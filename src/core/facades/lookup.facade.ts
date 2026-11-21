import {
  AIProviderAdapter,
  ChatGPTAdapter,
  ClaudeAdapter,
  GeminiAdapter,
} from "../adapters/ai-providers.adapter";
import { AIProviderResponse, ExecutiveConclusion } from "../domain/lookup.types";

class LookupFacade {
  private adapters: AIProviderAdapter[] = [
    new GeminiAdapter(),
    new ChatGPTAdapter(),
    new ClaudeAdapter(),
  ];

  getAdapters(): AIProviderAdapter[] {
    return this.adapters;
  }

  synthesizeConclusions(
    query: string,
    responses: AIProviderResponse[]
  ): ExecutiveConclusion {
    const allCitations = responses.flatMap((r) => r.citations);
    const mismatches = allCitations.filter((c) => c.citedPrice !== c.realPrice);

    // Calcular producto con mejor ranking promedio
    const rankMap = new Map<string, { name: string; totalRank: number; count: number }>();
    for (const item of allCitations) {
      const current = rankMap.get(item.sku) ?? { name: item.name, totalRank: 0, count: 0 };
      current.totalRank += item.rank;
      current.count += 1;
      rankMap.set(item.sku, current);
    }

    let topVisibleProduct = "N/A";
    let bestScore = Infinity;
    rankMap.forEach((val) => {
      const avg = val.totalRank / val.count;
      if (avg < bestScore) {
        bestScore = avg;
        topVisibleProduct = val.name;
      }
    });

    const insights: string[] = [
      `Analyzed ${allCitations.length} product citations across ${responses.length} AI answer engines.`,
      `Highest cross-engine visibility achieved by "${topVisibleProduct}" (avg rank #${bestScore.toFixed(1)}).`,
    ];

    if (mismatches.length > 0) {
      const sample = mismatches[0];
      insights.push(
        `Detected ${mismatches.length} stale price citation(s), e.g., ${sample.brand} cited at $${sample.citedPrice} vs. live catalog $${sample.realPrice}.`
      );
    } else {
      insights.push("100% pricing accuracy verified across all sampled AI engines.");
    }

    return {
      query,
      generatedAt: new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      topVisibleProduct,
      totalModelsAnalyzed: responses.length,
      priceDiscrepanciesCount: mismatches.length,
      insights,
      recommendedAction:
        mismatches.length > 0
          ? "Deploy updated Product Schema (JSON-LD) with validPriceUntil and ping high-authority review sources."
          : "Maintain current structured merchant feed and monitor competitor share-of-voice.",
    };
  }
}

export const lookupFacade = new LookupFacade();
