import { UseQueryResult } from "@tanstack/react-query";
import { AIProviderResponse } from "@/core/domain/lookup.types";
import { CitationItemCard } from "./CitationItemCard";
import { AIProviderStrategy } from "@/core/adapters/ai-provider.strategy";

interface ProviderResultColumnProps {
  adapter: AIProviderStrategy;
  queryState: UseQueryResult<AIProviderResponse, Error>;
}

export function ProviderResultColumn({ adapter, queryState }: ProviderResultColumnProps) {
  const { isFetching, isLoading, isError, data, error } = queryState;

  return (
    <section className="pl-card flex flex-col justify-between space-y-4">
      <div>
        <div className="mb-4 flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isFetching
                  ? "animate-ping bg-amber-500"
                  : isError
                  ? "bg-red-500"
                  : "bg-emerald-500"
              }`}
            />
            <h3 className="text-sm font-semibold tracking-tight">{adapter.modelName}</h3>
          </div>

          <span className="rounded border border-[var(--border-hairline)] bg-[var(--surface-subtle)] px-2 py-0.5 font-mono text-[11px] tabular-nums text-[var(--text-muted)]">
            {isFetching ? "Querying..." : isError ? "Offline" : `${data?.latencyMs}ms`}
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="pl-skeleton h-32 rounded-lg border border-[var(--border-hairline)]" />
            <div className="pl-skeleton h-32 rounded-lg border border-[var(--border-hairline)]" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 font-mono text-xs leading-relaxed text-red-600 dark:text-red-400">
            {error?.message || "Live provider unavailable."}
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
