---
schema_version: 1
id: 46c8491e-581c-4f3d-99f1-2a9fefde99b5
name: orbit-web
node: .
branch: develop
previous_commit: 7c7650522f0bec4f10cd3bb8da3e0517c56c96ad
---

## What changed
In `.infrar/build.yaml`, an `API_URL` env entry was added with `from: orbit-api`. The knowledge file's Dependencies section was updated to describe the wiring. No application code was touched.

## Why
`server.js` proxies `/api/*` to the address in `API_URL`, but the variable was never declared in the build spec, so previews never injected it and the proxy fell back to `http://localhost:3001` — every API call from the browser failed. Wiring `API_URL` from the `orbit-api` node makes the preview inject the api node's real address, completing the preview wiring.
