# orbit-web

Frontend for the **Orbit** demo project — a single **app** node.

A small Express server serves the static Tasks UI and proxies `/api/*` to the
`orbit-api` service. Reads `API_URL` (wired from the `api` node in preview) and
`PORT` (default `8080`).

Paired with the `orbit-api` repository (backend + infra).
