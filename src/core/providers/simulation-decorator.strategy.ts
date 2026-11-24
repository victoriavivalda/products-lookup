import {
  AI_MODELS,
  AIModelId,
  CampaignTheme,
  SIMULATION_SCENARIOS,
  SimulationScenario,
} from "@/core/constants/lookup.constants";
import { AIProviderResponse } from "@/core/domain/lookup.types";
import { AIProviderStrategy } from "./ai-provider.strategy";

const ASYMMETRIC_DELAYS_MS: Record<AIModelId, number> = {
  [AI_MODELS.GEMINI]: 350,
  [AI_MODELS.CHATGPT]: 2100,
  [AI_MODELS.CLAUDE]: 3400,
};

const OUTAGE_TARGET_MODEL: AIModelId = AI_MODELS.CHATGPT;
const OUTAGE_DELAY_MS = 900;
const PRICE_DRIFT_BASE_OFFSET = 45;
const PRICE_DRIFT_STEP_OFFSET = 15;

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    return Promise.reject(new DOMException("Aborted", "AbortError"));
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export class SimulationDecoratorStrategy implements AIProviderStrategy {
  readonly modelId: AIModelId;
  readonly modelName: string;

  constructor(
    private readonly wrapped: AIProviderStrategy,
    private readonly scenario: SimulationScenario
  ) {
    this.modelId = wrapped.modelId;
    this.modelName = wrapped.modelName;
  }

  async execute(
    query: string,
    campaign?: CampaignTheme,
    signal?: AbortSignal
  ): Promise<AIProviderResponse> {
    switch (this.scenario) {
      case SIMULATION_SCENARIOS.NORMAL:
        return this.wrapped.execute(query, campaign, signal);

      case SIMULATION_SCENARIOS.SLOW_NETWORK:
        return this.executeSlowNetwork(query, campaign, signal);

      case SIMULATION_SCENARIOS.PARTIAL_OUTAGE:
        return this.executePartialOutage(query, campaign, signal);

      case SIMULATION_SCENARIOS.PRICE_DRIFT:
        return this.executePriceDrift(query, campaign, signal);
    }
  }

  private async executeSlowNetwork(
    query: string,
    campaign?: CampaignTheme,
    signal?: AbortSignal
  ): Promise<AIProviderResponse> {
    const startTime = performance.now();
    await sleep(ASYMMETRIC_DELAYS_MS[this.modelId], signal);
    const response = await this.wrapped.execute(query, campaign, signal);

    return {
      ...response,
      latencyMs: Math.round(performance.now() - startTime),
    };
  }

  private async executePartialOutage(
    query: string,
    campaign?: CampaignTheme,
    signal?: AbortSignal
  ): Promise<AIProviderResponse> {
    if (this.modelId === OUTAGE_TARGET_MODEL) {
      await sleep(OUTAGE_DELAY_MS, signal);
      throw new Error(
        "Simulated API Conditions 502 Bad Gateway: Upstream shopping index timed out."
      );
    }

    return this.wrapped.execute(query, campaign, signal);
  }

  private async executePriceDrift(
    query: string,
    campaign?: CampaignTheme,
    signal?: AbortSignal
  ): Promise<AIProviderResponse> {
    const response = await this.wrapped.execute(query, campaign, signal);

    return {
      ...response,
      citations: response.citations.map((citation, idx) => ({
        ...citation,
        citedPrice:
          citation.realPrice +
          PRICE_DRIFT_BASE_OFFSET +
          idx * PRICE_DRIFT_STEP_OFFSET,
        sentiment: "neutral",
      })),
    };
  }
}
