import { NextResponse } from "next/server";
import { AI_MODEL_LABELS } from "@/core/constants/lookup.constants";
import {
  LiveProviderUnavailableError,
  MissingProviderKeyError,
} from "@/core/domain/lookup.errors";
import {
  AIProviderResponse,
  LookupErrorResponse,
  LookupRequestPayload,
} from "@/core/domain/lookup.types";
import { performServerLookup } from "@/core/facades/server-lookup.facade";

export async function POST(
  request: Request
): Promise<NextResponse<AIProviderResponse | LookupErrorResponse>> {
  const { modelId, query, forceMode, campaign } =
    (await request.json()) as Partial<LookupRequestPayload>;

  if (!query?.trim() || !modelId || !AI_MODEL_LABELS[modelId]) {
    return NextResponse.json({ error: "Invalid lookup parameters" }, { status: 400 });
  }

  try {
    const result = await performServerLookup(
      modelId,
      query.trim(),
      forceMode,
      campaign
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MissingProviderKeyError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof LiveProviderUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Unexpected lookup failure" }, { status: 500 });
  }
}
