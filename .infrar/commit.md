---
schema_version: 1
id: "c0a8bf6f-3189-4425-9d77-1be1e34d99a1"
name: "orbit-web"
node: "."
branch: "develop"
previous_commit: "aa900b806561635324c880cf6e7fff9bfa2f0852"
---
## What changed

- Rewrote the repo root `Dockerfile` (the canonical build artifact) so the build explicitly copies the runnable entrypoint `server.js` and the `public/` static assets into `/app`, guaranteeing `/app/server.js` exists at runtime. Set `ENV PORT=3000` / `EXPOSE 3000` and `CMD ["node", "server.js"]`, matching `package.json`'s own `start` script.
- Updated `.infrar/build.yaml` to reference the root `Dockerfile` by path (`dockerfile` / `dockerfilePath`) and kept a coherent inline `dockerfileContent` fallback that performs the same explicit copies. `run.command` stays `node server.js`; `run.port` and the `/` healthcheck stay on `3000`.

## Why

The component was stuck in CrashLoopBackOff with `Error: Cannot find module '/app/server.js'`: the run command expected `server.js` at the image root (`/app`), but the produced image did not place it there, so the container exited immediately. Making the root Dockerfile the authoritative build and explicitly copying `server.js` + `public/` into `/app` ensures the build emits exactly what the run command needs. Verified via a live smoke test that `server.js` binds `0.0.0.0` on `$PORT` (default `3000`) and that `/` returns HTTP 200, satisfying the healthcheck. No application feature (including the welcome modal) was changed.
