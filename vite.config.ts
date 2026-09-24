import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import { handleContactRequest } from './api/contact.js'
import { handleAdminRequest } from './api/admin.js'

function contactApiPlugin(): Plugin {
  return {
    name: 'contact-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/contact', (req, res) => {
        handleContactRequest(req, res);
      });
      server.middlewares.use('/api/admin', (req, res) => {
        handleAdminRequest(req, res);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/contact', (req, res) => {
        handleContactRequest(req, res);
      });
      server.middlewares.use('/api/admin', (req, res) => {
        handleAdminRequest(req, res);
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss(), contactApiPlugin()],
})
