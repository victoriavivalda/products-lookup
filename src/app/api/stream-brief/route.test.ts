import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("POST /api/stream-brief", () => {
  it("returns 400 when conclusion payload is incomplete", async () => {
    const req = new Request("http://localhost/api/stream-brief", {
      method: "POST",
      body: JSON.stringify({ query: "espresso", conclusion: { query: "espresso" } }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns text/plain stream with no-cache headers for valid payloads", async () => {
    const req = new Request("http://localhost/api/stream-brief", {
      method: "POST",
      body: JSON.stringify({
        query: "espresso",
        conclusion: {
          query: "espresso",
          topVisibleProduct: "Breville",
          recommendedAction: "Update JSON-LD.",
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/plain");
    expect(res.headers.get("Cache-Control")).toContain("no-cache");
    await res.body?.cancel();
  });
});
