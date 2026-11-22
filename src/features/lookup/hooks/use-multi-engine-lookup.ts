import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { lookupFacade } from "@/core/facades/lookup.facade";
import { SimulationDecoratorStrategy } from "@/core/adapters/simulation-decorator.strategy";
import { AIProviderResponse } from "@/core/domain/lookup.types";
import {
  CampaignTheme,
  QUERY_KEYS,
  SIMULATION_SCENARIOS,
  SimulationScenario,
  UI_CONFIG,
} from "@/core/constants/lookup.constants";

function createAdapterQueryOptions(
  adapter: SimulationDecoratorStrategy,
  query: string,
  campaign: CampaignTheme,
  scenario: SimulationScenario,
  enabled: boolean
) {
  return {
    queryKey: [
      QUERY_KEYS.PRODUCTS_LOOKUP,
      adapter.modelId,
      query,
      campaign,
      scenario,
    ] as const,
    queryFn: () => adapter.execute(query, campaign),
    enabled,
    staleTime: UI_CONFIG.CACHE_STALE_TIME_MS,
    retry: false,
  };
}

export function useMultiEngineLookup(
  committedQuery: string,
  campaign: CampaignTheme,
  scenario: SimulationScenario = SIMULATION_SCENARIOS.NORMAL
) {
  const normalizedQuery = committedQuery.trim();
  const hasActiveQuery = normalizedQuery.length > 0;

  const adapters = useMemo(
    () =>
      lookupFacade
        .getAdapters()
        .map((base) => new SimulationDecoratorStrategy(base, scenario)),
    [scenario]
  );

  const queries = useQueries({
    queries: adapters.map((adapter) =>
      createAdapterQueryOptions(
        adapter,
        normalizedQuery,
        campaign,
        scenario,
        hasActiveQuery
      )
    ),
  });

  // 1. Estabiliza las respuestas completadas solo cuando cambian los datos reales
  const completedResponses = useMemo(
    () =>
      queries
        .map((q) => q.data)
        .filter((data): data is AIProviderResponse => Boolean(data)),
    [queries]
  );

  // 2. Evita re-ejecutar synthesizeConclusions en renders no relacionados (ej. al escribir en el input)
  const conclusion = useMemo(() => {
    if (!hasActiveQuery || completedResponses.length === 0) return null;
    return lookupFacade.synthesizeConclusions(normalizedQuery, completedResponses);
  }, [hasActiveQuery, normalizedQuery, completedResponses]);

  const engineSlots = useMemo(
    () =>
      adapters.map((adapter, index) => ({
        adapter,
        queryState: queries[index],
      })),
    [adapters, queries]
  );

  return {
    engineSlots,
    completedResponses,
    totalEngines: adapters.length,
    conclusion,
    hasActiveQuery,
  };
}
