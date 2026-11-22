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
  if (seriesList.length === 0) return null;

  return (
    <div
      role="group"
      aria-label="Highlight product trajectory on chart"
      className="flex flex-wrap items-center gap-2 border-t border-(--border-hairline) pt-3"
    >
      {seriesList.map((series) => {
        const isSelected = hoveredSku === series.sku;

        return (
          <button
            key={series.sku}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onHoverSku(isSelected ? null : series.sku)}
            onMouseEnter={() => onHoverSku(series.sku)}
            onMouseLeave={() => onHoverSku(null)}
            onFocus={() => onHoverSku(series.sku)}
            onBlur={() => onHoverSku(null)}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[11px] transition ${
              isSelected
                ? "border-(--accent-primary) bg-(--accent-surface) text-(--accent-primary)"
                : "border-(--border-hairline) bg-(--surface-subtle) text-(--text-primary) hover:border-(--border-hover)"
            }`}
          >
            <span className="max-w-47.5 truncate">{series.name}</span>
            <span className="rounded bg-(--surface-canvas) px-1.5 py-0.5 text-[10px] text-(--text-muted)">
              {series.appearancesCount}/{totalLoadedEngines} engines
            </span>
          </button>
        );
      })}
    </div>
  );
}
