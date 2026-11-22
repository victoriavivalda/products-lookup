import { ProductSeries } from "./visibility-matrix.utils";

interface ProductLegendBarProps {
  seriesList: ProductSeries[];
  totalLoadedEngines: number;
  hoveredSku: string | null;
  onHoverSku: (sku: string | null) => void;
}

export function ProductLegendBar({
  seriesList,
  totalLoadedEngines,
  hoveredSku,
  onHoverSku,
}: ProductLegendBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border-hairline)] pt-3">
      {seriesList.map((series) => {
        const isSelected = hoveredSku === series.sku;
        return (
          <button
            key={series.sku}
            type="button"
            onMouseEnter={() => onHoverSku(series.sku)}
            onMouseLeave={() => onHoverSku(null)}
            className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[11px] transition ${
              isSelected
                ? "border-[var(--accent-primary)] bg-[var(--accent-surface)] text-[var(--accent-primary)]"
                : "border-[var(--border-hairline)] bg-[var(--surface-subtle)] text-[var(--text-primary)] hover:border-[var(--border-hover)]"
            }`}
          >
            <span className="max-w-[190px] truncate">{series.name}</span>
            <span className="rounded bg-[var(--surface-canvas)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
              {series.appearancesCount}/{totalLoadedEngines} engines
            </span>
          </button>
        );
      })}
    </div>
  );
}
