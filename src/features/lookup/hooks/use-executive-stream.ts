"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { AIProviderResponse, ExecutiveConclusion } from "@/core/domain/lookup.types";

interface StreamState {
  key: string;
  text: string;
  isStreaming: boolean;
}

const INITIAL_STATE: StreamState = { key: "", text: "", isStreaming: false };

async function fetchExecutiveStream(
  payload: {
    query: string;
    conclusion: ExecutiveConclusion;
    responses: AIProviderResponse[];
  },
  onChunk: (chunk: string) => void,
  signal: AbortSignal
): Promise<void> {
  const response = await fetch("/api/stream-brief", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Stream failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}

export function useExecutiveStream(
  conclusion: ExecutiveConclusion | null,
  responses: AIProviderResponse[]
) {
  const [state, setState] = useState<StreamState>(INITIAL_STATE);

  const queryKey = conclusion?.query ?? "";
  const enginesCount = responses.length;
  const isReady = Boolean(conclusion && enginesCount > 0);
  const requestKey = isReady ? `${queryKey}:${enginesCount}` : "";

  const startStream = useEffectEvent(
    async (key: string, signal: AbortSignal) => {
      if (!conclusion || signal.aborted) return;

      setState({ key, text: "", isStreaming: true });

      try {
        await fetchExecutiveStream(
          { query: queryKey, conclusion, responses },
          (chunk) =>
            setState((prev) =>
              prev.key === key ? { ...prev, text: prev.text + chunk } : prev
            ),
          signal
        );
      } catch (error) {
        const isAbortError =
          error instanceof Error && error.name === "AbortError";
        if (!isAbortError && !signal.aborted) {
          setState({
            key,
            text: conclusion.recommendedAction,
            isStreaming: false,
          });
        }
      } finally {
        if (!signal.aborted) {
          setState((prev) =>
            prev.key === key ? { ...prev, isStreaming: false } : prev
          );
        }
      }
    }
  );

  useEffect(() => {
    if (!requestKey) return;

    const controller = new AbortController();
    queueMicrotask(() => {
      void startStream(requestKey, controller.signal);
    });

    return () => controller.abort();
  }, [requestKey]);

  const isCurrentKey = isReady && state.key === requestKey;

  return {
    streamedText: isCurrentKey ? state.text : "",
    isStreaming: isCurrentKey ? state.isStreaming : false,
  };
}
