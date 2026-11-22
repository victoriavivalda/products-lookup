"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, Search, X } from "lucide-react";

interface SearchCommandBarProps {
  value: string;
  presets: readonly string[];
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
}

export function SearchCommandBar({
  value,
  presets,
  onChange,
  onSubmit,
}: SearchCommandBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <section className="mb-8 space-y-3">
      <form
        onSubmit={handleFormSubmit}
        className="pl-card flex items-center gap-3 p-2 pl-4 focus-within:border-[var(--accent-primary)]"
      >
        <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter a product query or shopping prompt (e.g., best espresso machine under $500)..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              onSubmit("");
            }}
            aria-label="Clear query"
            className="rounded-md p-1.5 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        <kbd className="hidden rounded border border-[var(--border-hairline)] bg-[var(--surface-subtle)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-muted)] sm:inline-block">
          ⌘K
        </kbd>

        <button
          type="submit"
          disabled={!value.trim()}
          className="pl-accent-pill inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 font-mono text-xs font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span>Inspect</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] text-[var(--text-muted)]">
          Quick prompts:
        </span>
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              onChange(preset);
              onSubmit(preset);
            }}
            className="rounded-full border border-[var(--border-hairline)] bg-[var(--surface-subtle)] px-3 py-1 font-mono text-[11px] text-[var(--text-primary)] transition hover:border-[var(--accent-primary)]"
          >
            {preset}
          </button>
        ))}
      </div>
    </section>
  );
}
