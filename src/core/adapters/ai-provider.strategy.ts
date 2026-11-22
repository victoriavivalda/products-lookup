import {
  AIModelId,
  API_ENDPOINTS,
  CampaignTheme,
  ExecutionForceMode,
} from "@/core/constants/lookup.constants";
import {
  AIProviderResponse,
  LookupErrorResponse,
  LookupRequestPayload,
} from "@/core/domain/lookup.types";

export interface AIProviderStrategy {
  readonly modelId: AIModelId;
  readonly modelName: string;
  execute(
    query: string,
    campaign?: CampaignTheme,
    signal?: AbortSignal
  ): Promise<AIProviderResponse>;
}

export class HttpLookupStrategy implements AIProviderStrategy {
  constructor(
    public readonly modelId: AIModelId,
    public readonly modelName: string,
    private readonly forceMode: ExecutionForceMode
  ) {}

  async execute(
    query: string,
    campaign?: CampaignTheme,
    signal?: AbortSignal
  ): Promise<AIProviderResponse> {
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
      signal,
    });

    if (!res.ok) {
      const errBody = (await res
        .json()
        .catch(() => ({}))) as Partial<LookupErrorResponse>;

      throw new Error(
        errBody.error ||
          `Lookup failed [${this.forceMode}] for ${this.modelName}`
      );
    }

    return (await res.json()) as AIProviderResponse;
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

  async execute(
    query: string,
    campaign?: CampaignTheme,
    signal?: AbortSignal
  ): Promise<AIProviderResponse> {
    const startTime = performance.now();

    const withMeasuredLatency = (
      response: AIProviderResponse
    ): AIProviderResponse => ({
      ...response,
      latencyMs: Math.round(performance.now() - startTime),
    });

    try {
      const response = await this.primary.execute(query, campaign, signal);
      return withMeasuredLatency(response);
    } catch (error) {
      // Si la petición fue abortada por el usuario, no disparar el fallback
      if (signal?.aborted) throw error;

      const fallbackResponse = await this.fallback.execute(
        query,
        campaign,
        signal
      );
      return withMeasuredLatency(fallbackResponse);
    }
  }
}
