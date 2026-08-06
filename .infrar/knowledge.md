---
schema_version: 1
id: c0a8bf6f-3189-4425-9d77-1be1e34d99a1
name: orbit-web
node: .
category: app
---

## Purpose
Orbit is a web application providing a team task board, served via a Node.js server, with a frontend welcome modal that greets users.

## Structure
Frontend static assets live under public/ (index.html, app.js, styles.css), served by server.js (node server.js on port 3000). The welcome modal markup is in index.html, its behavior/logic in app.js, and its visual styling in styles.css.

## Behavior
On load, the app displays a welcome modal (#welcome-title heading plus body copy). The modal's title and body text are now rendered in bold via explicit font-weight: 700 on the .modal h2 and .modal p selectors, ensuring consistent bold styling for the whole sentence rather than relying on the browser default or the isolated <strong>Orbit</strong> tag. No HTML structure or JS logic changed.

## Dependencies
No new dependencies introduced; relies on existing static file serving via server.js and existing CSS variables (--muted, --text, --accent).

## Notes
This is a purely cosmetic CSS change; the previous history of iterative welcome-title text edits (multiple past commits) has been superseded and the git history entries removed, but the current state reflects only the bold styling change on top of the 'Buongiorno utente!' text.
