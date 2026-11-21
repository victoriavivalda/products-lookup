"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface SearchCommandBarProps {
  query: string;
  presets: string[];
  onQueryChange: (value: string) => void;
}

export function SearchCommandBar({ query, presets, onQueryChange }: SearchCommandBarProps) {
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

  return (
    <div className="mb-10 space-y-4">
      <div className="pl-card flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Enter consumer shopping prompt..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <kbd className="hidden rounded border border-[var(--border-hairline)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-muted)] sm:inline-block">
          ⌘K
        </kbd>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-[var(--text-muted)]">Quick prompts:</span>
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => onQueryChange(preset)}
            className="rounded-md border border-[var(--border-hairline)] px-2.5 py-1 font-mono text-xs text-[var(--text-muted)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
