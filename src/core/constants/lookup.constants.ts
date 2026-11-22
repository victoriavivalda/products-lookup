type ValueOf<T> = T[keyof T];

export const AI_MODELS = {
  GEMINI: "gemini",
  CHATGPT: "chatgpt",
  CLAUDE: "claude",
} as const;

export type AIModelId = ValueOf<typeof AI_MODELS>;

export const AI_MODEL_LABELS: Record<AIModelId, string> = {
  [AI_MODELS.GEMINI]: "Google AI Overviews",
  [AI_MODELS.CHATGPT]: "ChatGPT Shopping",
  [AI_MODELS.CLAUDE]: "Claude Search",
};

export const AI_ENV_KEYS: Record<AIModelId, string> = {
  [AI_MODELS.GEMINI]: "GEMINI_API_KEY",
  [AI_MODELS.CHATGPT]: "OPENAI_API_KEY",
  [AI_MODELS.CLAUDE]: "ANTHROPIC_API_KEY",
};

export const PROVIDER_MODES = {
  MOCK: "mock",
  LIVE: "live",
  AUTO: "auto",
} as const;

export type ProviderMode = ValueOf<typeof PROVIDER_MODES>;

export const EXECUTION_FORCE_MODES = {
  LIVE: "live",
  MOCK: "mock",
} as const;

export type ExecutionForceMode = ValueOf<typeof EXECUTION_FORCE_MODES>;

export const CAMPAIGN_THEMES = {
  BLACK_FRIDAY: "black-friday",
  CHRISTMAS: "christmas",
  JULY_4: "july4",
} as const;

export type CampaignTheme = ValueOf<typeof CAMPAIGN_THEMES>;

interface CampaignMetadata {
  readonly themeLabel: string;
  readonly badgeLabel: string;
  readonly presets: readonly string[];
}

const CAMPAIGN_METADATA: Record<CampaignTheme, CampaignMetadata> = {
  [CAMPAIGN_THEMES.BLACK_FRIDAY]: {
    themeLabel: "Black Friday",
    badgeLabel: "Live Retail",
    presets: [
      "best noise cancelling headphones",
      "4k oled gaming monitor deals",
      "espresso machine under 500",
    ],
  },
  [CAMPAIGN_THEMES.CHRISTMAS]: {
    themeLabel: "Christmas",
    badgeLabel: "Holiday Season",
    presets: [
      "cashmere gift throw blanket",
      "pour-over coffee gift set",
      "wireless turntable walnut",
    ],
  },
  [CAMPAIGN_THEMES.JULY_4]: {
    themeLabel: "4th of July",
    badgeLabel: "Summer Retail",
    presets: [
      "portable charcoal grill stainless",
      "insulated cooler 45qt",
      "outdoor bluetooth speaker waterproof",
    ],
  },
};

export const CAMPAIGN_THEME_LABELS: Record<CampaignTheme, string> = {
  [CAMPAIGN_THEMES.BLACK_FRIDAY]:
    CAMPAIGN_METADATA[CAMPAIGN_THEMES.BLACK_FRIDAY].themeLabel,
  [CAMPAIGN_THEMES.CHRISTMAS]:
    CAMPAIGN_METADATA[CAMPAIGN_THEMES.CHRISTMAS].themeLabel,
  [CAMPAIGN_THEMES.JULY_4]:
    CAMPAIGN_METADATA[CAMPAIGN_THEMES.JULY_4].themeLabel,
};

export const CAMPAIGN_LABELS: Record<CampaignTheme, string> = {
  [CAMPAIGN_THEMES.BLACK_FRIDAY]:
    CAMPAIGN_METADATA[CAMPAIGN_THEMES.BLACK_FRIDAY].badgeLabel,
  [CAMPAIGN_THEMES.CHRISTMAS]:
    CAMPAIGN_METADATA[CAMPAIGN_THEMES.CHRISTMAS].badgeLabel,
  [CAMPAIGN_THEMES.JULY_4]:
    CAMPAIGN_METADATA[CAMPAIGN_THEMES.JULY_4].badgeLabel,
};

export const CAMPAIGN_PRESET_PROMPTS: Record<
  CampaignTheme,
  readonly string[]
> = {
  [CAMPAIGN_THEMES.BLACK_FRIDAY]:
    CAMPAIGN_METADATA[CAMPAIGN_THEMES.BLACK_FRIDAY].presets,
  [CAMPAIGN_THEMES.CHRISTMAS]:
    CAMPAIGN_METADATA[CAMPAIGN_THEMES.CHRISTMAS].presets,
  [CAMPAIGN_THEMES.JULY_4]:
    CAMPAIGN_METADATA[CAMPAIGN_THEMES.JULY_4].presets,
};

export const API_ENDPOINTS = {
  LOOKUP: "/api/lookup",
  SEND_REPORT: "/api/report/send",
  STREAM_BRIEF: "/api/stream-brief",
} as const;

export const QUERY_KEYS = {
  PRODUCTS_LOOKUP: "products-lookup",
} as const;

export const UI_CONFIG = {
  SEARCH_DEBOUNCE_MS: 450,
  CACHE_STALE_TIME_MS: 30 * 60_000,
  DOM_THEME_ATTRIBUTE: "data-campaign",
} as const;

export const EMAIL_DISPATCH_STATUS = {
  IDLE: "idle",
  SENDING: "sending",
  SENT: "sent",
  ERROR: "error",
} as const;

export type EmailDispatchStatus = ValueOf<typeof EMAIL_DISPATCH_STATUS>;

export const REPORT_MODES = {
  LIVE: "live",
  SIMULATED: "simulated",
} as const;

export type ReportMode = ValueOf<typeof REPORT_MODES>;

export const SIMULATION_SCENARIOS = {
  NORMAL: "normal",
  SLOW_NETWORK: "slow-network",
  PARTIAL_OUTAGE: "partial-outage",
  PRICE_DRIFT: "price-drift",
} as const;

export type SimulationScenario = ValueOf<typeof SIMULATION_SCENARIOS>;

export const SIMULATION_SCENARIO_LABELS: Record<SimulationScenario, string> = {
  [SIMULATION_SCENARIOS.NORMAL]: "Normal",
  [SIMULATION_SCENARIOS.SLOW_NETWORK]: "Slow Network",
  [SIMULATION_SCENARIOS.PARTIAL_OUTAGE]: "Partial Outage",
  [SIMULATION_SCENARIOS.PRICE_DRIFT]: "Price Drift",
};
