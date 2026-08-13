---
schema_version: 1
id: 46c8491e-581c-4f3d-99f1-2a9fefde99b5
name: orbit-web
node: .
branch: develop
previous_commit: c5caeee7b03b2f56a68924e49b74e5867879f137
---

## What changed
- Nothing in the code. This is a verification retry: the per-task Share action (inline email form posting to `/api/tasks/:id/share`) is already committed in `c5caeee`.

## Why
The previous build failed with a repository-access error: the cluster could not clone the repo because the cloud SSH key was not registered with the git provider. The user has now added the key in Settings → Git, so the build only needs to be re-run — no code or build-spec fix is required.
