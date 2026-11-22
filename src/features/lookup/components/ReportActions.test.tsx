// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EMAIL_DISPATCH_STATUS } from "@/core/constants/lookup.constants";
import { ExecutiveConclusion } from "@/core/domain/lookup.types";
import { ReportActions } from "./ReportActions";

const mockUseReportExport = vi.fn();

vi.mock("@/features/lookup/hooks/use-report-export", () => ({
  useReportExport: (...args: unknown[]) => mockUseReportExport(...args),
}));

const SAMPLE_CONCLUSION: ExecutiveConclusion = {
  query: "espresso machine",
  generatedAt: "2026-11-22",
  topVisibleProduct: "Breville",
  totalModelsAnalyzed: 3,
  priceDiscrepanciesCount: 0,
  insights: Array.of(),
  recommendedAction: "Maintain feed.",
};

afterEach(() => {
  cleanup();
  mockUseReportExport.mockReset();
});

describe("ReportActions", () => {
  it("triggers PDF download and opens inline email dispatch form", () => {
    const downloadPdf = vi.fn();
    const openEmailForm = vi.fn();

    mockUseReportExport.mockReturnValue({
      isDownloading: false,
      downloadPdf,
      isEmailFormOpen: false,
      openEmailForm,
      resetEmailForm: vi.fn(),
      email: "",
      updateEmail: vi.fn(),
      status: EMAIL_DISPATCH_STATUS.IDLE,
      errorMessage: null,
      sendEmail: vi.fn(),
    });

    render(<ReportActions conclusion={SAMPLE_CONCLUSION} responses={Array.of()} />);

    fireEvent.click(screen.getByRole("button", { name: /download pdf/i }));
    expect(downloadPdf).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: /send to email/i }));
    expect(openEmailForm).toHaveBeenCalledOnce();
  });

  it("renders accessible alert banner with retry action when email dispatch fails", () => {
    mockUseReportExport.mockReturnValue({
      isDownloading: false,
      downloadPdf: vi.fn(),
      isEmailFormOpen: true,
      openEmailForm: vi.fn(),
      resetEmailForm: vi.fn(),
      email: "lead@company.com",
      updateEmail: vi.fn(),
      status: EMAIL_DISPATCH_STATUS.ERROR,
      errorMessage: "Domain not verified",
      sendEmail: vi.fn((e: Event) => e.preventDefault()),
    });

    render(<ReportActions conclusion={SAMPLE_CONCLUSION} responses={Array.of()} />);

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Domain not verified");
    expect(screen.getByRole("button", { name: /retry/i })).toBeDefined();
  });
});
