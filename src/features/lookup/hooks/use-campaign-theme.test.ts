// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  CAMPAIGN_LABELS,
  CAMPAIGN_THEMES,
  UI_CONFIG,
} from "@/core/constants/lookup.constants";
import { useCampaignTheme } from "./use-campaign-theme";

describe("useCampaignTheme", () => {
  it("synchronizes data-campaign attribute on documentElement and updates label", () => {
    const { result } = renderHook(() =>
      useCampaignTheme(CAMPAIGN_THEMES.BLACK_FRIDAY)
    );

    expect(result.current.campaign).toBe(CAMPAIGN_THEMES.BLACK_FRIDAY);
    expect(result.current.label).toBe(
      CAMPAIGN_LABELS[CAMPAIGN_THEMES.BLACK_FRIDAY]
    );
    expect(
      document.documentElement.getAttribute(UI_CONFIG.DOM_THEME_ATTRIBUTE)
    ).toBe(CAMPAIGN_THEMES.BLACK_FRIDAY);

    act(() => {
      result.current.setCampaign(CAMPAIGN_THEMES.CHRISTMAS);
    });

    expect(result.current.campaign).toBe(CAMPAIGN_THEMES.CHRISTMAS);
    expect(result.current.label).toBe(
      CAMPAIGN_LABELS[CAMPAIGN_THEMES.CHRISTMAS]
    );
    expect(
      document.documentElement.getAttribute(UI_CONFIG.DOM_THEME_ATTRIBUTE)
    ).toBe(CAMPAIGN_THEMES.CHRISTMAS);
  });
});
