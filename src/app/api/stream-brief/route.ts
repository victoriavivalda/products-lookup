import { ExecutiveConclusion } from "@/core/domain/lookup.types";
import { createExecutiveBriefStream } from "@/core/facades/stream-brief.facade";

interface StreamBriefPayload {
  query?: string;
  conclusion?: ExecutiveConclusion;
}

export async function POST(request: Request): Promise<Response> {
  const { query, conclusion } = (await request.json()) as StreamBriefPayload;

  if (!query?.trim() || !conclusion) {
    return new Response("Invalid stream parameters", { status: 400 });
  }

  return new Response(createExecutiveBriefStream(query.trim(), conclusion), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
