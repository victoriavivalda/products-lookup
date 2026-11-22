"use client";

import { useState } from "react";
import {
  CAMPAIGN_PRESET_PROMPTS,
  CAMPAIGN_THEMES,
} from "@/core/constants/lookup.constants";
import { useCampaignTheme } from "@/features/lookup/hooks/use-campaign-theme";
import { useMultiEngineLookup } from "@/features/lookup/hooks/use-multi-engine-lookup";
import { TopNavBar } from "@/features/lookup/components/TopNavBar";
import { SearchCommandBar } from "@/features/lookup/components/SearchCommandBar";
import { ExecutiveSummaryCard } from "@/features/lookup/components/ExecutiveSummaryCard";
import { ProviderResultColumn } from "@/features/lookup/components/ProviderResultColumn";
import { EmptyLookupState } from "@/features/lookup/components/EmptyLookupState";
import { EngineTelemetryChart } from "@/features/lookup/components/EngineTelemetryChart";
import { VisibilityMatrixChart } from "@/features/lookup/components/visibility-matrix/VisibilityMatrixChart";

export default function ProductsLookupPage() {
  const [query, setQuery] = useState<string>("");
  const { campaign, setCampaign, label } = useCampaignTheme(
    CAMPAIGN_THEMES.BLACK_FRIDAY
  );
  const {
    engineSlots,
    completedResponses,
    totalEngines,
    conclusion,
    hasActiveQuery,
  } = useMultiEngineLookup(query, campaign);

  const activePresets = CAMPAIGN_PRESET_PROMPTS[campaign];

  return (
    <div className="min-h-screen transition-colors duration-200">
      <main className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <TopNavBar
          campaign={campaign}
          campaignLabel={label}
          onSelectCampaign={setCampaign}
        />

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
          query={query}
          presets={activePresets}
          onQueryChange={setQuery}
        />

        {!hasActiveQuery ? (
          <EmptyLookupState
            presets={activePresets}
            onSelectPreset={setQuery}
          />
        ) : (
          <>
            <ExecutiveSummaryCard
              conclusion={conclusion}
              responses={completedResponses}
              totalEngines={totalEngines}
            />
            
            <div className="grid gap-6 lg:grid-cols-3">
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
      </main>
    </div>
  );
}
