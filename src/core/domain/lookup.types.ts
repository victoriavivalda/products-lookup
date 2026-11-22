import {
  AIModelId,
  CampaignTheme,
  ExecutionForceMode,
} from "@/core/constants/lookup.constants";

export type { AIModelId };

export type CitationSentiment = "positive" | "neutral" | "negative";

export interface ProductCitation {
  readonly id: string;
  readonly sku: string;
  readonly name: string;
  readonly brand: string;
  readonly realPrice: number;
  readonly citedPrice: number;
  readonly rank: number;
  readonly sentiment: CitationSentiment;
  readonly sources: readonly string[];
  readonly modelId: AIModelId;
}

export interface AIProviderResponse {
  readonly modelId: AIModelId;
  readonly modelName: string;
  readonly latencyMs: number;
  readonly citations: readonly ProductCitation[];
}

export interface ExecutiveConclusion {
  readonly query: string;
  readonly generatedAt: string;
  readonly topVisibleProduct: string;
  readonly totalModelsAnalyzed: number;
  readonly priceDiscrepanciesCount: number;
  readonly insights: readonly string[];
  readonly recommendedAction: string;
}

export interface LookupRequestPayload {
  readonly modelId: AIModelId;
  readonly query: string;
  readonly forceMode?: ExecutionForceMode;
  readonly campaign?: CampaignTheme;
}

export interface LookupErrorResponse {
  readonly error: string;
}
