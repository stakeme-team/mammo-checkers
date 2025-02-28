import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    host: '0.0.0.0',
    port: 4173, 
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      protocol: 'wss', // WebSocket Secure для HMR через Cloudflare
      host: 'mammo-checkers.mammoblocks.io',
    },
  },
});
