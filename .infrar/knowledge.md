---
schema_version: 1
id: 46c8491e-581c-4f3d-99f1-2a9fefde99b5
name: orbit-web
node: .
category: app
---
## Purpose
orbit-web is the frontend node of the **Orbit** demo project: a small task-list web application. A minimal Express server serves a static "Tasks" UI and reverse-proxies all `/api/*` requests to the companion `orbit-api` backend (a separate repository/node), so the browser only ever talks to this one origin. It is designed to run as a containerized **app** node inside an Infrar Application Preview, where the `API_URL` environment variable is wired in from the `api` node at preview launch.

## Structure
- `server.js` — the entire server (~30 lines): an ES-module Express app that mounts the `/api` reverse proxy and static file serving from `public/`.
- `public/` — the static client, with no build step:
  - `index.html` — page shell with a new-task form (title input + low/medium/high priority select), a `#tasks` list, and a `#status` line.
  - `app.js` — vanilla-JS client logic: fetches, renders, and creates tasks via `/api/tasks` using `fetch` and plain DOM APIs.
  - `styles.css` — dark-theme styling via CSS custom properties; priority dots colored through `.p-high`/`.p-medium`/`.p-low` classes.
- `package.json` — `"type": "module"`, Node >= 20, a single `start` script (`node server.js`), and the only two runtime dependencies (`express`, `http-proxy-middleware`).
- `Dockerfile` — `node:20-alpine`; installs prod deps, copies the source, sets/exposes port 8080, runs `node server.js`.
- `README.md`, `.gitignore`, `.dockerignore` — docs and hygiene files.

## Behavior
On startup, `server.js` reads `PORT` (default `8080`) and `API_URL` (default `http://localhost:3001`) and listens on `0.0.0.0`. Requests to `/api/*` are proxied to `API_URL` with `changeOrigin: true` and the `/api` prefix stripped (`pathRewrite: { '^/api': '' }`), so a browser call to `/api/tasks` reaches the backend at `<API_URL>/tasks`. All other paths are served statically from `public/`.

In the browser, `app.js` runs `load()` on page load: it GETs `/api/tasks`, renders each task as a list item (priority color dot, title, priority badge, strikethrough when `done` is truthy), and sets the status line to the task count ("N tasks · served by orbit-api"). On failure it shows "Could not reach the API: …" instead. Submitting the form POSTs `{ title, priority }` as JSON to `/api/tasks` (empty titles are ignored client-side), clears the input, and reloads the list. There is no client-side routing, state library, or UI for completing/deleting tasks — the UI only lists and creates them.

## Dependencies
- **Runtime:** Node.js >= 20; `express` ^4.19.2 (HTTP server + static serving) and `http-proxy-middleware` ^3.0.3 (the `/api` reverse proxy). The browser client has zero dependencies.
- **Services:** requires the `orbit-api` backend reachable at `API_URL`, exposing `GET /tasks` (JSON array of objects with `title`, `priority`, `done`) and `POST /tasks` (accepting `{ title, priority }`). Without it the page still loads but shows an API-unreachable status.
- **Environment variables:** `PORT` (default 8080) and `API_URL` (default `http://localhost:3001`; injected by Infrar from the `api` node in previews).

## Notes
- `render()` inserts task titles via `innerHTML` without escaping, so titles containing HTML are interpreted as markup — a potential XSS vector if API data is untrusted (acceptable for a demo, worth knowing before reuse).
- Only `low`/`medium`/`high` priorities have dot colors in CSS; any other value falls back to the default gray dot.
- The form-submit POST doesn't check the response status; a failed create only surfaces indirectly when `load()` re-fetches.
- There is intentionally no build/bundle step: `public/` is served as-is, keeping the Docker image and dev loop trivial (`npm start`).
- No lockfile is committed (`package-lock.json` is gitignored); the Dockerfile copies `package.json` alone before `npm install --omit=dev`, so image builds resolve dependency versions at build time.
