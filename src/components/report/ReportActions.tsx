"use client";

import { Download, Mail, Check, Loader2, AlertCircle, X } from "lucide-react";
import { EMAIL_DISPATCH_STATUS } from "@/core/constants/lookup.constants";
import { AIProviderResponse, ExecutiveConclusion } from "@/core/domain/lookup.types";
import { useReportExport } from "@/features/lookup/hooks/use-report-export";

interface ReportActionsProps {
  conclusion: ExecutiveConclusion;
  responses: AIProviderResponse[];
}

export function ReportActions({ conclusion, responses }: ReportActionsProps) {
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
  } = useReportExport(conclusion, responses);

  const submitButtonLabel =
    status === EMAIL_DISPATCH_STATUS.SENT
      ? "Sent"
      : status === EMAIL_DISPATCH_STATUS.ERROR
      ? "Retry"
      : "Dispatch";

  const isError = status === EMAIL_DISPATCH_STATUS.ERROR;
  const isSending = status === EMAIL_DISPATCH_STATUS.SENDING;
  const isSent = status === EMAIL_DISPATCH_STATUS.SENT;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={downloadPdf}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-canvas)] px-3.5 py-2 font-mono text-xs font-medium transition hover:border-[var(--border-hover)] disabled:opacity-50"
        >
          {isDownloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          Download PDF
        </button>

        {!isEmailFormOpen ? (
          <button
            type="button"
            onClick={openEmailForm}
            className="pl-accent-pill inline-flex items-center gap-2 rounded-lg px-3.5 py-2 font-mono text-xs font-medium transition hover:opacity-90"
          >
            <Mail className="h-3.5 w-3.5" />
            Send to Email
          </button>
        ) : (
          <form onSubmit={sendEmail} className="flex items-center gap-1.5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => updateEmail(e.target.value)}
              placeholder="executive@company.com"
              className={`rounded-lg border bg-[var(--surface-canvas)] px-3 py-1.5 font-mono text-xs outline-none transition ${
                isError
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-[var(--border-hairline)] focus:border-[var(--accent-primary)]"
              }`}
            />
            <button
              type="submit"
              disabled={isSending || isSent}
              className="pl-accent-pill inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-medium disabled:opacity-60"
            >
              {isSending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isSent && <Check className="h-3.5 w-3.5" />}
              {submitButtonLabel}
            </button>
            <button
              type="button"
              onClick={resetEmailForm}
              aria-label="Cancel email dispatch"
              className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </form>
        )}
      </div>

      {isError && errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/5 px-2.5 py-1 font-mono text-[11px] text-red-600 dark:text-red-400"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
