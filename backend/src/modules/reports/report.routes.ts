import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { getReportSummary, downloadReportCsv } from './report.controller.js';
import { reportQuerySchema } from './report.schema.js';

export const reportRouter = Router();

reportRouter.use(requireAuth);

reportRouter.get('/summary', validate(reportQuerySchema, 'query'), getReportSummary);
reportRouter.get('/export.csv', validate(reportQuerySchema, 'query'), downloadReportCsv);
