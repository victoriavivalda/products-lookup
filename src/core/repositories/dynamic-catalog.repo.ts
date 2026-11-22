import {
  AI_MODELS,
  AIModelId,
  CAMPAIGN_THEMES,
  CampaignTheme,
} from "@/core/constants/lookup.constants";
import { ProductCitation } from "@/core/domain/lookup.types";

const BRAND_POOLS = {
  audio: ["Sony", "Bose", "Sennheiser", "Apple", "Bowers & Wilkins"],
  monitor: ["LG UltraGear", "ASUS ROG", "Alienware", "Samsung Odyssey", "MSI"],
  coffee: ["Breville", "De'Longhi", "Fellow", "Gaggia", "Jura"],
  holiday: ["Aesop", "Pendleton", "Marshall", "Le Creuset", "Bang & Olufsen"],
  summer: ["YETI", "Weber", "Sonos", "Traeger", "BioLite"],
  default: ["Apex", "Vanguard", "Krono", "Lumina", "Nordic"],
} as const;

type ProductCategory = keyof typeof BRAND_POOLS;

const CATEGORY_KEYWORDS: ReadonlyArray<{
  category: Exclude<ProductCategory, "default">;
  keywords: readonly string[];
}> = [
  { category: "audio", keywords: ["headphone", "earbud", "audio", "turntable"] },
  { category: "monitor", keywords: ["monitor", "oled", "keyboard"] },
  { category: "coffee", keywords: ["espresso", "coffee", "pour-over"] },
  { category: "summer", keywords: ["grill", "cooler", "outdoor"] },
  { category: "holiday", keywords: ["gift", "cashmere", "blanket"] },
];

const CAMPAIGN_FALLBACK_CATEGORY: Partial<
  Record<CampaignTheme, ProductCategory>
> = {
  [CAMPAIGN_THEMES.JULY_4]: "summer",
  [CAMPAIGN_THEMES.CHRISTMAS]: "holiday",
};

const CAMPAIGN_EDITIONS: Record<CampaignTheme, readonly [string, string]> = {
  [CAMPAIGN_THEMES.BLACK_FRIDAY]: ["Doorbuster Bundle", "Flagship Edition"],
  [CAMPAIGN_THEMES.CHRISTMAS]: ["Holiday Gift Set", "Winter Atelier Edition"],
  [CAMPAIGN_THEMES.JULY_4]: ["Summer Backyard Edition", "All-Weather Pro"],
};

const RANK_BY_MODEL: Record<AIModelId, readonly [number, number]> = {
  [AI_MODELS.GEMINI]: [1, 2],
  [AI_MODELS.CHATGPT]: [2, 1],
  [AI_MODELS.CLAUDE]: [1, 3],
};


const SOURCES_BY_MODEL: Record<
  AIModelId,
  readonly [readonly string[], readonly string[]]
> = {
  [AI_MODELS.GEMINI]: [
    ["nytimes.com", "rtings.com"],
    ["techradar.com", "tomsguide.com"],
  ],
  [AI_MODELS.CHATGPT]: [
    ["reddit.com", "theverge.com"],
    ["cnet.com", "consumerreports.org"],
  ],
  [AI_MODELS.CLAUDE]: [
    ["consumerreports.org", "wirecutter.com"],
    ["arstechnica.com", "architecturaldigest.com"],
  ],
};

function detectCategory(
  query: string,
  campaign: CampaignTheme
): ProductCategory {
  const normalized = query.toLowerCase();
  const matched = CATEGORY_KEYWORDS.find(({ keywords }) =>
    keywords.some((kw) => normalized.includes(kw))
  );

  if (matched) return matched.category;
  return CAMPAIGN_FALLBACK_CATEGORY[campaign] ?? "default";
}

function capitalizeWords(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "Featured Product";

  return trimmed
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function buildSku(brand: string, offset: number): string {
  const prefix = brand.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
  return `${prefix}-${offset}`;
}

export function buildDynamicMockCitations(
  modelId: AIModelId,
  query: string,
  campaign: CampaignTheme = CAMPAIGN_THEMES.BLACK_FRIDAY
): ProductCitation[] {
  const category = detectCategory(query, campaign);
  const [firstBrand, secondBrand] = BRAND_POOLS[category];
  const cleanTitle = capitalizeWords(query);
  const [primaryEdition, secondaryEdition] = CAMPAIGN_EDITIONS[campaign];

  const basePrice = 129 + ((query.length * 17) % 320);
  const secondPrice = basePrice + 55;

  const [firstRank, secondRank] = RANK_BY_MODEL[modelId];
  const hasStalePrice = modelId !== AI_MODELS.CLAUDE;
  const citedSecondPrice = hasStalePrice ? secondPrice + 40 : secondPrice;
  const [primarySources, secondarySources] = SOURCES_BY_MODEL[modelId];

  return [
    {
      id: `${modelId}-1`,
      sku: buildSku(firstBrand, 100 + query.length),
      name: `${firstBrand} ${cleanTitle} — ${primaryEdition}`,
      brand: firstBrand,
      realPrice: basePrice,
      citedPrice: basePrice,
      rank: firstRank,
      sentiment: "positive",
      sources: primarySources,
      modelId,
    },
    {
      id: `${modelId}-2`,
      sku: buildSku(secondBrand, 200 + query.length),
      name: `${secondBrand} ${cleanTitle} (${secondaryEdition})`,
      brand: secondBrand,
      realPrice: secondPrice,
      citedPrice: citedSecondPrice,
      rank: secondRank,
      sentiment: hasStalePrice ? "neutral" : "positive",
      sources: secondarySources,
      modelId,
    },
  ];
}
