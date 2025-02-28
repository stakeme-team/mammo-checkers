import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';

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
      protocol: 'wss',
      host: 'mammo-checkers.mammoblocks.io',
    },
    https: {
			key: fs.readFileSync("localhost-key.pem"),
			cert: fs.readFileSync("localhost.pem"),
		},
  },
});
