import type { Request, Response, NextFunction } from 'express';
import { clientService } from './client.service.js';
import { successResponse, paginatedResponse } from '../../utils/response.js';
import type { GetClientsQuery } from './client.schema.js';

type ClientIdParams = { id: string };

export async function createClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await clientService.createClient(req.user!._id, req.body);
    res.status(201).json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function listClients(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = res.locals.validatedQuery as GetClientsQuery;
    const result = await clientService.getClients(req.user!._id, query);
    res.json(paginatedResponse(result.clients, result.pagination));
  } catch (err) {
    next(err);
  }
}

export async function listClientOptions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await clientService.getAllClientsForDropdown(req.user!._id);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function getClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const params = res.locals.validatedParams as ClientIdParams;
    const data = await clientService.getClientById(req.user!._id, params.id);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function updateClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const params = res.locals.validatedParams as ClientIdParams;
    const data = await clientService.updateClient(req.user!._id, params.id, req.body);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function deleteClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const params = res.locals.validatedParams as ClientIdParams;
    const data = await clientService.deleteClient(req.user!._id, params.id);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function restoreClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const params = res.locals.validatedParams as ClientIdParams;
    const data = await clientService.restoreClient(req.user!._id, params.id);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function permanentDeleteClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const params = res.locals.validatedParams as ClientIdParams;
    const data = await clientService.permanentDeleteClient(req.user!._id, params.id);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}
