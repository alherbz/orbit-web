---
schema_version: 1
id: 46c8491e-581c-4f3d-99f1-2a9fefde99b5
name: orbit-web
node: .
branch: develop
previous_commit: 78e502b78879eba6c1d43696669e30a879799471
---

## What changed

In `.infrar/build.yaml`, the `API_URL` env entry now reads `from: api`
instead of `from: orbit-api`. No application code changed.

## Why

The `from:` value must name the node as the project graph knows it. The
backend node is named `api` in the graph; `orbit-api` was the repo-level
name from root.md, which matched no link, so the preview never injected
`API_URL` and the `/api` proxy in `server.js` fell back to
`http://localhost:3001`. Wiring from `api` lets the preview inject the
backend's address.
