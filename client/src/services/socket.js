import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
  if (!socket) socket = io({ transports: ["websocket"] });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

export const joinRoom = (role, userId) => {
  if (socket) socket.emit("joinRoom", { role, userId });
};