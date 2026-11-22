import { describe, expect, it } from "vitest";
import { AI_MODELS, AI_MODEL_LABELS } from "../constants/lookup.constants";
import { AIProviderResponse } from "../domain/lookup.types";
import { buildAuditTelemetryViewModel } from "./telemetry.presenter";

const SAMPLE_RESPONSES: AIProviderResponse[] = [
  {
    modelId: AI_MODELS.GEMINI,
    modelName: AI_MODEL_LABELS[AI_MODELS.GEMINI],
    latencyMs: 500,
    citations: [
      {
        id: "g-1",
        sku: "SNY-100",
        name: "Sony WH-1000XM5 — Doorbuster Bundle",
        brand: "Sony",
        realPrice: 300,
        citedPrice: 300,
        rank: 1,
        sentiment: "positive",
        sources: ["rtings.com"],
        modelId: AI_MODELS.GEMINI,
      },
      {
        id: "g-2",
        sku: "BOS-200",
        name: "Bose QuietComfort (Flagship Edition)",
        brand: "Bose",
        realPrice: 250,
        citedPrice: 290, // Price drift
        rank: 2,
        sentiment: "neutral",
        sources: ["techradar.com"],
        modelId: AI_MODELS.GEMINI,
      },
    ],
  },
  {
    modelId: AI_MODELS.CLAUDE,
    modelName: AI_MODEL_LABELS[AI_MODELS.CLAUDE],
    latencyMs: 1000,
    citations: [
      {
        id: "c-1",
        sku: "SNY-100",
        name: "Sony WH-1000XM5 (Flagship Edition)",
        brand: "Sony",
        realPrice: 300,
        citedPrice: 300,
        rank: 1,
        sentiment: "positive",
        sources: ["wirecutter.com"],
        modelId: AI_MODELS.CLAUDE,
      },
    ],
  },
];

describe("buildAuditTelemetryViewModel", () => {
  it("computes relative latency bar percentages and price accuracy scores", () => {
    const vm = buildAuditTelemetryViewModel(SAMPLE_RESPONSES);

    expect(vm.totalEngines).toBe(2);

    // Gemini: 500ms / 1000ms = 50% width, 1/2 verified = 50% price match
    expect(vm.engineMetrics[0].latencyBarPercent).toBe(50);
    expect(vm.engineMetrics[0].priceAccuracyPercent).toBe(50);
    expect(vm.engineMetrics[0].isFullyVerified).toBe(false);

    // Claude: 1000ms / 1000ms = 100% width, 1/1 verified = 100% price match
    expect(vm.engineMetrics[1].latencyBarPercent).toBe(100);
    expect(vm.engineMetrics[1].priceAccuracyPercent).toBe(100);
    expect(vm.engineMetrics[1].isFullyVerified).toBe(true);
  });

  it("merges matching products across engines regardless of campaign suffix", () => {
    const vm = buildAuditTelemetryViewModel(SAMPLE_RESPONSES);
    const sonySeries = vm.visibilitySeries.find((s) => s.sku === "SNY-100");

    expect(sonySeries).toBeDefined();
    expect(sonySeries?.appearancesCount).toBe(2);
  });
});
