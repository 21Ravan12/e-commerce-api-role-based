require('dotenv').config();
const http = require('http'); 
const { app, initializeDatabase } = require('./app');
const redis = require('./lib/redis');
const logger = require('./services/logger');
const mongoose = require('mongoose');
const port = process.env.PORT; 

async function startServer() {
  try {
    await Promise.all([
      redis.connect().catch(err => {
        logger.error('Redis connection error:', err);
        throw err;
      }),
      initializeDatabase()
    ]);
    
    logger.info('Redis and MongoDB connected successfully');

    const server = http.createServer(app);

    server.listen(port, () => {
      logger.info(`HTTP server running on port ${port} (${process.env.NODE_ENV})`);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        redis.client?.quit();
        mongoose.connection.close();
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        redis.client?.quit();
        mongoose.connection.close();
        logger.info('Server closed');
        process.exit(0);
      });
    });

  } catch (err) {
    logger.error('Server failed to start:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
  startServer().catch(err => {
    logger.error('Fatal error during server startup:', err);
    process.exit(1);
  });
} else {
  logger.error('Invalid NODE_ENV value. Server not started.');
  process.exit(1);
}