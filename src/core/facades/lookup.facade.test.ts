import { describe, it, expect } from "vitest";
import { lookupFacade } from "./lookup.facade";
import { AIProviderResponse } from "../domain/lookup.types";

describe("LookupFacade.synthesizeConclusions", () => {
  it("identifies the top-ranked product across multiple engines using average rank", () => {
    const mockResponses: AIProviderResponse[] = [
      {
        modelId: "gemini",
        modelName: "Google AI Overviews",
        latencyMs: 500,
        citations: [
          {
            id: "1",
            sku: "SKU-A",
            name: "Product Alpha",
            brand: "BrandA",
            realPrice: 100,
            citedPrice: 100,
            rank: 2,
            sentiment: "positive",
            sources: ["wirecutter.com"],
            modelId: "gemini",
          },
          {
            id: "2",
            sku: "SKU-B",
            name: "Product Beta",
            brand: "BrandB",
            realPrice: 200,
            citedPrice: 200,
            rank: 1,
            sentiment: "positive",
            sources: ["rtings.com"],
            modelId: "gemini",
          },
        ],
      },
      {
        modelId: "chatgpt",
        modelName: "ChatGPT Shopping",
        latencyMs: 900,
        citations: [
          {
            id: "3",
            sku: "SKU-A",
            name: "Product Alpha",
            brand: "BrandA",
            realPrice: 100,
            citedPrice: 100,
            rank: 1,
            sentiment: "positive",
            sources: ["theverge.com"],
            modelId: "chatgpt",
          },
          {
            id: "4",
            sku: "SKU-B",
            name: "Product Beta",
            brand: "BrandB",
            realPrice: 200,
            citedPrice: 200,
            rank: 4,
            sentiment: "neutral",
            sources: ["cnet.com"],
            modelId: "chatgpt",
          },
        ],
      },
    ];

    // Product Alpha avg rank: (2 + 1) / 2 = 1.5
    // Product Beta avg rank: (1 + 4) / 2 = 2.5
    const result = lookupFacade.synthesizeConclusions("wireless headphones", mockResponses);

    expect(result.topVisibleProduct).toBe("Product Alpha");
    expect(result.totalModelsAnalyzed).toBe(2);
    expect(result.priceDiscrepanciesCount).toBe(0);
    expect(result.insights).toContain(
      "100% pricing accuracy verified across all sampled AI engines."
    );
  });

  it("flags stale price discrepancies and recommends JSON-LD schema remediation", () => {
    const mockResponses: AIProviderResponse[] = [
      {
        modelId: "chatgpt",
        modelName: "ChatGPT Shopping",
        latencyMs: 1100,
        citations: [
          {
            id: "1",
            sku: "SNY-XM5",
            name: "Sony WH-1000XM5",
            brand: "Sony",
            realPrice: 248,
            citedPrice: 299, // Stale price
            rank: 1,
            sentiment: "positive",
            sources: ["cnet.com"],
            modelId: "chatgpt",
          },
        ],
      },
    ];

    const result = lookupFacade.synthesizeConclusions("sony xm5", mockResponses);

    expect(result.priceDiscrepanciesCount).toBe(1);
    expect(result.insights.some((i) => i.includes("Detected 1 stale price citation(s)"))).toBe(true);
    expect(result.recommendedAction).toContain("Product Schema (JSON-LD)");
  });
});
