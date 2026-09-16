---
schema_version: 1
id: 46c8491e-581c-4f3d-99f1-2a9fefde99b5
name: orbit-web
node: .
branch: main
previous_commit: 64e4cb30d3b7f4616e21c8988a65585310f3ccf2
---

## What changed

`.infrar/build.yaml`, `env:`: added `APP_VERSION` with `default: "dev"`. `server.js` reads
`process.env.APP_VERSION` for the `version` field of `/health` and falls back to `dev`
itself; the spec did not declare it, so it was never injected.

No `requires:` was added, and no `.infrar/environment/` directory was created. The node's
dependencies were resolved to: none. It runs `express` and `http-proxy-middleware` and
speaks to exactly one thing — the `api` node — which is a node of the namespace and is
already wired as `API_URL` `from: api`, not a requirement.

## Why

Resolving this repository's dependencies is a short answer, and the short answer is worth
recording: the only variable the code read without a declaration was `APP_VERSION`, and
there is no database, cache, bucket, queue or identity provider behind this node. An empty
`resources.tf` would state the same thing with three files nothing reads.

The `/api` proxy was checked rather than assumed: `createProxyMiddleware` strips `^/api`
before forwarding, which lands back on the api node's own `/api` base only because
`API_URL` is `part: url` — the base the target serves under, not its origin. The two sides
agree as written.
