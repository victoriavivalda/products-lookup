import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EMAIL_DISPATCH_STATUS,
  REPORT_MODES,
} from "@/core/constants/lookup.constants";
import { ExecutiveConclusion } from "@/core/domain/lookup.types";

const sendEmailMock = vi.fn();
const renderToBufferMock = vi.fn();

vi.mock("resend", () => ({
  Resend: class MockResend {
    emails = { send: sendEmailMock };
  },
}));

vi.mock("@react-pdf/renderer", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@react-pdf/renderer")>();
  return {
    ...actual,
    renderToBuffer: renderToBufferMock,
  };
});

// Importamos después de registrar los mocks
const { dispatchExecutiveReport, EmailDispatchError } = await import(
  "./report-dispatch.facade"
);

const SAMPLE_CONCLUSION: ExecutiveConclusion = {
  query: 'headphones <script>alert("xss")</script>',
  generatedAt: "2026-11-22T15:00:00Z",
  topVisibleProduct: "Sony & Bose Flagship",
  totalModelsAnalyzed: 3,
  priceDiscrepanciesCount: 2,
  insights: Array.of("Insight 1"),
  recommendedAction: "Update JSON-LD schema.",
};

describe("dispatchExecutiveReport", () => {
  beforeEach(() => {
    sendEmailMock.mockReset();
    renderToBufferMock.mockReset();
    renderToBufferMock.mockResolvedValue(Buffer.from("mock-pdf-bytes"));
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("runs in SIMULATED mode without calling Resend when RESEND_API_KEY is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");

    const dispatchPromise = dispatchExecutiveReport(
      "cto@company.com",
      SAMPLE_CONCLUSION
    );

    await vi.advanceTimersByTimeAsync(650);
    const result = await dispatchPromise;

    expect(result).toEqual({
      status: EMAIL_DISPATCH_STATUS.SENT,
      mode: REPORT_MODES.SIMULATED,
      recipient: "cto@company.com",
    });
    expect(renderToBufferMock).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("renders PDF, escapes HTML entities, and sends via Resend in LIVE mode", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_12345");
    sendEmailMock.mockResolvedValueOnce({ data: { id: "msg_1" }, error: null });

    const result = await dispatchExecutiveReport(
      "vp@company.com",
      SAMPLE_CONCLUSION,
      Array.of(),
      "Custom <narrative> summary"
    );

    expect(result).toEqual({
      status: EMAIL_DISPATCH_STATUS.SENT,
      mode: REPORT_MODES.LIVE,
      recipient: "vp@company.com",
    });

    expect(renderToBufferMock).toHaveBeenCalledOnce();
    expect(sendEmailMock).toHaveBeenCalledOnce();

    const sentPayload = sendEmailMock.mock.calls.at(0)?.at(0);
    expect(sentPayload.to).toBe("vp@company.com");
    expect(sentPayload.html).toContain("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
    expect(sentPayload.html).toContain("Sony &amp; Bose Flagship");
    expect(sentPayload.html).toContain("Custom &lt;narrative&gt; summary");
    expect(sentPayload.attachments).toHaveLength(1);
    expect(sentPayload.attachments.at(0)?.content).toEqual(
      Buffer.from("mock-pdf-bytes")
    );
  });

  it("throws EmailDispatchError when Resend returns an API error", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_12345");
    sendEmailMock.mockResolvedValueOnce({
      data: null,
      error: { message: "Domain not verified" },
    });

    await expect(
      dispatchExecutiveReport("vp@company.com", SAMPLE_CONCLUSION)
    ).rejects.toThrow(new EmailDispatchError("Domain not verified"));
  });
});
