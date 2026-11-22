import { afterEach, describe, expect, it, vi } from "vitest";
import { AI_MODELS } from "@/core/constants/lookup.constants";
import {
  LiveProviderUnavailableError,
  MissingProviderKeyError,
} from "@/core/domain/lookup.errors";
import * as serverLookupFacade from "@/core/facades/server-lookup.facade";
import { POST } from "./route";

describe("POST /api/lookup", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 when request body is malformed JSON or missing required fields", async () => {
    const badJsonReq = new Request("http://localhost/api/lookup", {
      method: "POST",
      body: "{ invalid-json",
    });

    const badJsonRes = await POST(badJsonReq);
    expect(badJsonRes.status).toBe(400);

    const invalidModelReq = new Request("http://localhost/api/lookup", {
      method: "POST",
      body: JSON.stringify({ modelId: "unknown-llm", query: "headphones" }),
    });

    const invalidModelRes = await POST(invalidModelReq);
    expect(invalidModelRes.status).toBe(400);
  });

  it("maps MissingProviderKeyError to 503 and LiveProviderUnavailableError to 502", async () => {
    vi.spyOn(serverLookupFacade, "performServerLookup").mockRejectedValueOnce(
      new MissingProviderKeyError("GEMINI_API_KEY")
    );

    const req = new Request("http://localhost/api/lookup", {
      method: "POST",
      body: JSON.stringify({ modelId: AI_MODELS.GEMINI, query: "laptop" }),
    });

    const res503 = await POST(req);
    expect(res503.status).toBe(503);

    vi.spyOn(serverLookupFacade, "performServerLookup").mockRejectedValueOnce(
      new LiveProviderUnavailableError("Gemini")
    );

    const res502 = await POST(
      new Request("http://localhost/api/lookup", {
        method: "POST",
        body: JSON.stringify({ modelId: AI_MODELS.GEMINI, query: "laptop" }),
      })
    );
    expect(res502.status).toBe(502);
  });
});
