import { AIModelId } from "@/core/constants/lookup.constants";
import { AIProviderResponse } from "@/core/domain/lookup.types";
import {
  buildVisibilitySeries,
  ProductSeries,
} from "@/core/facades/presenters/visibility-matrix.presenters";

export interface EngineTelemetryMetric {
  readonly modelId: AIModelId;
  readonly modelName: string;
  readonly latencyMs: number;
  readonly latencyBarPercent: number;
  readonly priceAccuracyPercent: number;
  readonly isFullyVerified: boolean;
}

export interface AuditTelemetryViewModel {
  readonly engineMetrics: readonly EngineTelemetryMetric[];
  readonly visibilitySeries: readonly ProductSeries[];
  readonly totalEngines: number;
}

const MIN_LATENCY_BAR_PERCENT = 12;

function calculatePriceAccuracy(engine: AIProviderResponse): number {
  const totalItems = engine.citations.length;
  if (totalItems === 0) return 100;

  const verifiedItems = engine.citations.filter(
    (citation) => citation.citedPrice === citation.realPrice
  ).length;

  return Math.round((verifiedItems / totalItems) * 100);
}

function toEngineMetric(
  engine: AIProviderResponse,
  maxLatency: number
): EngineTelemetryMetric {
  const priceAccuracyPercent = calculatePriceAccuracy(engine);
  const rawBarPercent = Math.round((engine.latencyMs / maxLatency) * 100);

  return {
    modelId: engine.modelId,
    modelName: engine.modelName,
    latencyMs: engine.latencyMs,
    latencyBarPercent: Math.max(MIN_LATENCY_BAR_PERCENT, rawBarPercent),
    priceAccuracyPercent,
    isFullyVerified: priceAccuracyPercent === 100,
  };
}

export function buildAuditTelemetryViewModel(
  responses: readonly AIProviderResponse[]
): AuditTelemetryViewModel {
  const maxLatency = Math.max(...responses.map((r) => r.latencyMs), 1);

  return {
    engineMetrics: responses.map((engine) => toEngineMetric(engine, maxLatency)),
    visibilitySeries: buildVisibilitySeries([...responses]),
    totalEngines: responses.length,
  };
}
