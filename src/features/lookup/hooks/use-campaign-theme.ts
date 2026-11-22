"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import {
  CAMPAIGN_LABELS,
  CAMPAIGN_THEMES,
  CampaignTheme,
  UI_CONFIG,
} from "@/core/constants/lookup.constants";

function applyThemeToDom(theme: CampaignTheme) {
  document.documentElement.setAttribute(UI_CONFIG.DOM_THEME_ATTRIBUTE, theme);
}

export function useCampaignTheme(
  initialTheme: CampaignTheme = CAMPAIGN_THEMES.BLACK_FRIDAY
) {
  const [campaign, setCampaignState] = useState<CampaignTheme>(initialTheme);

  useLayoutEffect(() => {
    applyThemeToDom(campaign);
  }, [campaign]);

  const setCampaign = useCallback((nextTheme: CampaignTheme) => {
    setCampaignState(nextTheme);
  }, []);

  return {
    campaign,
    setCampaign,
    label: CAMPAIGN_LABELS[campaign],
  };
}
