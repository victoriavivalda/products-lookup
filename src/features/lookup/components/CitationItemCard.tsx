"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { ProductCitation } from "@/core/domain/lookup.types";

export function CitationItemCard({ item }: { item: ProductCitation }) {
  const hasPriceMismatch = item.citedPrice !== item.realPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-2.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-subtle)] p-3.5"
    >
      <div>
        <span className="font-mono text-xs text-[var(--text-muted)]">
          Rank #{item.rank} · {item.sku}
        </span>
        <p className="text-sm font-medium leading-snug">{item.name}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {hasPriceMismatch ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-xs tabular-nums text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            Cited ${item.citedPrice} (Real ${item.realPrice})
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs tabular-nums text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />${item.citedPrice} Verified
          </span>
        )}

        <div className="flex items-center gap-1 font-mono text-[11px] text-[var(--text-muted)]">
          <ExternalLink className="h-3 w-3" />
          <span>{item.sources.length} sources</span>
        </div>
      </div>
    </motion.div>
  );
}
