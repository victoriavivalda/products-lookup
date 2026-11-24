import {
  AI_MODEL_LABELS,
  AI_MODELS,
  AIModelId,
  EXECUTION_FORCE_MODES,
  PROVIDER_MODES,
  ProviderMode,
} from "@/core/constants/lookup.constants";
import {
  AIProviderStrategy,
  HttpLookupStrategy,
  ResilientAIProviderProxy,
} from "./ai-provider.strategy";

const VALID_MODES = new Set<string>(Object.values(PROVIDER_MODES));

function resolveDefaultMode(): ProviderMode {
  const envMode = process.env.NEXT_PUBLIC_PROVIDER_MODE?.toLowerCase();
  return envMode && VALID_MODES.has(envMode)
    ? (envMode as ProviderMode)
    : PROVIDER_MODES.MOCK;
}

function createStrategyForModel(
  modelId: AIModelId,
  mode: ProviderMode
): AIProviderStrategy {
  const label = AI_MODEL_LABELS[modelId];

  switch (mode) {
    case PROVIDER_MODES.MOCK:
      return new HttpLookupStrategy(modelId, label, EXECUTION_FORCE_MODES.MOCK);

    case PROVIDER_MODES.LIVE:
      return new HttpLookupStrategy(modelId, label, EXECUTION_FORCE_MODES.LIVE);

    case PROVIDER_MODES.AUTO:
      return new ResilientAIProviderProxy(
        new HttpLookupStrategy(modelId, label, EXECUTION_FORCE_MODES.LIVE),
        new HttpLookupStrategy(modelId, label, EXECUTION_FORCE_MODES.MOCK)
      );
  }
}

export class AIProviderFactory {
  static createAll(mode: ProviderMode = resolveDefaultMode()): AIProviderStrategy[] {
    return Object.values(AI_MODELS).map((modelId) =>
      createStrategyForModel(modelId, mode)
    );
  }
}
