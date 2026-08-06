---
schema_version: 1
id: c0a8bf6f-3189-4425-9d77-1be1e34d99a1
name: orbit-web
node: .
category: app
---
## Purpose
orbit-web is the browser-facing app node of the Orbit task board. It is a small Node.js/Express server (`server.js`) that serves a static client from `public/` and proxies the client's `/api/*` calls to the separate API node. It is packaged for containerized deployment via an inline Dockerfile in `.infrar/build.yaml` (a root `Dockerfile` also exists).

## Structure
The repo root holds `server.js` (the only server code), `package.json`, `Dockerfile`, and `README.md`. `public/` contains the entire client: `index.html` (page shell, including the first-visit welcome modal whose title reads "CIAOO! BENVENTUOO!", the task form, and the task list), `app.js` (all client logic: task loading/rendering, form submission, welcome-modal show/dismiss), and `styles.css`. `.infrar/build.yaml` defines the build: `node:20-alpine`, `npm install --omit=dev`, `COPY . .`, run command `node server.js` on port 3000 with a healthcheck on `/`.

## Behavior
On startup `server.js` listens on `0.0.0.0` at `PORT` (env, default 8080 in code; the build spec sets `PORT=3000`). It mounts `http-proxy-middleware` on `/api`, forwarding to `API_URL` (env, wired by Infrar; the `^/api` prefix is stripped before forwarding) and serves `public/` statically for everything else. In the browser, `app.js` fetches `/api/tasks` on load, renders the task list with priority badges, and posts new tasks from the form. A welcome modal (`#welcome-overlay`) shows on first visit only — it is gated by the `orbit-welcome-seen` localStorage key and can be dismissed via the "Get started" button, a click on the backdrop, or the Escape key; dismissal persists the flag. If localStorage is unavailable the modal still shows.

## Dependencies
Runtime is Node.js >= 20 (ES modules). Third-party packages: `express` ^4.19.2 (static serving) and `http-proxy-middleware` ^3.0.3 (API proxying). The client is dependency-free vanilla JS/CSS. At runtime the node depends on the API node reachable at `API_URL` for all `/api/tasks` data; without it the UI shows "Could not reach the API" in the status line.

## Notes
The server binds all interfaces and reads `PORT` from the environment, matching the platform's networking contract. The client uses only same-origin relative paths (`/api/tasks`), so no CORS or hardcoded hosts are involved. The port mismatch between the code default (8080) and the build spec (3000) is harmless because the build spec always sets `PORT`. The welcome modal text lives directly in `public/index.html` (`#welcome-title`); its behavior lives in the IIFE at the bottom of `public/app.js`.
