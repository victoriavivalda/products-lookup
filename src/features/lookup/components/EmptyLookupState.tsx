"use client";

import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";

interface EmptyLookupStateProps {
  presets: string[];
  onSelectPreset: (preset: string) => void;
}

export function EmptyLookupState({ presets, onSelectPreset }: EmptyLookupStateProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="pl-card flex flex-col items-center justify-center py-16 text-center"
      style={{ backgroundColor: "var(--surface-subtle)" }}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-hairline)] bg-[var(--surface-canvas)]">
        <Search className="h-4 w-4 text-[var(--text-muted)]" />
      </div>

      <h2 className="text-sm font-semibold tracking-tight">
        Ready to audit AI answer engines
      </h2>
      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-[var(--text-muted)]">
        Type any product or shopping query above, or select a sample prompt below to inspect rankings, pricing accuracy, and cited sources across models.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => onSelectPreset(preset)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-canvas)] px-3 py-1.5 font-mono text-xs transition hover:border-[var(--border-hover)]"
          >
            <Sparkles className="h-3 w-3" style={{ color: "var(--accent-primary)" }} />
            {preset}
          </button>
        ))}
      </div>
    </motion.section>
  );
}
