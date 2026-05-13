// services/socket.js
// Singleton socket instance — import this wherever you need socket events
// Member 4 creates this; Member 3's services/socket.js should match.

import { io } from "socket.io-client";

// During dev, Vite proxies /socket.io → localhost:5000 (vite.config.js)
// In production, replace with your deployed backend URL via env var
export const socket = io(import.meta.env.VITE_BACKEND_URL || "", {
  withCredentials: true,
  autoConnect: true,
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("[socket] connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("[socket] connection error:", err.message);
});
