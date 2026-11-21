import { UseQueryResult } from "@tanstack/react-query";
import { AIProviderAdapter } from "@/core/adapters/ai-providers.adapter";
import { AIProviderResponse } from "@/core/domain/lookup.types";
import { CitationItemCard } from "./CitationItemCard";

interface ProviderResultColumnProps {
  adapter: AIProviderAdapter;
  queryState: UseQueryResult<AIProviderResponse, Error>;
}

export function ProviderResultColumn({ adapter, queryState }: ProviderResultColumnProps) {
  const { isFetching, isLoading, data } = queryState;

  return (
    <section className="pl-card flex flex-col justify-between space-y-4">
      <div>
        <div className="mb-4 flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
          <h3 className="text-sm font-semibold">{adapter.modelName}</h3>
          <span className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
            {isFetching ? "Querying..." : `${data?.latencyMs}ms`}
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-lg bg-[var(--surface-subtle)]" />
            <div className="h-24 animate-pulse rounded-lg bg-[var(--surface-subtle)]" />
          </div>
        ) : (
          <div className="space-y-3">
            {data?.citations.map((item) => (
              <CitationItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
