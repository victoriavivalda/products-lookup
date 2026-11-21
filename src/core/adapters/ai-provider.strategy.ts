import {
  AIModelId,
  API_ENDPOINTS,
  CampaignTheme,
  ExecutionForceMode,
} from "../constants/lookup.constants";
import { AIProviderResponse, LookupRequestPayload } from "../domain/lookup.types";

export interface AIProviderStrategy {
  readonly modelId: AIModelId;
  readonly modelName: string;
  execute(query: string, campaign?: CampaignTheme): Promise<AIProviderResponse>;
}

export class HttpLookupStrategy implements AIProviderStrategy {
  constructor(
    public readonly modelId: AIModelId,
    public readonly modelName: string,
    private readonly forceMode: ExecutionForceMode
  ) {}

  async execute(query: string, campaign?: CampaignTheme): Promise<AIProviderResponse> {
    const payload: LookupRequestPayload = {
      modelId: this.modelId,
      query,
      forceMode: this.forceMode,
      campaign,
    };

    const res = await fetch(API_ENDPOINTS.LOOKUP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(
        errBody.error || `Lookup failed [${this.forceMode}] for ${this.modelName}`
      );
    }

    const data: AIProviderResponse = await res.json();
    return data;
  }
}

export class ResilientAIProviderProxy implements AIProviderStrategy {
  readonly modelId: AIModelId;
  readonly modelName: string;

  constructor(
    private readonly primary: AIProviderStrategy,
    private readonly fallback: AIProviderStrategy
  ) {
    this.modelId = primary.modelId;
    this.modelName = primary.modelName;
  }

  async execute(query: string, campaign?: CampaignTheme): Promise<AIProviderResponse> {
    const t0 = performance.now();
    try {
      const response = await this.primary.execute(query, campaign);
      return { ...response, latencyMs: Math.round(performance.now() - t0) };
    } catch {
      const fallbackResponse = await this.fallback.execute(query, campaign);
      return { ...fallbackResponse, latencyMs: Math.round(performance.now() - t0) };
    }
  }
}
