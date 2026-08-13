Declare API_URL wired from the orbit-api node in build.yaml

server.js proxies /api/* to API_URL, but the env var was never
declared in build.yaml, so a preview fell back to
http://localhost:3001 and every API call from the browser failed.
Add API_URL with `from: orbit-api` so the preview injects the api
node's address. No application code changes.
