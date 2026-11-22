"use client";

import { AlertCircle, Check, Download, Loader2, Mail, X } from "lucide-react";
import { EMAIL_DISPATCH_STATUS } from "@/core/constants/lookup.constants";
import {
  AIProviderResponse,
  ExecutiveConclusion,
} from "@/core/domain/lookup.types";
import { useReportExport } from "@/features/lookup/hooks/use-report-export";

interface ReportActionsProps {
  conclusion: ExecutiveConclusion;
  responses: AIProviderResponse[];
  narrative?: string;
}

const SUBMIT_BUTTON_LABELS: Record<string, string> = {
  [EMAIL_DISPATCH_STATUS.SENT]: "Sent",
  [EMAIL_DISPATCH_STATUS.ERROR]: "Retry",
};

export function ReportActions({
  conclusion,
  responses,
  narrative,
}: ReportActionsProps) {
  const {
    isDownloading,
    downloadPdf,
    isEmailFormOpen,
    openEmailForm,
    resetEmailForm,
    email,
    updateEmail,
    status,
    errorMessage,
    sendEmail,
  } = useReportExport(conclusion, responses, narrative);

  const isError = status === EMAIL_DISPATCH_STATUS.ERROR;
  const isSending = status === EMAIL_DISPATCH_STATUS.SENDING;
  const isSent = status === EMAIL_DISPATCH_STATUS.SENT;
  const submitButtonLabel = SUBMIT_BUTTON_LABELS[status] ?? "Dispatch";

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={downloadPdf}
          disabled={isDownloading}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-(--border-hairline) bg-(--surface-canvas) px-3.5 py-2 font-mono text-xs font-medium transition hover:border-(--border-hover) disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDownloading ? (
            <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download aria-hidden="true" className="h-3.5 w-3.5" />
          )}
          <span>Download PDF</span>
        </button>

        {!isEmailFormOpen ? (
          <button
            type="button"
            onClick={openEmailForm}
            className="pl-accent-pill inline-flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 font-mono text-xs font-medium transition hover:opacity-90"
          >
            <Mail aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Send to Email</span>
          </button>
        ) : (
          <form onSubmit={sendEmail} className="flex items-center gap-1.5">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => updateEmail(e.target.value)}
              aria-label="Recipient email address"
              aria-invalid={isError}
              placeholder="executive@company.com"
              className={`rounded-lg border bg-(--surface-canvas) px-3 py-1.5 font-mono text-xs outline-none transition ${
                isError
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-(--border-hairline) focus:border-(--accent-primary)"
              }`}
            />
            <button
              type="submit"
              disabled={isSending || isSent}
              className="pl-accent-pill inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending && (
                <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
              )}
              {isSent && <Check aria-hidden="true" className="h-3.5 w-3.5" />}
              <span>{submitButtonLabel}</span>
            </button>
            <button
              type="button"
              onClick={resetEmailForm}
              aria-label="Cancel email dispatch"
              className="cursor-pointer rounded-lg p-1.5 text-(--text-muted) transition hover:text-(--text-primary)"
            >
              <X aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </form>
        )}
      </div>

      {isError && errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/5 px-2.5 py-1 font-mono text-[11px] text-red-600 dark:text-red-400"
        >
          <AlertCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
