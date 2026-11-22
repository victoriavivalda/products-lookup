"use client";

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

export function TopNavBar({
  campaign,
  campaignLabel,
  onSelectCampaign,
}: TopNavBarProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <nav className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-(--border-hairline) pb-4">
      {/* Marca + Píldora sutil de campaña */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm font-bold uppercase tracking-[0.14em]">
          Products Lookup
        </span>

        <span className="hidden rounded-full bg-(--accent-surface) px-2.5 py-0.5 font-mono text-xs font-medium text-(--accent-primary) sm:inline-flex">
          {campaignLabel}
        </span>
      </div>

      {/* Pestañas de campaña */}
      <div
        role="tablist"
        aria-label="Seasonal retail campaign theme"
        className="flex items-center gap-5 font-mono text-xs"
      >
        {CAMPAIGN_OPTIONS.map((theme) => {
          const active = campaign === theme;
          return (
            <button
              key={theme}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelectCampaign(theme)}
              className={`relative cursor-pointer py-1 transition-colors ${
                active
                  ? "font-semibold text-(--text-primary)"
                  : "text-(--text-muted) hover:text-(--text-primary)"
              }`}
            >
              {CAMPAIGN_THEME_LABELS[theme]}
              {active && (
                <motion.span
                  layoutId="editorial-campaign-underline"
                  transition={{
                    type: "spring",
                    stiffness: 450,
                    damping: 35,
                    duration: prefersReducedMotion ? 0 : undefined,
                  }}
                  className="absolute inset-x-0 -bottom-4.25 h-0.5"
                  style={{ backgroundColor: "var(--accent-primary)" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
