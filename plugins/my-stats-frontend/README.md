# My Stats Frontend Module

A minimal Frontend Module for Backstage (new frontend system) that provides:

- A `StatsApi` via `ApiBlueprint`
- A `/stats` page via `PageBlueprint`

## Installation

Add the package to your workspace and ensure it is built with the app. The module exposes extensions that the app can install.

## Run & Verify

```bash
# Start backend and frontend
yarn workspace backend start
yarn workspace app start

# Verify backend endpoint
curl -s http://localhost:7007/api/my-stats/stats | jq .
# Visit the stats page
open http://localhost:3000/stats
```

## Notes

- The module registers a default `StatsApi` that fetches from `/api/my-stats/stats`.
- You can provide an alternative implementation by overriding the `statsApiRef` in the app's API factories.
