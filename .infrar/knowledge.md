---
schema_version: 2
id: 46c8491e-581c-4f3d-99f1-2a9fefde99b5
name: orbit-web
node: .
category: app
---

## Purpose
Small Express front-end server for the Orbit Tasks UI: it serves the static client assets and proxies API traffic to the companion `orbit-api` service. It now also answers a platform liveness probe on its own, without depending on the API node.

## Files
| Path | Role |
|---|---|
| README.md | Describes the node's role, its pairing with the `orbit-api` repository (tasks management plus email sending via Resend) and the environment variables it reads |
| server.js | Express entrypoint: proxy middleware for `/api/*`, the `/health` liveness route, static file serving and the HTTP listener bound to 0.0.0.0 |

## Surface
**Exposes** — HTTP server on `PORT` (default `8080`). `GET /health` answers `{ status, service, version }` for liveness probes; `/api/*` is proxied to orbit-api; everything else is served from `public`.

**Consumes** — Environment variables: `API_URL` (upstream base URL of the `orbit-api` node, wired from the `api` node in preview environments) and `PORT` (default `8080`). Packages: `express` for routing/static serving plus an HTTP proxy middleware for the `/api/*` forwarding. Services: the `orbit-api` backend, which itself manages tasks and sends email through Resend — this node holds no database or mail credentials of its own.

## Behavior
On startup the server reads `API_URL` and `PORT`, then registers middleware in order: the `/api/*` proxy toward the API backend, the `/health` handler, and finally `express.static` over `public`. Because `/health` is registered before the static middleware, it is handled by the JSON responder rather than by any file of the same name, and it deliberately performs no upstream call so the probe stays green even when `orbit-api` is unreachable. Requests under `/api` are rewritten and forwarded to the upstream; all remaining paths fall through to static assets. The listener binds `0.0.0.0` so the container is reachable from outside its network namespace.

## Notes
Middleware ordering is the invariant to preserve: the proxy and `/health` must stay registered before `express.static`, otherwise API calls or the probe could be shadowed by static files. `/health` is intentionally dependency-free — adding an upstream check to it would make the platform restart this node whenever `orbit-api` degrades, so backend reachability belongs in a separate readiness endpoint. Without `API_URL` the static UI still loads but every `/api/*` call fails, which makes the app look broken while `/health` still reports `ok`.
