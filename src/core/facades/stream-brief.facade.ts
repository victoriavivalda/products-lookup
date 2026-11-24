import { resolveProviderApiKey } from "@/core/adapters/server/live-provider.registry";
import {
  AI_MODEL_LABELS,
  AI_MODELS,
  AIModelId,
  EXECUTION_FORCE_MODES,
} from "@/core/constants/lookup.constants";
import { LiveProviderUnavailableError } from "@/core/domain/lookup.errors";
import { ExecutiveConclusion } from "@/core/domain/lookup.types";

type StreamGenerator = (
  prompt: string,
  apiKey: string,
  onChunk: (text: string) => void,
  signal: AbortSignal
) => Promise<void>;

const STREAM_CHAIN_ORDER: readonly AIModelId[] = [
  AI_MODELS.GEMINI,
  AI_MODELS.CHATGPT,
  AI_MODELS.CLAUDE,
];

const STREAM_TIMEOUT_MS = 8_000;
const FALLBACK_WORD_DELAY_MS = 28;

const STREAM_ENDPOINTS = {
  GEMINI: "https://googleapis.com/v1beta/models/gemini-flash-lite-latest:streamGenerateContent?alt=sse",
  OPENAI: "https://api.openai.com/v1/chat/completions",
  ANTHROPIC: "https://api.anthropic.com/v1/messages",
} as const;

function buildBriefPrompt(
  query: string,
  conclusion: ExecutiveConclusion
): string {
  return `Write a concise, 2-sentence executive retail visibility brief for "${query}". Top product: ${conclusion.topVisibleProduct}. Price discrepancies: ${conclusion.priceDiscrepanciesCount}. Action: ${conclusion.recommendedAction}. Plain text only, no markdown.`;
}

function buildFallbackBriefText(conclusion: ExecutiveConclusion): string {
  const driftStatus =
    conclusion.priceDiscrepanciesCount === 0
      ? "All sampled AI shopping engines are reporting verified catalog pricing with zero drift."
      : `Detected ${conclusion.priceDiscrepanciesCount} stale price citation(s) across sampled engines requiring immediate schema sync.`;

  return `Executive Telemetry Brief for "${conclusion.query}": ${conclusion.topVisibleProduct} currently leads cross-engine visibility. ${driftStatus} Strategic priority: ${conclusion.recommendedAction}`;
}

async function consumeSseLines(
  body: ReadableStream<Uint8Array>,
  extractToken: (jsonLine: string) => string | undefined,
  onChunk: (text: string) => void
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const dataStr = line.slice(6).trim();
      if (!dataStr || dataStr === "[DONE]") continue;

      try {
        const token = extractToken(dataStr);
        if (token) onChunk(token);
      } catch {
        // Ignorar fragmentos SSE parciales o eventos sin delta de texto
      }
    }
  }
}

const STREAM_STRATEGIES: Record<AIModelId, StreamGenerator> = {
  [AI_MODELS.GEMINI]: async (prompt, apiKey, onChunk, signal) => {
    const res = await fetch(STREAM_ENDPOINTS.GEMINI, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: AbortSignal.any([signal, AbortSignal.timeout(STREAM_TIMEOUT_MS)]),
    });

    if (!res.ok || !res.body) {
      throw new LiveProviderUnavailableError(AI_MODEL_LABELS[AI_MODELS.GEMINI]);
    }

    await consumeSseLines(
      res.body,
      (raw) => JSON.parse(raw).candidates?.at(0)?.content?.parts?.at(0)?.text,
      onChunk
    );
  },

  [AI_MODELS.CHATGPT]: async (prompt, apiKey, onChunk, signal) => {
    const res = await fetch(STREAM_ENDPOINTS.OPENAI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        stream: true,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.any([signal, AbortSignal.timeout(STREAM_TIMEOUT_MS)]),
    });

    if (!res.ok || !res.body) {
      throw new LiveProviderUnavailableError(AI_MODEL_LABELS[AI_MODELS.CHATGPT]);
    }

    await consumeSseLines(
      res.body,
      (raw) => JSON.parse(raw).choices?.at(0)?.delta?.content,
      onChunk
    );
  },

  [AI_MODELS.CLAUDE]: async (prompt, apiKey, onChunk, signal) => {
    const res = await fetch(STREAM_ENDPOINTS.ANTHROPIC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-latest",
        max_tokens: 220,
        stream: true,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.any([signal, AbortSignal.timeout(STREAM_TIMEOUT_MS)]),
    });

    if (!res.ok || !res.body) {
      throw new LiveProviderUnavailableError(AI_MODEL_LABELS[AI_MODELS.CLAUDE]);
    }

    await consumeSseLines(
      res.body,
      (raw) => {
        const event = JSON.parse(raw);
        return event.type === "content_block_delta"
          ? event.delta?.text
          : undefined;
      },
      onChunk
    );
  },
};

export function createExecutiveBriefStream(
  query: string,
  conclusion: ExecutiveConclusion
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const forceMode = process.env.NEXT_PUBLIC_PROVIDER_MODE;
  const prompt = buildBriefPrompt(query, conclusion);
  const streamAbortController = new AbortController();

  return new ReadableStream({
    async start(controller) {
      let hasEmittedTokens = false;

      const pushChunk = (text: string) => {
        if (streamAbortController.signal.aborted) return;
        hasEmittedTokens = true;
        controller.enqueue(encoder.encode(text));
      };

      if (forceMode !== EXECUTION_FORCE_MODES.MOCK) {
        for (const modelId of STREAM_CHAIN_ORDER) {
          const apiKey = resolveProviderApiKey(modelId);
          if (!apiKey) continue;

          try {
            await STREAM_STRATEGIES[modelId](
              prompt,
              apiKey,
              pushChunk,
              streamAbortController.signal
            );
            if (!streamAbortController.signal.aborted) controller.close();
            return;
          } catch {
            // Si ya emitió texto parcial antes de cortarse, no mezclar otro proveedor encima
            if (hasEmittedTokens) {
              if (!streamAbortController.signal.aborted) controller.close();
              return;
            }
          }
        }
      }

      const tokens = buildFallbackBriefText(conclusion).split(" ");
      for (let i = 0; i < tokens.length; i++) {
        if (streamAbortController.signal.aborted) return;
        pushChunk(i === 0 ? tokens[i] : ` ${tokens[i]}`);
        await new Promise((r) => setTimeout(r, FALLBACK_WORD_DELAY_MS));
      }

      if (!streamAbortController.signal.aborted) {
        controller.close();
      }
    },

    cancel() {
      streamAbortController.abort();
    },
  });
}
