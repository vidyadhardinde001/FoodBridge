import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

// In socket-client.ts
export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000
  });

  socket.on("connect_error", (err) => {
    console.log("Connection error:", err.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;