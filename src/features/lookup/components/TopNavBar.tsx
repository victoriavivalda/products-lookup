"use client";

import { KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CAMPAIGN_THEME_LABELS,
  CAMPAIGN_THEMES,
  CampaignTheme,
} from "@/core/constants/lookup.constants";

interface TopNavBarProps {
  campaign: CampaignTheme;
  campaignLabel: string;
  onSelectCampaign: (theme: CampaignTheme) => void;
}

const CAMPAIGN_OPTIONS: CampaignTheme[] = Object.values(CAMPAIGN_THEMES);

const UNDERLINE_SPRING = {
  type: "spring",
  stiffness: 450,
  damping: 35,
} as const;

export function TopNavBar({
  campaign,
  campaignLabel,
  onSelectCampaign,
}: TopNavBarProps) {
  const prefersReducedMotion = useReducedMotion();

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + CAMPAIGN_OPTIONS.length) %
      CAMPAIGN_OPTIONS.length;

    onSelectCampaign(CAMPAIGN_OPTIONS[nextIndex]);
  };

  return (
    <nav
      aria-label="Primary navigation"
      className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-(--border-hairline) pb-4"
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm font-bold uppercase tracking-[0.14em]">
          Products Lookup
        </span>

        <span className="hidden rounded-full bg-(--accent-surface) px-2.5 py-0.5 font-mono text-xs font-medium text-(--accent-primary) sm:inline-flex">
          {campaignLabel}
        </span>
      </div>

      <div
        role="tablist"
        aria-label="Seasonal retail campaign theme"
        className="flex items-center gap-5 font-mono text-xs"
      >
        {CAMPAIGN_OPTIONS.map((theme, index) => {
          const isActive = campaign === theme;

          return (
            <button
              key={theme}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelectCampaign(theme)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`relative cursor-pointer py-1 transition-colors ${
                isActive
                  ? "font-semibold text-(--text-primary)"
                  : "text-(--text-muted) hover:text-(--text-primary)"
              }`}
            >
              {CAMPAIGN_THEME_LABELS[theme]}

              {isActive && (
                <motion.span
                  layoutId="editorial-campaign-underline"
                  transition={
                    prefersReducedMotion ? { duration: 0 } : UNDERLINE_SPRING
                  }
                  className="absolute inset-x-0 -bottom-4.25 h-0.5 bg-(--accent-primary)"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
