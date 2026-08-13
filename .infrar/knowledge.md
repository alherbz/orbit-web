---
schema_version: 1
id: c0a8bf6f-3189-4425-9d77-1be1e34d99a1
name: orbit-web
node: .
category: app
---
## Purpose
Orbit is a web application providing a team task board, served via a Node.js server: users can list tasks, add tasks, share a task with a teammate by email, and are greeted by a welcome modal on first visit.

## Structure
Frontend static assets live under public/ (index.html, app.js, styles.css), served by server.js (Express static server plus an /api reverse proxy, started with `node server.js`). Task rendering, the per-row share flow (wireShare) and the welcome modal logic are in app.js; layout and the share form/message styling are in styles.css.

## Behavior
On load, app.js fetches /api/tasks through the same-origin /api proxy (server.js rewrites /api/* to the API node from API_URL) and renders each task as a card row with a priority dot, title and badge. Each row also has a "Share" button that toggles an inline email form; submitting POSTs { email } to /api/tasks/{id}/share and shows the outcome inline on the row — a green "Shared with <email>" note on success, or the server's error message (including the mail provider's message when the API returns one) in red on failure. The submit button is disabled while the request is in flight. The new-task form POSTs to /api/tasks and reloads the list. The welcome modal shows on first visit and is dismissed via button, overlay click or Escape, persisting the seen flag in localStorage.

## Dependencies
express and http-proxy-middleware (existing; server.js). No new dependencies for the share feature — it uses the browser's fetch and existing CSS variables (--muted, --text, --line, --accent). The share endpoint is provided by the orbit-api node and reached only through the same-origin /api proxy; no API host is hardcoded. The proxy target comes from the API_URL env var, declared in .infrar/build.yaml with `from: orbit-api` so the preview injects the api node's address (server.js falls back to http://localhost:3001 only for local development).

## Notes
The .task row uses flex-wrap so the inline share form and message occupy their own line inside the card without changing the row layout. Server-side share errors (mail not configured → 503, invalid address → 400, provider rejection → 502) are displayed inline exactly as reported by the API, so mail misconfiguration is visible in the UI as well as the preview logs.
