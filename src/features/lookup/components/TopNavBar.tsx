"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, FlaskConical } from "lucide-react";
import {
  CAMPAIGN_THEMES,
  CampaignTheme,
  SIMULATION_SCENARIO_LABELS,
  SIMULATION_SCENARIOS,
  SimulationScenario,
} from "@/core/constants/lookup.constants";

interface TopNavBarProps {
  campaign: CampaignTheme;
  campaignLabel: string;
  onSelectCampaign: (theme: CampaignTheme) => void;
  scenario: SimulationScenario;
  onSelectScenario: (scenario: SimulationScenario) => void;
}

const CAMPAIGN_OPTIONS: CampaignTheme[] = Object.values(CAMPAIGN_THEMES);
const SCENARIO_OPTIONS: SimulationScenario[] = Object.values(SIMULATION_SCENARIOS);

const CAMPAIGN_TAB_LABELS: Record<CampaignTheme, string> = {
  [CAMPAIGN_THEMES.BLACK_FRIDAY]: "Black Friday",
  [CAMPAIGN_THEMES.CHRISTMAS]: "Christmas",
  [CAMPAIGN_THEMES.JULY_4]: "4th of July",
};

export function TopNavBar({
  campaign,
  campaignLabel,
  onSelectCampaign,
  scenario,
  onSelectScenario,
}: TopNavBarProps) {
  const prefersReducedMotion = useReducedMotion();
  const isSimulating = scenario !== SIMULATION_SCENARIOS.NORMAL;

  return (
    <nav className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
      {/* Brand Wordmark + Subtle Live Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: "var(--accent-primary)" }}
          />
          <span className="font-mono text-sm font-bold uppercase tracking-[0.14em]">
            Products Lookup
          </span>
        </div>

        <span className="hidden text-[var(--border-hover)] sm:inline">/</span>

        <span className="hidden font-mono text-xs text-[var(--text-muted)] sm:inline">
          {campaignLabel}
        </span>
      </div>

      {/* Borderless Editorial Controls */}
      <div className="flex items-center gap-5 font-mono text-xs">
        {/* Clean Underline Campaign Tabs */}
        <div className="flex items-center gap-5">
          {CAMPAIGN_OPTIONS.map((theme) => {
            const active = campaign === theme;
            return (
              <button
                key={theme}
                type="button"
                onClick={() => onSelectCampaign(theme)}
                className={`relative py-1 transition-colors ${
                  active
                    ? "font-semibold text-[var(--text-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {CAMPAIGN_TAB_LABELS[theme]}
                {active && (
                  <motion.span
                    layoutId="editorial-campaign-underline"
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 35,
                      duration: prefersReducedMotion ? 0 : undefined,
                    }}
                    className="absolute inset-x-0 -bottom-[17px] h-[2px]"
                    style={{ backgroundColor: "var(--accent-primary)" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <span className="h-4 w-px bg-[var(--border-hairline)]" />

        {/* Tightly Aligned Ghost Simulator Select */}
        <div
          className={`relative inline-flex items-center rounded-md px-2 py-1 transition-colors ${
            isSimulating
              ? "bg-[var(--accent-surface)] font-semibold text-[var(--accent-primary)]"
              : "text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
          }`}
        >
          <FlaskConical className="pointer-events-none mr-1.5 h-3.5 w-3.5 shrink-0" />
          <select
            aria-label="Simulation scenario"
            value={scenario}
            onChange={(e) => onSelectScenario(e.target.value as SimulationScenario)}
            className="cursor-pointer appearance-none bg-transparent pr-4 outline-none"
          >
            {SCENARIO_OPTIONS.map((opt) => (
              <option
                key={opt}
                value={opt}
                className="bg-[var(--surface-canvas)] text-[var(--text-primary)]"
              >
                {opt === SIMULATION_SCENARIOS.NORMAL
                  ? "Sim: Off"
                  : `Sim: ${SIMULATION_SCENARIO_LABELS[opt]}`}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 opacity-75" />
        </div>
      </div>
    </nav>
  );
}
