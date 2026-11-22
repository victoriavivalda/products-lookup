# products-lookup

A multi-engine product visibility and price accuracy inspector across AI search platforms (**Google AI Overviews**, **ChatGPT Shopping**, and **Claude Search**).

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS v4**, **TanStack Query**, and **Framer Motion**, applying a layered **Repository → Facade → Controller** architecture across both the domain layer and the CSS design system.

---

## Key Capabilities

- **Progressive Multi-Engine Telemetry & Explicit Query Execution:** Uses explicit submission (`Enter`, `Inspect` button, or instant *Quick prompts* with `⌘K` / `Ctrl+K` shortcut) to prevent partial LLM queries, dispatching parallel per-engine requests without blocking the main thread.
- **Continuous AI Executive Streaming (`/api/stream-brief`):** Streams token-by-token executive visibility syntheses via native Web Streams (`ReadableStream` + SSE) with `AbortController` cancellation and a chained multi-provider fallback (**Gemini → OpenAI → Claude → Local Token Stream**).
- **Hybrid Execution Engine (`mock` / `auto` / `live`):** Powered by **Strategy, Factory, and Resilient Proxy** patterns—supports real LLM APIs with automatic fallback to a dynamic contextual catalog generator.
- **Data-Driven Motion & Vector Visualizations:**
  - **Engine Latency & Accuracy Benchmark:** Framer Motion horizontal progress bars with `tabular-nums` alignment, WAI-ARIA `progressbar` semantics, and `useReducedMotion()` accessibility support.
  - **Cross-Engine Ranking Bump Chart:** Modular SVG trajectory chart (`pathLength` Bezier curves) with keyboard focus navigation tracking product ranks (`#1`–`#3`), cross-engine presence, and verified vs. drifted pricing.
