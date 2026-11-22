"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Eye } from "lucide-react";
import { AIProviderResponse } from "@/core/domain/lookup.types";
import { buildVisibilitySeries } from "./visibility-matrix.utils";
import { MatrixBumpSvg } from "./MatrixBumpSvg";
import { ProductLegendBar } from "./ProductLegendBar";

interface VisibilityMatrixChartProps {
  responses: AIProviderResponse[];
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function VisibilityMatrixChart({ responses }: VisibilityMatrixChartProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hoveredSku, setHoveredSku] = useState<string | null>(null);

  const seriesList = useMemo(
    () => buildVisibilitySeries(responses),
    [responses]
  );

  const loadedModelIds = useMemo(
    () => new Set(responses.map((r) => r.modelId)),
    [responses]
  );

  if (responses.length === 0) return null;

  return (
    <motion.section
      aria-label="Cross-engine ranking and appearance trajectory"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
      className="pl-card mb-8 space-y-4"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-(--border-hairline) pb-3">
        <div className="flex items-center gap-2">
          <Eye aria-hidden="true" className="h-4 w-4 text-(--accent-primary)" />
          <h2 className="text-sm font-semibold tracking-tight">
            Cross-Engine Ranking &amp; Appearance Trajectory
          </h2>
        </div>

        <div className="flex items-center gap-4 font-mono text-[11px] text-(--text-muted)">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2
              aria-hidden="true"
              className="h-3.5 w-3.5 text-emerald-500"
            />
            <span>Verified Price</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <AlertTriangle
              aria-hidden="true"
              className="h-3.5 w-3.5 text-amber-500"
            />
            <span>Price Drift</span>
          </span>
        </div>
      </header>

      <MatrixBumpSvg
        seriesList={seriesList}
        loadedModelIds={loadedModelIds}
        hoveredSku={hoveredSku}
        onHoverSku={setHoveredSku}
      />

      <ProductLegendBar
        seriesList={seriesList}
        totalLoadedEngines={responses.length}
        hoveredSku={hoveredSku}
        onHoverSku={setHoveredSku}
      />
    </motion.section>
  );
}
