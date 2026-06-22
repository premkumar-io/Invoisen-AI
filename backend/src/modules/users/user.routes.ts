import { Router } from 'express';
import { getMe, updateMe, exportMe } from './user.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { updateProfileSchema } from './user.schema.js';

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get('/me', getMe);
userRouter.patch('/me', validate(updateProfileSchema), updateMe);
userRouter.get('/me/export', exportMe);
