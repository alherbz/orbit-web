---
schema_version: 1
id: c0a8bf6f-3189-4425-9d77-1be1e34d99a1
name: orbit-web
node: .
category: app
---
## Purpose
Orbit is a web application providing a team task board, served via a Node.js server: users see a product-style board with an API status chip, can filter tasks (All / Open / Done), add tasks, share a task with a teammate by email, and are greeted by a welcome modal on first visit.

## Structure
Frontend static assets live under public/ (index.html, app.js, styles.css), served by server.js (Express static server plus an /api reverse proxy, started with `node server.js`). index.html holds the semantic layout: a topbar (brand + `#health-chip` status chip), a composer card with a labelled new-task form, a filter toolbar with a task counter, and the board section containing four mutually exclusive states (loading skeleton `#skeleton`, task list `#tasks`, empty state `#empty`, error state `#error`). app.js contains all behavior — health check, load/render, filtering, task creation, the per-card share flow (wireShare) and the welcome modal; styles.css is a plain-CSS dark theme (indigo accent, priority badge tints, shimmer skeleton, focus-visible outlines, phone-width media query). No framework or npm package is used in the frontend.

## Behavior
On load, app.js fetches /api/health once and renders the header chip: green "API online · postgres|memory" (the storage word comes from the API's health payload) when reachable, muted "API unreachable" otherwise. It then fetches /api/tasks through the same-origin /api proxy (server.js rewrites /api/* to the API node from API_URL) showing the skeleton while loading; on failure the error state quotes the server's message, on an empty result a friendly empty line is shown, otherwise each task renders as a card with a coloured priority badge (high/medium/low), the title, and an Open/Done chip (done titles are struck through). Cards are built with createElement/textContent so titles are never parsed as HTML. The filter row switches All/Open/Done client-side (aria-pressed reflects the active filter) and the counter shows total and open counts. The new-task form POSTs to /api/tasks with the submit button disabled in flight and shows the server's error inline under the composer on failure. Each card's "Share" button toggles an inline email form (visually-hidden label, per-task input id): the address is validated client-side first (inline error + aria-invalid on a malformed one), the Send button shows "Sending…" and is disabled while the request is in flight, and the outcome line quotes the server's message — green "Shared with <email>." on success, or the API's error (including the mail provider's message when returned) in red. The welcome modal shows on first visit and is dismissed via button, overlay click or Escape, persisting the seen flag in localStorage.

## Dependencies
express and http-proxy-middleware (existing; server.js). The frontend is plain HTML/CSS/JS with the browser's fetch — no framework, no npm package. The task, share and health endpoints are provided by the orbit-api node and reached only through the same-origin /api proxy; no API host is hardcoded. The proxy target comes from the API_URL env var, declared in .infrar/build.yaml with `from: orbit-api` so the preview injects the api node's address (server.js falls back to http://localhost:3001 only for local development). The status chip's storage word depends on orbit-api's GET /health returning { status, storage }.

## Notes
The board renders exactly one of four states at a time via showBoard(); the skeleton is markup-only (aria-hidden) so no timer is needed. The health chip is polled once at load, not continuously. Server-side share errors (mail not configured → 503, invalid address → 400, provider rejection → 502) are displayed inline exactly as reported by the API, so mail misconfiguration is visible in the UI as well as the preview logs. The proxy logic in server.js, the build spec and the port were deliberately left unchanged by the board redesign.
