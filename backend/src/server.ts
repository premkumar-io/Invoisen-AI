import { app } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { startCronJobs } from './services/cron.service.js';

async function main(): Promise<void> {
  await connectDb();
  startCronJobs();

  app.listen(env.PORT, () => {
    logger.info(`Invoizmo API listening on port ${env.PORT}`);
  });
}

main().catch((err) => {
  logger.error('Failed to start server', { err });
  process.exit(1);
});
