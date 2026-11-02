import { Router } from 'express';
import { getDBStatus } from '../config/db.js';
import { config } from '../config/env.js';

const router = Router();

router.get('/', (req, res) => {
  const dbStatus = getDBStatus();
  const uptime = process.uptime();

  res.status(200).json({
    status: 'OK',
    service: 'Agri-Tech Smart Farming Management System API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(uptime),
    environment: config.env,
    database: {
      status: dbStatus.status,
      connected: dbStatus.connected,
      host: dbStatus.host,
      databaseName: dbStatus.databaseName,
      isInMemory: dbStatus.isInMemory,
    },
  });
});

export default router;