- **Telemetry Edge-Case Simulator (Decorator Pattern):** Non-invasive `SimulationDecoratorStrategy` accessible from the footer (**API Conditions**: `Normal`, `Slow Network`, `Partial Outage`, `Price Drift`) to verify isolated error recovery, asymmetric latency loading, and drift alerts without mutating core adapters.
- **Isomorphic Vector PDF & Email Dispatch:** Shares a single `AuditTelemetryViewModel` presenter and modular `<ExecutiveReportPDF />` template (`@react-pdf/renderer`) for both client-side PDF downloads and server-side [Resend](https://resend.com) email attachments with HTML sanitization.
- **Campaign-Driven Seasonal Theming:** Switch between *Black Friday*, *Christmas*, and *4th of July*—dynamically updating OKLCH color palettes, card radii, suggested prompts, and catalog editions while preserving per-campaign query cache.
- **Browser-Native Accessibility:** Automatically adapts to OS color schemes (`prefers-color-scheme`), browser font-size scaling (`rem` + `clamp()`), and motion preferences (`prefers-reduced-motion`).

---

## Architecture Overview

This project mirrors a **Repository → Facade → Controller** pattern across both the TypeScript domain layer and the CSS cascade:

```text
src/
├── app/
│   ├── api/
│   │   ├── lookup/route.ts                # Thin REST controller for multi-engine queries
│   │   ├── stream-brief/route.ts          # Native ReadableStream endpoint for AI synthesis
│   │   └── report/send/route.ts           # Thin REST controller for email + PDF dispatch
│   ├── globals.css                        # Tailwind v4 & layered CSS entrypoint
│   ├── layout.tsx                         # Font variables (Inter, JetBrains Mono) & QueryProvider
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
│   ├── constants/                         # Typed domain constants, simulation modes & env key maps
│   ├── domain/                            # Immutable TypeScript entities & semantic domain errors
│   ├── repositories/                      # Dynamic seasonal catalog generator (fallback data)
│   ├── adapters/                          # Strategy, Resilient Proxy, Simulation Decorator, Factory & tests
│   └── facades/                           # Lookup, StreamBrief, ReportDispatch, TelemetryPresenter & tests
│
├── features/lookup/                       # CONTROLLER & PRESENTATION LAYER
│   ├── hooks/                             # Custom hooks (useMultiEngineLookup, useExecutiveStream, useCampaignTheme, useReportExport)
│   └── components/                        # Modular UI components & visibility-matrix SVG subcomponents
│
└── components/report/                     # Modular vector PDF template (executive-report/) & export actions
```

### Design Engineering Decisions

1. **Deterministic CSS Cascade (`@layer base, components` + Tailwind v4):**
   - **Repository (`1-repository.css`):** Stores raw perceptual color values (`OKLCH`), seasonal primitive palettes, and fluid `clamp()` scales. Components never reference raw tokens directly.
   - **Themes (`themes/*.css`):** Map campaign-level tokens (`--accent-primary`, `--surface-canvas`, `--radius-card`) without touching component markup.
   - **Facade (`2-facade.css`):** Resolves semantic tokens, live `[data-campaign]` overrides, automatic dark mode, browser font scaling (`rem`-based spacing), and `prefers-reduced-motion` fallbacks.
2. **SOLID & Resilient Provider Layer:**
   - **Strategy, Proxy & Factory (`ai-provider.strategy.ts`, `ai-provider.factory.ts`):** Decouples the UI from data sources; `ResilientAIProviderProxy` intercepts live calls, forwards `AbortSignal` cancellations, and transparently falls back to dynamic mock telemetry on timeouts or quota limits.
   - **Open/Closed Edge-Case Simulation (`SimulationDecoratorStrategy`):** Wraps base adapters to inject asymmetric network delays, single-provider `502` outages, or global price drift from the footer controls without altering production components.
   - **Shared ViewModel & Isomorphic Reporting (`telemetry.presenter.ts`, `ExecutiveReportPDF.tsx`):** Eliminates metric duplication across the Web UI, downloadable vector PDF, and Resend email attachments.
3. **Tabular Numerals & Zero Layout Shift:**
   - All rankings, prices, and latency metrics use `JetBrains Mono` with `tabular-nums` alongside structural shimmer skeletons to eliminate layout jitter.

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables (Optional)

Copy `.env.example` to `.env.local` if you want to test live LLM queries, real-time SSE streaming, or email delivery with PDF attachments. If omitted, the application runs out-of-the-box in `mock` mode.

```bash
cp .env.example .env.local
```

```env
# Execution mode: "mock" (default) | "auto" (live with fallback) | "live" (strict)
NEXT_PUBLIC_PROVIDER_MODE=auto

# Optional AI Provider API Keys (used when mode is "auto" or "live")
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Optional Email Delivery Key (Resend)
RESEND_API_KEY=
# Optional: Set only if you have a verified custom domain in Resend
# RESEND_FROM_EMAIL="Products Lookup <audit@yourdomain.com>"
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Press **`⌘K`** (or **`Ctrl+K`**) at any time to focus the search command bar, and use the **API Conditions** controls in the footer to simulate network latency, partial outages, and price drift.

### 4. Run Unit Tests & Quality Checks

```bash
npm test          # Run Vitest unit tests (Adapters, Facades, Presenters, Stream & Dispatch)
npm run lint      # Run ESLint checks
npm run build     # Verify production build
```

---

## Engineering Trade-offs & Future Improvements

- **Client-Side Session Caching vs. Distributed Cache:** Query results are cached per `(modelId, query, campaign, scenario)` in TanStack Query (`30m` stale time) for instant cross-campaign comparison without redundant LLM token spend. In a multi-tenant production environment, this would be backed by Redis/KV edge caching with rate limiting per IP/API key.
- **Zero-Dependency Runtime Type Guards:** API routes use lightweight TypeScript type guards to avoid bundle overhead; if payload schemas grow, migrating to `zod` would centralize validation and OpenAPI generation.
- **Test Coverage Focus:** Unit tests prioritize the `core/` domain, resilience proxies, SSE stream fallback chains, and presenters where algorithmic risk is highest. Adding Playwright E2E flows would be the next step for full UI regression coverage.
