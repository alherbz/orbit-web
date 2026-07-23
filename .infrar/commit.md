---
schema_version: 1
id: c0a8bf6f-3189-4425-9d77-1be1e34d99a1
name: orbit-web
node: .
branch: develop
previous_commit: 727585577312014aa06865a2f3c5d1d842554a35
---

## What changed

- Fixed the preview build spec (`.infrar/build.yaml`) so the container actually produces the runnable entrypoint at `/app/server.js`.
- The inline Dockerfile now explicitly copies `server.js` and the `public/` static assets into the image (instead of relying solely on a generic `COPY . .`) and adds an explicit `CMD ["node", "server.js"]`.
- Kept the spec coherent: `run.command` remains `node server.js`, `run.port` and the healthcheck stay on `3000`, and the server binds `0.0.0.0` on `$PORT` (default `3000`), serving `public/index.html` at `/` (HTTP 200).

## Why

The component crashed instantly at startup with `Error: Cannot find module '/app/server.js'`: the run command expected `server.js` at the image root, but the build did not reliably emit it there, so the container exited immediately. Explicitly copying the server entrypoint and static assets makes the build produce exactly what the run command needs, allowing the preview and its `/` healthcheck to come up. No application feature was changed.
