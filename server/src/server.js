import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { config } from './config/env.js';

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`  Agri-Tech Backend API running on port ${config.port}`);
      console.log(`  Environment: ${config.env}`);
      console.log(`  Health Check: http://localhost:${config.port}/api/health`);
      console.log(`  Unified Full-Stack App: http://localhost:${config.port}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error(`[Server] Critical startup error: ${err.message}`);
    process.exit(1);
  }
};

const handleShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP connections closed.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

startServer();
