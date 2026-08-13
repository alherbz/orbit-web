Redesign the board as a product-quality task UI, no new dependencies

Rework public/index.html, app.js and styles.css into a clean single-column
task board: a header with the Orbit brand and an API status chip fed by
one GET /api/health poll at load (green with the storage word when
reachable, muted when not), a labelled new-task composer, an
All/Open/Done filter row with a task counter, and task cards showing the
title, a coloured priority badge and an Open/Done state. The board
handles loading (shimmer skeleton), empty and error states explicitly,
quoting the server's message on failure. The Share action is polished:
inline form under the card with client-side email validation
(aria-invalid + inline error), a disabled "Sending…" state, and a
success/error line quoting the server's message. Cards are built with
textContent (titles never parsed as HTML), the layout is responsive down
to phone width with visible focus states. Plain HTML/CSS/JS only —
server.js, the build spec and the port are untouched.
