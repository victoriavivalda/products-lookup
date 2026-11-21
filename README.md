# products-lookup

A multi-engine product visibility and price accuracy inspector across AI search platforms (Google AI Overviews, ChatGPT Shopping, and Claude Search).

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **React Query**, and **Framer Motion**, applying a layered **Repository → Facade → Controller** architecture across both data providers and the CSS design system.

---

## Key Capabilities

- **Progressive Multi-Engine Telemetry:** Queries AI search adapters in parallel with independent latency simulation, streaming results onto the UI without blocking the main thread.
- **Stale Pricing & Citation Audit:** Cross-references AI-cited prices against live catalog pricing to flag discrepancies in real time.
- **Automated Executive Conclusions:** Synthesizes cross-engine rankings, share-of-voice, and actionable schema recommendations on the fly.
- **Vector PDF & Email Dispatch:** Generates downloadable executive reports (`@react-pdf/renderer`) and dispatches summaries via email (`/api/report/send` powered by Resend with automatic simulation fallback).
- **Single-File Seasonal Theming:** Switch entire campaign aesthetics (*Black Friday*, *Christmas Sales*, *4th of July*) by swapping a single CSS theme import or toggling live in the UI.
- **Browser-Native Accessibility:** Automatically adapts to OS color schemes (`prefers-color-scheme`), browser font-size scaling (`rem` + `clamp()`), and motion preferences (`prefers-reduced-motion`).

---

## Architecture Overview

This project mirrors a **Repository → Facade → Controller** pattern across both the TypeScript domain layer and the CSS cascade:

```text
src/
├── styles/                        # LAYERED CSS DESIGN SYSTEM
│   ├── 1-repository.css           # Raw OKLCH primitives & fluid typography scales
│   ├── themes/                    # Swappable campaign theme contracts
│   │   ├── theme-black-friday.css
│   │   ├── theme-christmas.css
│   │   └── theme-july4.css
│   └── 2-facade.css               # Semantic tokens, OS media queries & UI primitives
│
├── core/                          # DOMAIN & PROVIDER LAYER (SOLID)
│   ├── domain/                    # Pure TypeScript entities (ProductCitation, ExecutiveConclusion)
│   ├── adapters/                  # Strategy/Adapter pattern per AI engine (Gemini, ChatGPT, Claude)
│   └── facades/                   # LookupFacade: orchestrates providers & synthesizes insights
│
├── features/lookup/               # CONTROLLER & PRESENTATION LAYER
│   ├── hooks/                     # Custom hooks (useMultiEngineLookup, useCampaignTheme)
│   └── components/                # Single-responsibility atomic UI components
│
└── components/report/             # Executive PDF template & client-side export actions
```

### Design Engineering Decisions

1. **Deterministic CSS Cascade (`@layer base, components, utilities`):**
   - **Repository (`1-repository.css`):** Stores raw perceptual color values (`OKLCH`) and fluid `clamp()` scales. Components never reference raw tokens directly.
   - **Themes (`themes/*.css`):** Override campaign-level tokens (`--accent-primary`, `--surface-canvas`, `--radius-card`) without touching component markup.
   - **Facade (`2-facade.css`):** Maps semantic tokens and handles automatic dark mode, browser font scaling (`rem`-based spacing and borders), and reduced-motion fallbacks.
2. **SOLID & Clean UI Decomposition:**
   - Each AI engine implements a common `AIProviderAdapter` interface (Open/Closed & Dependency Inversion), allowing new models to be added without modifying UI controllers.
   - State orchestration (`useMultiEngineLookup`, `useCampaignTheme`) is decoupled from pure presentational components (`CitationItemCard`, `ProviderResultColumn`, `ExecutiveSummaryCard`).
3. **Tabular Numerals & Zero Layout Shift:**
   - All rankings, prices, and latency metrics use `JetBrains Mono` with `tabular-nums` to prevent horizontal jitter during progressive loading.

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables (Optional)

Create a `.env.local` file in the project root if you want to test live email delivery via [Resend](https://resend.com). If omitted, the API route automatically falls back to a simulated dispatch mode.

```env
RESEND_API_KEY=re_your_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Press **`⌘K`** (or **`Ctrl+K`**) at any time to focus the search command bar.


### 4. Run Unit Tests

The core business logic and executive insight synthesis (`LookupFacade`) are covered with unit tests powered by **Vitest**:

```bash
npm test
```

---

## Switching Campaign Themes via CSS

To permanently switch the default seasonal aesthetic at build time, update the theme `@import` inside `src/app/globals.css`:

```css
@import "../styles/1-repository.css";
@import "../styles/themes/theme-christmas.css"; /* Swap theme file here */
@import "../styles/2-facade.css";
```
