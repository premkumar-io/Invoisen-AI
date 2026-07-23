import type { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, pagination?: any) {
  if (pagination) {
    return res.status(statusCode).json({ success: true, data, pagination });
  }
  return res.status(statusCode).json({ success: true, data });
}

export function successResponse<T>(data: T) {
  return { success: true as const, data };
}

export function paginatedResponse<T>(
  data: T[],
  pagination: { total: number; page: number; limit: number; totalPages: number }
) {
  return { success: true as const, data, pagination };
}

export function errorResponse(
  code: string,
  message: string,
  fields?: Record<string, string[]>
) {
  return {
    success: false as const,
    error: { code, message, ...(fields ? { fields } : {}) },
  };
}
