import { useEffect, useState } from "react";
import {
  CAMPAIGN_LABELS,
  CAMPAIGN_THEMES,
  CampaignTheme,
  UI_CONFIG,
} from "@/core/constants/lookup.constants";

export function useCampaignTheme(
  initialTheme: CampaignTheme = CAMPAIGN_THEMES.BLACK_FRIDAY
) {
  const [campaign, setCampaign] = useState<CampaignTheme>(initialTheme);

  useEffect(() => {
      document.documentElement.setAttribute(UI_CONFIG.DOM_THEME_ATTRIBUTE, campaign);
  }, [campaign]);

  return { campaign, setCampaign, label: CAMPAIGN_LABELS[campaign] };
}
