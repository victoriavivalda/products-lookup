"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";

interface EmptyLookupStateProps {
  presets: readonly string[];
  onSelectPreset: (preset: string) => void;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function EmptyLookupState({
  presets,
  onSelectPreset,
}: EmptyLookupStateProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      aria-label="Empty search state"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
      className="pl-card flex flex-col items-center justify-center bg-(--surface-subtle) py-16 text-center"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-(--border-hairline) bg-(--surface-canvas)">
        <Search aria-hidden="true" className="h-4 w-4 text-(--text-muted)" />
      </div>

      <h2 className="text-sm font-semibold tracking-tight">
        Ready to audit AI answer engines
      </h2>

      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-(--text-muted)">
        Type any product or shopping query above, or select a sample prompt
        below to inspect rankings, pricing accuracy, and cited sources across
        models.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onSelectPreset(preset)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--border-hairline) bg-(--surface-canvas) px-3 py-1.5 font-mono text-xs transition hover:border-(--border-hover)"
          >
            <Sparkles
              aria-hidden="true"
              className="h-3 w-3 text-(--accent-primary)"
            />
            <span>{preset}</span>
          </button>
        ))}
      </div>
    </motion.section>
  );
}
