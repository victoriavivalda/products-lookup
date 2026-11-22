// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AI_MODEL_LABELS, AI_MODELS } from "@/core/constants/lookup.constants";
import {
  AIProviderResponse,
  ExecutiveConclusion,
} from "@/core/domain/lookup.types";
import { useExecutiveStream } from "./use-executive-stream";

const SAMPLE_CONCLUSION: ExecutiveConclusion = {
  query: "best espresso machine",
  generatedAt: "2026-11-22",
  topVisibleProduct: "Breville Barista Express",
  totalModelsAnalyzed: 3,
  priceDiscrepanciesCount: 0,
  insights: Array.of("All prices verified."),
  recommendedAction: "Maintain feed.",
};

const SAMPLE_RESPONSES: AIProviderResponse[] = Array.of<AIProviderResponse>({
  modelId: AI_MODELS.GEMINI,
  modelName: AI_MODEL_LABELS[AI_MODELS.GEMINI],
  latencyMs: 320,
  citations: Array.of(),
});

describe("useExecutiveStream", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("accumulates streamed text chunks progressively and marks completion", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode("Breville leads "));
        controller.enqueue(encoder.encode("AI visibility."));
        controller.close();
      },
    });

    fetchMock.mockResolvedValueOnce(new Response(stream, { status: 200 }));

    const { result } = renderHook(() =>
      useExecutiveStream(SAMPLE_CONCLUSION, SAMPLE_RESPONSES)
    );

    await waitFor(() => {
      expect(result.current.streamedText).toBe("Breville leads AI visibility.");
    });

    expect(result.current.isStreaming).toBe(false);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("aborts in-flight stream request when hook unmounts", async () => {
    let capturedSignal: AbortSignal | undefined;

    fetchMock.mockImplementationOnce((_url, init) => {
      capturedSignal = init?.signal ?? undefined;
      return new Promise(() => {});
    });

    const { unmount } = renderHook(() =>
      useExecutiveStream(SAMPLE_CONCLUSION, SAMPLE_RESPONSES)
    );

    await waitFor(() => {
      expect(capturedSignal).toBeDefined();
    });

    expect(capturedSignal?.aborted).toBe(false);
    unmount();
    expect(capturedSignal?.aborted).toBe(true);
  });
});
