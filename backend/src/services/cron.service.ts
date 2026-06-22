import cron from 'node-cron';
import { purgeExpiredTrash } from '../modules/invoices/invoice.service.js';
import { logger } from '../utils/logger.js';

export function startCronJobs(): void {
  cron.schedule('0 2 * * *', async () => {
    try {
      const count = await purgeExpiredTrash();
      logger.info('Trash purge completed', { deletedCount: count });
    } catch (err) {
      logger.error('Trash purge failed', { err });
    }
  });

  logger.info('Cron jobs started');
}
