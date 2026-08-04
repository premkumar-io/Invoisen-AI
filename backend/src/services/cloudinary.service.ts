import { v2 as cloudinary } from 'cloudinary';
import { env, isCloudinaryConfigured } from '../config/env.js';
import { logger } from '../utils/logger.js';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  logger.info('[Cloudinary Storage] Cloudinary SDK initialized successfully.');
} else {
  logger.info('[Cloudinary Storage] Credentials not detected. Running in Base64 / Local fallback mode.');
}

/**
 * Uploads a file (Base64 data URI or binary buffer) to Cloudinary.
 * If Cloudinary is not configured, returns the local Base64 Data URI fallback.
 */
export async function uploadToCloudinary(options: {
  fileData: string;
  folder?: string;
  publicId?: string;
}): Promise<{ url: string; publicId?: string; provider: 'cloudinary' | 'local_fallback' }> {
  try {
    if (isCloudinaryConfigured) {
      const result = await cloudinary.uploader.upload(options.fileData, {
        folder: options.folder || 'invoisen_uploads',
        public_id: options.publicId,
        resource_type: 'auto',
      });

      logger.info(`[Cloudinary Storage] Uploaded asset to CDN: ${result.secure_url}`);
      return {
        url: result.secure_url,
        publicId: result.public_id,
        provider: 'cloudinary',
      };
    }

    // Fallback mode if Cloudinary API keys are not supplied in .env
    const fallbackUrl = options.fileData.startsWith('data:')
      ? options.fileData
      : `data:image/png;base64,${options.fileData}`;

    return {
      url: fallbackUrl,
      provider: 'local_fallback',
    };
  } catch (error: any) {
    logger.error(`[Cloudinary Storage] Upload failed: ${error.message}`);
    // Return fallback rather than breaking upload flow
    return {
      url: options.fileData.startsWith('data:') ? options.fileData : `data:image/png;base64,${options.fileData}`,
      provider: 'local_fallback',
    };
  }
}
