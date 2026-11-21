import { Palette } from "lucide-react";
import { CAMPAIGN_LABELS, CampaignTheme } from "../hooks/use-campaign-theme";

interface TopNavBarProps {
  campaign: CampaignTheme;
  campaignLabel: string;
  onSelectCampaign: (theme: CampaignTheme) => void;
}

export function TopNavBar({ campaign, campaignLabel, onSelectCampaign }: TopNavBarProps) {
  const themes = Object.keys(CAMPAIGN_LABELS) as CampaignTheme[];

  return (
    <nav className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm font-semibold tracking-tight">products-lookup</span>
        <span className="pl-accent-pill rounded-full px-2.5 py-0.5 font-mono text-xs">
          {campaignLabel}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Palette className="h-3.5 w-3.5 text-[var(--text-muted)]" />
        <span className="font-mono text-xs text-[var(--text-muted)]">Theme:</span>
        {themes.map((themeKey) => (
          <button
            key={themeKey}
            onClick={() => onSelectCampaign(themeKey)}
            className={`rounded-md px-2.5 py-1 font-mono text-xs transition ${
              campaign === themeKey
                ? "pl-accent-pill font-medium"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {themeKey}
          </button>
        ))}
      </div>
    </nav>
  );
}
