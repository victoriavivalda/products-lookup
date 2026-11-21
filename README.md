# products-lookup

A multi-engine product visibility and price accuracy inspector across AI search platforms (**Google AI Overviews**, **ChatGPT Shopping**, and **Claude Search**).

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **React Query**, and **Framer Motion**, applying a layered **Repository → Facade → Controller** architecture across both the domain layer and the CSS design system.

---

## Key Capabilities

- **Progressive Multi-Engine Telemetry:** Queries AI search providers in parallel with independent latencies, streaming results onto the UI without blocking the main thread.
- **Hybrid Execution Engine (`mock` / `auto` / `live`):** Powered by **Strategy, Factory, and Proxy** patterns—supports real LLM APIs (Gemini, OpenAI, Anthropic) with automatic fallback to a dynamic contextual catalog generator.
- **Stale Pricing & Citation Audit:** Cross-references AI-cited prices against verified catalog pricing to flag discrepancies in real time.
- **Automated Executive Conclusions:** Synthesizes cross-engine rankings, share-of-voice KPIs, and actionable schema recommendations on the fly.
- **Vector PDF & Email Dispatch:** Generates downloadable executive reports (`@react-pdf/renderer`) and dispatches HTML summaries via `/api/report/send` (powered by [Resend](https://resend.com) with real error feedback and simulated fallback).
- **Campaign-Driven Seasonal Theming:** Switch between *Black Friday*, *Holiday Season (Christmas)*, and *4th of July*—dynamically updating OKLCH color palettes, card radii, suggested prompts, and catalog editions.
- **Browser-Native Accessibility:** Automatically adapts to OS color schemes (`prefers-color-scheme`), browser font-size scaling (`rem` + `clamp()`), and motion preferences (`prefers-reduced-motion`).

---

## Architecture Overview

This project mirrors a **Repository → Facade → Controller** pattern across both the TypeScript domain layer and the CSS cascade:

```text
src/
├── app/
│   ├── api/
│   │   ├── lookup/route.ts                # Thin REST controller for multi-engine queries
│   │   └── report/send/route.ts           # Thin REST controller for email report dispatch
│   ├── globals.css                        # Layered CSS entrypoint
│   └── page.tsx                           # Main lookup controller view
│
├── styles/                                # LAYERED CSS DESIGN SYSTEM
│   ├── 1-repository.css                   # Raw OKLCH primitives, campaign palettes & fluid scales
│   ├── themes/                            # Swappable campaign theme contracts
│   │   ├── theme-black-friday.css
│   │   ├── theme-christmas.css
│   │   └── theme-july4.css
│   └── 2-facade.css                       # Semantic tokens, OS media queries & UI primitives
│
├── core/                                  # DOMAIN & PROVIDER LAYER (SOLID)
│   ├── constants/                         # Typed domain constants & environment key maps
│   ├── domain/                            # Pure TypeScript entities & semantic domain errors
│   ├── repositories/                      # Dynamic seasonal catalog generator (fallback data)
│   ├── adapters/                          # Strategy, Resilient Proxy, Factory & live LLM registry
│   └── facades/                           # LookupFacade, ServerLookupFacade, ReportDispatchFacade & unit tests
│
├── features/lookup/                       # CONTROLLER & PRESENTATION LAYER
│   ├── hooks/                             # Custom hooks (useMultiEngineLookup, useCampaignTheme, useReportExport)
│   └── components/                        # Single-responsibility atomic UI components
│
└── components/report/                     # Executive PDF template & export actions bar
```

### Design Engineering Decisions

1. **Deterministic CSS Cascade (`@layer base, components, utilities`):**
   - **Repository (`1-repository.css`):** Stores raw perceptual color values (`OKLCH`), seasonal primitive palettes, and fluid `clamp()` scales. Components never reference raw tokens directly.
   - **Themes (`themes/*.css`):** Map campaign-level tokens (`--accent-primary`, `--surface-canvas`, `--radius-card`) without touching component markup.
   - **Facade (`2-facade.css`):** Resolves semantic tokens, live `[data-campaign]` overrides, automatic dark mode, browser font scaling (`rem`-based spacing), and reduced-motion fallbacks.
2. **SOLID & Resilient Provider Layer:**
   - **Strategy & Factory (`ai-provider.strategy.ts`, `ai-provider.factory.ts`):** Decouples the UI from data sources; switching `NEXT_PUBLIC_PROVIDER_MODE` toggles between `mock`, `live`, and `auto`.
   - **Resilient Proxy (`ResilientAIProviderProxy`):** Intercepts live calls, measures client latency, and transparently falls back to dynamic mock telemetry if an external API is unavailable.
   - **Clean UI Decomposition:** State orchestration (`useMultiEngineLookup`, `useReportExport`) is isolated from pure presentational components (`CitationItemCard`, `ProviderResultColumn`, `ExecutiveSummaryCard`).
3. **Tabular Numerals & Zero Layout Shift:**
   - All rankings, prices, and latency metrics use `JetBrains Mono` with `tabular-nums` alongside structural shimmer skeletons to eliminate layout jitter.

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables (Optional)

Copy `.env.example` to `.env.local` if you want to test live LLM queries or real email dispatch. If omitted, the application runs out-of-the-box in `mock` mode.

```bash
cp .env.example .env.local
```

```env
# Execution mode: "mock" (default) | "auto" (live with fallback) | "live" (strict)
NEXT_PUBLIC_PROVIDER_MODE=mock

# Optional AI Provider API Keys (used when mode is "auto" or "live")
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Optional Email Delivery Key (Resend)
RESEND_API_KEY=
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Press **`⌘K`** (or **`Ctrl+K`**) at any time to focus the search command bar.

### 4. Run Unit Tests & Quality Checks

```bash
npm test          # Run Vitest unit tests for LookupFacade
npm run lint      # Run ESLint checks
npm run build     # Verify production build
```

---

## Switching Campaign Themes via CSS

To permanently change the default seasonal aesthetic at build time, update the theme `@import` inside `src/app/globals.css`:

```css
@import "../styles/1-repository.css";
@import "../styles/themes/theme-christmas.css"; /* Swap theme file here */
@import "../styles/2-facade.css";
```
