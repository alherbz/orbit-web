---
schema_version: 2
id: 46c8491e-581c-4f3d-99f1-2a9fefde99b5
name: orbit-web
node: .
category: app
---

## Purpose

`orbit-web` is Orbit's small team task board frontend. An Express server serves the browser assets and forwards same-origin `/api` requests to the separate `orbit-api` service.

## Files

| Path | Role |
| --- | --- |
| `server.js` | Express entrypoint, `/api` reverse proxy, `/health` liveness route, static hosting, listener. |
| `public/index.html` | Task board markup: health chip, new-task form, filters, cards, activity list, first-visit welcome dialog. |
| `public/app.js` | Browser state, API calls, task rendering, card actions, sharing, attachments, activity, health and welcome behavior. |
| `public/styles.css` | Board layout, state and action styling, responsive rules, hidden-element overrides. |
| `package.json` | Node runtime requirement, `npm start` command, Express and proxy dependencies. |
| `Dockerfile` | Node 20 Alpine image, production install, copied runtime files, container port and entrypoint. |
| `README.md` | Local startup and service configuration guidance. |

## Surface

**Exposes:** `npm start` runs `node server.js`; Express listens on `0.0.0.0:${PORT}` (default `8080`, container default `3000`). It serves `public/` at `/`, returns web-process liveness JSON at `GET /health`, and proxies `/api/*` to `orbit-api` with the `/api` prefix retained. There is no exported programmatic API.

**Consumes:** Runtime/deployment supplies `PORT` (listener), `API_URL` (base URL of the `orbit-api` node, default `http://localhost:8083`), and `APP_VERSION` (web `/health` response, default `dev`). The server uses `express` and `http-proxy-middleware`; browser code uses native DOM, Fetch, clipboard and localStorage APIs. The browser calls `orbit-api` through this server for tasks, activity, attachments, sharing, public links and dependency health; Postgres, Redis and S3 are reached through `orbit-api`, not directly by this node. Public-link signing and share delivery are API-side concerns; `ORBIT_SIGNING_SECRET` is not read by `orbit-web`.

## Behavior

- On load, `checkHealth`, `load` and `loadActivity` independently request `/api/health`, `/api/tasks` and `/api/activity`. The chip reports dependency states from the API health response; the board shows loading, list, empty or error states. The activity feed shows worker-written task events or a load error.
- `render` filters the in-memory task list by all, open or done, updates the total/open count, and builds cards with DOM nodes and `textContent`. Creating a task posts a trimmed title and selected priority to `/api/tasks`, then reloads tasks and schedules an activity refresh.
- A card can PATCH its done state, POST an email to `/api/tasks/:id/share`, POST to `/api/tasks/:id/link` and display/copy a same-origin `/api/public/tasks/:token` URL. The share form validates email locally and displays API errors, including `providerMessage` when present.
- Opening Files fetches `/api/tasks/:id/attachments`; uploading sends the selected file as a raw request body to `/api/tasks/:id/attachments?filename=...` with its MIME type, then refreshes the list. File links open `/api/attachments/:id` in a new tab. Task creation, completion and upload schedule an activity reload after 800 ms.
- The first-visit welcome dialog uses the `orbit-welcome-seen` localStorage key and can be dismissed by button, backdrop or Escape.

## Notes

- The `/api` proxy is registered before `/health` and static hosting; the browser uses same-origin relative API paths, and `API_URL` must be a service base URL without an `/api` suffix.
- `GET /health` only checks the web process. The header chip instead calls `/api/health` and expects a `deps` object; that check runs once at page load, despite the nearby comment calling it polling.
- Task data and activity come from `orbit-api`; the frontend has no persistent task store. Filters work on the last fetched task array. The UI assumes task fields such as `id`, `title`, `priority`, `done` and `attachments`, plus activity `created_at` and `message`.
- Keep `.cards[hidden]`, `.share-form[hidden]` and `.modal-overlay[hidden]` display overrides when changing CSS: their explicit display rules would otherwise defeat the HTML `hidden` attribute.
