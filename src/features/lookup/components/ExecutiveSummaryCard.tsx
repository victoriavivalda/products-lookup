"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, AlertTriangle, Layers } from "lucide-react";
import { AIProviderResponse, ExecutiveConclusion } from "@/core/domain/lookup.types";
import { ReportActions } from "@/components/report/ReportActions";

interface ExecutiveSummaryCardProps {
  conclusion: ExecutiveConclusion | null;
  responses: AIProviderResponse[];
  totalEngines: number;
}

export function ExecutiveSummaryCard({
  conclusion,
  responses,
  totalEngines,
}: ExecutiveSummaryCardProps) {
  return (
    <AnimatePresence mode="wait">
      {conclusion && (
        <motion.section
          key={conclusion.query}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="pl-card mb-8 space-y-5"
          style={{ backgroundColor: "var(--surface-subtle)" }}
        >
          {/* Header + Export Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: "var(--accent-primary)" }} />
              <h2 className="text-sm font-semibold tracking-tight">
                Executive Audit Summary
              </h2>
            </div>

            <ReportActions conclusion={conclusion} responses={responses} />
          </div>

          {/* KPI Strip */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-canvas)] p-3">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-muted)]">
                <Layers className="h-3.5 w-3.5" />
                <span>ENGINES SAMPLED</span>
              </div>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                {responses.length} / {totalEngines}
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-canvas)] p-3">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-muted)]">
                {conclusion.priceDiscrepanciesCount > 0 ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                )}
                <span>PRICE DISCREPANCIES</span>
              </div>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                {conclusion.priceDiscrepanciesCount}
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-canvas)] p-3">
              <div className="font-mono text-[11px] text-[var(--text-muted)]">
                TOP RANK LEADER
              </div>
              <p className="mt-1 truncate text-sm font-semibold">
                {conclusion.topVisibleProduct}
              </p>
            </div>
          </div>

          {/* Insights List */}
          <ul className="space-y-2 text-sm">
            {conclusion.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-[var(--text-primary)]">
                <span className="mt-0.5 rounded bg-[var(--surface-canvas)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-muted)] border border-[var(--border-hairline)]">
                  0{idx + 1}
                </span>
                <span className="leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>

          {/* Action Banner */}
          <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-canvas)] p-3.5 font-mono text-xs leading-relaxed text-[var(--text-muted)]">
            <strong className="text-[var(--text-primary)]">Recommended Action:</strong>{" "}
            {conclusion.recommendedAction}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
