// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AI_MODEL_LABELS,
  AI_MODELS,
  CAMPAIGN_THEMES,
  SIMULATION_SCENARIOS,
} from "@/core/constants/lookup.constants";
import { AIProviderResponse } from "@/core/domain/lookup.types";
import { useMultiEngineLookup } from "./use-multi-engine-lookup";

function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useMultiEngineLookup", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stays idle with no network calls when query is empty", () => {
    const { result } = renderHook(
      () =>
        useMultiEngineLookup(
          "   ",
          CAMPAIGN_THEMES.BLACK_FRIDAY,
          SIMULATION_SCENARIOS.NORMAL
        ),
      { wrapper: createTestWrapper() }
    );

    expect(result.current.hasActiveQuery).toBe(false);
    expect(result.current.completedResponses).toHaveLength(0);
    expect(result.current.conclusion).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("isolates single-engine failures and synthesizes conclusion from surviving engines", async () => {
    fetchMock.mockImplementation(async (_url, init) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as {
        modelId: string;
      };

      if (body.modelId === AI_MODELS.CLAUDE) {
        return new Response(
          JSON.stringify({ error: "Claude upstream outage" }),
          { status: 502 }
        );
      }

      const payload: AIProviderResponse = {
        modelId: body.modelId as AIProviderResponse["modelId"],
        modelName:
          AI_MODEL_LABELS[body.modelId as keyof typeof AI_MODEL_LABELS],
        latencyMs: 400,
        citations: Array.of({
          id: `${body.modelId}-1`,
          sku: "SNY-100",
          name: "Sony WH-1000XM5",
          brand: "Sony",
          realPrice: 399,
          citedPrice: 399,
          rank: 1,
          sentiment: "positive" as const,
          sources: Array.of("rtings.com"),
          modelId: body.modelId as AIProviderResponse["modelId"],
        }),
      };

      return new Response(JSON.stringify(payload), { status: 200 });
    });

    const { result } = renderHook(
      () =>
        useMultiEngineLookup(
          "wireless headphones",
          CAMPAIGN_THEMES.BLACK_FRIDAY,
          SIMULATION_SCENARIOS.NORMAL
        ),
      { wrapper: createTestWrapper() }
    );

    await waitFor(() => {
      expect(result.current.completedResponses).toHaveLength(2);
    });

    expect(result.current.totalEngines).toBe(3);
    expect(result.current.conclusion?.topVisibleProduct).toBe("Sony WH-1000XM5");
    expect(result.current.conclusion?.totalModelsAnalyzed).toBe(2);

    const claudeSlot = result.current.engineSlots.find(
      (s) => s.adapter.modelId === AI_MODELS.CLAUDE
    );
    expect(claudeSlot?.queryState.isError).toBe(true);
  });
});
