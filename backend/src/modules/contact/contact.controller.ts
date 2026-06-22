import type { Request, Response, NextFunction } from 'express';
import * as contactService from './contact.service.js';
import { successResponse } from '../../utils/response.js';

export async function submitContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await contactService.submitContact(req.body);
    res.status(201).json(successResponse(data));
  } catch (err) {
    next(err);
  }
}
