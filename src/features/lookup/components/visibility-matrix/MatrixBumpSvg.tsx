"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AI_MODEL_LABELS, AIModelId } from "@/core/constants/lookup.constants";
import {
  buildSmoothBezierPath,
  getEngineColumnX,
  getRankRowY,
  MATRIX_CONFIG,
  ProductSeries,
} from "./visibility-matrix.utils";

interface MatrixBumpSvgProps {
  seriesList: ProductSeries[];
  loadedModelIds: Set<AIModelId>;
  hoveredSku: string | null;
  onHoverSku: (sku: string | null) => void;
}

export function MatrixBumpSvg({
  seriesList,
  loadedModelIds,
  hoveredSku,
  onHoverSku,
}: MatrixBumpSvgProps) {
  const prefersReducedMotion = useReducedMotion();
  const { SVG_WIDTH, SVG_HEIGHT, PADDING_X, PADDING_TOP, ROW_HEIGHT, RANKS, ORDERED_ENGINES } =
    MATRIX_CONFIG;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="h-auto w-full min-w-[540px] select-none"
        role="img"
        aria-label="Product ranking trajectory across AI search engines"
      >
        {/* Horizontal Rank Guidelines (#1, #2, #3) */}
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
                className="fill-[var(--text-muted)] font-mono text-[11px]"
              >
                #{rank}
              </text>
            </g>
          );
        })}

        {/* Vertical Engine Columns & Labels */}
        {ORDERED_ENGINES.map((modelId, idx) => {
          const x = getEngineColumnX(idx);
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
                    ? "fill-[var(--text-primary)]"
                    : "fill-[var(--text-muted)] opacity-50"
                }`}
              >
                {AI_MODEL_LABELS[modelId]}
              </text>
            </g>
          );
        })}

        {/* Product Trajectories & Nodes */}
        {seriesList.map((series, sIdx) => {
          const activePoints = series.points.filter(
            (p): p is typeof p & { y: number } => p.y !== null
          );

          const isDimmed = hoveredSku !== null && hoveredSku !== series.sku;
          const isHighlighted = hoveredSku === series.sku;

          return (
            <g
              key={series.sku}
              onMouseEnter={() => onHoverSku(series.sku)}
              onMouseLeave={() => onHoverSku(null)}
              className="cursor-pointer transition-opacity duration-200"
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
                      delay: sIdx * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    },
                    opacity: { duration: 0.2 },
                  }}
                />
              )}

              {activePoints.map((pt, pIdx) => (
                <g key={`${series.sku}-${pt.modelId}`}>
                  <motion.circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHighlighted ? 7.5 : 5.5}
                    fill={
                      pt.hasPriceMismatch
                        ? "oklch(0.75 0.18 75)"
                        : "oklch(0.62 0.17 150)"
                    }
                    stroke="var(--surface-canvas)"
                    strokeWidth="2"
                    initial={prefersReducedMotion ? false : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 360,
                      damping: 22,
                      delay: prefersReducedMotion ? 0 : sIdx * 0.08 + pIdx * 0.06,
                    }}
                  />

                  {isHighlighted && pt.citedPrice !== undefined && (
                    <text
                      x={pt.x}
                      y={pt.y - 12}
                      textAnchor="middle"
                      className="fill-[var(--text-primary)] font-mono text-[10px] font-semibold"
                    >
                      ${pt.citedPrice}
                    </text>
                  )}
                </g>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
