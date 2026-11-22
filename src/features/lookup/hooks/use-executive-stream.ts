"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { AIProviderResponse, ExecutiveConclusion } from "@/core/domain/lookup.types";

interface StreamState {
  text: string;
  isStreaming: boolean;
}

const INITIAL_STATE: StreamState = { text: "", isStreaming: false };

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

  const startStream = useEffectEvent(async (signal: AbortSignal) => {
    if (!conclusion) return;

    setState({ text: "", isStreaming: true });

    try {
      await fetchExecutiveStream(
        { query: queryKey, conclusion, responses },
        (chunk) => setState((prev) => ({ ...prev, text: prev.text + chunk })),
        signal
      );
    } catch (error) {
      const isAbortError = error instanceof Error && error.name === "AbortError";
      if (!isAbortError) {
        setState((prev) => ({
          ...prev,
          text: conclusion.recommendedAction,
        }));
      }
    } finally {
      if (!signal.aborted) {
        setState((prev) => ({ ...prev, isStreaming: false }));
      }
    }
  });

  useEffect(() => {
    if (!isReady) return;

    const controller = new AbortController();
    void startStream(controller.signal);

    return () => controller.abort();
  }, [isReady, queryKey, enginesCount]);

  return {
    streamedText: isReady ? state.text : "",
    isStreaming: isReady ? state.isStreaming : false,
  };
}
