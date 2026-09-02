---
schema_version: 1
id: 46c8491e-581c-4f3d-99f1-2a9fefde99b5
name: orbit-web
node: .
branch: main
previous_commit: 209c816765c9141cb343a5148ec221b4d355c19c
---

## What changed
- `.infrar/build.yaml`: `run.command` is now the string `node server.js` instead of the argv array `["node", "server.js"]`. Nothing else in the spec changed — same `dockerfile` strategy on the existing `Dockerfile`, `context: node`, port 8080, health check on `/`, and the `PORT` / `API_URL` env wiring.

## Why
The build failed validation with `run.command: Expected string (got ["node","server.js"])`: the build spec schema takes the start command as a single string, not an argv list. The command itself is unchanged and still matches the `CMD ["node", "server.js"]` in the Dockerfile, so the container starts exactly as before. No application code was touched.
