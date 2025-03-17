// /src/server.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createServer } from 'http';
import { initSocket } from './lib/socket.js';
import { connectDB } from './lib/db.js';

console.log('MONGODB_URI:', process.env.MONGODB_URI); // Debug: Check if loaded

const startServer = async () => {
  try {
    await connectDB();
    
    const httpServer = createServer();
    initSocket(httpServer);
    
    const PORT = process.env.SOCKET_PORT || 3001;
    httpServer.listen(PORT, () => {
      console.log(`Socket server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();