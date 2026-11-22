import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AI_MODEL_LABELS,
  AI_MODELS,
  AIModelId,
  SIMULATION_SCENARIOS,
} from "@/core/constants/lookup.constants";
import { AIProviderResponse } from "@/core/domain/lookup.types";
import { AIProviderStrategy } from "./ai-provider.strategy";
import { SimulationDecoratorStrategy } from "./simulation-decorator.strategy";

function createMockResponse(modelId: AIModelId): AIProviderResponse {
  return {
    modelId,
    modelName: AI_MODEL_LABELS[modelId],
    latencyMs: 120,
    citations: [
      {
        id: `${modelId}-1`,
        sku: "SKU-1",
        name: "Product Alpha",
        brand: "Sony",
        realPrice: 200,
        citedPrice: 200,
        rank: 1,
        sentiment: "positive",
        sources: ["rtings.com"],
        modelId,
      },
      {
        id: `${modelId}-2`,
        sku: "SKU-2",
        name: "Product Beta",
        brand: "Bose",
        realPrice: 300,
        citedPrice: 300,
        rank: 2,
        sentiment: "positive",
        sources: ["wirecutter.com"],
        modelId,
      },
    ],
  };
}

function createStubStrategy(
  modelId: AIModelId = AI_MODELS.GEMINI
): AIProviderStrategy {
  return {
    modelId,
    modelName: AI_MODEL_LABELS[modelId],
    execute: vi.fn(async () => createMockResponse(modelId)),
  };
}

describe("SimulationDecoratorStrategy", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("delegates directly to wrapped strategy in NORMAL scenario", async () => {
    const wrapped = createStubStrategy(AI_MODELS.GEMINI);
    const decorator = new SimulationDecoratorStrategy(
      wrapped,
      SIMULATION_SCENARIOS.NORMAL
    );

    const result = await decorator.execute("headphones");

    expect(wrapped.execute).toHaveBeenCalledOnce();
    expect(result.latencyMs).toBe(120);
    expect(result.citations[0].citedPrice).toBe(200);
  });

  it("injects artificial delay and updates latencyMs in SLOW_NETWORK scenario", async () => {
    const wrapped = createStubStrategy(AI_MODELS.CHATGPT);
    const decorator = new SimulationDecoratorStrategy(
      wrapped,
      SIMULATION_SCENARIOS.SLOW_NETWORK
    );

    const promise = decorator.execute("headphones");
    await vi.advanceTimersByTimeAsync(2100);
    const result = await promise;

    expect(wrapped.execute).toHaveBeenCalledOnce();
    expect(result.latencyMs).toBeGreaterThanOrEqual(2100);
  });

  it("throws 502 error only for ChatGPT in PARTIAL_OUTAGE scenario", async () => {
    const chatgptWrapped = createStubStrategy(AI_MODELS.CHATGPT);
    const geminiWrapped = createStubStrategy(AI_MODELS.GEMINI);

    const chatgptDecorator = new SimulationDecoratorStrategy(
      chatgptWrapped,
      SIMULATION_SCENARIOS.PARTIAL_OUTAGE
    );
    const geminiDecorator = new SimulationDecoratorStrategy(
      geminiWrapped,
      SIMULATION_SCENARIOS.PARTIAL_OUTAGE
    );

    const outagePromise = chatgptDecorator.execute("headphones");
    const assertion = expect(outagePromise).rejects.toThrow("502 Bad Gateway");
    await vi.advanceTimersByTimeAsync(900);
    await assertion;

    expect(chatgptWrapped.execute).not.toHaveBeenCalled();

    const geminiResult = await geminiDecorator.execute("headphones");
    expect(geminiWrapped.execute).toHaveBeenCalledOnce();
    expect(geminiResult.modelId).toBe(AI_MODELS.GEMINI);
  });

  it("inflates citedPrice and sets neutral sentiment in PRICE_DRIFT scenario", async () => {
    const wrapped = createStubStrategy(AI_MODELS.CLAUDE);
    const decorator = new SimulationDecoratorStrategy(
      wrapped,
      SIMULATION_SCENARIOS.PRICE_DRIFT
    );

    const result = await decorator.execute("headphones");

    expect(result.citations[0]).toMatchObject({
      realPrice: 200,
      citedPrice: 245,
      sentiment: "neutral",
    });
    expect(result.citations[1]).toMatchObject({
      realPrice: 300,
      citedPrice: 360,
      sentiment: "neutral",
    });
  });

  it("aborts immediately during simulated delay without calling wrapped strategy", async () => {
    const controller = new AbortController();
    const wrapped = createStubStrategy(AI_MODELS.CLAUDE);
    const decorator = new SimulationDecoratorStrategy(
      wrapped,
      SIMULATION_SCENARIOS.SLOW_NETWORK
    );

    const promise = decorator.execute("headphones", undefined, controller.signal);
    controller.abort();

    await expect(promise).rejects.toThrow("Aborted");
    expect(wrapped.execute).not.toHaveBeenCalled();
  });
});
