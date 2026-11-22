import { describe, expect, it } from "vitest";
import {
  AI_MODEL_LABELS,
  AI_MODELS,
  AIModelId,
} from "@/core/constants/lookup.constants";
import { AIProviderResponse, ProductCitation } from "@/core/domain/lookup.types";
import { lookupFacade } from "./lookup.facade";

function createCitation(
  overrides: Partial<ProductCitation> &
    Pick<
      ProductCitation,
      "id" | "sku" | "name" | "realPrice" | "citedPrice" | "rank"
    >
): ProductCitation {
  return {
    brand: "BrandA",
    sentiment: "positive",
    sources: Array.of("wirecutter.com"),
    modelId: AI_MODELS.GEMINI,
    ...overrides,
  };
}

function createResponse(
  modelId: AIModelId,
  citations: ProductCitation[]
): AIProviderResponse {
  return {
    modelId,
    modelName: AI_MODEL_LABELS[modelId],
    latencyMs: 500,
    citations,
  };
}

describe("LookupFacade.synthesizeConclusions", () => {
  it("identifies the top-ranked product across multiple engines using average rank", () => {
    // Product Alpha avg rank: (2 + 1) / 2 = 1.5
    // Product Beta avg rank: (1 + 4) / 2 = 2.5
    const mockResponses = Array.of(
      createResponse(
        AI_MODELS.GEMINI,
        Array.of(
          createCitation({
            id: "1",
            sku: "SKU-A",
            name: "Product Alpha",
            realPrice: 100,
            citedPrice: 100,
            rank: 2,
          }),
          createCitation({
            id: "2",
            sku: "SKU-B",
            name: "Product Beta",
            brand: "BrandB",
            realPrice: 200,
            citedPrice: 200,
            rank: 1,
          })
        )
      ),
      createResponse(
        AI_MODELS.CHATGPT,
        Array.of(
          createCitation({
            id: "3",
            sku: "SKU-A",
            name: "Product Alpha",
            realPrice: 100,
            citedPrice: 100,
            rank: 1,
            modelId: AI_MODELS.CHATGPT,
          }),
          createCitation({
            id: "4",
            sku: "SKU-B",
            name: "Product Beta",
            brand: "BrandB",
            realPrice: 200,
            citedPrice: 200,
            rank: 4,
            sentiment: "neutral",
            modelId: AI_MODELS.CHATGPT,
          })
        )
      )
    );

    const result = lookupFacade.synthesizeConclusions(
      "wireless headphones",
      mockResponses
    );

    expect(result.topVisibleProduct).toBe("Product Alpha");
    expect(result.totalModelsAnalyzed).toBe(2);
    expect(result.priceDiscrepanciesCount).toBe(0);
    expect(result.insights).toContain(
      "100% pricing accuracy verified across all sampled AI engines."
    );
  });

  it("flags stale price discrepancies and recommends JSON-LD schema remediation", () => {
    const mockResponses = Array.of(
      createResponse(
        AI_MODELS.CHATGPT,
        Array.of(
          createCitation({
            id: "1",
            sku: "SNY-XM5",
            name: "Sony WH-1000XM5",
            brand: "Sony",
            realPrice: 248,
            citedPrice: 299,
            rank: 1,
            modelId: AI_MODELS.CHATGPT,
          })
        )
      )
    );

    const result = lookupFacade.synthesizeConclusions("sony xm5", mockResponses);

    expect(result.priceDiscrepanciesCount).toBe(1);
    expect(
      result.insights.some((i) => i.includes("Detected 1 stale price citation(s)"))
    ).toBe(true);
    expect(result.recommendedAction).toContain("Product Schema (JSON-LD)");
  });

  it("handles responses with zero citations gracefully without emitting #Infinity", () => {
    const mockResponses = Array.of(createResponse(AI_MODELS.GEMINI, Array.of()));

    const result = lookupFacade.synthesizeConclusions("rare item", mockResponses);

    expect(result.topVisibleProduct).toBe("N/A");
    expect(result.priceDiscrepanciesCount).toBe(0);
    expect(result.insights.some((i) => i.includes("Infinity"))).toBe(false);
  });
});
