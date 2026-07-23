import type { Request, Response, NextFunction } from 'express';
import { successResponse } from '../../utils/response.js';
import * as reportService from './report.service.js';
import type { ReportQuery } from './report.schema.js';

export async function getReportSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = res.locals.validatedQuery as ReportQuery;
    const data = await reportService.getReportSummary(req.user!._id, query);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function downloadReportCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = res.locals.validatedQuery as ReportQuery;
    const csv = await reportService.getReportCsv(req.user!._id, query);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="invoisen-report.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
}
