import {
  AI_MODELS,
  AIModelId,
  CampaignTheme,
  SIMULATION_SCENARIOS,
  SimulationScenario,
} from "../constants/lookup.constants";
import { AIProviderResponse } from "../domain/lookup.types";
import { AIProviderStrategy } from "./ai-provider.strategy";

const ASYMMETRIC_DELAYS_MS: Record<AIModelId, number> = {
  [AI_MODELS.GEMINI]: 350,
  [AI_MODELS.CHATGPT]: 2100,
  [AI_MODELS.CLAUDE]: 3400,
};

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
    campaign?: CampaignTheme
  ): Promise<AIProviderResponse> {
    if (this.scenario === SIMULATION_SCENARIOS.NORMAL) {
      return this.wrapped.execute(query, campaign);
    }

    if (this.scenario === SIMULATION_SCENARIOS.SLOW_NETWORK) {
      const t0 = performance.now();
      await new Promise((r) => setTimeout(r, ASYMMETRIC_DELAYS_MS[this.modelId]));
      const response = await this.wrapped.execute(query, campaign);
      return {
        ...response,
        latencyMs: Math.round(performance.now() - t0),
      };
    }

    if (
      this.scenario === SIMULATION_SCENARIOS.PARTIAL_OUTAGE &&
      this.modelId === AI_MODELS.CHATGPT
    ) {
      await new Promise((r) => setTimeout(r, 900));
      throw new Error(
        "Simulated 502 Bad Gateway: Upstream shopping index timed out."
      );
    }

    const response = await this.wrapped.execute(query, campaign);

    if (this.scenario === SIMULATION_SCENARIOS.PRICE_DRIFT) {
      return {
        ...response,
        citations: response.citations.map((c, idx) => ({
          ...c,
          citedPrice: c.realPrice + 45 + idx * 15,
          sentiment: "neutral",
        })),
      };
    }

    return response;
  }
}
