# My Stats Backend Plugin

This is a minimal example backend plugin for Backstage that exposes a stats endpoint.

## Routes

- `GET /api/my-stats/stats` — returns JSON with example counts.

## Auth Policy

- The path `/api/my-stats/stats` is allowed for unauthenticated access using `httpRouter.addAuthPolicy`.

## Local Run & Verify

```bash
# Start backend and frontend
yarn workspace backend start
yarn workspace app start

# Verify the endpoint
curl -s http://localhost:7007/api/my-stats/stats | jq .
```

Expected response:

```json
{ "services": 12, "apis": 5, "docs": 23 }
```

## Install in Backend

Add the plugin to your backend assembly:

```ts
// packages/backend/src/index.ts
backend.add(import('@org/plugin-my-stats-backend'));
```
