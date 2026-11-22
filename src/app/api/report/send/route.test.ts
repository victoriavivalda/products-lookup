import { afterEach, describe, expect, it, vi } from "vitest";
import {
  EMAIL_DISPATCH_STATUS,
  REPORT_MODES,
} from "@/core/constants/lookup.constants";
import * as reportDispatchFacade from "@/core/facades/report-dispatch.facade";
import { POST } from "./route";

const VALID_CONCLUSION = {
  query: "monitor",
  generatedAt: "2026-11-22",
  topVisibleProduct: "LG OLED",
  totalModelsAnalyzed: 3,
  priceDiscrepanciesCount: 0,
  insights: [],
  recommendedAction: "Maintain feed.",
};

describe("POST /api/report/send", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects invalid email formats with 400", async () => {
    const req = new Request("http://localhost/api/report/send", {
      method: "POST",
      body: JSON.stringify({
        email: "not-an-email@",
        conclusion: VALID_CONCLUSION,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("maps EmailDispatchError to 502 and returns 200 on success", async () => {
    vi.spyOn(
      reportDispatchFacade,
      "dispatchExecutiveReport"
    ).mockRejectedValueOnce(
      new reportDispatchFacade.EmailDispatchError("Provider rejected")
    );

    const res502 = await POST(
      new Request("http://localhost/api/report/send", {
        method: "POST",
        body: JSON.stringify({
          email: "lead@company.com",
          conclusion: VALID_CONCLUSION,
        }),
      })
    );
    expect(res502.status).toBe(502);

    vi.spyOn(
      reportDispatchFacade,
      "dispatchExecutiveReport"
    ).mockResolvedValueOnce({
      status: EMAIL_DISPATCH_STATUS.SENT,
      mode: REPORT_MODES.SIMULATED,
      recipient: "lead@company.com",
    });

    const res200 = await POST(
      new Request("http://localhost/api/report/send", {
        method: "POST",
        body: JSON.stringify({
          email: "lead@company.com",
          conclusion: VALID_CONCLUSION,
        }),
      })
    );
    expect(res200.status).toBe(200);
  });
});
