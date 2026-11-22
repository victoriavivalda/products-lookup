"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Globe } from "lucide-react";
import { ProductCitation } from "@/core/domain/lookup.types";

interface CitationItemCardProps {
  item: ProductCitation;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

function PriceVerificationBadge({
  citedPrice,
  realPrice,
}: {
  citedPrice: number;
  realPrice: number;
}) {
  const hasPriceMismatch = citedPrice !== realPrice;

  if (hasPriceMismatch) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-xs tabular-nums text-amber-700 dark:text-amber-400">
        <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
        <span>
          Cited <strong>${citedPrice}</strong> · Real ${realPrice}
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs tabular-nums text-emerald-700 dark:text-emerald-400">
      <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      <span>${citedPrice} Verified</span>
    </span>
  );
}

export function CitationItemCard({ item }: CitationItemCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      aria-label={`Rank ${item.rank}: ${item.name}`}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
      className="group space-y-3 rounded-lg border border-(--border-hairline) bg-(--surface-subtle) p-4 transition-colors hover:border-(--border-hover)"
    >
      <header className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center rounded border border-(--border-hairline) bg-(--surface-canvas) px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums">
          <span className="sr-only">Rank </span>#{item.rank}
        </span>
        <span className="font-mono text-[11px] text-(--text-muted)">
          {item.sku}
        </span>
      </header>

      <h4 className="text-sm font-medium leading-snug tracking-tight">
        {item.name}
      </h4>

      <div>
        <PriceVerificationBadge
          citedPrice={item.citedPrice}
          realPrice={item.realPrice}
        />
      </div>

      {item.sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-(--border-hairline) pt-2.5">
          <Globe aria-hidden="true" className="h-3 w-3 text-(--text-muted)" />
          <ul aria-label="Cited sources" className="flex flex-wrap gap-1.5">
            {item.sources.map((source) => (
              <li
                key={source}
                className="rounded border border-(--border-hairline) bg-(--surface-canvas) px-1.5 py-0.5 font-mono text-[10px] text-(--text-muted)"
              >
                {source}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.article>
  );
}
