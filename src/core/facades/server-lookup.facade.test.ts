import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AI_ENV_KEYS,
  AI_MODEL_LABELS,
  AI_MODELS,
  CAMPAIGN_THEMES,
  EXECUTION_FORCE_MODES,
} from "@/core/constants/lookup.constants";
import {
  LiveProviderUnavailableError,
  MissingProviderKeyError,
} from "@/core/domain/lookup.errors";
import {
  LIVE_PROVIDER_REGISTRY,
  RawCitation,
} from "@/core/adapters/server/live-provider.registry";
import { performServerLookup } from "./server-lookup.facade";

const SAMPLE_RAW_CITATIONS: RawCitation[] = Array.of<RawCitation>({
  sku: "SNY-101",
  name: "Sony WH-1000XM5",
  brand: "Sony",
  realPrice: 399,
  citedPrice: 399,
  rank: 1,
  sentiment: "positive",
  sources: Array.of("rtings.com", "theverge.com"),
});

describe("performServerLookup", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("throws MissingProviderKeyError when forceMode is LIVE and API key is missing", async () => {
    vi.stubEnv(AI_ENV_KEYS[AI_MODELS.GEMINI], "");

    await expect(
      performServerLookup(
        AI_MODELS.GEMINI,
        "headphones",
        EXECUTION_FORCE_MODES.LIVE
      )
    ).rejects.toThrow(MissingProviderKeyError);
  });

  it("returns normalized live citations when API key exists and provider succeeds", async () => {
    vi.stubEnv(AI_ENV_KEYS[AI_MODELS.GEMINI], "valid-gemini-key");
    const fetchSpy = vi
      .spyOn(LIVE_PROVIDER_REGISTRY[AI_MODELS.GEMINI], "fetchCitations")
      .mockResolvedValueOnce(SAMPLE_RAW_CITATIONS);

    const response = await performServerLookup(
      AI_MODELS.GEMINI,
      "headphones",
      EXECUTION_FORCE_MODES.LIVE
    );

    expect(fetchSpy).toHaveBeenCalledWith("headphones", "valid-gemini-key");
    expect(response.modelId).toBe(AI_MODELS.GEMINI);
    expect(response.modelName).toBe(AI_MODEL_LABELS[AI_MODELS.GEMINI]);
    expect(response.citations).toHaveLength(1);
    expect(response.citations.at(0)).toMatchObject({
      id: "gemini-live-0",
      modelId: AI_MODELS.GEMINI,
      sku: "SNY-101",
    });
  });

  it("throws LiveProviderUnavailableError in strict LIVE mode when provider fails", async () => {
    vi.stubEnv(AI_ENV_KEYS[AI_MODELS.CHATGPT], "valid-openai-key");
    vi.spyOn(
      LIVE_PROVIDER_REGISTRY[AI_MODELS.CHATGPT],
      "fetchCitations"
    ).mockRejectedValueOnce(new Error("Upstream 503"));

    await expect(
      performServerLookup(
        AI_MODELS.CHATGPT,
        "headphones",
        EXECUTION_FORCE_MODES.LIVE
      )
    ).rejects.toThrow(LiveProviderUnavailableError);
  });

  it("falls back transparently to mock catalog when live fails and forceMode is omitted", async () => {
    vi.stubEnv(AI_ENV_KEYS[AI_MODELS.CLAUDE], "valid-claude-key");
    const fetchSpy = vi
      .spyOn(LIVE_PROVIDER_REGISTRY[AI_MODELS.CLAUDE], "fetchCitations")
      .mockRejectedValueOnce(new Error("Timeout"));

    const lookupPromise = performServerLookup(
      AI_MODELS.CLAUDE,
      "espresso machine",
      undefined,
      CAMPAIGN_THEMES.BLACK_FRIDAY
    );

    await vi.advanceTimersByTimeAsync(1400);
    const response = await lookupPromise;

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(response.modelId).toBe(AI_MODELS.CLAUDE);
    expect(response.citations).toHaveLength(2);
    expect(response.citations.at(0)?.id).toBe("claude-1");
  });

  it("skips live provider completely when forceMode is MOCK even if API key is present", async () => {
    vi.stubEnv(AI_ENV_KEYS[AI_MODELS.GEMINI], "valid-gemini-key");
    const fetchSpy = vi.spyOn(
      LIVE_PROVIDER_REGISTRY[AI_MODELS.GEMINI],
      "fetchCitations"
    );

    const lookupPromise = performServerLookup(
      AI_MODELS.GEMINI,
      "gaming monitor",
      EXECUTION_FORCE_MODES.MOCK
    );

    await vi.advanceTimersByTimeAsync(600);
    const response = await lookupPromise;

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(response.citations).toHaveLength(2);
    expect(response.citations.at(0)?.id).toBe("gemini-1");
  });
});
