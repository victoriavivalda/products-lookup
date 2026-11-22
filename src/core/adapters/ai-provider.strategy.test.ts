import { describe, expect, it, vi } from "vitest";
import { AI_MODEL_LABELS, AI_MODELS } from "@/core/constants/lookup.constants";
import { AIProviderResponse } from "@/core/domain/lookup.types";
import {
  AIProviderStrategy,
  ResilientAIProviderProxy,
} from "./ai-provider.strategy";

function createMockResponse(sourceTag: string): AIProviderResponse {
  return {
    modelId: AI_MODELS.GEMINI,
    modelName: AI_MODEL_LABELS[AI_MODELS.GEMINI],
    latencyMs: 100,
    citations: [
      {
        id: `${sourceTag}-1`,
        sku: "SKU-1",
        name: `Product (${sourceTag})`,
        brand: "Sony",
        realPrice: 299,
        citedPrice: 299,
        rank: 1,
        sentiment: "positive",
        sources: ["rtings.com"],
        modelId: AI_MODELS.GEMINI,
      },
    ],
  };
}

function createStubStrategy(
  implementation: () => Promise<AIProviderResponse>
): AIProviderStrategy {
  return {
    modelId: AI_MODELS.GEMINI,
    modelName: AI_MODEL_LABELS[AI_MODELS.GEMINI],
    execute: vi.fn(implementation),
  };
}

describe("ResilientAIProviderProxy", () => {
  it("returns the primary strategy response when the live provider succeeds", async () => {
    const primary = createStubStrategy(async () => createMockResponse("live"));
    const fallback = createStubStrategy(async () => createMockResponse("mock"));

    const proxy = new ResilientAIProviderProxy(primary, fallback);
    const result = await proxy.execute("headphones");

    expect(result.citations[0].id).toBe("live-1");
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(primary.execute).toHaveBeenCalledOnce();
    expect(fallback.execute).not.toHaveBeenCalled();
  });

  it("transparently falls back to secondary strategy when primary throws", async () => {
    const primary = createStubStrategy(async () => {
      throw new Error("502 Bad Gateway");
    });
    const fallback = createStubStrategy(async () => createMockResponse("mock"));

    const proxy = new ResilientAIProviderProxy(primary, fallback);
    const result = await proxy.execute("headphones");

    expect(result.citations[0].id).toBe("mock-1");
    expect(primary.execute).toHaveBeenCalledOnce();
    expect(fallback.execute).toHaveBeenCalledOnce();
  });

  it("rethrows immediately without calling fallback when request is aborted", async () => {
    const controller = new AbortController();
    const abortError = new DOMException("Aborted", "AbortError");

    const primary = createStubStrategy(async () => {
      controller.abort();
      throw abortError;
    });
    const fallback = createStubStrategy(async () => createMockResponse("mock"));

    const proxy = new ResilientAIProviderProxy(primary, fallback);

    await expect(
      proxy.execute("headphones", undefined, controller.signal)
    ).rejects.toThrow("Aborted");
    expect(fallback.execute).not.toHaveBeenCalled();
  });
});
