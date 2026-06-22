import type { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import { ValidationAppError } from '../utils/errors.js';

type RequestPart = 'body' | 'query' | 'params';

export function validate(schema: ZodType, part: RequestPart = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const fields: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.') || '_root';
        fields[path] = fields[path] ?? [];
        fields[path].push(issue.message);
      }
      next(new ValidationAppError(fields));
      return;
    }

    res.locals[`validated${part[0]!.toUpperCase()}${part.slice(1)}`] = result.data;

    if (part === 'query') {
      next();
      return;
    }

    req[part] = result.data;
    next();
  };
}
