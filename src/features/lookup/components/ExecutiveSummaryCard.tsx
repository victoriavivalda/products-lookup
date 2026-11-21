"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
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
          key={`${conclusion.query}-${responses.length}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="pl-card mb-8 space-y-4"
          style={{ backgroundColor: "var(--surface-subtle)" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: "var(--accent-primary)" }} />
              <h2 className="text-sm font-semibold tracking-tight">
                Automated Executive Conclusions
              </h2>
              <span className="font-mono text-xs text-[var(--text-muted)]">
                ({responses.length}/{totalEngines} engines ready)
              </span>
            </div>

            <ReportActions conclusion={conclusion} responses={responses} />
          </div>

          <ul className="space-y-1.5 text-sm">
            {conclusion.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2 text-[var(--text-primary)]">
                <span className="mt-0.5 font-mono text-xs text-[var(--text-muted)]">
                  0{idx + 1}
                </span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-canvas)] p-3 font-mono text-xs text-[var(--text-muted)]">
            <strong className="text-[var(--text-primary)]">Recommended Action:</strong>{" "}
            {conclusion.recommendedAction}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
