// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AI_MODEL_LABELS, AI_MODELS } from "@/core/constants/lookup.constants";
import { AIProviderResponse } from "@/core/domain/lookup.types";
import { VisibilityMatrixChart } from "./VisibilityMatrixChart";

afterEach(cleanup);

const SAMPLE_RESPONSES: AIProviderResponse[] = Array.of<AIProviderResponse>(
  {
    modelId: AI_MODELS.GEMINI,
    modelName: AI_MODEL_LABELS[AI_MODELS.GEMINI],
    latencyMs: 450,
    citations: Array.of({
      id: "g-1",
      sku: "SNY-XM5",
      name: "Sony WH-1000XM5",
      brand: "Sony",
      realPrice: 399,
      citedPrice: 399,
      rank: 1,
      sentiment: "positive",
      sources: Array.of("rtings.com"),
      modelId: AI_MODELS.GEMINI,
    }),
  },
  {
    modelId: AI_MODELS.CHATGPT,
    modelName: AI_MODEL_LABELS[AI_MODELS.CHATGPT],
    latencyMs: 820,
    citations: Array.of({
      id: "c-1",
      sku: "SNY-XM5",
      name: "Sony WH-1000XM5",
      brand: "Sony",
      realPrice: 399,
      citedPrice: 449,
      rank: 2,
      sentiment: "neutral",
      sources: Array.of("cnet.com"),
      modelId: AI_MODELS.CHATGPT,
    }),
  }
);

describe("VisibilityMatrixChart", () => {
  it("renders accessible SVG trajectory chart and highlights product series on keyboard focus", () => {
    render(<VisibilityMatrixChart responses={SAMPLE_RESPONSES} />);

    const chart = screen.getByRole("img", {
      name: /product ranking trajectory across ai search engines/i,
    });
    expect(chart).toBeDefined();

    const legendButton = screen.getByRole("button", {
      name: /sony wh-1000xm5.*2\/2 engines/i,
    });
    expect(legendButton.getAttribute("aria-pressed")).toBe("false");

    fireEvent.focus(legendButton);
    expect(legendButton.getAttribute("aria-pressed")).toBe("true");
  });
});
