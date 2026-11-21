import {
  AI_ENV_KEYS,
  AI_MODEL_LABELS,
  AI_MODELS,
  AIModelId,
} from "@/core/constants/lookup.constants";
import { ProductCitation } from "@/core/domain/lookup.types";

type RawCitation = Omit<ProductCitation, "id" | "modelId">;

export interface LiveProviderHandler {
  fetchCitations(query: string, apiKey: string): Promise<RawCitation[]>;
}

export function resolveProviderApiKey(modelId: AIModelId): string | undefined {
  const envKeyName = AI_ENV_KEYS[modelId];
  const rawValue = process.env[envKeyName]?.trim();
  return rawValue && rawValue.length > 0 ? rawValue : undefined;
}

function buildShoppingAuditPrompt(modelName: string, query: string): string {
  return `Simulate how "${modelName}" ranks 2 real retail products for: "${query}".
Return ONLY a valid JSON array of 2 objects with keys: sku, name, brand, realPrice (number), citedPrice (number, optionally +$35 stale), rank (1-3), sentiment ("positive" | "neutral"), sources (2 domains).`;
}

const GEMINI_LIVE_HANDLER: LiveProviderHandler = {
  async fetchCitations(query, apiKey) {
    const endpoint = new URL(
      "https://googleapis.com"
    );
    endpoint.searchParams.set("key", apiKey);

    const res = await fetch(endpoint.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: buildShoppingAuditPrompt(AI_MODEL_LABELS.gemini, query) }] },
        ],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    if (!res.ok) throw new Error("Gemini API request failed");
    const data = await res.json();
    const text = data.candidates?.at(0)?.content?.parts?.at(0)?.text;
    return JSON.parse(text);
  },
};

const OPENAI_LIVE_HANDLER: LiveProviderHandler = {
  async fetchCitations(query, apiKey) {
    const res = await fetch("https://openai.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: buildShoppingAuditPrompt(AI_MODEL_LABELS.chatgpt, query) },
        ],
      }),
    });

    if (!res.ok) throw new Error("OpenAI API request failed");
    const data = await res.json();
    const text = data.choices?.at(0)?.message?.content;
    return JSON.parse(text);
  },
};

const CLAUDE_LIVE_HANDLER: LiveProviderHandler = {
  async fetchCitations(query, apiKey) {
    const res = await fetch("https://anthropic.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-latest",
        max_tokens: 600,
        messages: [
          { role: "user", content: buildShoppingAuditPrompt(AI_MODEL_LABELS.claude, query) },
        ],
      }),
    });

    if (!res.ok) throw new Error("Anthropic API request failed");
    const data = await res.json();
    const text = data.content?.at(0)?.text;
    return JSON.parse(text);
  },
};

export const LIVE_PROVIDER_REGISTRY: Record<AIModelId, LiveProviderHandler> = {
  [AI_MODELS.GEMINI]: GEMINI_LIVE_HANDLER,
  [AI_MODELS.CHATGPT]: OPENAI_LIVE_HANDLER,
  [AI_MODELS.CLAUDE]: CLAUDE_LIVE_HANDLER,
};
