---
schema_version: 1
id: 46c8491e-581c-4f3d-99f1-2a9fefde99b5
name: orbit-web
node: .
branch: develop
previous_commit: 59521017bfb49a57f37a4de8ae6b972214d4a8ef
---

## What changed
- `public/app.js`: each rendered task row now includes a "Share" button, a hidden inline email form, and a per-row message element. A new `wireShare()` helper toggles the form, validates that an address was typed, POSTs `{ email }` to `/api/tasks/{id}/share` (same-origin relative path through the existing `/api` proxy), and shows the result inline — "Shared with <email>" on success, or the server's `error` message (plus the mail provider's message when the API surfaces one) on failure. The submit button is disabled while the request is in flight.
- `public/styles.css`: the `.task` row now wraps (`flex-wrap: wrap`) so the share form and message can sit on their own line inside the card; added styles for the subtle `.share-toggle` button, the `.share-form` row, and the `.share-msg` success/error colors, all reusing the existing CSS variables.

## Why
Users need to share a task with a teammate by email directly from the board. The frontend keeps the current visual style, adds no dependencies, and talks to the new API endpoint through the existing same-origin `/api` proxy so no host is hardcoded and preview auth is preserved. Server-side errors (mail not configured, invalid address, provider rejection) are shown inline exactly as the API reports them.
