import {
  AI_MODEL_LABELS,
  AI_MODELS,
  EXECUTION_FORCE_MODES,
  PROVIDER_MODES,
  ProviderMode,
} from "../constants/lookup.constants";
import {
  AIProviderStrategy,
  HttpLookupStrategy,
  ResilientAIProviderProxy,
} from "./ai-provider.strategy";

export class AIProviderFactory {
  static createAll(
    mode: ProviderMode = (process.env.NEXT_PUBLIC_PROVIDER_MODE as ProviderMode) ||
      PROVIDER_MODES.MOCK
  ): AIProviderStrategy[] {
    return Object.values(AI_MODELS).map((id) => {
      const label = AI_MODEL_LABELS[id];
      const live = new HttpLookupStrategy(id, label, EXECUTION_FORCE_MODES.LIVE);
      const mock = new HttpLookupStrategy(id, label, EXECUTION_FORCE_MODES.MOCK);

      if (mode === PROVIDER_MODES.MOCK) return mock;
      if (mode === PROVIDER_MODES.LIVE) return live;
      return new ResilientAIProviderProxy(live, mock);
    });
  }
}
