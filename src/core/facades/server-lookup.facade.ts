import {
  AI_ENV_KEYS,
  AI_MODEL_LABELS,
  AI_MODELS,
  AIModelId,
  CampaignTheme,
  EXECUTION_FORCE_MODES,
  ExecutionForceMode,
} from "@/core/constants/lookup.constants";
import {
  LiveProviderUnavailableError,
  MissingProviderKeyError,
} from "@/core/domain/lookup.errors";
import {
  AIProviderResponse,
  ProductCitation,
} from "@/core/domain/lookup.types";
import {
  LIVE_PROVIDER_REGISTRY,
  resolveProviderApiKey,
} from "@/core/adapters/server/live-provider.registry";
import { buildDynamicMockCitations } from "@/core/repositories/dynamic-catalog.repo";

const SIMULATED_LATENCY_MS: Record<AIModelId, number> = {
  [AI_MODELS.GEMINI]: 520,
  [AI_MODELS.CHATGPT]: 1050,
  [AI_MODELS.CLAUDE]: 1380,
};

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

function buildTimedResponse(
  modelId: AIModelId,
  startTime: number,
  citations: ProductCitation[]
): AIProviderResponse {
  return {
    modelId,
    modelName: AI_MODEL_LABELS[modelId],
    latencyMs: Math.round(performance.now() - startTime),
    citations,
  };
}

async function executeLiveLookup(
  modelId: AIModelId,
  query: string,
  apiKey: string
): Promise<ProductCitation[]> {
  const handler = LIVE_PROVIDER_REGISTRY[modelId];
  const rawCitations = await handler.fetchCitations(query, apiKey);

  return rawCitations.map((item, idx) => ({
    ...item,
    id: `${modelId}-live-${idx}`,
    modelId,
  }));
}

async function executeMockLookup(
  modelId: AIModelId,
  query: string,
  campaign?: CampaignTheme
): Promise<ProductCitation[]> {
  await delay(SIMULATED_LATENCY_MS[modelId]);
  return buildDynamicMockCitations(modelId, query, campaign);
}

export async function performServerLookup(
  modelId: AIModelId,
  query: string,
  forceMode?: ExecutionForceMode,
  campaign?: CampaignTheme
): Promise<AIProviderResponse> {
  const apiKey = resolveProviderApiKey(modelId);
  const isStrictLive = forceMode === EXECUTION_FORCE_MODES.LIVE;
  const isForcedMock = forceMode === EXECUTION_FORCE_MODES.MOCK;

  if (isStrictLive && !apiKey) {
    throw new MissingProviderKeyError(AI_ENV_KEYS[modelId]);
  }

  const startTime = performance.now();

  if (!isForcedMock && apiKey) {
    try {
      const citations = await executeLiveLookup(modelId, query, apiKey);
      return buildTimedResponse(modelId, startTime, citations);
    } catch (error) {
      if (isStrictLive) {
        throw new LiveProviderUnavailableError(AI_MODEL_LABELS[modelId], {
          cause: error,
        });
      }
    }
  }

  const mockCitations = await executeMockLookup(modelId, query, campaign);
  return buildTimedResponse(modelId, startTime, mockCitations);
}
