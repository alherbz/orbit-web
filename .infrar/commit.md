---
schema_version: 1
id: c0a8bf6f-3189-4425-9d77-1be1e34d99a1
name: orbit-web
node: .
branch: develop
previous_commit: fa65fdb3b3cd05397fa674deeff7a70f73d09162
---

## What changed

- Added a welcome modal to `public/index.html` that greets users with a friendly "Hi there!" message.
- Added modal styling (overlay, card, button) to `public/styles.css`, matching the existing dark theme.
- Added modal logic in `public/app.js`: the modal shows on first visit, remembers dismissal via `localStorage`, and can be closed via the button, clicking the overlay, or pressing Escape.

## Why

To warmly welcome our users when they open the Orbit frontend, improving the first-time experience.
