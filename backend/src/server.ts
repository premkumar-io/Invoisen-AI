import { app } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { startCronJobs } from './services/cron.service.js';

async function main(): Promise<void> {
  const server = app.listen(env.PORT, () => {
    logger.info(`Invoisen API listening on port ${env.PORT}`);
  });

  // Initiate database connection in background without blocking server startup
  connectDb(10, 5000)
    .then((connected) => {
      if (connected) {
        startCronJobs();
      }
    })
    .catch((err) => {
      logger.error('Database initialization error:', { err });
    });
}

main().catch((err) => {
  logger.error('Fatal error during server startup', { err });
});

