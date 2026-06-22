import { Router } from 'express';
import { getSettingsHandler, updateSettingsHandler } from './settings.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { updateSettingsSchema } from './settings.schema.js';

export const settingsRouter = Router();

settingsRouter.use(requireAuth);

settingsRouter.get('/', getSettingsHandler);
settingsRouter.patch('/', validate(updateSettingsSchema), updateSettingsHandler);
