import { AIProviderResponse } from "@/core/domain/lookup.types";
import {
  buildVisibilitySeries,
  ProductSeries,
} from "@/features/lookup/components/visibility-matrix/visibility-matrix.utils";

export interface EngineTelemetryMetric {
  modelId: string;
  modelName: string;
  latencyMs: number;
  latencyBarPercent: number;
  priceAccuracyPercent: number;
  isFullyVerified: boolean;
}

export interface AuditTelemetryViewModel {
  engineMetrics: EngineTelemetryMetric[];
  visibilitySeries: ProductSeries[];
  totalEngines: number;
}

export function buildAuditTelemetryViewModel(
  responses: AIProviderResponse[]
): AuditTelemetryViewModel {
  const maxLatency = Math.max(...responses.map((r) => r.latencyMs), 1);

  const engineMetrics: EngineTelemetryMetric[] = responses.map((engine) => {
    const totalItems = engine.citations.length;
    const verifiedItems = engine.citations.filter(
      (c) => c.citedPrice === c.realPrice
    ).length;

    const priceAccuracyPercent =
      totalItems > 0 ? Math.round((verifiedItems / totalItems) * 100) : 100;

    return {
      modelId: engine.modelId,
      modelName: engine.modelName,
      latencyMs: engine.latencyMs,
      latencyBarPercent: Math.max(
        12,
        Math.round((engine.latencyMs / maxLatency) * 100)
      ),
      priceAccuracyPercent,
      isFullyVerified: priceAccuracyPercent === 100,
    };
  });

  return {
    engineMetrics,
    visibilitySeries: buildVisibilitySeries(responses),
    totalEngines: responses.length,
  };
}
