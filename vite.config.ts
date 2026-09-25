import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import { handleContactRequest } from './api/contact.js'
import { handleAdminApiRequest } from './src/server/adminHandler.js'

function contactApiPlugin(): Plugin {
  return {
    name: 'contact-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req as unknown as { originalUrl?: string }).originalUrl || req.url || '';
        if (url.startsWith('/api/contact')) {
          handleContactRequest(req, res);
        } else if (url.startsWith('/api/admin') || url.startsWith('/api/content') || url.startsWith('/api/analytics')) {
          handleAdminApiRequest(req, res);
        } else {
          next();
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req as unknown as { originalUrl?: string }).originalUrl || req.url || '';
        if (url.startsWith('/api/contact')) {
          handleContactRequest(req, res);
        } else if (url.startsWith('/api/admin') || url.startsWith('/api/content') || url.startsWith('/api/analytics')) {
          handleAdminApiRequest(req, res);
        } else {
          next();
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss(), contactApiPlugin()],
})
