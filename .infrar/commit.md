---
schema_version: 1
id: "c0a8bf6f-3189-4425-9d77-1be1e34d99a1"
name: "orbit-web"
node: "."
branch: "develop"
previous_commit: "972b5bac52baf503548e55f3492e24c68ba6f3f9"
---
## What changed

Fixed the build/run wiring so the `orbit-web` container starts. Changes are
limited to `.infrar/build.yaml` and `.dockerignore` — no application feature
was touched.

- **Removed the invalid `env.from: orbit-api` block** from `build.yaml`. The
  committed spec referenced a node (`orbit-api`) that does not exist in this
  project (the only node is `orbit-web`). A `from` pointing at a non-existent
  node makes the whole build spec invalid, so the platform silently ignored it
  and fell back to an auto-proposal that never placed `server.js` at `/app`.
  Also dropped the unused `HOST` env; kept only `PORT` default `"3000"`.
- **Single, valid dockerfile source:** inline `dockerfileContent` only (no
  `dockerfile` path alongside it).
- **Guaranteed entry file:** inline Dockerfile uses `WORKDIR /app` and
  `COPY . .`, so the git-tracked `server.js` and `public/` always land at
  `/app`; `run.command: node server.js` resolves `/app/server.js` at runtime.
- **No `CMD`/`ENTRYPOINT` in the inline content** — the entry lives only in
  `run.command`, the combination the platform requires.
- **Coherent runtime:** `run.port: 3000`, `healthcheck.path: /` on `port:
  3000`, `PORT` default `3000`; `server.js` binds `0.0.0.0` on `$PORT`.
- `.dockerignore` excludes `node_modules`, `.git`, `*.log`, `.infrar` so
  `COPY . .` keeps the image clean.

Verified (not assumed): `PORT=3000 node server.js` boots, binds `0.0.0.0:3000`,
and `GET /` returns HTTP 200 (served from `public/index.html`), matching the
healthcheck.

## Why

The preview repeatedly crashed at startup with
`Error: Cannot find module '/app/server.js'` (CrashLoopBackOff). The real cause
was not the Dockerfile copy logic but an **invalid build spec**: the committed
`build.yaml` contained `env.from: orbit-api`, referencing a node that does not
exist. That invalidated the spec, so the platform discarded it and used an
auto-proposal that did not produce `/app/server.js`. Removing the invalid
cross-node reference (and keeping the rest strictly within the build-spec
schema) lets the platform honor the spec, which copies the entrypoint to `/app`
and runs `node server.js` on `0.0.0.0:3000`.
