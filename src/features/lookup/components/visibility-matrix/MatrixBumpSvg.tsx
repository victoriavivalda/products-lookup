"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AI_MODEL_LABELS, AIModelId } from "@/core/constants/lookup.constants";
import {
  buildSmoothBezierPath,
  getEngineColumnX,
  getRankRowY,
  MATRIX_CONFIG,
  ProductSeries,
} from "@/core/facades/presenters/visibility-matrix.presenters";

interface MatrixBumpSvgProps {
  seriesList: ProductSeries[];
  loadedModelIds: Set<AIModelId>;
  hoveredSku: string | null;
  onHoverSku: (sku: string | null) => void;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const NODE_COLOR_VERIFIED = "oklch(0.62 0.17 150)";
const NODE_COLOR_DRIFT = "oklch(0.75 0.18 75)";

function ProductTrajectoryGroup({
  series,
  seriesIndex,
  isHighlighted,
  isDimmed,
  prefersReducedMotion,
  onHoverSku,
}: {
  series: ProductSeries;
  seriesIndex: number;
  isHighlighted: boolean;
  isDimmed: boolean;
  prefersReducedMotion: boolean;
  onHoverSku: (sku: string | null) => void;
}) {
  const activePoints = series.points.filter(
    (point): point is typeof point & { y: number } => point.y !== null
  );

  const baseDelay = prefersReducedMotion ? 0 : seriesIndex * 0.08;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${series.name}: ${series.appearancesCount} engine appearances`}
      onMouseEnter={() => onHoverSku(series.sku)}
      onMouseLeave={() => onHoverSku(null)}
      onFocus={() => onHoverSku(series.sku)}
      onBlur={() => onHoverSku(null)}
      className="cursor-pointer outline-none transition-opacity duration-200"
      style={{ opacity: isDimmed ? 0.22 : 1 }}
    >
      {activePoints.length > 1 && (
        <motion.path
          d={buildSmoothBezierPath(activePoints)}
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth={isHighlighted ? 2.75 : 1.75}
          strokeLinecap="round"
          initial={prefersReducedMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.75 }}
          transition={{
            pathLength: {
              duration: prefersReducedMotion ? 0 : 0.65,
              delay: baseDelay,
              ease: EASE_OUT_EXPO,
            },
            opacity: { duration: 0.2 },
          }}
        />
      )}

      {activePoints.map((point, pointIndex) => (
        <g key={`${series.sku}-${point.modelId}`}>
          <motion.circle
            cx={point.x}
            cy={point.y}
            r={isHighlighted ? 7.5 : 5.5}
            fill={
              point.hasPriceMismatch ? NODE_COLOR_DRIFT : NODE_COLOR_VERIFIED
            }
            stroke="var(--surface-canvas)"
            strokeWidth={2}
            initial={prefersReducedMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 22,
              delay: prefersReducedMotion ? 0 : baseDelay + pointIndex * 0.06,
            }}
          />

          {isHighlighted && point.citedPrice !== undefined && (
            <text
              x={point.x}
              y={point.y - 12}
              textAnchor="middle"
              className="fill-(--text-primary) font-mono text-[10px] font-semibold"
            >
              ${point.citedPrice}
            </text>
          )}
        </g>
      ))}
    </g>
  );
}

export function MatrixBumpSvg({
  seriesList,
  loadedModelIds,
  hoveredSku,
  onHoverSku,
}: MatrixBumpSvgProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const {
    SVG_WIDTH,
    SVG_HEIGHT,
    PADDING_X,
    PADDING_TOP,
    ROW_HEIGHT,
    RANKS,
    ORDERED_ENGINES,
  } = MATRIX_CONFIG;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="h-auto w-full min-w-[540px] select-none"
        role="img"
        aria-label="Product ranking trajectory across AI search engines"
      >
        {RANKS.map((rank) => {
          const y = getRankRowY(rank);
          return (
            <g key={rank}>
              <line
                x1={PADDING_X - 24}
                y1={y}
                x2={SVG_WIDTH - PADDING_X + 24}
                y2={y}
                stroke="var(--border-hairline)"
                strokeDasharray="3 3"
              />
              <text
                x={PADDING_X - 34}
                y={y + 4}
                textAnchor="end"
                className="fill-(--text-muted) font-mono text-[11px]"
              >
                #{rank}
              </text>
            </g>
          );
        })}

        {ORDERED_ENGINES.map((modelId, index) => {
          const x = getEngineColumnX(index);
          const isLoaded = loadedModelIds.has(modelId);

          return (
            <g key={modelId}>
              <line
                x1={x}
                y1={PADDING_TOP - 14}
                x2={x}
                y2={PADDING_TOP + ROW_HEIGHT * 2 + 14}
                stroke="var(--border-hairline)"
              />
              <text
                x={x}
                y={SVG_HEIGHT - 16}
                textAnchor="middle"
                className={`font-mono text-[11px] font-medium ${
                  isLoaded
                    ? "fill-(--text-primary)"
                    : "fill-(--text-muted) opacity-50"
                }`}
              >
                {AI_MODEL_LABELS[modelId]}
              </text>
            </g>
          );
        })}

        {seriesList.map((series, seriesIndex) => (
          <ProductTrajectoryGroup
            key={series.sku}
            series={series}
            seriesIndex={seriesIndex}
            isHighlighted={hoveredSku === series.sku}
            isDimmed={hoveredSku !== null && hoveredSku !== series.sku}
            prefersReducedMotion={prefersReducedMotion}
            onHoverSku={onHoverSku}
          />
        ))}
      </svg>
    </div>
  );
}
