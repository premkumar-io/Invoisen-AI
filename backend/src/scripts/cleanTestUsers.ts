import { connectDb, disconnectDb } from '../config/db.js';
import { User } from '../modules/users/user.model.js';
import { Settings } from '../modules/settings/settings.model.js';
import { Invoice } from '../modules/invoices/invoice.model.js';
import { Client } from '../modules/clients/client.model.js';
import { Product } from '../modules/products/product.model.js';
import { logger } from '../utils/logger.js';

async function cleanTestUsers(): Promise<void> {
  await connectDb();

  const mainEmail = 'premkumar080504@gmail.com';
  const testUsers = await User.find({ email: { $ne: mainEmail } });
  const testUserIds = testUsers.map((u) => u._id);

  logger.info(`Found ${testUsers.length} test accounts to remove:`, {
    emails: testUsers.map((u) => u.email),
  });

  if (testUserIds.length > 0) {
    const [userRes, settingsRes, invoiceRes, clientRes, productRes] = await Promise.all([
      User.deleteMany({ _id: { $in: testUserIds } }),
      Settings.deleteMany({ userId: { $in: testUserIds } }),
      Invoice.deleteMany({ userId: { $in: testUserIds } }),
      Client.deleteMany({ userId: { $in: testUserIds } }),
      Product.deleteMany({ userId: { $in: testUserIds } }),
    ]);

    logger.info('Deleted test user data:', {
      usersDeleted: userRes.deletedCount,
      settingsDeleted: settingsRes.deletedCount,
      invoicesDeleted: invoiceRes.deletedCount,
      clientsDeleted: clientRes.deletedCount,
      productsDeleted: productRes.deletedCount,
    });
  } else {
    logger.info('No test accounts found to delete.');
  }

  const remainingUsers = await User.find({}, 'email fullName role');
  logger.info('Remaining users in database:', remainingUsers);

  await disconnectDb();
}

cleanTestUsers().catch((err) => {
  logger.error('Cleanup failed:', { err });
  process.exit(1);
});
