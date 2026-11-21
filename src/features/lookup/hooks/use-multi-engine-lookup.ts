import { useEffect, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { lookupFacade } from "@/core/facades/lookup.facade";
import { AIProviderResponse } from "@/core/domain/lookup.types";
import {
  CampaignTheme,
  QUERY_KEYS,
  UI_CONFIG,
} from "@/core/constants/lookup.constants";

export function useMultiEngineLookup(rawQuery: string, campaign: CampaignTheme) {
  const [debouncedQuery, setDebouncedQuery] = useState(() => rawQuery.trim());

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedQuery(rawQuery.trim()),
      UI_CONFIG.SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [rawQuery]);

  const adapters = lookupFacade.getAdapters();
  const hasActiveQuery = debouncedQuery.length > 0;

  const queries = useQueries({
    queries: adapters.map((adapter) => ({
      queryKey: [QUERY_KEYS.PRODUCTS_LOOKUP, adapter.modelId, debouncedQuery, campaign],
      queryFn: () => adapter.execute(debouncedQuery, campaign),
      enabled: hasActiveQuery,
      staleTime: UI_CONFIG.CACHE_STALE_TIME_MS,
      retry: false,
    })),
  });

  const engineSlots = adapters.map((adapter, index) => ({
    adapter,
    queryState: queries[index],
  }));

  const completedResponses = queries
    .map((q) => q.data)
    .filter((data): data is AIProviderResponse => Boolean(data));

  const conclusion =
    hasActiveQuery && completedResponses.length > 0
      ? lookupFacade.synthesizeConclusions(debouncedQuery, completedResponses)
      : null;

  return {
    engineSlots,
    completedResponses,
    totalEngines: adapters.length,
    conclusion,
    hasActiveQuery,
  };
}
