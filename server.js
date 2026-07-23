import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);

// API_URL is wired from the `api` node by Infrar at preview launch.
const API_URL = process.env.API_URL || 'http://localhost:3001';

const app = express();

// The browser only talks to this server; /api/* is proxied to the api node.
app.use(
  '/api',
  createProxyMiddleware({
    target: API_URL,
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
  }),
);

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`orbit-web listening on :${PORT} → API ${API_URL}`);
});
