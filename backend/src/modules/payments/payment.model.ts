import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  userId: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'razorpay' | 'bank_transfer' | 'cash' | 'other';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionId: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    invoiceNumber: { type: String, default: '' },
    clientName: { type: String, default: '' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'razorpay', 'bank_transfer', 'cash', 'other'],
      default: 'stripe',
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed', 'refunded'],
      default: 'completed',
    },
    transactionId: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1, createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
