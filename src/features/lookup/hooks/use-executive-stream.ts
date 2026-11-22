"use client";

import { useEffect, useState } from "react";
import { AIProviderResponse, ExecutiveConclusion } from "@/core/domain/lookup.types";

export function useExecutiveStream(
  conclusion: ExecutiveConclusion | null,
  responses: AIProviderResponse[]
) {
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const queryKey = conclusion?.query ?? "";
  const enginesCount = responses.length;

  useEffect(() => {
    if (!conclusion || enginesCount === 0) {
      setStreamedText("");
      setIsStreaming(false);
      return;
    }

    const abortController = new AbortController();
    setStreamedText("");
    setIsStreaming(true);

    (async () => {
      try {
        const res = await fetch("/api/stream-brief", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: conclusion.query,
            conclusion,
            responses,
          }),
          signal: abortController.signal,
        });

        if (!res.ok || !res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setStreamedText((prev) => prev + chunk);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setStreamedText(conclusion.recommendedAction);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsStreaming(false);
        }
      }
    })();

    return () => abortController.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, enginesCount]);

  return { streamedText, isStreaming };
}
