import { UseQueryResult } from "@tanstack/react-query";
import { AIProviderResponse } from "@/core/domain/lookup.types";
import { CitationItemCard } from "./CitationItemCard";
import { AIProviderStrategy } from "@/core/adapters/ai-provider.strategy";

interface ProviderResultColumnProps {
  adapter: AIProviderStrategy;
  queryState: UseQueryResult<AIProviderResponse, Error>;
}

interface ProviderStatusBadge {
  dotClassName: string;
  label: string;
  srStatus: string;
}

function resolveProviderStatus(
  isFetching: boolean,
  isError: boolean,
  latencyMs?: number
): ProviderStatusBadge {
  if (isFetching) {
    return {
      dotClassName: "animate-ping bg-amber-500",
      label: "Querying...",
      srStatus: "Querying provider",
    };
  }

  if (isError) {
    return {
      dotClassName: "bg-red-500",
      label: "Offline",
      srStatus: "Provider offline",
    };
  }

  return {
    dotClassName: "bg-emerald-500",
    label: latencyMs !== undefined ? `${latencyMs}ms` : "Ready",
    srStatus: "Provider online",
  };
}

function ColumnSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-3">
      <div className="pl-skeleton h-32 rounded-lg border border-(--border-hairline)" />
      <div className="pl-skeleton h-32 rounded-lg border border-(--border-hairline)" />
    </div>
  );
}

export function ProviderResultColumn({
  adapter,
  queryState,
}: ProviderResultColumnProps) {
  const { isFetching, isLoading, isError, data, error } = queryState;
  const status = resolveProviderStatus(isFetching, isError, data?.latencyMs);
  const citations = data?.citations ?? [];

  return (
    <section
      aria-label={`${adapter.modelName} results`}
      aria-busy={isLoading}
      className="pl-card flex flex-col space-y-4"
    >
      <header className="flex items-center justify-between border-b border-(--border-hairline) pb-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${status.dotClassName}`}
          />
          <span className="sr-only">{status.srStatus}</span>
          <h3 className="text-sm font-semibold tracking-tight">
            {adapter.modelName}
          </h3>
        </div>

        <span className="rounded border border-(--border-hairline) bg-(--surface-subtle) px-2 py-0.5 font-mono text-[11px] tabular-nums text-(--text-muted)">
          {status.label}
        </span>
      </header>

      {isLoading ? (
        <ColumnSkeleton />
      ) : isError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 font-mono text-xs leading-relaxed text-red-600 dark:text-red-400"
        >
          {error?.message || "Live provider unavailable."}
        </div>
      ) : citations.length === 0 ? (
        <p className="rounded-lg border border-dashed border-(--border-hairline) p-4 text-center font-mono text-xs text-(--text-muted)">
          No product citations returned for this query.
        </p>
      ) : (
        <div className="space-y-3">
          {citations.map((item) => (
            <CitationItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
