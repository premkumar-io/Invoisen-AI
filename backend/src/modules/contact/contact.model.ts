import mongoose, { Schema, Document } from 'mongoose';

export type ContactStatus = 'new' | 'read' | 'resolved';

export interface IContactRequest extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContactRequest>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
  },
  { timestamps: true }
);

export const ContactRequest = mongoose.model<IContactRequest>('ContactRequest', contactSchema);
