import { Router } from 'express';
import { submitContact } from './contact.controller.js';
import { validate } from '../../middleware/validate.js';
import { contactSchema } from './contact.schema.js';

export const contactRouter = Router();

contactRouter.post('/', validate(contactSchema), submitContact);
