import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local compatible OpenSSL libraries are discoverable in environments without system libssl1.1
const localLibDir = path.resolve(__dirname, '../../lib');
if (fs.existsSync(localLibDir)) {
  process.env.LD_LIBRARY_PATH = `${localLibDir}:${process.env.LD_LIBRARY_PATH || ''}`;
}

let memoryServer = null;

export const connectDB = async (customUri = null) => {
  const uriToUse = customUri || config.mongodbUri;

  if (uriToUse) {
    try {
      const conn = await mongoose.connect(uriToUse);
      console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.error(`[Database] Failed to connect to configured MongoDB URI: ${err.message}`);
      if (config.env === 'production') {
        throw err;
      }
      console.log('[Database] Falling back to MongoDB Memory Server for local development/testing...');
    }
  }

  // Fallback to mongodb-memory-server for isolated tests or local demo without external database
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create({
        binary: {
          version: process.env.MONGOMS_VERSION || '4.4.29',
        },
      });
    }
    const memUri = memoryServer.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`[Database] Connected to in-memory MongoDB fallback instance: ${memUri}`);
    return conn;
  } catch (memErr) {
    console.error(`[Database] Failed to start in-memory MongoDB: ${memErr.message}`);
    throw memErr;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
    console.log('[Database] MongoDB connection closed.');
  } catch (err) {
    console.error(`[Database] Error while closing connection: ${err.message}`);
  }
};

export const getDBStatus = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    status: states[state] || 'unknown',
    connected: state === 1,
    host: mongoose.connection.host || 'unknown',
    databaseName: mongoose.connection.name || 'unknown',
    isInMemory: Boolean(memoryServer),
  };
};
