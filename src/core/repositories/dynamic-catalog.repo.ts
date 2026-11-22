import {
  AI_MODELS,
  AIModelId,
  CAMPAIGN_THEMES,
  CampaignTheme,
} from "../constants/lookup.constants";
import { ProductCitation } from "../domain/lookup.types";

const BRAND_POOLS = {
  audio: ["Sony", "Bose", "Sennheiser", "Apple", "Bowers & Wilkins"],
  monitor: ["LG UltraGear", "ASUS ROG", "Alienware", "Samsung Odyssey", "MSI"],
  coffee: ["Breville", "De'Longhi", "Fellow", "Gaggia", "Jura"],
  holiday: ["Aesop", "Pendleton", "Marshall", "Le Creuset", "Bang & Olufsen"],
  summer: ["YETI", "Weber", "Sonos", "Traeger", "BioLite"],
  default: ["Apex", "Vanguard", "Krono", "Lumina", "Nordic"],
} as const;

type ProductCategory = keyof typeof BRAND_POOLS;

const CAMPAIGN_EDITIONS: Record<CampaignTheme, [string, string]> = {
  [CAMPAIGN_THEMES.BLACK_FRIDAY]: ["Doorbuster Bundle", "Flagship Edition"],
  [CAMPAIGN_THEMES.CHRISTMAS]: ["Holiday Gift Set", "Winter Atelier Edition"],
  [CAMPAIGN_THEMES.JULY_4]: ["Summer Backyard Edition", "All-Weather Pro"],
};

const SOURCES_BY_MODEL: Record<AIModelId, [string[], string[]]> = {
  [AI_MODELS.GEMINI]: [
    ["://nytimes.com", "rtings.com"],
    ["techradar.com", "tomsguide.com"],
  ],
  [AI_MODELS.CHATGPT]: [
    ["://reddit.com", "theverge.com"],
    ["cnet.com", "consumerreports.org"],
  ],
  [AI_MODELS.CLAUDE]: [
    ["consumerreports.org", "wirecutter.com"],
    ["arstechnica.com", "architecturaldigest.com"],
  ],
};

function detectCategory(query: string, campaign: CampaignTheme): ProductCategory {
  const q = query.toLowerCase();
  if (q.includes("headphone") || q.includes("earbud") || q.includes("audio") || q.includes("turntable")) {
    return "audio";
  }
  if (q.includes("monitor") || q.includes("oled") || q.includes("keyboard")) {
    return "monitor";
  }
  if (q.includes("espresso") || q.includes("coffee") || q.includes("pour-over")) {
    return "coffee";
  }
  if (q.includes("grill") || q.includes("cooler") || q.includes("outdoor") || campaign === CAMPAIGN_THEMES.JULY_4) {
    return "summer";
  }
  if (q.includes("gift") || q.includes("cashmere") || q.includes("blanket") || campaign === CAMPAIGN_THEMES.CHRISTMAS) {
    return "holiday";
  }
  return "default";
}

function capitalizeWords(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function buildDynamicMockCitations(
  modelId: AIModelId,
  query: string,
  campaign: CampaignTheme = CAMPAIGN_THEMES.BLACK_FRIDAY
): ProductCitation[] {
  const category = detectCategory(query, campaign);
  const brands = BRAND_POOLS[category];
  const cleanTitle = capitalizeWords(query);
  const [primaryEdition, secondaryEdition] = CAMPAIGN_EDITIONS[campaign];

  const firstBrand = brands[0];
  const secondBrand = brands[1];

  const basePrice = 129 + ((query.length * 17) % 320);
  const secondPrice = basePrice + 55;

  const firstRank = modelId === AI_MODELS.CHATGPT ? 2 : 1;
  const secondRank =
    modelId === AI_MODELS.CHATGPT ? 1 : modelId === AI_MODELS.CLAUDE ? 3 : 2;

  const hasStalePrice = modelId !== AI_MODELS.CLAUDE;
  const citedSecondPrice = hasStalePrice ? secondPrice + 40 : secondPrice;
  const [primarySources, secondarySources] = SOURCES_BY_MODEL[modelId];

  return [
    {
      id: `${modelId}-1`,
      sku: `${firstBrand.slice(0, 3).toUpperCase()}-${100 + query.length}`,
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
      sku: `${secondBrand.slice(0, 3).toUpperCase()}-${200 + query.length}`,
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
