import { describe, expect, it } from "vitest";
import {
  AI_MODELS,
  CAMPAIGN_THEMES,
} from "@/core/constants/lookup.constants";
import { buildDynamicMockCitations } from "./dynamic-catalog.repo";

describe("buildDynamicMockCitations", () => {
  it("generates distinct model-scoped citations with campaign-specific suffixes", () => {
    const xmasCitations = buildDynamicMockCitations(
      AI_MODELS.GEMINI,
      "wireless earbuds",
      CAMPAIGN_THEMES.CHRISTMAS
    );

    expect(xmasCitations).toHaveLength(2);
    expect(xmasCitations.at(0)?.id).toBe("gemini-1");
    expect(xmasCitations.at(1)?.id).toBe("gemini-2");
    expect(
      xmasCitations.some((c) => /holiday|gift|christmas/i.test(c.name))
    ).toBe(true);
  });

  it("maintains consistent SKUs across different AI models for the same query", () => {
    const gemini = buildDynamicMockCitations(AI_MODELS.GEMINI, "standing desk");
    const claude = buildDynamicMockCitations(AI_MODELS.CLAUDE, "standing desk");

    expect(gemini.map((c) => c.sku)).toEqual(claude.map((c) => c.sku));
  });
});
