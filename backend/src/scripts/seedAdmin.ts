import { connectDb, disconnectDb } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../modules/users/user.model.js';
import { Settings } from '../modules/settings/settings.model.js';
import { hashPassword } from '../modules/auth/auth.constants.js';
import { logger } from '../utils/logger.js';

async function seedAdmin(): Promise<void> {
  if (!env.SEED_ADMIN_EMAIL || !env.SEED_ADMIN_PASSWORD) {
    logger.error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env');
    process.exit(1);
  }

  await connectDb();

  const existing = await User.findOne({ email: env.SEED_ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    logger.info('Admin user already exists', { email: env.SEED_ADMIN_EMAIL });
    await disconnectDb();
    return;
  }

  const password = await hashPassword(env.SEED_ADMIN_PASSWORD);
  const user = await User.create({
    fullName: env.SEED_ADMIN_NAME ?? 'Admin',
    email: env.SEED_ADMIN_EMAIL.toLowerCase(),
    password,
    role: 'admin',
    plan: 'enterprise',
  });

  await Settings.create({
    userId: user._id,
    theme: 'light',
    defaultCurrency: 'USD',
    invoicePrefix: 'INV',
    businessProfile: {
      name: env.SEED_ADMIN_NAME ?? 'Invoisen Admin',
      logoUrl: '',
      address: '',
      email: user.email,
      phone: '',
      gstNumber: '',
    },
  });

  logger.info('Admin user created', { email: user.email });
  await disconnectDb();
}

seedAdmin().catch((err) => {
  logger.error('Seed failed', { err });
  process.exit(1);
});
