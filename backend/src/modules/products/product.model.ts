import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  userId: Types.ObjectId;
  name: string;
  description: string;
  unitPrice: number;
  category: 'service' | 'product' | 'subscription' | 'other';
  sku: string;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    unitPrice: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ['service', 'product', 'subscription', 'other'],
      default: 'service',
    },
    sku: { type: String, default: '', trim: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', sku: 'text' });
productSchema.index({ userId: 1, isDeleted: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
