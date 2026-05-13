// vite.config.js
// Member 4 owns this file.
//
// KEY CONFIG:
//  - proxy: forwards /api/* and /socket.io/* to the Express backend
//    during development so the React dev server (port 5173) and
//    Express (port 5000) don't cause CORS issues.
//  - ws: true on the /socket.io proxy is critical — it upgrades
//    the HTTP connection to a WebSocket, which Socket.io requires.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      // REST API calls
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      // Socket.io WebSocket upgrade
      "/socket.io": {
        target: "http://localhost:5000",
        changeOrigin: true,
        ws: true, // ← enables WebSocket proxying
        secure: false,
      },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
