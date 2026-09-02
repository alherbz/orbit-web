---
schema_version: 2
id: c0a8bf6f-3189-4425-9d77-1be1e34d99a1
name: orbit-web
node: .
category: app
---

## Purpose
Frontend of the **Orbit** demo project: a small Express server that serves a dependency-free static task-board UI (`public/`) and reverse-proxies `/api/*` to the `orbit-api` backend, so the browser only ever talks to this one origin.

## Files
| Path | Role |
|---|---|
| `server.js` | The whole server: mounts the `/api` proxy (target `API_URL`, `pathRewrite` strips `^/api`), then `express.static('public')`; listens on `0.0.0.0:PORT`. |
| `public/index.html` | Static markup: welcome modal, topbar with `#health-chip`, composer form `#new-task`, filter toolbar + `#count`, and the four board states `#skeleton` / `#tasks` / `#empty` / `#error`. |
| `public/app.js` | All client behavior — `checkHealth`, `load`, `render`, `showBoard`, `taskCard`, `wireShare`, filter wiring, new-task submit, `initWelcomeModal`. Plain classic script, no framework. |
| `public/styles.css` | Hand-written dark theme (CSS custom properties in `:root`, indigo `--accent`), priority badges, shimmer skeleton, modal, 480px media query. |
| `package.json` | ESM (`"type": "module"`), Node >= 20, `start: node server.js`, deps `express` + `http-proxy-middleware`. |
| `Dockerfile` | Repo-root image recipe (node:20-alpine, `npm install --omit=dev`, copies `server.js` + `public`, `ENV PORT=3000`). Kept for local/manual builds — the platform uses the inline spec instead. |
| `.infrar/build.yaml` | Build/run spec actually used by Infrar: inline `dockerfileContent`, `run.command: node server.js`, `run.port: 3000`, healthcheck `/`, env `PORT` + `API_URL` (`from: api`). |
| `.dockerignore` | Excludes `node_modules`, `.git`, `.infrar`, logs from the build context. |
| `README.md` | Short description of the node and its two env vars. |

## Surface
**Exposes** — HTTP on `PORT` (`0.0.0.0`; code default `8080`, but the container and `build.yaml` set/serve `3000`): `GET /` and every static asset under `public/` (`/index.html`, `/app.js`, `/styles.css`); `ALL /api/*` proxied to `API_URL` with the `/api` prefix **removed**. No own JSON API, no exported module API. Command: `npm start` = `node server.js`.

**Consumes** — env `API_URL` (declared in `.infrar/build.yaml` as `from: api`, the api node's graph name; `server.js` falls back to `http://localhost:3001` for local dev only) and `PORT`; npm packages `express` ^4 and `http-proxy-middleware` ^3. Backend endpoints reached through the same-origin proxy: `GET /api/health` (expects `{ status, storage }`), `GET /api/tasks` and `POST /api/tasks` (task shape `{ id, title, priority, done }`), `POST /api/tasks/:id/share` (`{ email }`; errors may carry `error` and `providerMessage`). Browser APIs: `fetch`, `localStorage`.

## Behavior
`server.js` mounts the proxy **before** the static middleware, so `/api/*` never falls through to a file; because `pathRewrite` strips `^/api`, the api node must serve its routes at its **root** (`/health`, `/tasks`, …), i.e. `api_prefix: /` on that node.

The page script runs at the end of `<body>` and finishes by calling `checkHealth()` then `load()`. `checkHealth` hits `/api/health` once and paints the header chip: `chip--ok` with `API online · <storage>` on success, `chip--down` with `API unreachable` on any failure. `load()` shows the skeleton, fetches `/api/tasks`, and on a non-OK response throws with the server's `error` field so `#error` quotes it; on success it stores `tasks` and calls `render()`.

`render()` derives the visible slice from the current `filter` (`all` / `open` / `done`), writes the `N tasks · M open` counter, and either shows a filter-specific `#empty` message or replaces `#tasks` children with `taskCard()` nodes. Exactly one of the four board regions is visible at a time, enforced by `showBoard(state)`. Cards are assembled with `createElement`/`textContent`, so task titles are never parsed as HTML; each carries a colored priority badge, an Open/Done chip (done titles struck through), and a **Share** toggle.

`wireShare` gives each card an inline email form (`sr-only` label, per-task input id `share-email-<id>`): the toggle shows/hides it and focuses the input, typing clears a previous error and `aria-invalid`, submit validates against `EMAIL_RE` client-side first, then POSTs to `/api/tasks/:id/share` with the Send button disabled and relabelled `Sending…`. Success shows a green `Shared with <email>.` and collapses the form; failure shows the API's `error` plus `providerMessage` when present, in red.

The composer POSTs `{ title, priority }`, disables the submit button in flight, reloads the board on success, and prints the server's message under the form on failure. Filter buttons keep `is-active` and `aria-pressed` in sync and only re-`render()` — they never refetch. `initWelcomeModal` shows the modal unless `localStorage['orbit-welcome-seen'] === '1'`, and dismisses on button click, overlay-background click, or Escape, persisting the flag.

## Notes
- **Port**: `server.js` defaults to `8080` but the image sets `PORT=3000` and `build.yaml` declares `run.port: 3000` with a healthcheck on `/`. Change one and change the other, or the pod is probed on a port it does not serve.
- **Two build recipes**: the platform builds from `.infrar/build.yaml`'s inline `dockerfileContent` (`COPY . .`, relying on `.dockerignore`); the root `Dockerfile` copies `server.js` and `public` explicitly. They already differ — when the file layout or start command changes, update the spec (that is what runs) and keep the root `Dockerfile` consistent.
- Must bind `0.0.0.0`; `server.js` already does. Binding loopback builds fine but the preview never comes up.
- Never hardcode the API host in `public/`: client code fetches **relative** `/api/...` and the proxy resolves it. `API_URL` is server-side only and must stay declared with `from: api` in `build.yaml`, or it is silently unset.
- The base-path contract is `frontend /api/x` → `backend /x`. Adding an `api_prefix` on the backend without dropping `pathRewrite` here (or vice versa) builds and runs but shows no data.
- `.cards` sets `display: grid`, which overrides the UA's `[hidden] { display: none }` — the explicit `.cards[hidden] { display: none }` guard in `styles.css` is what keeps the skeleton from staying on screen after load. The same guard pattern is needed for `.share-form`, `.share-msg` and `.modal-overlay`; any new `display:`-carrying element toggled via `hidden` needs one too.
- The health chip is polled **once** at load and its classes are only ever added, never removed — a second `checkHealth()` call would leave both `chip--ok` and `chip--down` applied.
- No SPA fallback: unknown non-`/api` paths 404 from `express.static`. Assets are served without cache-busting.
- There is no lockfile (`package-lock.json` is gitignored) and the install step is `npm install --omit=dev || npm install` — builds resolve semver ranges fresh.
- The welcome modal heading is intentionally Italian ("Buongiorno utente!"); everything else in the UI is English.
