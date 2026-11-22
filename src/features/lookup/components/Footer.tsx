"use client";

import { KeyboardEvent, useId } from "react";
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

function getScenarioStyles(isActive: boolean, isNormal: boolean) {
  if (!isActive) {
    return {
      button: "text-(--text-muted) hover:text-(--text-primary)",
      dot: "",
    };
  }

  return isNormal
    ? { button: "font-semibold text-(--text-primary)", dot: "bg-(--text-primary)" }
    : { button: "font-semibold text-(--accent-primary)", dot: "bg-(--accent-primary)" };
}

export function Footer({ scenario, onSelectScenario }: FooterProps) {
  const baseId = useId();

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    const isNext = event.key === "ArrowRight" || event.key === "ArrowDown";
    const isPrev = event.key === "ArrowLeft" || event.key === "ArrowUp";
    if (!isNext && !isPrev) return;

    event.preventDefault();
    const direction = isNext ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + SCENARIO_OPTIONS.length) %
      SCENARIO_OPTIONS.length;

    onSelectScenario(SCENARIO_OPTIONS[nextIndex]);
  };

  return (
    <footer className="mt-16 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-(--border-hairline) pt-6 pb-8 font-mono text-xs text-(--text-muted)">
      <span className="inline-flex items-center gap-1.5 opacity-80">
        <Activity aria-hidden="true" className="size-3.5" />
        <span>API Conditions:</span>
      </span>

      <div
        role="radiogroup"
        aria-label="Emulate API and network conditions"
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5"
      >
        {SCENARIO_OPTIONS.map((option, index) => {
          const isActive = scenario === option;
          const isNormal = option === SIMULATION_SCENARIOS.NORMAL;
          const styles = getScenarioStyles(isActive, isNormal);
          const tooltipId = `${baseId}-tooltip-${option}`;

          return (
            <div key={option} className="group relative inline-flex items-center">
              <button
                type="button"
                role="radio"
                aria-checked={isActive}
                aria-describedby={tooltipId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onSelectScenario(option)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`inline-flex cursor-pointer items-center gap-1.5 transition-colors ${styles.button}`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className={`size-1.5 rounded-full ${styles.dot}`}
                  />
                )}
                <span>{SIMULATION_SCENARIO_LABELS[option]}</span>
              </button>

              <span
                id={tooltipId}
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2.5 w-max max-w-60 -translate-x-1/2 translate-y-1 rounded-md border border-(--border-hairline) bg-(--surface-elevated) px-2.5 py-1.5 text-center font-sans text-[11px] leading-snug text-(--text-primary) opacity-0 shadow-sm transition-all duration-150 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
              >
                {SCENARIO_DESCRIPTIONS[option]}
              </span>
            </div>
          );
        })}
      </div>
    </footer>
  );
}
