import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import {
  createClient,
  listClients,
  listClientOptions,
  getClient,
  updateClient,
  deleteClient,
  restoreClient,
  permanentDeleteClient,
} from './client.controller.js';
import {
  createClientSchema,
  updateClientSchema,
  getClientsSchema,
  clientIdSchema,
} from './client.schema.js';

export const clientRouter = Router();

clientRouter.use(requireAuth);

clientRouter.get('/', validate(getClientsSchema, 'query'), listClients);
clientRouter.post('/', validate(createClientSchema), createClient);
clientRouter.get('/options', listClientOptions);
clientRouter.get('/:id', validate(clientIdSchema, 'params'), getClient);
clientRouter.patch('/:id', validate(clientIdSchema, 'params'), validate(updateClientSchema), updateClient);
clientRouter.delete('/:id', validate(clientIdSchema, 'params'), deleteClient);
clientRouter.patch('/:id/restore', validate(clientIdSchema, 'params'), restoreClient);
clientRouter.delete('/:id/permanent', validate(clientIdSchema, 'params'), permanentDeleteClient);
