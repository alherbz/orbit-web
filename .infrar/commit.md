---
schema_version: 1
id: 46c8491e-581c-4f3d-99f1-2a9fefde99b5
name: orbit-web
node: .
branch: develop
previous_commit: f2f26274b03fc8541bc7105c3826a4b493aacb47
---

## What changed
Redesigned the board UI in public/index.html, public/app.js and public/styles.css — plain HTML/CSS/JS, no new dependency:
- Header with the Orbit brand and a compact status chip fed by a single GET /api/health poll at load: green with the storage word ("API online · postgres|memory") when reachable, muted "API unreachable" when not.
- Clean single-column card list with generous spacing, a modern type scale and an indigo accent; each card shows the title, a coloured priority badge (high/medium/low) and an Open/Done state chip (done titles struck through).
- Filter row (All / Open / Done) with aria-pressed states plus a task counter; filtering is client-side.
- New-task composer with visible labels posting to the existing POST /api/tasks endpoint, submit disabled in flight, server errors shown inline.
- Explicit board states: a shimmer loading skeleton, a friendly empty state, and an error state quoting the server's message.
- Polished Share flow: inline form under the card with a visually-hidden label, client-side email validation (inline error + aria-invalid), a disabled "Sending…" state, and a success/error line quoting the server's message (including the mail provider's message when returned).
- Task cards are built with createElement/textContent so titles are never parsed as HTML; layout is responsive down to phone width; focus-visible outlines throughout. The welcome modal is kept and restyled to match.
server.js (proxy logic), the build spec and the port are untouched. knowledge.md was rewritten to describe the new UI.

## Why
The board needed to look like a real product for a live demo: a status chip showing API reachability and storage mode, explicit loading/empty/error states instead of a blank page, filters, and an accessible, responsive, polished share flow — all without introducing any framework or npm package.
