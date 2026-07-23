import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/requireAuth.js';
import { sendSuccess } from '../../utils/response.js';

export const uploadRouter = Router();

uploadRouter.use(requireAuth);

uploadRouter.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fileData, fileName, fileType } = req.body;
    if (!fileData) {
      const error = new Error('File data is required') as any;
      error.statusCode = 400;
      throw error;
    }

    // In local development or production, return standard data URL or asset path
    const url = fileData.startsWith('data:')
      ? fileData
      : `data:${fileType || 'image/png'};base64,${fileData}`;

    return sendSuccess(res, { url, fileName: fileName || 'uploaded_file' }, 201);
  } catch (error) {
    next(error);
  }
});
