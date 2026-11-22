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
  email?: string;
  conclusion?: ExecutiveConclusion;
  responses?: AIProviderResponse[];
  narrative?: string;
}

export async function POST(
  request: Request
): Promise<NextResponse<DispatchReportResult | LookupErrorResponse>> {
  try {
    const body = (await request.json()) as SendReportRequest;

    if (!body.email || !body.email.includes("@") || !body.conclusion) {
      return NextResponse.json(
        { error: "A valid recipient email and report conclusion are required." },
        { status: 400 }
      );
    }

    const result = await dispatchExecutiveReport(
      body.email.trim(),
      body.conclusion,
      body.responses ?? [],
      body.narrative
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
