import { describe, expect, it } from "vitest";
import {
  AI_MODEL_LABELS,
  AI_MODELS,
  AIModelId,
} from "@/core/constants/lookup.constants";
import { AIProviderResponse, ProductCitation } from "@/core/domain/lookup.types";
import { buildAuditTelemetryViewModel } from "./telemetry.presenter";

function createCitation(
  overrides: Partial<ProductCitation> &
    Pick<ProductCitation, "id" | "sku" | "name" | "realPrice" | "citedPrice" | "rank">
): ProductCitation {
  return {
    brand: "Sony",
    sentiment: "positive",
    sources: ["rtings.com"],
    modelId: AI_MODELS.GEMINI,
    ...overrides,
  };
}

function createEngineResponse(
  modelId: AIModelId,
  latencyMs: number,
  citations: ProductCitation[]
): AIProviderResponse {
  return {
    modelId,
    modelName: AI_MODEL_LABELS[modelId],
    latencyMs,
    citations,
  };
}

const SAMPLE_RESPONSES: AIProviderResponse[] = [
  createEngineResponse(AI_MODELS.GEMINI, 500, [
    createCitation({
      id: "g-1",
      sku: "SNY-100",
      name: "Sony WH-1000XM5 — Doorbuster Bundle",
      realPrice: 300,
      citedPrice: 300,
      rank: 1,
    }),
    createCitation({
      id: "g-2",
      sku: "BOS-200",
      name: "Bose QuietComfort (Flagship Edition)",
      brand: "Bose",
      realPrice: 250,
      citedPrice: 290,
      rank: 2,
      sentiment: "neutral",
    }),
  ]),
  createEngineResponse(AI_MODELS.CLAUDE, 1000, [
    createCitation({
      id: "c-1",
      sku: "SNY-100",
      name: "Sony WH-1000XM5 (Flagship Edition)",
      realPrice: 300,
      citedPrice: 300,
      rank: 1,
      modelId: AI_MODELS.CLAUDE,
    }),
  ]),
];

describe("buildAuditTelemetryViewModel", () => {
  it("computes relative latency bar percentages and price accuracy scores", () => {
    const vm = buildAuditTelemetryViewModel(SAMPLE_RESPONSES);

    expect(vm.totalEngines).toBe(2);
    expect(vm.engineMetrics[0]).toMatchObject({
      modelId: AI_MODELS.GEMINI,
      latencyBarPercent: 50,
      priceAccuracyPercent: 50,
      isFullyVerified: false,
    });
    expect(vm.engineMetrics[1]).toMatchObject({
      modelId: AI_MODELS.CLAUDE,
      latencyBarPercent: 100,
      priceAccuracyPercent: 100,
      isFullyVerified: true,
    });
  });

  it("merges matching products across engines regardless of campaign suffix", () => {
    const vm = buildAuditTelemetryViewModel(SAMPLE_RESPONSES);
    const sonySeries = vm.visibilitySeries.find((s) => s.sku === "SNY-100");

    expect(sonySeries).toBeDefined();
    expect(sonySeries?.appearancesCount).toBe(2);
  });

  it("enforces minimum 12% bar width for ultra-fast responses", () => {
    const responses = [
      createEngineResponse(AI_MODELS.GEMINI, 10, []),
      createEngineResponse(AI_MODELS.CLAUDE, 1000, []),
    ];

    const vm = buildAuditTelemetryViewModel(responses);

    expect(vm.engineMetrics[0].latencyBarPercent).toBe(12);
    expect(vm.engineMetrics[0].priceAccuracyPercent).toBe(100);
  });

  it("handles empty responses array safely", () => {
    const vm = buildAuditTelemetryViewModel([]);

    expect(vm).toEqual({
      engineMetrics: [],
      visibilitySeries: [],
      totalEngines: 0,
    });
  });
});
