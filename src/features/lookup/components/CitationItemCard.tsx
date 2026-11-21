"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Globe } from "lucide-react";
import { ProductCitation } from "@/core/domain/lookup.types";

export function CitationItemCard({ item }: { item: ProductCitation }) {
  const hasPriceMismatch = item.citedPrice !== item.realPrice;

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group space-y-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-subtle)] p-4 transition-colors hover:border-[var(--border-hover)]"
    >
      {/* Header: Rank Badge + SKU */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center rounded border border-[var(--border-hairline)] bg-[var(--surface-canvas)] px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums">
          #{item.rank}
        </span>
        <span className="font-mono text-[11px] text-[var(--text-muted)]">
          {item.sku}
        </span>
      </div>

      {/* Product Title */}
      <p className="text-sm font-medium leading-snug tracking-tight">
        {item.name}
      </p>

      {/* Price Verification Pill */}
      <div>
        {hasPriceMismatch ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-xs tabular-nums text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>
              Cited <strong>${item.citedPrice}</strong> · Real ${item.realPrice}
            </span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs tabular-nums text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>${item.citedPrice} Verified</span>
          </span>
        )}
      </div>

      {/* Cited Sources */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-[var(--border-hairline)] pt-2.5">
        <Globe className="h-3 w-3 text-[var(--text-muted)]" />
        {item.sources.map((source) => (
          <span
            key={source}
            className="rounded bg-[var(--surface-canvas)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-muted)] border border-[var(--border-hairline)]"
          >
            {source}
          </span>
        ))}
      </div>
    </motion.article>
  );
}
