import { useQueries } from "@tanstack/react-query";
import { lookupFacade } from "@/core/facades/lookup.facade";
import { AIProviderResponse } from "@/core/domain/lookup.types";

export function useMultiEngineLookup(query: string) {
  const adapters = lookupFacade.getAdapters();

  const queries = useQueries({
    queries: adapters.map((adapter) => ({
      queryKey: ["products-lookup", adapter.modelId, query],
      queryFn: () => adapter.lookupProducts(query),
      staleTime: 1000 * 60,
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
    completedResponses.length > 0
      ? lookupFacade.synthesizeConclusions(query, completedResponses)
      : null;

  return {
    engineSlots,
    completedResponses,
    totalEngines: adapters.length,
    conclusion,
  };
}
