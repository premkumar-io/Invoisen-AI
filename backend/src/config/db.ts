import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let isConnecting = false;

export async function connectDb(maxRetries = 10, retryDelayMs = 5000): Promise<boolean> {
  if (isDbReady()) return true;
  if (isConnecting) return false;
  isConnecting = true;

  try {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await mongoose.connect(env.MONGODB_URI, {
          serverSelectionTimeoutMS: 5000,
        });
        logger.info('MongoDB connected successfully');
        isConnecting = false;
        return true;
      } catch (error) {
        logger.error(`MongoDB Atlas connection attempt ${attempt}/${maxRetries} failed:`, error);

        // Try local MongoDB instance as fallback if available
        try {
          logger.info('Attempting local MongoDB fallback (mongodb://127.0.0.1:27017/invoisen)...');
          await mongoose.connect('mongodb://127.0.0.1:27017/invoisen', {
            serverSelectionTimeoutMS: 3000,
          });
          logger.info('Connected to local MongoDB instance successfully');
          isConnecting = false;
          return true;
        } catch {
          logger.error('User IP blocked by MongoDB Atlas rules or local DB unavailable.');
          logger.error('Recommended fix: Add your Render outbound IP ranges (74.220.48.0/24, 74.220.56.0/24) or local IP in MongoDB Atlas Network Access.');

        }

        if (attempt < maxRetries) {
          logger.info(`Retrying MongoDB connection in ${retryDelayMs / 1000}s...`);
          await new Promise((res) => setTimeout(res, retryDelayMs));
        }
      }
    }
    logger.warn('MongoDB initial connection exhausted all retries. Server running in standby mode.');
    return false;
  } finally {
    isConnecting = false;
  }
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

export function isDbReady(): boolean {
  return mongoose.connection.readyState === 1;
}

