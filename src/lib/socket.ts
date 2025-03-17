import { Server, Socket } from 'socket.io';
import { connectDB } from './db.js';
import jwt from 'jsonwebtoken';
import { Chat } from './db'; // Import your Chat model

type User = {
  id: string;
  role: 'charity' | 'provider';
};

let io: Server | null = null;

export const initSocket = (server: any): Server => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.use(async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as User;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as User;
    console.log(`User connected: ${user.id}`);

    socket.on('join-chat', (chatId: string) => {
      socket.join(chatId);
      console.log(`User ${user.id} joined chat ${chatId}`);
    });

    socket.on('send-message', async ({ chatId, text, sender, userId }) => {
      try {
        const newMessage = {
          sender,
          text,
          timestamp: new Date(),
          userId
        };

        const updatedChat = await Chat.findByIdAndUpdate(
          chatId,
          {
            $push: { messages: newMessage },
            $set: { updatedAt: new Date() }
          },
          { new: true }
        ).populate('charityId providerId');

        io?.to(chatId).emit("new-message", {
          ...newMessage,
          _id: updatedChat.messages.slice(-1)[0]._id,
          chatId,
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.id}`);
    });
  });

  return io;
};

// ✅ Function to get the initialized WebSocket server instance
export const getSocketServer = (): Server => {
  if (!io) {
    throw new Error("Socket server is not initialized");
  }
  return io;
};
