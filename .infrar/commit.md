---
schema_version: 1
id: "c0a8bf6f-3189-4425-9d77-1be1e34d99a1"
name: "orbit-web"
node: "."
branch: "develop"
previous_commit: "e1c42fb34d4d529487278463fb7116ea4dddffa6"
---
## What changed

Re-applied the lost `.infrar/build.yaml` fix and made it robust so the
container actually finds its entry file at `/app/server.js`:

- **Single, valid dockerfile source:** inline `dockerfileContent` only
  (no `dockerfile` path alongside it), so the spec is schema-valid and
  is not silently replaced by an auto-proposal.
- **Guaranteed entry file:** the inline Dockerfile uses `WORKDIR /app`
  and `COPY . .` to copy the whole build context, so `server.js` and
  `public/` always land at `/app`. `run.command: node server.js` then
  resolves `/app/server.js` at runtime. `.dockerignore` excludes
  `node_modules`, `.git`, `*.log`, and `.infrar` so the image stays clean.
- **No `CMD`/`ENTRYPOINT` in the inline content** — the entry lives only
  in `run.command`, avoiding the combination the platform rejects.
- **Coherent runtime wiring:** `run.port: 3000`, `healthcheck.path: /`
  on `port: 3000`, `PORT` defaults to `3000`; `server.js` binds
  `0.0.0.0` on `$PORT`.
- Added `*.log` and `.infrar` to `.dockerignore` so `COPY . .` does not
  pull build/runtime artifacts into the image.

Verified locally (not assumed): started `PORT=3000 node server.js` and
confirmed the process binds `0.0.0.0:3000` and `GET /` returns
**HTTP 200** (1293 bytes from `public/index.html`), matching the
healthcheck.

## Why

The preview kept crashing at startup with
`Error: Cannot find module '/app/server.js'` (CrashLoopBackOff). The
prior build-spec fix had been overwritten, and the entry file was not
reliably present at `/app`. This change re-applies the fix using a
context copy so the entrypoint is always present, while keeping the
spec strictly within the build-spec schema so the platform honors it.
No application feature (including the welcome modal) was changed.
