"use client";

import { useState } from "react";
import {
  CAMPAIGN_PRESET_PROMPTS,
  CAMPAIGN_THEMES,
  SIMULATION_SCENARIOS,
  SimulationScenario,
} from "@/core/constants/lookup.constants";
import { useCampaignTheme } from "@/features/lookup/hooks/use-campaign-theme";
import { useMultiEngineLookup } from "@/features/lookup/hooks/use-multi-engine-lookup";
import { TopNavBar } from "@/features/lookup/components/TopNavBar";
import { Footer } from "@/features/lookup/components/Footer";
import { SearchCommandBar } from "@/features/lookup/components/SearchCommandBar";
import { ExecutiveSummaryCard } from "@/features/lookup/components/ExecutiveSummaryCard";
import { ProviderResultColumn } from "@/features/lookup/components/ProviderResultColumn";
import { EmptyLookupState } from "@/features/lookup/components/EmptyLookupState";
import { EngineTelemetryChart } from "@/features/lookup/components/EngineTelemetryChart";
import { VisibilityMatrixChart } from "@/features/lookup/components/visibility-matrix/VisibilityMatrixChart";

export default function ProductsLookupPage() {
  const [scenario, setScenario] = useState<SimulationScenario>(
    SIMULATION_SCENARIOS.NORMAL
  );
  const [draftQuery, setDraftQuery] = useState<string>("");
  const [submittedQuery, setSubmittedQuery] = useState<string>("");

  const { campaign, setCampaign, label } = useCampaignTheme(
    CAMPAIGN_THEMES.BLACK_FRIDAY
  );

  const {
    engineSlots,
    completedResponses,
    totalEngines,
    conclusion,
    hasActiveQuery,
  } = useMultiEngineLookup(submittedQuery, campaign, scenario);

  const activePresets = CAMPAIGN_PRESET_PROMPTS[campaign];

  const handleSelectPreset = (preset: string) => {
    setDraftQuery(preset);
    setSubmittedQuery(preset);
  };

  return (
    <div className="flex min-h-screen flex-col transition-colors duration-200">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pt-10 md:pt-14">
        <TopNavBar
          campaign={campaign}
          campaignLabel={label}
          onSelectCampaign={setCampaign}
        />

        <p className="sr-only" aria-live="polite">
          {hasActiveQuery
            ? `${completedResponses.length} of ${totalEngines} AI search engines loaded.`
            : "Ready for product search."}
        </p>

        <header className="mb-8 max-w-2xl space-y-2.5">
          <h1
            className="font-semibold leading-[1.15] tracking-[-0.025em]"
            style={{ fontSize: "var(--fluid-h1)" }}
          >
            Inspect product visibility and price accuracy across AI engines
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Real-time citation telemetry, stale pricing detection, and automated
            executive reporting.
          </p>
        </header>

        <SearchCommandBar
          value={draftQuery}
          presets={activePresets}
          onChange={setDraftQuery}
          onSubmit={setSubmittedQuery}
        />

        <div className="flex-1">
          {!hasActiveQuery ? (
            <EmptyLookupState
              presets={activePresets}
              onSelectPreset={handleSelectPreset}
            />
          ) : (
            <>
              <ExecutiveSummaryCard
                conclusion={conclusion}
                responses={completedResponses}
                totalEngines={totalEngines}
              />

              <div className="mb-8 grid gap-6 lg:grid-cols-3">
                {engineSlots.map(({ adapter, queryState }) => (
                  <ProviderResultColumn
                    key={adapter.modelId}
                    adapter={adapter}
                    queryState={queryState}
                  />
                ))}
              </div>

              <EngineTelemetryChart responses={completedResponses} />
              <VisibilityMatrixChart responses={completedResponses} />
            </>
          )}
        </div>

        <Footer scenario={scenario} onSelectScenario={setScenario} />
      </main>
    </div>
  );
}
