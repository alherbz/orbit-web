Fix API_URL preview wiring: from the api node by graph name

Change the web node's build.yaml API_URL env entry to `from: api` —
the api node's name as the project graph knows it — instead of the
root.md repo-level name, so the preview matches the link and injects
the api node's address into the /api proxy.
