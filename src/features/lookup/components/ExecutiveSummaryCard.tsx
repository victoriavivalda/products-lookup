"use client";

import { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Layers,
  Radio,
  Sparkles,
} from "lucide-react";
import {
  AIProviderResponse,
  ExecutiveConclusion,
} from "@/core/domain/lookup.types";
import { ReportActions } from "@/features/lookup/components/ReportActions";
import { useExecutiveStream } from "@/features/lookup/hooks/use-executive-stream";

interface ExecutiveSummaryCardProps {
  conclusion: ExecutiveConclusion | null;
  responses: AIProviderResponse[];
  totalEngines: number;
}

interface KpiMetricCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  truncateValue?: boolean;
}

const CARD_TRANSITION = {
  duration: 0.22,
  ease: [0.16, 1, 0.3, 1],
} as const;

function KpiMetricCard({
  label,
  value,
  icon,
  truncateValue = false,
}: KpiMetricCardProps) {
  return (
    <div className="rounded-lg border border-(--border-hairline) bg-(--surface-canvas) p-3">
      <div className="flex items-center gap-1.5 font-mono text-[11px] text-(--text-muted)">
        {icon}
        <span>{label}</span>
      </div>
      <p
        className={`mt-1 ${
          truncateValue
            ? "truncate text-sm font-semibold"
            : "font-mono text-lg font-semibold tabular-nums"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function ExecutiveSummaryCard({
  conclusion,
  responses,
  totalEngines,
}: ExecutiveSummaryCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const { streamedText, isStreaming } = useExecutiveStream(conclusion, responses);

  const effectiveNarrative = conclusion
    ? streamedText || conclusion.recommendedAction
    : "";

  return (
    <AnimatePresence mode="wait">
      {conclusion && (
        <motion.section
          key={conclusion.query}
          aria-label="Executive audit summary"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : CARD_TRANSITION}
          className="pl-card mb-8 space-y-5 bg-(--surface-subtle)"
        >
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-(--border-hairline) pb-4">
            <div className="flex items-center gap-2">
              <Sparkles
                aria-hidden="true"
                className="h-4 w-4 text-(--accent-primary)"
              />
              <h2 className="text-sm font-semibold tracking-tight">
                Executive Audit Summary
              </h2>
            </div>

            <ReportActions
              conclusion={conclusion}
              responses={responses}
              narrative={effectiveNarrative}
            />
          </header>

          <div className="grid gap-3 sm:grid-cols-3">
            <KpiMetricCard
              label="ENGINES SAMPLED"
              icon={<Layers aria-hidden="true" className="h-3.5 w-3.5" />}
              value={`${responses.length} / ${totalEngines}`}
            />

            <KpiMetricCard
              label="PRICE DISCREPANCIES"
              icon={
                conclusion.priceDiscrepanciesCount > 0 ? (
                  <AlertTriangle
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-amber-500"
                  />
                ) : (
                  <CheckCircle2
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-emerald-500"
                  />
                )
              }
              value={conclusion.priceDiscrepanciesCount}
            />

            <KpiMetricCard
              label="TOP RANK LEADER"
              value={conclusion.topVisibleProduct}
              truncateValue
            />
          </div>

          <ul className="space-y-2 text-sm">
            {conclusion.insights.map((insight, index) => (
              <li
                key={insight}
                className="flex items-start gap-2.5 text-(--text-primary)"
              >
                <span className="mt-0.5 rounded border border-(--border-hairline) bg-(--surface-canvas) px-1.5 py-0.5 font-mono text-[10px] text-(--text-muted)">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 rounded-lg border border-(--border-hairline) bg-(--surface-canvas) p-3.5">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-(--text-muted)">
              <Radio
                aria-hidden="true"
                className={`h-3 w-3 text-(--accent-primary) ${
                  isStreaming ? "animate-pulse" : ""
                }`}
              />
              <span>
                {isStreaming
                  ? "Streaming AI Synthesis..."
                  : "AI Executive Synthesis"}
              </span>
            </div>

            <p
              aria-live="polite"
              aria-busy={isStreaming}
              className="font-mono text-xs leading-relaxed text-(--text-primary)"
            >
              {effectiveNarrative}
              {isStreaming && (
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block h-3.5 w-1.5 animate-pulse bg-(--accent-primary) align-middle"
                />
              )}
            </p>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
