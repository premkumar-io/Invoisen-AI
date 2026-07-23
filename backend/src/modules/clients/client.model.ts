import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IClient extends Document {
  userId: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  gstNumber: string;
  notes: string;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '' },
    gstNumber: { type: String, trim: true, uppercase: true, default: '' },
    notes: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index for searching clients
clientSchema.index({ name: 'text', email: 'text', company: 'text' });

// Compound index for user's clients
clientSchema.index({ userId: 1, isDeleted: 1 });

export const Client = mongoose.model<IClient>('Client', clientSchema);
