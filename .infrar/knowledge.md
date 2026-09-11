---
schema_version: 2
id: 46c8491e-581c-4f3d-99f1-2a9fefde99b5
name: orbit-web
node: .
category: app
---

## Purpose
`orbit-web` is the whole Orbit frontend: a small Express server that serves a dependency-free static Tasks UI from `public/` and reverse-proxies `/api/*` to the companion `orbit-api` service, so the browser only ever talks to one origin. It is a single repo-root app node — there is no build step, no framework and no client bundler.

## Files
| Path | Role |
|---|---|
| server.js | The entire server: `http-proxy-middleware` on `/api` toward `API_URL`, a self-contained `GET /health`, `express.static` over `public/`, and the listener bound to `0.0.0.0` |
| package.json | ESM (`"type": "module"`), Node >= 20, `start` = `node server.js`; deps are only `express` and `http-proxy-middleware` |
| public/index.html | Static shell: welcome modal, topbar (logo, `.branch-badge`, `#health-chip`), composer form `#new-task` (fields `#title` and `#priority`), filter nav, and the four board containers `#skeleton` / `#tasks` / `#empty` / `#error` |
| public/app.js | All client logic, plain DOM, no build: `checkHealth`, `load`, `render`, `showBoard`, `taskCard`, `wireShare`, filter wiring, new-task submit, `initWelcomeModal` |
| public/styles.css | Dark theme via `:root` custom properties; card/badge/chip/skeleton/modal styling, `[hidden]` guards, mobile breakpoint, `.branch-badge`, and the composer field/label rules |
| Dockerfile | Repo-root image recipe (`node:20-alpine`, explicit `COPY server.js` + `COPY public`, `ENV PORT=3000`) — reference only; the platform builds from the inline spec below |
| .dockerignore | Keeps `node_modules`, `.git`, `.infrar` and logs out of the build context |
| .infrar/build.yaml | The spec the platform actually builds and runs: inline `dockerfileContent`, `run.command`/`run.port` 3000, healthcheck on `/`, `env` = `PORT` (default `3000`) and `API_URL` (`from: api`) |
| .infrar/iac-preview/orbit-web-pod.yaml | Committed pod behaviour for the preview: `node server.js`, containerPort 3000, readiness `GET /` |
| README.md | One-paragraph description and the pairing with the `orbit-api` repo (tasks + Resend email) |

## Surface
**Exposes** — HTTP on `PORT` (code default `8080`; the container and build spec run it on `3000`). `GET /health` → `{ status, service: "orbit-web", version, uptime }`, answered locally with no upstream call. `/api/*` → proxied to `API_URL` with `^/api` **stripped**. Everything else → static files from `public/` (`/`, `/app.js`, `/styles.css`). No exported module API.

**Consumes** — Env: `API_URL` (base URL of the backend, wired `from: api` — the graph node name is `api`, not `orbit-api`), `PORT`, `APP_VERSION` (optional, only echoed by `/health`, and **not declared in build.yaml** so it is never injected → `/health` always reports `dev`). Packages: `express`, `http-proxy-middleware`. Services: `orbit-api` for `GET /health`, `GET /tasks`, `POST /tasks`, `POST /tasks/:id/share`; this node holds no database, mail or Resend credentials itself. Browser: `localStorage` key `orbit-welcome-seen`.

## Behavior
**Request path.** Middleware order in `server.js` is proxy → `/health` → static, and that order is the contract: registering static first would let a file shadow the probe or the API. The proxy rewrites `^/api` away, so the backend serves its routes at its **root** (`/tasks`, `/health`), not under `/api` — client and backend agree only because of this rewrite.

**Page load.** `app.js` fires `checkHealth()` and `load()` at the bottom of the script. `checkHealth` hits `/api/health` (i.e. the *backend's* health, not this server's), turning `#health-chip` green with `API online · <body.storage>` or muted with `API unreachable`. `load()` calls `showBoard('loading')`, fetches `/api/tasks`, then `render()`.

