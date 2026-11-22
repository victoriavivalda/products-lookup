import { describe, expect, it, vi } from "vitest";
import { AI_MODELS, AI_MODEL_LABELS } from "../constants/lookup.constants";
import { AIProviderResponse } from "../domain/lookup.types";
import { AIProviderStrategy, ResilientAIProviderProxy } from "./ai-provider.strategy";

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

describe("ResilientAIProviderProxy", () => {
  it("returns the primary strategy response when the live provider succeeds", async () => {
    const primary: AIProviderStrategy = {
      modelId: AI_MODELS.GEMINI,
      modelName: AI_MODEL_LABELS[AI_MODELS.GEMINI],
      execute: vi.fn().mockResolvedValue(createMockResponse("live")),
    };
    const fallback: AIProviderStrategy = {
      modelId: AI_MODELS.GEMINI,
      modelName: AI_MODEL_LABELS[AI_MODELS.GEMINI],
      execute: vi.fn().mockResolvedValue(createMockResponse("mock")),
    };

    const proxy = new ResilientAIProviderProxy(primary, fallback);
    const result = await proxy.execute("headphones");

    expect(result.citations[0].id).toBe("live-1");
    expect(primary.execute).toHaveBeenCalledOnce();
    expect(fallback.execute).not.toHaveBeenCalled();
  });

  it("transparently falls back to secondary strategy when primary throws", async () => {
    const primary: AIProviderStrategy = {
      modelId: AI_MODELS.GEMINI,
      modelName: AI_MODEL_LABELS[AI_MODELS.GEMINI],
      execute: vi.fn().mockRejectedValue(new Error("502 Bad Gateway")),
    };
    const fallback: AIProviderStrategy = {
      modelId: AI_MODELS.GEMINI,
      modelName: AI_MODEL_LABELS[AI_MODELS.GEMINI],
      execute: vi.fn().mockResolvedValue(createMockResponse("mock")),
    };

    const proxy = new ResilientAIProviderProxy(primary, fallback);
    const result = await proxy.execute("headphones");

    expect(result.citations[0].id).toBe("mock-1");
    expect(primary.execute).toHaveBeenCalledOnce();
    expect(fallback.execute).toHaveBeenCalledOnce();
  });
});
