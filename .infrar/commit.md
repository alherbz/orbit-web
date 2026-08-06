---
schema_version: 1
id: c0a8bf6f-3189-4425-9d77-1be1e34d99a1
name: orbit-web
node: .
branch: develop
previous_commit: 2ecb37f4a8a3859f2daf7d948ed18c5796158352
---

## What changed
Made the welcome modal text bold in `public/styles.css`:

- `.modal h2` (the `#welcome-title` heading, "Buongiorno utente!") now sets `font-weight: 700` explicitly instead of relying on the browser default.
- `.modal p` (the modal body copy, "Welcome to Orbit — your team's task board...") now sets `font-weight: 700`, so the whole sentence is bold and not just the `<strong>Orbit</strong>` word.

No markup or behavior change: `public/index.html` and the welcome-modal logic in `public/app.js` are untouched, and the build/run contract (`node server.js` on port 3000) is unchanged.

## Why
The user asked for the frontend welcome modal text to be shown in bold. Applying it via CSS on the existing `.modal` selectors keeps the HTML semantic (no wrapper `<b>`/`<strong>` tags added for styling) and covers both the title and the paragraph in one place.
