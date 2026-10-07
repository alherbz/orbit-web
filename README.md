# orbit-web

Frontend for **Orbit**, a small team task board. Paired with the `orbit-api`
repository (API, worker and infrastructure).

A small Express server serves the static UI and forwards `/api/*` to orbit-api,
keeping the `/api` prefix.

| Variable | Required | Meaning |
|----------|----------|---------|
| `API_URL` | yes, outside local dev | base URL of orbit-api, e.g. `http://localhost:8083` (default) |
| `PORT` | no | default `8080` (`3000` in the container image) |

`npm install && npm start`, then open `http://localhost:8080`. The header chip shows
whether the API and its dependencies (Postgres, Redis, S3) answer.
