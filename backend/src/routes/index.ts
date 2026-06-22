import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { userRouter } from '../modules/users/user.routes.js';
import { settingsRouter } from '../modules/settings/settings.routes.js';
import { invoiceRouter } from '../modules/invoices/invoice.routes.js';
import { contactRouter } from '../modules/contact/contact.routes.js';
import { dashboardRouter } from '../modules/dashboard/dashboard.routes.js';
import { adminRouter } from '../modules/admin/admin.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/invoices', invoiceRouter);
apiRouter.use('/contact', contactRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/admin', adminRouter);
