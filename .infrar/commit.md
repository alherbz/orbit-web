---
schema_version: 1
id: 46c8491e-581c-4f3d-99f1-2a9fefde99b5
name: orbit-web
node: .
branch: develop
previous_commit: ef9e0fc0a7eeccd0daf5f4f9ecae550fd7fa7ada
---

## What changed

- `public/styles.css`: added `.field label[for="priority"] { color: var(--danger); }` right after the generic `.field label` rule, so the composer's **Priority** label renders in the theme red (`--danger`, `#ef4444`) instead of `--muted`.

No markup or client logic changed: `public/index.html` still carries `<label for="priority">Priority</label>`, and the new rule hooks onto that existing `for` attribute.

## Why

The picked element in the preview was `form#new-task > div.field:nth-of-type(2) > label` — the "Priority" label — and the request was to turn its text red. That label shares the `.field label` rule with the "New task" label, so recolouring the shared rule would have reddened both. An attribute-scoped override touches only the picked label and reuses the palette variable already defined in `:root`, keeping the change inside the existing theme.
