import type { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service.js';
import { successResponse, paginatedResponse } from '../../utils/response.js';

type AdminUsersQuery = { page: number; limit: number; search?: string };
type AdminContactsQuery = { page: number; limit: number; status?: 'new' | 'read' | 'resolved' };
type IdParams = { id: string };

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = res.locals.validatedQuery as AdminUsersQuery;
    const result = await adminService.listUsers(query);
    res.json(paginatedResponse(result.data, result.pagination));
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const params = res.locals.validatedParams as IdParams;
    const data = await adminService.updateUser(req.user!._id, params.id, req.body);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await adminService.getAnalytics();
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function listContacts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = res.locals.validatedQuery as AdminContactsQuery;
    const result = await adminService.listContacts(query);
    res.json(paginatedResponse(result.data, result.pagination));
  } catch (err) {
    next(err);
  }
}

export async function updateContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const params = res.locals.validatedParams as IdParams;
    const data = await adminService.updateContactStatus(params.id, req.body.status);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}
