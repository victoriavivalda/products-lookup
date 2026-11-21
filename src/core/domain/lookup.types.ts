export type AIModelId = "gemini" | "chatgpt" | "claude";

export interface ProductCitation {
  id: string;
  sku: string;
  name: string;
  brand: string;
  realPrice: number;
  citedPrice: number;
  rank: number;
  sentiment: "positive" | "neutral" | "negative";
  sources: string[];
  modelId: AIModelId;
}

export interface AIProviderResponse {
  modelId: AIModelId;
  modelName: string;
  latencyMs: number;
  citations: ProductCitation[];
}

export interface ExecutiveConclusion {
  query: string;
  generatedAt: string;
  topVisibleProduct: string;
  totalModelsAnalyzed: number;
  priceDiscrepanciesCount: number;
  insights: string[];
  recommendedAction: string;
}
