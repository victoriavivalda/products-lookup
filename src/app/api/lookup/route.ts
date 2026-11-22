import { NextResponse } from "next/server";
import {
  AI_MODELS,
  AIModelId,
  CAMPAIGN_THEMES,
  CampaignTheme,
  EXECUTION_FORCE_MODES,
  ExecutionForceMode,
} from "@/core/constants/lookup.constants";
import {
  LiveProviderUnavailableError,
  MissingProviderKeyError,
} from "@/core/domain/lookup.errors";
import {
  AIProviderResponse,
  LookupErrorResponse,
} from "@/core/domain/lookup.types";
import { performServerLookup } from "@/core/facades/server-lookup.facade";

const VALID_MODELS = new Set<string>(Object.values(AI_MODELS));
const VALID_FORCE_MODES = new Set<string>(Object.values(EXECUTION_FORCE_MODES));
const VALID_CAMPAIGNS = new Set<string>(Object.values(CAMPAIGN_THEMES));

function isValidModelId(value: unknown): value is AIModelId {
  return typeof value === "string" && VALID_MODELS.has(value);
}

function parseForceMode(value: unknown): ExecutionForceMode | undefined {
  return typeof value === "string" && VALID_FORCE_MODES.has(value)
    ? (value as ExecutionForceMode)
    : undefined;
}

function parseCampaign(value: unknown): CampaignTheme | undefined {
  return typeof value === "string" && VALID_CAMPAIGNS.has(value)
    ? (value as CampaignTheme)
    : undefined;
}

export async function POST(
  request: Request
): Promise<NextResponse<AIProviderResponse | LookupErrorResponse>> {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const normalizedQuery =
    typeof body.query === "string" ? body.query.trim() : "";

  if (!normalizedQuery || !isValidModelId(body.modelId)) {
    return NextResponse.json(
      { error: "Invalid lookup parameters." },
      { status: 400 }
    );
  }

  try {
    const result = await performServerLookup(
      body.modelId,
      normalizedQuery,
      parseForceMode(body.forceMode),
      parseCampaign(body.campaign)
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MissingProviderKeyError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof LiveProviderUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json(
      { error: "Unexpected lookup failure." },
      { status: 500 }
    );
  }
}
