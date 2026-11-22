import { NextResponse } from "next/server";
import {
  AIProviderResponse,
  ExecutiveConclusion,
  LookupErrorResponse,
} from "@/core/domain/lookup.types";
import {
  dispatchExecutiveReport,
  DispatchReportResult,
  EmailDispatchError,
} from "@/core/facades/report-dispatch.facade";

interface SendReportRequest {
  email?: unknown;
  conclusion?: unknown;
  responses?: unknown;
  narrative?: unknown;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && EMAIL_PATTERN.test(value.trim());
}

function isValidConclusion(value: unknown): value is ExecutiveConclusion {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ExecutiveConclusion>;

  return (
    typeof candidate.query === "string" &&
    typeof candidate.topVisibleProduct === "string" &&
    typeof candidate.recommendedAction === "string"
  );
}

export async function POST(
  request: Request
): Promise<NextResponse<DispatchReportResult | LookupErrorResponse>> {
  let body: SendReportRequest;

  try {
    body = (await request.json()) as SendReportRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  if (!isValidEmail(body.email) || !isValidConclusion(body.conclusion)) {
    return NextResponse.json(
      { error: "A valid recipient email and report conclusion are required." },
      { status: 400 }
    );
  }

  const responses = Array.isArray(body.responses)
    ? (body.responses as AIProviderResponse[])
    : [];
  const narrative =
    typeof body.narrative === "string" ? body.narrative : undefined;

  try {
    const result = await dispatchExecutiveReport(
      body.email.trim(),
      body.conclusion,
      responses,
      narrative
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof EmailDispatchError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json(
      { error: "Unexpected error while dispatching executive report." },
      { status: 500 }
    );
  }
}
