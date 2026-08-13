---
schema_version: 1
id: 46c8491e-581c-4f3d-99f1-2a9fefde99b5
name: orbit-web
node: .
branch: develop
previous_commit: 57c18edddb7b8ed0b6d7e0f490cf89ff2c57b22e
---

## What changed
- `public/styles.css`: added a `.cards[hidden] { display: none; }` rule right after the `.cards` declaration, plus a comment explaining why it is needed.
- `.infrar/knowledge.md`: Notes section now documents the `[hidden]` guard on `.cards`.

## Why
The board redesign gave `.cards` a `display: grid` rule. An author-set `display` overrides the browser's default `[hidden] { display: none }`, so when app.js set `hidden` on the `#skeleton` list after loading, the three placeholder skeleton cards remained visible — users saw three tasks "stuck loading" above the correctly rendered list. The explicit `[hidden]` guard (the same pattern already used for `.share-form` and `.modal-overlay`) restores the intended one-state-at-a-time board.
