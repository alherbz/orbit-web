---
schema_version: 1
id: 0618f6df-dccd-476b-81c2-b8a9158c433c
name: orbit-web
node: .
category: app
---
## Purpose
orbit-web is the frontend node of the **Orbit** demo project: a small task-list web app. A minimal Express server serves a static "Tasks" UI and reverse-proxies all `/api/*` requests to the companion `orbit-api` backend service (a separate repository/node), so the browser only ever talks to this server. It is designed to run as a containerized app node inside an Infrar Application Preview, where the `API_URL` environment variable is wired in from the `api` node at preview launch.

## Structure
- `server.js` — the entire server: an ES-module Express app (~30 lines) that mounts the `/api` proxy and static file serving.
- `public/` — the static client, no build step:
  - `index.html` — page shell with a new-task form (title input + low/medium/high priority select), a `#tasks` list, and a `#status` line.
  - `app.js` — vanilla-JS client logic: fetches, renders, and creates tasks via `/api/tasks`.
  - `styles.css` — dark-theme styling using CSS custom properties; priority dots colored via `.p-high`/`.p-medium`/`.p-low` classes.
- `package.json` — declares the only two runtime dependencies (`express`, `http-proxy-middleware`), `"type": "module"`, Node >= 20, and a single `start` script (`node server.js`).
- `Dockerfile` — `node:20-alpine` image; installs prod deps, copies the source, exposes port 8080, runs `node server.js`.
- `README.md`, `.gitignore`, `.dockerignore` — docs and hygiene files.

## Behavior
On startup, `server.js` reads `PORT` (default `8080`) and `API_URL` (default `http://localhost:3001`), then listens on `0.0.0.0`. Requests to `/api/*` are proxied to `API_URL` with `changeOrigin: true` and the `/api` prefix stripped (`pathRewrite: { '^/api': '' }`), so a browser call to `/api/tasks` reaches the backend at `<API_URL>/tasks`. All other paths are served statically from `public/`.

In the browser, `app.js` runs `load()` on page load: it `GET`s `/api/tasks`, renders each task as a list item (priority color dot, title, priority badge, strikethrough styling when `done` is truthy), and updates the status line with the task count. On failure it shows "Could not reach the API: …" instead. Submitting the form `POST`s `{ title, priority }` as JSON to `/api/tasks` (empty titles are ignored client-side), clears the input, and reloads the list. There is no client-side routing, state library, or UI for completing/deleting tasks — the UI only lists and creates them.

## Dependencies
- **Runtime:** Node.js >= 20; `express` ^4.19.2 (HTTP server + static serving) and `http-proxy-middleware` ^3.0.3 (the `/api` reverse proxy). The browser client has zero dependencies — plain DOM APIs and `fetch`.
- **Services:** requires the `orbit-api` backend to be reachable at `API_URL`, exposing `GET /tasks` (returning a JSON array of `{ title, priority, done }` objects) and `POST /tasks`. Without it, the UI loads but shows an API-unreachable status.
- **Environment:** `PORT` (default 8080) and `API_URL` (default `http://localhost:3001`; injected by Infrar from the `api` node in previews).

## Notes
- Tasks expect a `priority` of `low`/`medium`/`high`; any other value renders with the default gray dot since only those three have CSS classes.
- `render()` inserts task titles via `innerHTML` without escaping, so titles containing HTML are interpreted as markup — a potential XSS vector if the API data is untrusted (acceptable for a demo, worth knowing before reuse).
- The `POST` in the form handler doesn't check the response status; a failed create is only surfaced indirectly when `load()` re-fetches.
- There is intentionally no build/bundle step: `public/` is served as-is, which keeps the Docker image and dev loop trivial (`npm start`).
- The Dockerfile copies `package.json` alone (no lockfile is present in the repo) before `npm install --omit=dev`, then copies the rest of the source.
