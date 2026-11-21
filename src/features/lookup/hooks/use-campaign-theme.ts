import { useEffect, useState } from "react";

export type CampaignTheme = "black-friday" | "christmas" | "july4";

export const CAMPAIGN_LABELS: Record<CampaignTheme, string> = {
  "black-friday": "Black Friday Telemetry",
  christmas: "Christmas Sales",
  july4: "4th of July Monitor",
};

export function useCampaignTheme(initialTheme: CampaignTheme = "black-friday") {
  const [campaign, setCampaign] = useState<CampaignTheme>(initialTheme);

  useEffect(() => {
    if (campaign === "black-friday") {
      document.documentElement.removeAttribute("data-campaign");
    } else {
      document.documentElement.setAttribute("data-campaign", campaign);
    }
  }, [campaign]);

  return { campaign, setCampaign, label: CAMPAIGN_LABELS[campaign] };
}
