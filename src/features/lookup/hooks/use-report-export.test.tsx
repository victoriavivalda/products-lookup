// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { FormEvent } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EMAIL_DISPATCH_STATUS } from "@/core/constants/lookup.constants";
import { ExecutiveConclusion } from "@/core/domain/lookup.types";

const toBlobMock = vi.fn().mockResolvedValue(new Blob(["pdf-content"]));

vi.mock("@react-pdf/renderer", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@react-pdf/renderer")>();
  return {
    ...actual,
    pdf: () => ({ toBlob: toBlobMock }),
  };
});

const { useReportExport } = await import("./use-report-export");

const SAMPLE_CONCLUSION: ExecutiveConclusion = {
  query: "gaming laptop",
  generatedAt: "2026-11-22",
  topVisibleProduct: "ASUS ROG Zephyrus",
  totalModelsAnalyzed: 3,
  priceDiscrepanciesCount: 0,
  insights: Array.of("Verified."),
  recommendedAction: "Maintain feed.",
};

describe("useReportExport", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    toBlobMock.mockClear();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("handles email dispatch lifecycle from IDLE -> SENDING -> SENT", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "sent", mode: "simulated" }), {
        status: 200,
      })
    );

    const { result } = renderHook(() =>
      useReportExport(SAMPLE_CONCLUSION, Array.of(), "Executive summary")
    );

    act(() => {
      result.current.openEmailForm();
      result.current.updateEmail("vp@company.com");
    });

    await act(async () => {
      await result.current.sendEmail({
        preventDefault: vi.fn(),
      } as unknown as FormEvent<HTMLFormElement>);
    });

    expect(result.current.status).toBe(EMAIL_DISPATCH_STATUS.SENT);
    expect(result.current.errorMessage).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/report/send",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("surfaces server error message when /api/report/send returns non-OK response", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Domain not verified" }), {
        status: 502,
      })
    );

    const { result } = renderHook(() =>
      useReportExport(SAMPLE_CONCLUSION, Array.of())
    );

    act(() => {
      result.current.openEmailForm();
      result.current.updateEmail("user@external.com");
    });

    await act(async () => {
      await result.current.sendEmail({
        preventDefault: vi.fn(),
      } as unknown as FormEvent<HTMLFormElement>);
    });

    expect(result.current.status).toBe(EMAIL_DISPATCH_STATUS.ERROR);
    expect(result.current.errorMessage).toBe("Domain not verified");
  });
});
