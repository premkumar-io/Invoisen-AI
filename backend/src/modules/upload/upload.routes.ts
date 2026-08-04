import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/requireAuth.js';
import { sendSuccess } from '../../utils/response.js';
import { uploadToCloudinary } from '../../services/cloudinary.service.js';

export const uploadRouter = Router();

uploadRouter.use(requireAuth);

uploadRouter.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fileData, fileName, folder } = req.body;
    if (!fileData) {
      const error = new Error('File data is required') as any;
      error.statusCode = 400;
      throw error;
    }

    const uploadResult = await uploadToCloudinary({
      fileData,
      folder: folder || 'invoisen_uploads',
    });

    return sendSuccess(
      res,
      {
        url: uploadResult.url,
        fileName: fileName || 'uploaded_file',
        provider: uploadResult.provider,
      },
      201,
    );
  } catch (error) {
    next(error);
  }
});
