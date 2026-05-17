import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io({ transports: ['websocket'], autoConnect: true });
  }
  return socket;
};

export const getSocket = () => socket;

export const joinRoom = (role, userId) => {
  socket?.emit('joinRoom', { role, userId });
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
