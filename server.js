import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);

// Base URL of the orbit-api service (no path): /api/* is forwarded there as is.
const API_URL = process.env.API_URL || 'http://localhost:8083';

const app = express();

// The browser only talks to this server; /api/* is forwarded to orbit-api with
// the /api prefix kept (the API serves its routes under /api).
app.use(
  createProxyMiddleware({
    target: API_URL,
    changeOrigin: true,
    pathFilter: '/api',
  }),
);

// Liveness probe: answers without touching the API.
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'orbit-web',
    version: process.env.APP_VERSION ?? 'dev',
    uptime: process.uptime(),
  });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`orbit-web listening on :${PORT} → API ${API_URL}`);
});
