import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createServer as createViteServer } from 'vite';
import { handleContactRequest } from './api/contact.js';
import { handleAdminApiRequest } from './src/server/adminHandler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();

// API routes (must come before static serving)
app.use('/api/contact', (req, res) => handleContactRequest(req, res));
app.use('/api/admin', (req, res) => handleAdminApiRequest(req, res));
app.use('/api/content', (req, res) => handleAdminApiRequest(req, res));
app.use('/api/analytics', (req, res) => handleAdminApiRequest(req, res));

if (isProd) {
  // Serve built static files
  app.use(express.static(join(__dirname, 'dist')));
  // SPA fallback — serve index.html for all unknown routes
  app.get('*', (_req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Dev: proxy to vite
  const vite = await createViteServer({ server: { middlewareMode: true } });
  app.use(vite.middlewares);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${isProd ? 'production' : 'dev'})`);
});
