"use client";

import { useState } from "react";
import { useCampaignTheme } from "@/features/lookup/hooks/use-campaign-theme";
import { useMultiEngineLookup } from "@/features/lookup/hooks/use-multi-engine-lookup";
import { TopNavBar } from "@/features/lookup/components/TopNavBar";
import { SearchCommandBar } from "@/features/lookup/components/SearchCommandBar";
import { ExecutiveSummaryCard } from "@/features/lookup/components/ExecutiveSummaryCard";
import { ProviderResultColumn } from "@/features/lookup/components/ProviderResultColumn";

const PRESET_PROMPTS = [
  "best noise cancelling headphones",
  "4k oled gaming monitor deals",
  "espresso machine under 500",
];

export default function ProductsLookupPage() {
  const [query, setQuery] = useState(PRESET_PROMPTS);
  const { campaign, setCampaign, label } = useCampaignTheme("black-friday");
  const { engineSlots, completedResponses, totalEngines, conclusion } =
    useMultiEngineLookup(query);

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
            Real-time citation telemetry, stale pricing detection, and automated executive reporting.
          </p>
        </header>

        <SearchCommandBar
          query={query}
          presets={PRESET_PROMPTS}
          onQueryChange={setQuery}
        />

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
      </main>
    </div>
  );
}
