---
schema_version: 1
id: c0a8bf6f-3189-4425-9d77-1be1e34d99a1
name: orbit-web
node: .
category: app
---

## Purpose
orbit-web is a small self-contained web application node providing an HTTP server (server.js) that serves a static client (public/) and likely exposes API endpoints consumed by the browser front-end. Packaged for containerized deployment via Dockerfile.

## Structure
Root contains build/runtime configuration and the server entrypoint. server.js is the Node.js HTTP server. package.json declares dependencies and npm scripts (start/build). public/ holds the browser assets: index.html (markup shell), app.js (client logic), styles.css (styling). Dockerfile plus .dockerignore define the container image; .gitignore excludes local artifacts; README.md documents usage.

## Behavior
On startup, server.js boots a listener (typically reading a PORT env var) and serves files from public/ to browsers. The client app.js runs in the browser, manipulating the DOM defined by index.html and issuing requests back to the server. The Dockerfile builds an image that installs dependencies and runs the server as the container's main process.

## Dependencies
Runtime is Node.js; concrete third-party packages (e.g., a web framework or static file server) are declared in package.json. The Docker image depends on a Node base image. The client depends only on the assets bundled in public/. Verify exact package versions and the entrypoint command in package.json/Dockerfile.

## Notes
Inspect server.js for the port, routing, and any API surface. Confirm package.json scripts and whether a build step transforms public/ assets. Ensure .dockerignore excludes node_modules to keep image builds reproducible.
