"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Activity } from "lucide-react";
import { AIProviderResponse } from "@/core/domain/lookup.types";
import { buildAuditTelemetryViewModel } from "@/core/facades/telemetry.presenter";

interface EngineTelemetryChartProps {
  responses: AIProviderResponse[];
}

type EngineMetric = ReturnType<
  typeof buildAuditTelemetryViewModel
>["engineMetrics"][number];

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

function TelemetryBarRow({
  metric,
  index,
  prefersReducedMotion,
}: {
  metric: EngineMetric;
  index: number;
  prefersReducedMotion: boolean;
}) {
  const accuracyTone = metric.isFullyVerified
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-amber-600 dark:text-amber-400";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium tracking-tight">{metric.modelName}</span>

        <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums">
          <span className={accuracyTone}>
            {metric.priceAccuracyPercent}% price match
          </span>
          <span className="text-(--text-muted)">{metric.latencyMs}ms</span>
        </div>
      </div>

      <div
        role="progressbar"
        aria-label={`${metric.modelName} latency`}
        aria-valuenow={Math.round(metric.latencyBarPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${metric.latencyMs} milliseconds`}
        className="h-2.5 w-full overflow-hidden rounded-full border border-(--border-hairline) bg-(--surface-subtle)"
      >
        <svg aria-hidden="true" className="h-full w-full" preserveAspectRatio="none">
          <motion.rect
            x="0"
            y="0"
            height="100%"
            rx="4"
            fill="var(--accent-primary)"
            initial={{
              width: prefersReducedMotion ? `${metric.latencyBarPercent}%` : "0%",
            }}
            animate={{ width: `${metric.latencyBarPercent}%` }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.55,
              delay: prefersReducedMotion ? 0 : index * 0.08,
              ease: EASE_OUT_EXPO,
            }}
          />
        </svg>
      </div>
    </div>
  );
}

export function EngineTelemetryChart({ responses }: EngineTelemetryChartProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());

  const { engineMetrics } = useMemo(
    () => buildAuditTelemetryViewModel(responses),
    [responses]
  );

  if (responses.length === 0) return null;

  return (
    <motion.section
      aria-label="Engine latency and price accuracy telemetry"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
      className="pl-card mb-8 space-y-4"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-(--border-hairline) pb-3">
        <div className="flex items-center gap-2">
          <Activity
            aria-hidden="true"
            className="h-4 w-4 text-(--accent-primary)"
          />
          <h2 className="text-sm font-semibold tracking-tight">
            Engine Latency &amp; Price Accuracy Telemetry
          </h2>
        </div>
        <span className="font-mono text-[11px] text-(--text-muted)">
          LIVE RESPONSE BENCHMARK
        </span>
      </header>

      <div className="space-y-3.5 pt-1">
        {engineMetrics.map((metric, index) => (
          <TelemetryBarRow
            key={metric.modelId}
            metric={metric}
            index={index}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>
    </motion.section>
  );
}
