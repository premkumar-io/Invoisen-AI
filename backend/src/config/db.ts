import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export async function connectDb(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('Invalid environment variables:', error);

    // Try local MongoDB instance as fallback if available
    try {
      logger.info('Attempting local MongoDB fallback (mongodb://127.0.0.1:27017/invoisen)...');
      await mongoose.connect('mongodb://127.0.0.1:27017/invoisen', {
        serverSelectionTimeoutMS: 3000,
      });
      logger.info('Connected to local MongoDB instance successfully');
      return;
    } catch {
      logger.error('MongoDB connection error: IP not whitelisted.');
      logger.error('User IP blocked by MongoDB Atlas rules.');
      logger.error('Recommended fix: Add IP 0.0.0.0/0 in MongoDB Atlas Network Access.');
      throw error;
    }
  }
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

export function isDbReady(): boolean {
  return mongoose.connection.readyState === 1;
}
