"use client";

import { Activity, Calendar, FlaskConical } from "lucide-react";
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

export function TopNavBar({
  campaign,
  campaignLabel,
  onSelectCampaign,
  scenario,
  onSelectScenario,
}: TopNavBarProps) {
  return (
    <nav className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm font-semibold tracking-tight">
          products-lookup
        </span>
        <span className="pl-accent-pill inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium">
          <Activity className="h-3 w-3" />
          {campaignLabel}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Telemetry Edge-Case Simulator */}
        <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-subtle)] p-1 font-mono text-[11px]">
          <FlaskConical className="ml-1.5 h-3 w-3 text-[var(--text-muted)]" />
          {SCENARIO_OPTIONS.map((opt) => {
            const active = scenario === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onSelectScenario(opt)}
                className={`rounded-md px-2 py-0.5 transition ${
                  active
                    ? "bg-[var(--surface-canvas)] font-semibold text-[var(--text-primary)] shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {SIMULATION_SCENARIO_LABELS[opt]}
              </button>
            );
          })}
        </div>

        {/* Campaign Theme Switcher */}
        <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--text-muted)]">
          <Calendar className="h-3.5 w-3.5" />
          <div className="flex rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-subtle)] p-0.5">
            {CAMPAIGN_OPTIONS.map((theme) => {
              const active = campaign === theme;
              return (
                <button
                  key={theme}
                  type="button"
                  onClick={() => onSelectCampaign(theme)}
                  className={`rounded-md px-2.5 py-1 text-[11px] transition ${
                    active
                      ? "bg-[var(--surface-canvas)] font-medium text-[var(--text-primary)] shadow-2xs"
                      : "hover:text-[var(--text-primary)]"
                  }`}
                >
                  {theme}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
