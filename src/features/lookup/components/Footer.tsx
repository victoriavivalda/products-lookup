"use client";

import { Activity } from "lucide-react";
import {
  SIMULATION_SCENARIO_LABELS,
  SIMULATION_SCENARIOS,
  SimulationScenario,
} from "@/core/constants/lookup.constants";

interface FooterProps {
  scenario: SimulationScenario;
  onSelectScenario: (scenario: SimulationScenario) => void;
}

const SCENARIO_OPTIONS: SimulationScenario[] = Object.values(SIMULATION_SCENARIOS);

const SCENARIO_DESCRIPTIONS: Record<SimulationScenario, string> = {
  [SIMULATION_SCENARIOS.NORMAL]:
    "Standard live latency and accurate catalog pricing",
  [SIMULATION_SCENARIOS.SLOW_NETWORK]:
    "Injects artificial delay to test loading states and telemetry",
  [SIMULATION_SCENARIOS.PARTIAL_OUTAGE]:
    "Simulates an engine timeout to test graceful error fallback",
  [SIMULATION_SCENARIOS.PRICE_DRIFT]:
    "Injects stale prices to trigger discrepancy alerts",
};

export function Footer({ scenario, onSelectScenario }: FooterProps) {
  return (
    <footer className="mt-16 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-(--border-hairline) pt-6 pb-8 font-mono text-xs text-(--text-muted)">
      <span className="inline-flex items-center gap-1.5 opacity-80">
        <Activity className="size-3.5" />
        <span>API Conditions:</span>
      </span>

      <div
        role="radiogroup"
        aria-label="Emulate API and network conditions"
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5"
      >
        {SCENARIO_OPTIONS.map((opt) => {
          const active = scenario === opt;
          const isNormal = opt === SIMULATION_SCENARIOS.NORMAL;
          const description = SCENARIO_DESCRIPTIONS[opt];

          return (
            <div key={opt} className="group relative inline-flex items-center">
              <button
                type="button"
                role="radio"
                aria-checked={active}
                aria-describedby={`tooltip-${opt}`}
                onClick={() => onSelectScenario(opt)}
                className={`inline-flex cursor-pointer items-center gap-1.5 transition-colors ${
                  active
                    ? isNormal
                      ? "font-semibold text-(--text-primary)"
                      : "font-semibold text-(--accent-primary)"
                    : "text-(--text-muted) hover:text-(--text-primary)"
                }`}
              >
                {active && (
                  <span
                    className={`size-1.5 rounded-full ${
                      isNormal ? "bg-(--text-primary)" : "bg-(--accent-primary)"
                    }`}
                  />
                )}
                <span>{SIMULATION_SCENARIO_LABELS[opt]}</span>
              </button>

              {/* Clean Floating Tooltip (Hover & Keyboard Focus) */}
              <span
                id={`tooltip-${opt}`}
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2.5 w-max max-w-60 -translate-x-1/2 rounded-md border border-(--border-hairline) bg-(--surface-elevated) px-2.5 py-1.5 text-center font-sans text-[11px] leading-snug text-(--text-primary) opacity-0 shadow-sm transition-all duration-150 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 translate-y-1"
              >
                {description}
              </span>
            </div>
          );
        })}
      </div>
    </footer>
  );
}
