import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AI_ENV_KEYS, AI_MODELS } from "@/core/constants/lookup.constants";
import { LiveProviderUnavailableError } from "@/core/domain/lookup.errors";
import {
  LIVE_PROVIDER_REGISTRY,
  RawCitation,
  resolveProviderApiKey,
} from "./live-provider.registry";

const SAMPLE_CITATIONS: RawCitation[] = Array.of<RawCitation>({
  sku: "SNY-101",
  name: "Sony WH-1000XM5",
  brand: "Sony",
  realPrice: 399,
  citedPrice: 399,
  rank: 1,
  sentiment: "positive",
  sources: Array.of("rtings.com", "theverge.com"),
});

function mockJsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("resolveProviderApiKey", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns trimmed API key when env var is set", () => {
    vi.stubEnv(AI_ENV_KEYS[AI_MODELS.GEMINI], "  test-gemini-key  ");

    expect(resolveProviderApiKey(AI_MODELS.GEMINI)).toBe("test-gemini-key");
  });

  it("returns undefined when env var is missing or whitespace", () => {
    vi.stubEnv(AI_ENV_KEYS[AI_MODELS.CHATGPT], "   ");

    expect(resolveProviderApiKey(AI_MODELS.CHATGPT)).toBeUndefined();
    expect(resolveProviderApiKey(AI_MODELS.CLAUDE)).toBeUndefined();
  });
});

describe("LIVE_PROVIDER_REGISTRY", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches and strips markdown fences from Gemini JSON response", async () => {
    const markdownWrapped = `\`\`\`json\n${JSON.stringify(SAMPLE_CITATIONS)}\n\`\`\``;
    fetchMock.mockResolvedValueOnce(
      mockJsonResponse({
        candidates: Array.of({
          content: { parts: Array.of({ text: markdownWrapped }) },
        }),
      })
    );

    const result = await LIVE_PROVIDER_REGISTRY[AI_MODELS.GEMINI].fetchCitations(
      "headphones",
      "gemini-key"
    );

    expect(result).toEqual(SAMPLE_CITATIONS);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("generativelanguage.googleapis.com"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-goog-api-key": "gemini-key" }),
      })
    );
  });

  it("fetches and parses citations from OpenAI handler", async () => {
    fetchMock.mockResolvedValueOnce(
      mockJsonResponse({
        choices: Array.of({
          message: { content: JSON.stringify(SAMPLE_CITATIONS) },
        }),
      })
    );

    const result = await LIVE_PROVIDER_REGISTRY[AI_MODELS.CHATGPT].fetchCitations(
      "headphones",
      "openai-key"
    );

    expect(result).toEqual(SAMPLE_CITATIONS);
    expect(fetchMock).toEqual(expect.any(Function));
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("api.openai.com"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer openai-key" }),
      })
    );
  });

  it("fetches and parses citations from Anthropic Claude handler", async () => {
    fetchMock.mockResolvedValueOnce(
      mockJsonResponse({
        content: Array.of({ text: JSON.stringify(SAMPLE_CITATIONS) }),
      })
    );

    const result = await LIVE_PROVIDER_REGISTRY[AI_MODELS.CLAUDE].fetchCitations(
      "headphones",
      "claude-key"
    );

    expect(result).toEqual(SAMPLE_CITATIONS);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("api.anthropic.com"),
      expect.objectContaining({
        headers: expect.objectContaining({ "x-api-key": "claude-key" }),
      })
    );
  });

  it("throws LiveProviderUnavailableError on non-OK HTTP status or non-array payload", async () => {
    fetchMock.mockResolvedValueOnce(
      mockJsonResponse({ error: "Rate limit" }, false, 429)
    );

    await expect(
      LIVE_PROVIDER_REGISTRY[AI_MODELS.GEMINI].fetchCitations("headphones", "key")
    ).rejects.toThrow(LiveProviderUnavailableError);

    fetchMock.mockResolvedValueOnce(
      mockJsonResponse({
        choices: Array.of({
          message: { content: JSON.stringify({ notAnArray: true }) },
        }),
      })
    );

    await expect(
      LIVE_PROVIDER_REGISTRY[AI_MODELS.CHATGPT].fetchCitations("headphones", "key")
    ).rejects.toThrow(LiveProviderUnavailableError);
  });
});
