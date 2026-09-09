---
schema_version: 2
id: 46c8491e-581c-4f3d-99f1-2a9fefde99b5
name: orbit-web
node: .
category: app
---

## Purpose
orbit-web is the Express web front node of the platform: it serves the static client assets and exposes a liveness probe used by the platform to check the process is alive. It is the browser-facing entry point that sits in front of the api node.

## Files
| Path | Role |
|---|---|
| server.js | Express entrypoint: middleware setup, /health liveness route, static file serving |

## Surface
**Exposes** — HTTP endpoint GET /health returning a JSON payload {status, service, version, uptime} — status is the literal "ok", service the literal "orbit-web", version the build/deploy version reported by the process and uptime the process uptime in seconds. Static assets served from the public directory under the application root. The listening port is configured in server.js outside the region touched by this change.

**Consumes** — Environment: APP_VERSION — optional string surfaced as the version field of the /health response, falling back to "dev" when unset or empty-undefined. Packages: express (HTTP server, static middleware), node built-in path (resolution of the public assets directory relative to __dirname). Services: the api node for application traffic — deliberately not contacted by /health.

## Behavior
The app registers its middleware chain, then GET /health, then express.static for the public directory. /health answers synchronously from process state only: it never calls the api node, so it stays green when downstream dependencies are degraded and only reflects whether this process itself is up. The version field is resolved per request from process.env.APP_VERSION using the nullish-coalescing default "dev". Any request not matched by an earlier handler falls through to the static middleware, which resolves it against public.

## Notes
The /health route must remain registered before express.static so a public/health asset can never shadow the probe. The probe is intentionally shallow — do not add downstream checks to it, or the platform will restart this node for failures that belong to the api node. Because the fallback uses ?? and not ||, an APP_VERSION set to the empty string is reported verbatim as an empty version rather than "dev"; deployments should either set a real version or leave the variable unset. Consumers parsing /health must tolerate the version field, which was absent from earlier responses.
