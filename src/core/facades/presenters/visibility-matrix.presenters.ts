import { AIModelId, AIProviderResponse } from "@/core/domain/lookup.types";
import { AI_MODELS } from "@/core/constants/lookup.constants";

export const MATRIX_CONFIG = {
  SVG_WIDTH: 680,
  SVG_HEIGHT: 210,
  PADDING_X: 95,
  PADDING_TOP: 36,
  ROW_HEIGHT: 48,
  RANKS: [1, 2, 3] as const,
  ORDERED_ENGINES: [
    AI_MODELS.GEMINI,
    AI_MODELS.CHATGPT,
    AI_MODELS.CLAUDE,
  ] as AIModelId[],
} as const;

export interface TrajectoryPoint {
  modelId: AIModelId;
  x: number;
  y: number | null;
  rank: number | null;
  hasPriceMismatch: boolean;
  citedPrice?: number;
}

export interface ProductSeries {
  sku: string;
  name: string;
  points: TrajectoryPoint[];
  appearancesCount: number;
}

export function getEngineColumnX(engineIndex: number): number {
  const usableWidth = MATRIX_CONFIG.SVG_WIDTH - MATRIX_CONFIG.PADDING_X * 2;
  const stepX = usableWidth / (MATRIX_CONFIG.ORDERED_ENGINES.length - 1);
  return MATRIX_CONFIG.PADDING_X + engineIndex * stepX;
}

export function getRankRowY(rank: number): number {
  const clampedRank = Math.min(Math.max(rank, 1), 3);
  return MATRIX_CONFIG.PADDING_TOP + (clampedRank - 1) * MATRIX_CONFIG.ROW_HEIGHT;
}

export function buildSmoothBezierPath(points: { x: number; y: number }[]): string {
  return points.reduce((path, pt, idx) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[idx - 1];
    const midX = (prev.x + pt.x) / 2;
    return `${path} C ${midX} ${prev.y}, ${midX} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");
}

function extractBaseProductName(name: string): string {
  return name.split("—")[0].split("(")[0].trim();
}

function getNormalizedProductKey(brand: string, name: string): string {
  return `${brand.toLowerCase().trim()}::${extractBaseProductName(name).toLowerCase()}`;
}

export function buildVisibilitySeries(
  responses: AIProviderResponse[]
): ProductSeries[] {
  if (responses.length === 0) return [];

  const responseByEngine = new Map<AIModelId, AIProviderResponse>();
  responses.forEach((res) => responseByEngine.set(res.modelId, res));

  const uniqueProducts = new Map<string, { sku: string; name: string }>();
  responses.forEach((res) => {
    res.citations.forEach((citation) => {
      const normalizedKey = getNormalizedProductKey(citation.brand, citation.name);
      if (!uniqueProducts.has(normalizedKey)) {
        uniqueProducts.set(normalizedKey, {
          sku: citation.sku,
          name: extractBaseProductName(citation.name),
        });
      }
    });
  });

  return Array.from(uniqueProducts.entries()).map(([normalizedKey, meta]) => {
    let appearancesCount = 0;

    const points = MATRIX_CONFIG.ORDERED_ENGINES.map((modelId, idx) => {
      const x = getEngineColumnX(idx);
      const match = responseByEngine
        .get(modelId)
        ?.citations.find(
          (c) => getNormalizedProductKey(c.brand, c.name) === normalizedKey
        );

      if (!match) {
        return { modelId, x, y: null, rank: null, hasPriceMismatch: false };
      }

      appearancesCount++;
      return {
        modelId,
        x,
        y: getRankRowY(match.rank),
        rank: match.rank,
        hasPriceMismatch: match.citedPrice !== match.realPrice,
        citedPrice: match.citedPrice,
      };
    });

    return {
      sku: meta.sku,
      name: meta.name,
      points,
      appearancesCount,
    };
  });
}
