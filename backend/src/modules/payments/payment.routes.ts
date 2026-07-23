import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/requireAuth.js';
import { Payment } from './payment.model.js';
import { sendSuccess } from '../../utils/response.js';
import { Types } from 'mongoose';

export const paymentRouter = Router();

paymentRouter.use(requireAuth);

paymentRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return sendSuccess(res, payments, 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
});

paymentRouter.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const { invoiceId, invoiceNumber, clientName, amount, currency, paymentMethod, status, transactionId, notes } = req.body;

    const payment = await Payment.create({
      userId: new Types.ObjectId(userId),
      invoiceId: invoiceId ? new Types.ObjectId(invoiceId) : undefined,
      invoiceNumber: invoiceNumber || '',
      clientName: clientName || '',
      amount: Number(amount) || 0,
      currency: currency || 'USD',
      paymentMethod: paymentMethod || 'stripe',
      status: status || 'completed',
      transactionId: transactionId || `TXN-${Date.now()}`,
      notes: notes || '',
    });

    return sendSuccess(res, payment, 201);
  } catch (error) {
    next(error);
  }
});
