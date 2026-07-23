import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/requireAuth.js';
import { Notification } from './notification.model.js';
import { sendSuccess } from '../../utils/response.js';
import { Types } from 'mongoose';

export const notificationRouter = Router();

notificationRouter.use(requireAuth);

notificationRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const notifications = await Notification.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return sendSuccess(res, notifications);
  } catch (error) {
    next(error);
  }
});

notificationRouter.patch('/read-all', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    await Notification.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true } }
    );
    return sendSuccess(res, { message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});
