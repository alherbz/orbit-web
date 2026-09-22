---
schema_version: 1
id: 46c8491e-581c-4f3d-99f1-2a9fefde99b5
name: orbit-web
node: .
branch: develop
previous_commit: 4162702625b1ac3d6f72b691618516e8d20d7ac8
---

## What changed

- `public/index.html`: the topbar heading is now `<h1>Orbit Demo 2026</h1>` (was `Orbit`), and the document `<title>` is now `Orbit Demo 2026` (was `Orbit — Tasks`).

Nothing else changed: no CSS selector targets the heading text (`.brand h1` styles it by position) and `app.js` never reads it, so styling and client logic are untouched. The `.branch-badge` next to the heading still reads `develop`, and the welcome modal still says "Welcome to **Orbit**" — that is the product name, not the page title.

## Why

The request was to change the home title of orbit-web to "Orbit Demo 2026". The name is written literally in two places in `index.html` — the browser tab title and the visible page heading — so both were updated together to keep the tab and the header from drifting apart.
