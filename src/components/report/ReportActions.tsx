"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, Mail, Check, Loader2 } from "lucide-react";
import { AIProviderResponse, ExecutiveConclusion } from "@/core/domain/lookup.types";
import { ExecutiveReportPDF } from "./ExecutiveReportPDF";

export function ReportActions({
  conclusion,
  responses,
}: {
  conclusion: ExecutiveConclusion;
  responses: AIProviderResponse[];
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const blob = await pdf(
        <ExecutiveReportPDF conclusion={conclusion} responses={responses} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-lookup-report-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEmailState("sending");

    try {
      const res = await fetch("/api/report/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, conclusion }),
      });
      if (!res.ok) throw new Error();
      setEmailState("sent");
      setTimeout(() => {
        setShowEmailForm(false);
        setEmailState("idle");
        setEmail("");
      }, 2200);
    } catch {
      setEmailState("error");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        onClick={handleDownloadPDF}
        disabled={isDownloading}
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-canvas)] px-3.5 py-2 font-mono text-xs font-medium transition hover:border-[var(--border-hover)] disabled:opacity-50"
      >
        {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        Download PDF
      </button>

      {!showEmailForm ? (
        <button
          onClick={() => setShowEmailForm(true)}
          className="pl-accent-pill inline-flex items-center gap-2 rounded-lg px-3.5 py-2 font-mono text-xs font-medium transition hover:opacity-90"
        >
          <Mail className="h-3.5 w-3.5" />
          Send to Email
        </button>
      ) : (
        <form onSubmit={handleSendEmail} className="flex items-center gap-1.5">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="executive@company.com"
            className="rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-canvas)] px-3 py-1.5 font-mono text-xs outline-none focus:border-[var(--accent-primary)]"
          />
          <button
            type="submit"
            disabled={emailState === "sending" || emailState === "sent"}
            className="pl-accent-pill inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-medium"
          >
            {emailState === "sending" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {emailState === "sent" && <Check className="h-3.5 w-3.5" />}
            {emailState === "sent" ? "Sent" : "Dispatch"}
          </button>
        </form>
      )}
    </div>
  );
}
