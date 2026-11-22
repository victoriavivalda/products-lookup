import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  EMAIL_DISPATCH_STATUS,
  REPORT_MODES,
  ReportMode,
} from "@/core/constants/lookup.constants";
import { LookupDomainError } from "@/core/domain/lookup.errors";
import {
  AIProviderResponse,
  ExecutiveConclusion,
} from "@/core/domain/lookup.types";
import { ExecutiveReportPDF } from "@/components/report/executive-report/ExecutiveReportPDF";

export interface DispatchReportResult {
  readonly status: typeof EMAIL_DISPATCH_STATUS.SENT;
  readonly mode: ReportMode;
  readonly recipient: string;
}

export class EmailDispatchError extends LookupDomainError {}

const DEFAULT_SENDER_EMAIL = "Products Lookup <onboarding@resend.dev>";
const SIMULATED_DISPATCH_DELAY_MS = 650;

function escapeHtml(unsafe: string): string {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildCompactEmailHtml(
  conclusion: ExecutiveConclusion,
  totalEngines: number,
  narrative?: string
): string {
  const driftLabel =
    conclusion.priceDiscrepanciesCount === 0
      ? "0 detected"
      : `${conclusion.priceDiscrepanciesCount} flagged`;

  const safeQuery = escapeHtml(conclusion.query);
  const safeLeader = escapeHtml(conclusion.topVisibleProduct);
  const safeSummary = escapeHtml(
    narrative?.trim() || conclusion.recommendedAction
  );

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 540px; color: #111827; line-height: 1.5;">
      <p style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">
        Products Lookup · Executive Brief
      </p>
      <h2 style="margin: 0 0 14px; font-size: 18px; font-weight: 600;">
        Audit: "${safeQuery}"
      </h2>

      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 16px; border-collapse: collapse; font-size: 12px;">
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Top Rank Leader</td>
          <td align="right" style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; font-weight: 600;">${safeLeader}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Price Discrepancies</td>
          <td align="right" style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; font-family: monospace; font-weight: 600;">${driftLabel}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; color: #6b7280;">Engines Sampled</td>
          <td align="right" style="padding: 10px 12px; font-family: monospace; font-weight: 600;">${totalEngines} active</td>
        </tr>
      </table>

      <div style="background: #f9fafb; padding: 12px 14px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 12.5px; margin-bottom: 14px;">
        <strong>AI Synthesis &amp; Action:</strong> ${safeSummary}
      </div>

      <p style="font-size: 11.5px; color: #6b7280; margin: 0;">
        Full telemetry charts and per-engine citations are attached in the vector PDF report.
      </p>
    </div>
  `;
}

export async function dispatchExecutiveReport(
  recipient: string,
  conclusion: ExecutiveConclusion,
  responses: readonly AIProviderResponse[] = [],
  narrative?: string
): Promise<DispatchReportResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (apiKey) {
    const pdfBuffer = await renderToBuffer(
      <ExecutiveReportPDF
        conclusion={conclusion}
        responses={[...responses]}
        narrative={narrative}
      />
    );

    const resend = new Resend(apiKey);
    const sender =
      process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_SENDER_EMAIL;

    const { error } = await resend.emails.send({
      from: sender,
      to: recipient,
      subject: `AI Shelf Brief: ${conclusion.query}`,
      html: buildCompactEmailHtml(conclusion, responses.length, narrative),
      attachments: [
        {
          filename: `products-lookup-audit-${Date.now()}.pdf`,
          content: pdfBuffer,
        },
      ],
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

  await new Promise((resolve) =>
    setTimeout(resolve, SIMULATED_DISPATCH_DELAY_MS)
  );

  return {
    status: EMAIL_DISPATCH_STATUS.SENT,
    mode: REPORT_MODES.SIMULATED,
    recipient,
  };
}
