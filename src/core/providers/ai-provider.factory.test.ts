import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AI_MODEL_LABELS,
  AI_MODELS,
  PROVIDER_MODES,
} from "@/core/constants/lookup.constants";
import {
  HttpLookupStrategy,
  ResilientAIProviderProxy,
} from "./ai-provider.strategy";
import { AIProviderFactory } from "./ai-provider.factory";

describe("AIProviderFactory", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates one strategy per configured AI model in order", () => {
    const strategies = AIProviderFactory.createAll(PROVIDER_MODES.MOCK);

    expect(strategies).toHaveLength(3);
    expect(strategies.map((s) => s.modelId)).toEqual([
      AI_MODELS.GEMINI,
      AI_MODELS.CHATGPT,
      AI_MODELS.CLAUDE,
    ]);
    expect(strategies.map((s) => s.modelName)).toEqual([
      AI_MODEL_LABELS[AI_MODELS.GEMINI],
      AI_MODEL_LABELS[AI_MODELS.CHATGPT],
      AI_MODEL_LABELS[AI_MODELS.CLAUDE],
    ]);
  });

  it("instantiates HttpLookupStrategy in MOCK and LIVE modes", () => {
    const mockStrategies = AIProviderFactory.createAll(PROVIDER_MODES.MOCK);
    const liveStrategies = AIProviderFactory.createAll(PROVIDER_MODES.LIVE);

    mockStrategies.forEach((strategy) => {
      expect(strategy).toBeInstanceOf(HttpLookupStrategy);
      expect(strategy).not.toBeInstanceOf(ResilientAIProviderProxy);
    });

    liveStrategies.forEach((strategy) => {
      expect(strategy).toBeInstanceOf(HttpLookupStrategy);
      expect(strategy).not.toBeInstanceOf(ResilientAIProviderProxy);
    });
  });

  it("wraps strategies in ResilientAIProviderProxy when mode is AUTO", () => {
    const autoStrategies = AIProviderFactory.createAll(PROVIDER_MODES.AUTO);

    autoStrategies.forEach((strategy) => {
      expect(strategy).toBeInstanceOf(ResilientAIProviderProxy);
    });
  });

  it("resolves mode from NEXT_PUBLIC_PROVIDER_MODE case-insensitively", () => {
    vi.stubEnv("NEXT_PUBLIC_PROVIDER_MODE", "AUTO");

    const strategies = AIProviderFactory.createAll();

    strategies.forEach((strategy) => {
      expect(strategy).toBeInstanceOf(ResilientAIProviderProxy);
    });
  });

  it("falls back safely to MOCK mode when env var is missing or invalid", () => {
    vi.stubEnv("NEXT_PUBLIC_PROVIDER_MODE", "invalid-mode");

    const strategies = AIProviderFactory.createAll();

    strategies.forEach((strategy) => {
      expect(strategy).toBeInstanceOf(HttpLookupStrategy);
    });
  });
});
