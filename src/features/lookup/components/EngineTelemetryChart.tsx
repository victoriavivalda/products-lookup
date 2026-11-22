"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Activity } from "lucide-react";
import { AIProviderResponse } from "@/core/domain/lookup.types";
import { buildAuditTelemetryViewModel } from "@/core/facades/telemetry.presenter";

interface EngineTelemetryChartProps {
  responses: AIProviderResponse[];
}

export function EngineTelemetryChart({ responses }: EngineTelemetryChartProps) {
  const prefersReducedMotion = useReducedMotion();

  if (responses.length === 0) return null;

  const { engineMetrics } = buildAuditTelemetryViewModel(responses);

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="pl-card mb-8 space-y-4"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4" style={{ color: "var(--accent-primary)" }} />
          <h2 className="text-sm font-semibold tracking-tight">
            Engine Latency & Price Accuracy Telemetry
          </h2>
        </div>
        <span className="font-mono text-[11px] text-[var(--text-muted)]">
          LIVE RESPONSE BENCHMARK
        </span>
      </div>

      {/* Animated SVG/Motion Bars */}
      <div className="space-y-3.5 pt-1">
        {engineMetrics.map((metric, index) => (
          <div key={metric.modelId} className="space-y-1.5">
            {/* Row Labels */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium tracking-tight">{metric.modelName}</span>

              <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums">
                <span
                  className={
                    metric.isFullyVerified
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }
                >
                  {metric.priceAccuracyPercent}% price match
                </span>
                <span className="text-[var(--text-muted)]">{metric.latencyMs}ms</span>
              </div>
            </div>

            {/* SVG Progress Track + Animated Bar */}
            <div className="h-2.5 w-full overflow-hidden rounded-full border border-[var(--border-hairline)] bg-[var(--surface-subtle)]">
              <svg
                className="h-full w-full"
                preserveAspectRatio="none"
                aria-label={`${metric.modelName} latency ${metric.latencyMs} milliseconds`}
              >
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
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
