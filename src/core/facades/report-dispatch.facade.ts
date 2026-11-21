import { Resend } from "resend";
import {
  EMAIL_DISPATCH_STATUS,
  REPORT_MODES,
  ReportMode,
} from "@/core/constants/lookup.constants";
import { ExecutiveConclusion } from "@/core/domain/lookup.types";

export interface DispatchReportResult {
  status: typeof EMAIL_DISPATCH_STATUS.SENT;
  mode: ReportMode;
  recipient: string;
}

export class EmailDispatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailDispatchError";
  }
}

function buildReportEmailHtml(conclusion: ExecutiveConclusion): string {
  const insightsList = conclusion.insights
    .map((insight) => `<li style="margin-bottom: 8px;">${insight}</li>`)
    .join("");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; color: #0a0a0a; line-height: 1.5;">
      <p style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
        Products Lookup · Executive Telemetry
      </p>
      <h2 style="margin: 0 0 16px; font-size: 20px;">
        AI Visibility Audit: "${conclusion.query}"
      </h2>
      <ul style="padding-left: 18px; margin-bottom: 20px;">
        ${insightsList}
      </ul>
      <div style="background: #f9fafb; padding: 14px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 13px;">
        <strong>Recommended Action:</strong> ${conclusion.recommendedAction}
      </div>
    </div>
  `;
}

export async function dispatchExecutiveReport(
  recipient: string,
  conclusion: ExecutiveConclusion
): Promise<DispatchReportResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (apiKey) {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Products Lookup <onboarding@resend.dev>",
      to: recipient,
      subject: `AI Shelf Report: ${conclusion.query}`,
      html: buildReportEmailHtml(conclusion),
    });

    if (error) {
      throw new EmailDispatchError(
        error.message || "Email provider rejected the dispatch request."
      );
    }

    return {
      status: EMAIL_DISPATCH_STATUS.SENT,
      mode: REPORT_MODES.LIVE,
      recipient,
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 650));
  return {
    status: EMAIL_DISPATCH_STATUS.SENT,
    mode: REPORT_MODES.SIMULATED,
    recipient,
  };
}
