# Travel Weather App

Monorepo containing a React + Relay frontend and a Node GraphQL backend.

## Architecture Overview

This project is split into two apps inside one monorepo:

- `apps/website`: a React frontend built with Vite+, Relay, and Tailwind CSS.
- `apps/api`: a small Node.js GraphQL API built with GraphQL Yoga and Pothos.

The end-to-end flow is intentionally simple:

1. The user searches for a destination in the website.
2. The frontend sends a GraphQL query to the API using Relay.
3. The API calls Open-Meteo geocoding, forecast, and marine endpoints.
4. The API normalizes that data into a shared weather shape.
5. A ranking module scores each activity for the next seven days and returns both weekly recommendations and day-by-day factor breakdowns.
6. Relay renders the ranked activities, best days, and supporting factors in the UI.

## Technical Choices

- GraphQL between frontend and backend: this keeps the website focused on the exact fields it needs and gives the UI a strongly typed contract.
- Relay on the frontend: a good fit because the app is query-driven, benefits from colocated fragments, and needs predictable data fetching for the search + report flow.
- Pothos + GraphQL Yoga on the backend: lightweight, type-friendly, and easy to evolve without a lot of framework overhead.
- Open-Meteo as the data provider: it offers both forecast and marine data, which made it possible to support inland and coastal activity scoring in one pipeline.
- A dedicated ranking module: the recommendation logic lives outside the GraphQL layer so the scoring heuristics can be tested and iterated on independently.
- Monorepo layout: frontend and backend move together, which keeps schema changes, generated Relay artifacts, and UI updates in sync.

## How AI Assisted

AI (mainly Codex) was used as a pair-programming assistant during the build. It helped shape the activity scoring logic and ranking heuristics, refine UI copy and README wording, and suggest implementation/test improvements while I kept the final say on architecture, code changes, and validation. In practice, AI was most useful for accelerating iteration, not for making product or technical decisions on its own.

## Omissions & Trade-Offs

- No persistence layer: searches, preferences, and reports are not saved. That kept the scope focused on the recommendation flow,
- Heuristic scoring is hand-tuned: the activity rankings are explainable and easy to adjust, but they are not calibrated against real traveler feedback or historical outcome data. The next step would be validation with fixtures, user testing, and more domain-specific thresholds.
- Limited resilience around third-party weather data: the app depends directly on Open-Meteo responses and only has light fallback behavior. I would add caching, retries, and better degraded states for partial API failures.
- No authentication or multi-user features: this was intentionally skipped to prioritize the core search-to-report experience first.
- Polish is focused on the main happy path: there is good structure around loading states and core interactions, but there is still room for deeper accessibility review, analytics, and broader responsive/device testing.

## Development

- Prerequisites:

```bash
# Node.js 22.12+ is required
npm install -g pnpm
```

- Install `vp`:
  - macOS / Linux: `curl -fsSL https://vite.plus | bash`
  - Windows PowerShell: `irm https://vite.plus/ps1 | iex`
  - Docs: https://viteplus.dev/guide/

- Install `pnpm`:
  - Recommended: `npm install -g pnpm`
  - Docs: https://pnpm.io/installation

- Install Watchman for Relay watch mode:

```bash
# macOS
brew install watchman

# Ubuntu / Debian
sudo apt install watchman
```

- Install dependencies and validate:

```bash
vp install
vp check
vp run test -r
```

- Run the full local stack (API + Relay watch + Vite frontend):

```bash
vp run dev
```

- Run only the frontend:

```bash
vp run website#dev
```

- Run the GraphQL API:

```bash
vp run api#dev
```

- Watch Relay artifacts while editing frontend GraphQL:

```bash
vp run website#relay:watch
```

- Build the monorepo:

```bash
vp run build -r
```
