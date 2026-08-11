import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { logger } from './utils/logger.js';
import { prisma } from './db/client.js';

const PORT = parseInt(process.env.PORT || '8080', 10);
const app = createApp();

const server = app.listen(PORT, () => {
  logger.info(`🚀 Sheeneeka Nursery Backend API listening on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
});

// Graceful Shutdown Handler
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      await prisma.$disconnect();
      logger.info('Prisma client disconnected.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during Prisma disconnection:', err);
      process.exit(1);
    }
  });

  // Force close after 10 seconds if shutdown hangs
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
