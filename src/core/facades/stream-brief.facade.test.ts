import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AI_ENV_KEYS,
  AI_MODELS,
  EXECUTION_FORCE_MODES,
} from "@/core/constants/lookup.constants";
import { ExecutiveConclusion } from "@/core/domain/lookup.types";
import { createExecutiveBriefStream } from "@/core/facades/stream-brief.facade"

const SAMPLE_CONCLUSION: ExecutiveConclusion = {
  query: "best espresso machine",
  generatedAt: "2026-11-22T15:00:00Z",
  topVisibleProduct: "Breville Barista Express",
  totalModelsAnalyzed: 3,
  priceDiscrepanciesCount: 1,
  insights: Array.of("Breville leads across 2 of 3 engines."),
  recommendedAction: "Sync schema price for Breville SKU-101.",
};

async function readFullStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  return result;
}

function createSseResponse(events: string[]): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${event}\n\n`));
      }
      controller.close();
    },
  });

  return new Response(body, { status: 200 });
}

describe("createExecutiveBriefStream", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("streams local fallback brief word-by-word when mode is MOCK", async () => {
    vi.useFakeTimers();
    vi.stubEnv("NEXT_PUBLIC_PROVIDER_MODE", EXECUTION_FORCE_MODES.MOCK);
    vi.stubEnv(AI_ENV_KEYS[AI_MODELS.GEMINI], "unused-key");

    const stream = createExecutiveBriefStream(
      SAMPLE_CONCLUSION.query,
      SAMPLE_CONCLUSION
    );

    const readPromise = readFullStream(stream);
    await vi.runAllTimersAsync();
    const text = await readPromise;

    expect(fetchMock).not.toHaveBeenCalled();
    expect(text).toContain("Breville Barista Express");
    expect(text).toContain("Detected 1 stale price citation(s)");
    expect(text).toContain(SAMPLE_CONCLUSION.recommendedAction);
  });

  it("streams SSE tokens from Gemini when GEMINI_API_KEY is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_PROVIDER_MODE", EXECUTION_FORCE_MODES.LIVE);
    vi.stubEnv(AI_ENV_KEYS[AI_MODELS.GEMINI], "gemini-test-key");

    const ssePayloads = Array.of(
      JSON.stringify({
        candidates: Array.of({ content: { parts: Array.of({ text: "Breville leads " }) } }),
      }),
      JSON.stringify({
        candidates: Array.of({ content: { parts: Array.of({ text: "retail visibility." }) } }),
      }),
      "[DONE]"
    );

    fetchMock.mockResolvedValueOnce(createSseResponse(ssePayloads));

    const stream = createExecutiveBriefStream(
      SAMPLE_CONCLUSION.query,
      SAMPLE_CONCLUSION
    );
    const text = await readFullStream(stream);

    expect(text).toBe("Breville leads retail visibility.");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("://googleapis.com"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-goog-api-key": "gemini-test-key" }),
      })
    );
  });

  it("falls back along the chain to OpenAI when Gemini fails before emitting tokens", async () => {
    vi.stubEnv("NEXT_PUBLIC_PROVIDER_MODE", EXECUTION_FORCE_MODES.LIVE);
    vi.stubEnv(AI_ENV_KEYS[AI_MODELS.GEMINI], "gemini-key");
    vi.stubEnv(AI_ENV_KEYS[AI_MODELS.CHATGPT], "openai-key");

    fetchMock.mockResolvedValueOnce(new Response("Rate limit", { status: 429 }));

    const openAiEvents = Array.of(
      JSON.stringify({
        choices: Array.of({ delta: { content: "OpenAI fallback brief." } }),
      }),
      "[DONE]"
    );
    fetchMock.mockResolvedValueOnce(createSseResponse(openAiEvents));

    const stream = createExecutiveBriefStream(
      SAMPLE_CONCLUSION.query,
      SAMPLE_CONCLUSION
    );
    const text = await readFullStream(stream);

    expect(text).toBe("OpenAI fallback brief.");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining("api.openai.com"),
      expect.any(Object)
    );
  });

  it("does not duplicate content from next provider if stream drops mid-response", async () => {
    vi.stubEnv("NEXT_PUBLIC_PROVIDER_MODE", EXECUTION_FORCE_MODES.LIVE);
    vi.stubEnv(AI_ENV_KEYS[AI_MODELS.GEMINI], "gemini-key");
    vi.stubEnv(AI_ENV_KEYS[AI_MODELS.CHATGPT], "openai-key");

    const encoder = new TextEncoder();
    const partialBody = new ReadableStream<Uint8Array>({
      start(controller) {
        const chunk = JSON.stringify({
          candidates: Array.of({
            content: { parts: Array.of({ text: "Partial Gemini start..." }) },
          }),
        });
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        setTimeout(() => {
          controller.error(new Error("Connection reset mid-stream"));
        }, 10);
      },
    });

    fetchMock.mockResolvedValueOnce(new Response(partialBody, { status: 200 }));

    const stream = createExecutiveBriefStream(
      SAMPLE_CONCLUSION.query,
      SAMPLE_CONCLUSION
    );
    const text = await readFullStream(stream);

    expect(text).toBe("Partial Gemini start...");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

});
