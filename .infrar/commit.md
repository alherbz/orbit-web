---
schema_version: 1
id: c0a8bf6f-3189-4425-9d77-1be1e34d99a1
name: orbit-web
node: .
branch: develop
previous_commit: 7425f757f8c0cb34ee329178383b309ea4583ae9
---
## What changed

Rewrote `.infrar/build.yaml` into a minimal, strictly schema-valid build spec so the platform actually honors it instead of silently ignoring it and substituting an auto-proposal (which was what caused the fix to keep getting "lost"):

- **Exactly one dockerfile source:** inline `dockerfileContent` only (no `dockerfile` path alongside it).
- **Entry file is produced where the run command looks for it:** the Dockerfile sets `WORKDIR /app` and explicitly `COPY server.js ./server.js` and `COPY public ./public`, so `run.command: node server.js` resolves `/app/server.js` at runtime.
- **No `CMD`/`ENTRYPOINT` in the inline content** — the entry lives only in `run.command`, avoiding the rejected combination.
- **Removed the invalid `env.from: orbit-api` reference** (there is no `orbit-api` node in this project — only `orbit-web`); a `from` pointing at a non-existent node made the whole spec invalid.
- Kept the rest coherent: `run.port: 3000`, `healthcheck.path: /` on `port: 3000`, and `PORT` defaults to `3000`. `server.js` binds `0.0.0.0` on `$PORT`.

No application feature was changed (the welcome modal and all client/server code are untouched).

## Why

The component was crash-looping with `Error: Cannot find module '/app/server.js'`. The root cause was that the previous `.infrar/build.yaml` was invalid for the platform's build-spec schema (it referenced a non-existent node via `env.from: orbit-api`, and earlier revisions mixed `run.command` with an inline `CMD` and both a dockerfile path and inline content). An invalid spec is silently discarded and replaced by an auto-proposal that did not place `server.js` at `/app`, so the run command failed. This revision is minimal and passes every schema rule, and its Dockerfile guarantees the entrypoint exists at `/app/server.js`.

Verified via a live smoke test: `node server.js` boots, logs `orbit-web listening on :3000`, and `GET /` returns HTTP 200 (served from `public/index.html`), satisfying the healthcheck.
