import { AIProviderFactory } from "@/core/providers/ai-provider.factory";
import { AIProviderStrategy } from "@/core/providers/ai-provider.strategy";
import {
  AIProviderResponse,
  ExecutiveConclusion,
  ProductCitation,
} from "@/core/domain/lookup.types";

interface TopProductSummary {
  readonly name: string;
  readonly averageRank: number | null;
}

const RECOMMENDED_ACTIONS = {
  WITH_DRIFT:
    "Deploy updated Product Schema (JSON-LD) with validPriceUntil and ping high-authority review sources.",
  VERIFIED:
    "Maintain current structured merchant feed and monitor competitor share-of-voice.",
} as const;

function findTopVisibleProduct(
  citations: readonly ProductCitation[]
): TopProductSummary {
  if (citations.length === 0) {
    return { name: "N/A", averageRank: null };
  }

  const rankStats = new Map<
    string,
    { name: string; totalRank: number; count: number }
  >();

  for (const item of citations) {
    const entry = rankStats.get(item.sku) ?? {
      name: item.name,
      totalRank: 0,
      count: 0,
    };
    entry.totalRank += item.rank;
    entry.count += 1;
    rankStats.set(item.sku, entry);
  }

  let topName = "N/A";
  let bestAverage = Infinity;

  for (const { name, totalRank, count } of rankStats.values()) {
    const average = totalRank / count;
    if (average < bestAverage) {
      bestAverage = average;
      topName = name;
    }
  }

  return { name: topName, averageRank: bestAverage };
}

class LookupFacade {
  private readonly adapters: readonly AIProviderStrategy[] =
    AIProviderFactory.createAll();

  getAdapters(): readonly AIProviderStrategy[] {
    return this.adapters;
  }

  synthesizeConclusions(
    query: string,
    responses: readonly AIProviderResponse[]
  ): ExecutiveConclusion {
    const allCitations = responses.flatMap((r) => r.citations);
    const mismatches = allCitations.filter((c) => c.citedPrice !== c.realPrice);
    const topProduct = findTopVisibleProduct(allCitations);

    const insights: string[] = [
      `Analyzed ${allCitations.length} product citations across ${responses.length} AI answer engines.`,
    ];

    if (topProduct.averageRank !== null) {
      insights.push(
        `Highest cross-engine visibility achieved by "${topProduct.name}" (avg rank #${topProduct.averageRank.toFixed(1)}).`
      );
    }

    if (mismatches.length > 0) {
      const sample = mismatches[0];
      insights.push(
        `Detected ${mismatches.length} stale price citation(s), e.g., ${sample.brand} cited at $${sample.citedPrice} vs. live catalog $${sample.realPrice}.`
      );
    } else {
      insights.push(
        "100% pricing accuracy verified across all sampled AI engines."
      );
    }

    return {
      query,
      generatedAt: new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      topVisibleProduct: topProduct.name,
      totalModelsAnalyzed: responses.length,
      priceDiscrepanciesCount: mismatches.length,
      insights,
      recommendedAction:
        mismatches.length > 0
          ? RECOMMENDED_ACTIONS.WITH_DRIFT
          : RECOMMENDED_ACTIONS.VERIFIED,
    };
  }
}

export const lookupFacade = new LookupFacade();
