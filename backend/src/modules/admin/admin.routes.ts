import { Router } from 'express';
import {
  listUsers,
  updateUser,
  getAnalytics,
  listContacts,
  updateContact,
} from './admin.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import {
  adminUsersQuerySchema,
  adminUpdateUserSchema,
  adminUserIdParamSchema,
  adminListQuerySchema,
  updateContactStatusSchema,
  contactIdParamSchema,
} from './admin.schema.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, roleGuard('admin'));

adminRouter.get('/users', validate(adminUsersQuerySchema, 'query'), listUsers);
adminRouter.patch(
  '/users/:id',
  validate(adminUserIdParamSchema, 'params'),
  validate(adminUpdateUserSchema),
  updateUser
);
adminRouter.get('/analytics', getAnalytics);
adminRouter.get('/contacts', validate(adminListQuerySchema, 'query'), listContacts);
adminRouter.patch(
  '/contacts/:id',
  validate(contactIdParamSchema, 'params'),
  validate(updateContactStatusSchema),
  updateContact
);