**Board states.** `showBoard(state)` is the single state machine — it toggles `hidden` on the four containers so exactly one of skeleton/list/empty/error is visible. `render()` filters `tasks` by the active `all|open|done` filter, writes the `N tasks · M open` count from the **unfiltered** list, and picks one of three empty messages depending on whether the board is truly empty or just the filter. Filter buttons re-`render()` from the in-memory array without refetching.

**Cards.** `taskCard` builds every node with `createElement`/`textContent`, so task titles are never parsed as HTML. Each card gets a priority badge, a title, a read-only Open/Done chip and a Share toggle. `wireShare` validates the address against `EMAIL_RE` before any request, disables the button while posting to `/api/tasks/:id/share`, and reports the server's `error` plus `providerMessage` on failure or `Shared with <email>.` on success.

**Creating a task.** `#new-task` submit POSTs `{ title, priority }` to `/api/tasks`, then calls `load()` again — the list is always re-fetched rather than patched locally.

**Composer labels.** Both composer labels share `.field label` (uppercase, 12px, `--muted`); the Priority one is then overridden to `--danger` red by `.field label[for="priority"]`, which is keyed on the `for` attribute that binds it to `#priority`. The generic rule still governs the "New task" label.

**Welcome modal.** `initWelcomeModal` runs as an IIFE: it shows `#welcome-overlay` unless `localStorage['orbit-welcome-seen'] === '1'`, and dismisses on the button, a backdrop click or Escape. Every `localStorage` access is wrapped in try/catch — if storage is unavailable the modal simply shows every visit.

## Notes
- **The Priority label's red is attribute-scoped.** `.field label[for="priority"]` only matches because `index.html` keeps `for="priority"` on that label and `id="priority"` on the select. Renaming either — or dropping the `for` (which would also break the label/control association for screen readers) — silently reverts the label to `--muted`.
- **Port disagreement is real and deliberate-looking but fragile.** `server.js` defaults to `8080`, the root `Dockerfile` sets `ENV PORT=3000`, and `build.yaml` declares `PORT` default `"3000"` with `run.port: 3000`. The platform path works only because build.yaml supplies `PORT`; the inline `dockerfileContent` (unlike the root Dockerfile) sets no `ENV PORT`. Change one of the three and the pod binds a port nothing probes.
- **The root `Dockerfile` is not what gets built.** `build.yaml` carries its own inline `dockerfileContent` that does `COPY . .` instead of the explicit `COPY server.js` / `COPY public`. The two have drifted before (see the `fix(build)` run in the history); edits to the root Dockerfile alone change nothing in preview.
- **Healthcheck points at `/`, not `/health`.** Both `build.yaml` and the preview pod probe `GET /`, which is `index.html` from the static middleware. `/health` exists and is intentionally dependency-free — adding an upstream call to it would make the platform restart this node whenever `orbit-api` degrades.
- **`.cards[hidden] { display: none }` must stay.** `.cards` is `display: grid`, and an author `display` beats the UA's `[hidden]` rule, so without the guard the skeleton cards stay on screen after load. The same guard exists for `.share-form`, `.share-msg` and `.modal-overlay` — any new `display:`-carrying element toggled via `hidden` needs one too.
- **`API_URL` failure is silent from the outside.** Without it the server falls back to `http://localhost:3001`, the static UI still loads and `/health` still says `ok`, while every `/api/*` call fails — the app looks broken but the platform sees it healthy.
- **The branch badge is hard-coded text.** `<span class="branch-badge">develop</span>` in `index.html` is literal markup, not derived at runtime; on any other branch it lies until edited. It exists together with the `Completed` filter label (whose `data-filter` is still `done`) to give preview-compare visible deltas against `main`.
- **`.chip-dot` styles are dead.** The dot element was removed from the header markup on this branch; the CSS rules remain and will do nothing until the span comes back.
- **The UI cannot complete a task.** `done` is display-only (`done-chip`); there is no toggle control and no `PATCH`/`PUT` call anywhere in `app.js` — the Open/Completed filter only reads state the backend already set.
