"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import {
  API_ENDPOINTS,
  EMAIL_DISPATCH_STATUS,
  EmailDispatchStatus,
} from "@/core/constants/lookup.constants";
import { AIProviderResponse, ExecutiveConclusion } from "@/core/domain/lookup.types";
import { ExecutiveReportPDF } from "@/components/report/ExecutiveReportPDF";

export function useReportExport(
  conclusion: ExecutiveConclusion,
  responses: AIProviderResponse[]
) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailFormOpen, setIsEmailFormOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<EmailDispatchStatus>(EMAIL_DISPATCH_STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const downloadPdf = async () => {
    setIsDownloading(true);
    try {
      const blob = await pdf(
        <ExecutiveReportPDF conclusion={conclusion} responses={responses} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `products-lookup-report-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  const updateEmail = (value: string) => {
    setEmail(value);
    if (status === EMAIL_DISPATCH_STATUS.ERROR) {
      setStatus(EMAIL_DISPATCH_STATUS.IDLE);
      setErrorMessage(null);
    }
  };

  const resetEmailForm = () => {
    setIsEmailFormOpen(false);
    setStatus(EMAIL_DISPATCH_STATUS.IDLE);
    setErrorMessage(null);
    setEmail("");
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus(EMAIL_DISPATCH_STATUS.SENDING);
    setErrorMessage(null);

    try {
      const res = await fetch(API_ENDPOINTS.SEND_REPORT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          conclusion,
          responses,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Could not dispatch report via email.");
      }

      setStatus(EMAIL_DISPATCH_STATUS.SENT);
      setTimeout(resetEmailForm, 2200);
    } catch (err) {
      setStatus(EMAIL_DISPATCH_STATUS.ERROR);
      setErrorMessage(
        err instanceof Error ? err.message : "Unexpected error sending email."
      );
    }
  };

  return {
    isDownloading,
    downloadPdf,
    isEmailFormOpen,
    openEmailForm: () => setIsEmailFormOpen(true),
    resetEmailForm,
    email,
    updateEmail,
    status,
    errorMessage,
    sendEmail,
  };
}
