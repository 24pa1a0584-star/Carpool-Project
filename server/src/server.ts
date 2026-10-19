import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { connectDB, disconnectDB } from './config/db';
import { env } from './config/env';
import { initAdmin } from './bootstrap/initAdmin';
import { setupSocketHandlers } from './sockets/socketHandler';

const startServer = async (): Promise<void> => {
  try {
    // 1. Connect Database
    await connectDB();

    // 2. Safe Database Initialization & Super Admin Bootstrap
    await initAdmin();

    // 3. Create Express App & HTTP Server
    const app = createApp();
    const server = http.createServer(app);

    // 4. Attach Socket.IO Engine
    const io = new SocketIOServer(server, {
      cors: {
        origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
        credentials: true,
      },
    });

    setupSocketHandlers(io);

    // 5. Listen on Host & Port (0.0.0.0 for Cloud / Docker / Render compatibility)
    server.listen(env.PORT, '0.0.0.0', () => {
      console.log(`
🌺 ======================================================== 🌺
🚀 RouteBloom Server is Live & Blossoming!
📍 URL: http://localhost:${env.PORT}
🌱 Health: http://localhost:${env.PORT}/api/health
🌍 Environment: ${env.NODE_ENV}
⚡ Socket.IO: Connected & Ready
🌺 ======================================================== 🌺
      `);
    });

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Gracefully shutting down RouteBloom...`);
      server.close(async () => {
        await disconnectDB();
        console.log('🏁 RouteBloom shutdown complete. Goodbye!');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Failed to start RouteBloom server:', error);
    process.exit(1);
  }
};

startServer();
