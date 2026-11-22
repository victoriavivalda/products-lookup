import { ExecutiveConclusion } from "@/core/domain/lookup.types";
import { createExecutiveBriefStream } from "@/core/facades/stream-brief.facade";

interface StreamBriefPayload {
  query?: unknown;
  conclusion?: Partial<ExecutiveConclusion>;
}

function isValidConclusion(
  value: unknown
): value is ExecutiveConclusion {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ExecutiveConclusion>;

  return (
    typeof candidate.query === "string" &&
    typeof candidate.topVisibleProduct === "string" &&
    typeof candidate.recommendedAction === "string"
  );
}

export async function POST(request: Request): Promise<Response> {
  let body: StreamBriefPayload;

  try {
    body = (await request.json()) as StreamBriefPayload;
  } catch {
    return Response.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const normalizedQuery =
    typeof body.query === "string" ? body.query.trim() : "";

  if (!normalizedQuery || !isValidConclusion(body.conclusion)) {
    return Response.json(
      { error: "Invalid stream parameters." },
      { status: 400 }
    );
  }

  return new Response(
    createExecutiveBriefStream(normalizedQuery, body.conclusion),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}
