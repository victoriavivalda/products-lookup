"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef } from "react";
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
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
  };

  const handleClear = () => {
    onChange("");
    onSubmit("");
    inputRef.current?.focus();
  };

  const handleSelectPreset = (preset: string) => {
    onChange(preset);
    onSubmit(preset);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && value) {
      e.preventDefault();
      handleClear();
    }
  };

  const hasText = value.trim().length > 0;

  return (
    <section aria-label="Product query search" className="mb-8 space-y-3">
      <form
        role="search"
        onSubmit={handleFormSubmit}
        className="pl-card flex items-center gap-3 p-2 pl-4 focus-within:border-(--accent-primary)"
      >
        <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-(--text-muted)" />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleInputKeyDown}
          aria-label="Product query or shopping prompt"
          placeholder="Enter a product query or shopping prompt (e.g., best espresso machine under $500)..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-(--text-muted)"
        />

        {value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear query"
            className="cursor-pointer rounded-md p-1.5 text-(--text-muted) transition hover:text-(--text-primary)"
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        )}

        <kbd
          aria-hidden="true"
          className="hidden rounded border border-(--border-hairline) bg-(--surface-subtle) px-1.5 py-0.5 font-mono text-[10px] text-(--text-muted) sm:inline-block"
        >
          ⌘K
        </kbd>

        <button
          type="submit"
          disabled={!hasText}
          className="pl-accent-pill inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 font-mono text-xs font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span>Inspect</span>
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] text-(--text-muted)">
          Quick prompts:
        </span>
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className="cursor-pointer rounded-full border border-(--border-hairline) bg-(--surface-subtle) px-3 py-1 font-mono text-[11px] text-(--text-primary) transition hover:border-(--accent-primary)"
          >
            {preset}
          </button>
        ))}
      </div>
    </section>
  );
}
