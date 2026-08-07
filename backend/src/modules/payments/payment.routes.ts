import { Router, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { requireAuth, AuthRequest } from '../../middleware/requireAuth.js';
import { Payment } from './payment.model.js';
import { Invoice } from '../invoices/invoice.model.js';
import { User } from '../users/user.model.js';
import { sendSuccess } from '../../utils/response.js';
import { Types } from 'mongoose';
import { env } from '../../config/env.js';

export const paymentRouter = Router();

function getRazorpayInstance(): Razorpay | null {
  if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
    return new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return null;
}

// ── Public: Payment Config ──────────────────────────────────────────────────
paymentRouter.get('/config', (_req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      isRazorpayEnabled: Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET),
      keyId: env.RAZORPAY_KEY_ID || '',
    },
  });
});

// ── Public: Razorpay Webhook Endpoint ────────────────────────────────────────
paymentRouter.post('/webhook', async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string | undefined;
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        console.error('[Razorpay Webhook] Invalid signature mismatch.');
        return res.status(400).json({ success: false, error: { message: 'Invalid webhook signature' } });
      }
    }

    const event = req.body?.event;
    const payload = req.body?.payload?.payment?.entity;

    if (event === 'payment.captured' && payload) {
      const paymentId = payload.id;
      const orderId = payload.order_id;
      const amountInRupees = payload.amount ? payload.amount / 100 : 0;
      const email = payload.email;
      const notes = payload.notes || {};

      let payment = await Payment.findOne({ transactionId: paymentId });
      if (!payment) {
        let userId: Types.ObjectId | undefined;
        if (email) {
          const user = await User.findOne({ email: email.toLowerCase() });
          if (user) userId = user._id;
        }

        payment = await Payment.create({
          userId: userId || new Types.ObjectId('000000000000000000000000'),
          invoiceId: notes.invoiceId ? new Types.ObjectId(notes.invoiceId) : undefined,
          invoiceNumber: notes.invoiceNumber || '',
          clientName: notes.clientName || payload.contact || email || '',
          amount: amountInRupees,
          currency: (payload.currency || 'INR').toUpperCase(),
          paymentMethod: 'razorpay',
          status: 'completed',
          transactionId: paymentId,
          notes: `Razorpay Order: ${orderId}`,
        });
      }

      if (notes.invoiceId) {
        const invoice = await Invoice.findById(notes.invoiceId);
        if (invoice) {
          invoice.status = 'published';
          await invoice.save();
        }
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

// ── Authenticated Payment Routes ──────────────────────────────────────────────
paymentRouter.use(requireAuth);

// Get User Payment History
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

// Create Manual Payment Entry
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

// ── Razorpay: Create Order ────────────────────────────────────────────────────
paymentRouter.post('/razorpay/create-order', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const instance = getRazorpayInstance();
    if (!instance) {
      return res.status(503).json({
        success: false,
        error: { code: 'RAZORPAY_DISABLED', message: 'Razorpay is not configured on the server.' },
      });
    }

    const { amount, currency = 'INR', invoiceId, invoiceNumber, plan, notes = {} } = req.body;
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_AMOUNT', message: 'A valid positive payment amount is required.' },
      });
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(numericAmount * 100);

    const orderOptions = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: `rcpt_${Date.now().toString().slice(-10)}`,
      notes: {
        userId: req.user!._id.toString(),
        invoiceId: invoiceId || '',
        invoiceNumber: invoiceNumber || '',
        plan: plan || '',
        ...notes,
      },
    };

    const order = await instance.orders.create(orderOptions);

    return sendSuccess(res, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID,
    }, 201);
  } catch (error) {
    next(error);
  }
});

// ── Razorpay: Verify Payment Signature ─────────────────────────────────────────
paymentRouter.post('/razorpay/verify', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      invoiceId,
      invoiceNumber,
      clientName,
      amount,
      currency,
      plan,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Order ID, Payment ID, and Signature are required.' },
      });
    }

    if (!env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Razorpay Key Secret is missing.' },
      });
    }

    const bodyData = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(bodyData.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_SIGNATURE', message: 'Razorpay payment signature verification failed.' },
      });
    }

    const userId = req.user!._id;

    // Create payment record in MongoDB
    const payment = await Payment.create({
      userId: new Types.ObjectId(userId),
      invoiceId: invoiceId ? new Types.ObjectId(invoiceId) : undefined,
      invoiceNumber: invoiceNumber || '',
      clientName: clientName || req.user?.fullName || '',
      amount: Number(amount) || 0,
      currency: currency || 'INR',
      paymentMethod: 'razorpay',
      status: 'completed',
      transactionId: razorpay_payment_id,
      notes: `Razorpay Order: ${razorpay_order_id}`,
    });

    // If payment was for an invoice, update invoice status
    if (invoiceId) {
      const invoice = await Invoice.findById(invoiceId);
      if (invoice) {
        invoice.status = 'published';
        await invoice.save();
      }
    }

    // If payment was for a plan upgrade, update user plan
    if (plan && ['pro', 'enterprise'].includes(plan)) {
      await User.findByIdAndUpdate(userId, { plan });
    }

    return sendSuccess(res, {
      verified: true,
      payment,
      message: 'Payment verified and recorded successfully.',
    }, 200);
  } catch (error) {
    next(error);
  }
});
