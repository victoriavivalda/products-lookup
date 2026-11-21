import { AIModelId, AIProviderResponse, ProductCitation } from "../domain/lookup.types";

export interface AIProviderAdapter {
  readonly modelId: AIModelId;
  readonly modelName: string;
  lookupProducts(query: string): Promise<AIProviderResponse>;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

abstract class BaseAIAdapter implements AIProviderAdapter {
  abstract readonly modelId: AIModelId;
  abstract readonly modelName: string;
  protected abstract latency: number;
  protected abstract buildCitations(query: string): ProductCitation[];

  async lookupProducts(query: string): Promise<AIProviderResponse> {
    const t0 = performance.now();
    await wait(this.latency);
    return {
      modelId: this.modelId,
      modelName: this.modelName,
      latencyMs: Math.round(performance.now() - t0),
      citations: this.buildCitations(query),
    };
  }
}

export class GeminiAdapter extends BaseAIAdapter {
  readonly modelId = "gemini";
  readonly modelName = "Google AI Overviews";
  protected latency = 520;

  protected buildCitations(query: string): ProductCitation[] {
    return [
      {
        id: "gem-1",
        sku: "SNY-XM5-BLK",
        name: `Sony WH-1000XM5 Wireless (${query})`,
        brand: "Sony",
        realPrice: 248,
        citedPrice: 248,
        rank: 1,
        sentiment: "positive",
        sources: ["://nytimes.com", "rtings.com"],
        modelId: this.modelId,
      },
      {
        id: "gem-2",
        sku: "BSE-QCU-SLV",
        name: "Bose QuietComfort Ultra",
        brand: "Bose",
        realPrice: 329,
        citedPrice: 379,
        rank: 2,
        sentiment: "positive",
        sources: ["techradar.com"],
        modelId: this.modelId,
      },
    ];
  }
}

export class ChatGPTAdapter extends BaseAIAdapter {
  readonly modelId = "chatgpt";
  readonly modelName = "ChatGPT Shopping";
  protected latency = 1080;

  protected buildCitations(query: string): ProductCitation[] {
    return [
      {
        id: "gpt-1",
        sku: "BSE-QCU-SLV",
        name: `Bose QuietComfort Ultra (${query})`,
        brand: "Bose",
        realPrice: 329,
        citedPrice: 329,
        rank: 1,
        sentiment: "positive",
        sources: ["://reddit.com", "theverge.com"],
        modelId: this.modelId,
      },
      {
        id: "gpt-2",
        sku: "SNY-XM5-BLK",
        name: "Sony WH-1000XM5 Wireless",
        brand: "Sony",
        realPrice: 248,
        citedPrice: 299,
        rank: 3,
        sentiment: "neutral",
        sources: ["cnet.com"],
        modelId: this.modelId,
      },
    ];
  }
}

export class ClaudeAdapter extends BaseAIAdapter {
  readonly modelId = "claude";
  readonly modelName = "Claude Search";
  protected latency = 1420;

  protected buildCitations(query: string): ProductCitation[] {
    return [
      {
        id: "cld-1",
        sku: "APL-APM-USB",
        name: `Apple AirPods Max USB-C (${query})`,
        brand: "Apple",
        realPrice: 449,
        citedPrice: 449,
        rank: 1,
        sentiment: "positive",
        sources: ["macrumors.com", "consumerreports.org"],
        modelId: this.modelId,
      },
      {
        id: "cld-2",
        sku: "SNY-XM5-BLK",
        name: "Sony WH-1000XM5 Wireless",
        brand: "Sony",
        realPrice: 248,
        citedPrice: 248,
        rank: 2,
        sentiment: "positive",
        sources: ["soundguys.com"],
        modelId: this.modelId,
      },
    ];
  }
}
