import {
  AI_ENV_KEYS,
  AI_MODEL_LABELS,
  AI_MODELS,
  AIModelId,
} from "@/core/constants/lookup.constants";
import { LiveProviderUnavailableError } from "@/core/domain/lookup.errors";
import { ProductCitation } from "@/core/domain/lookup.types";

export type RawCitation = Omit<ProductCitation, "id" | "modelId">;

export interface LiveProviderHandler {
  fetchCitations(query: string, apiKey: string): Promise<RawCitation[]>;
}

const LIVE_TIMEOUT_MS = 8_000;


const GEMINI_BASE = "https://generativelanguage.googleapis.com";
const GEMINI_ENDPOINT = `${GEMINI_BASE}/v1beta/models/gemini-flash-lite-latest:generateContent`;

const OPENAI_BASE = "https://api.openai.com";
const OPENAI_ENDPOINT = `${OPENAI_BASE}/v1/chat/completions`;

const ANTHROPIC_BASE = "https://api.anthropic.com";
const ANTHROPIC_ENDPOINT = `${ANTHROPIC_BASE}/v1/messages`;

const PROVIDER_ENDPOINTS = {
  GEMINI: GEMINI_ENDPOINT,
  OPENAI: OPENAI_ENDPOINT,
  ANTHROPIC: ANTHROPIC_ENDPOINT,
} as const;

export function resolveProviderApiKey(modelId: AIModelId): string | undefined {
  const envKeyName = AI_ENV_KEYS[modelId];
  const rawValue = process.env[envKeyName]?.trim();
  return rawValue && rawValue.length > 0 ? rawValue : undefined;
}

function buildShoppingAuditPrompt(modelName: string, query: string): string {
  return `Simulate how "${modelName}" ranks 2 real retail products for: "${query}".
Return ONLY a valid JSON array of 2 objects with keys: sku, name, brand, realPrice (number), citedPrice (number, optionally +$35 stale), rank (1-3), sentiment ("positive" | "neutral"), sources (2 domains).`;
}

function parseCitationsPayload(
  rawText: string | undefined,
  providerLabel: string
): RawCitation[] {
  if (!rawText) {
    throw new LiveProviderUnavailableError(providerLabel);
  }

  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const parsed: unknown = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    throw new LiveProviderUnavailableError(providerLabel);
  }

  return parsed as RawCitation[];
}

const GEMINI_LIVE_HANDLER: LiveProviderHandler = {
  async fetchCitations(query, apiKey) {
    const label = AI_MODEL_LABELS[AI_MODELS.GEMINI];
    const res = await fetch(PROVIDER_ENDPOINTS.GEMINI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: buildShoppingAuditPrompt(label, query) }] },
        ],
        generationConfig: { responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(LIVE_TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new LiveProviderUnavailableError(label);
    }

    const data = await res.json();
    const text: string | undefined =
      data.candidates?.at(0)?.content?.parts?.at(0)?.text;

    return parseCitationsPayload(text, label);
  },
};

const OPENAI_LIVE_HANDLER: LiveProviderHandler = {
  async fetchCitations(query, apiKey) {
    const label = AI_MODEL_LABELS[AI_MODELS.CHATGPT];
    const res = await fetch(PROVIDER_ENDPOINTS.OPENAI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: buildShoppingAuditPrompt(label, query) },
        ],
      }),
      signal: AbortSignal.timeout(LIVE_TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new LiveProviderUnavailableError(label);
    }

    const data = await res.json();
    const text: string | undefined = data.choices?.at(0)?.message?.content;

    return parseCitationsPayload(text, label);
  },
};

const CLAUDE_LIVE_HANDLER: LiveProviderHandler = {
  async fetchCitations(query, apiKey) {
    const label = AI_MODEL_LABELS[AI_MODELS.CLAUDE];
    const res = await fetch(PROVIDER_ENDPOINTS.ANTHROPIC, {
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
          { role: "user", content: buildShoppingAuditPrompt(label, query) },
        ],
      }),
      signal: AbortSignal.timeout(LIVE_TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new LiveProviderUnavailableError(label);
    }

    const data = await res.json();
    const text: string | undefined = data.content?.at(0)?.text;

    return parseCitationsPayload(text, label);
  },
};

export const LIVE_PROVIDER_REGISTRY: Record<AIModelId, LiveProviderHandler> = {
  [AI_MODELS.GEMINI]: GEMINI_LIVE_HANDLER,
  [AI_MODELS.CHATGPT]: OPENAI_LIVE_HANDLER,
  [AI_MODELS.CLAUDE]: CLAUDE_LIVE_HANDLER,
};
