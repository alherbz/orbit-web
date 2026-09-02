---
schema_version: 2
id: 46c8491e-581c-4f3d-99f1-2a9fefde99b5
name: orbit-web
node: .
category: app
---

## Purpose
orbit-web is the frontend node of the **Orbit** demo project: a small task-list web application. A minimal Express server serves a static "Tasks" UI (light yellow theme) and reverse-proxies all `/api/*` requests to the companion `orbit-api` backend (a separate repository/node), so the browser only ever talks to this one origin.

## Files
| Path | Role |
|---|---|
| `server.js` | The whole server: ES-module Express app, mounts the `/api` reverse proxy and static serving of `public/`. |
| `public/index.html` | Page shell: new-task form (title input + low/medium/high priority select), `#tasks` list, `#status` line. |
| `public/app.js` | Vanilla-JS client: `load()` on page load, renders tasks, POSTs new ones to `/api/tasks`. |
| `public/styles.css` | Theme via CSS custom properties on `:root` (`--bg`, `--card`, `--line`, `--text`, `--muted`, `--accent`) plus priority-dot classes `.p-high`/`.p-medium`/`.p-low`. |
| `package.json` | `"type": "module"`, Node >= 20, `start` script, deps `express` + `http-proxy-middleware`. |
| `Dockerfile` | `node:20-alpine`, prod-only install, `PORT=8080`, `CMD ["node","server.js"]`. |
| `.infrar/build.yaml` | Infrar build/run spec: dockerfile strategy, port 8080, `PORT` and `API_URL` (from the `api` node, `part: origin`). |
| `README.md` | Docs. |

## Surface
**Exposes** — listens on `0.0.0.0:$PORT` (default 8080); `/api/*` reverse-proxied to `API_URL` with the `/api` prefix stripped; every other path served statically from `public/`.
**Consumes** — env `PORT` (default 8080) and `API_URL` (from the `api` node, default `http://localhost:3001`); npm packages `express`, `http-proxy-middleware`; the `orbit-api` backend with `GET /tasks` and `POST /tasks`.

## Behavior
On startup `server.js` reads `PORT` and `API_URL` and listens on all interfaces. `createProxyMiddleware` forwards `/api/tasks` to `<API_URL>/tasks` (`changeOrigin: true`, `pathRewrite: { '^/api': '' }`). In the browser, `app.js` GETs `/api/tasks`, renders each task as a list item (priority color dot, title, priority badge, strikethrough when `done`) and writes "N tasks · served by orbit-api" into the status line; on failure it shows "Could not reach the API: …". Submitting the form POSTs `{ title, priority }` as JSON, clears the input and reloads. No client-side routing, no state library, no UI for completing or deleting tasks.

The UI theme is **light with a yellow background**: `--bg: #ffd60a` (page), `--card: #fffbe6` (form controls and task rows), `--line: #d4ac0d` (borders), `--text: #1f1b06`, `--muted: #6b5f24`, `--accent: #6366f1` (submit button). Changing the palette means editing only that `:root` block — every rule reads the variables.

## Notes
- `render()` inserts task titles via `innerHTML` without escaping, so HTML in a title is interpreted as markup — an XSS vector if API data is untrusted (acceptable for a demo).
- Only `low`/`medium`/`high` have dot colors; any other priority falls back to the `--muted` gray dot. `.p-medium` (`#f59e0b`) is an amber close to the page background, but it sits on the pale `--card` row, not on `--bg`.
- The form-submit POST does not check the response status; a failed create only surfaces when `load()` re-fetches.
- No build/bundle step on purpose: `public/` is served as-is.
- No lockfile is committed (`package-lock.json` is gitignored); the Dockerfile copies `package.json` alone before `npm install --omit=dev`, so versions resolve at build time.
