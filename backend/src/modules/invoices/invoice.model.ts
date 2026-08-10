import mongoose, { Schema, Document, Types } from 'mongoose';

export type InvoiceStatus = 'draft' | 'published' | 'archived';
export type TaxType = string;
export type TemplateId = string;

export interface IInvoiceItem {
  name: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface IInvoice extends Document {
  userId: Types.ObjectId;
  invoiceNumber: string;
  status: InvoiceStatus;
  isDeleted: boolean;
  deletedAt: Date | null;
  businessInfo: {
    name: string;
    logoUrl: string;
    address: string;
    email: string;
    phone: string;
    gstNumber: string;
  };
  clientInfo: {
    name: string;
    email: string;
    address: string;
  };
  items: IInvoiceItem[];
  calculations: {
    subtotal: number;
    taxType: TaxType;
    taxRate: number;
    taxAmount: number;
    discount: number;
    shipping?: number;
    total: number;
  };
  customization: {
    fontFamily: string;
    fontSize: number;
    themeColor: string;
    backgroundColor: string;
    signatureDataUrl: string;
    currency: string;
    templateId: TemplateId;
  };
  invoiceDate: Date;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceItemSchema = new Schema<IInvoiceItem>(
  {
    name: { type: String, default: 'Item' },
    description: { type: String, default: '' },
    quantity: { type: Number, default: 1, min: 0 },
    rate: { type: Number, default: 0, min: 0 },
    amount: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new Schema<IInvoice>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    invoiceNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    businessInfo: {
      name: { type: String, default: '' },
      logoUrl: { type: String, default: '' },
      address: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      gstNumber: { type: String, default: '' },
    },
    clientInfo: {
      name: { type: String, default: 'Draft Client' },
      email: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    items: { type: [invoiceItemSchema], default: [] },
    calculations: {
      subtotal: { type: Number, default: 0 },
      taxType: {
        type: String,
        default: 'None',
      },
      taxRate: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      discount: { type: Number, default: 0, min: 0 },
      shipping: { type: Number, default: 0, min: 0 },
      total: { type: Number, default: 0 },
    },
    customization: {
      fontFamily: { type: String, default: 'Inter' },
      fontSize: { type: Number, default: 14 },
      themeColor: { type: String, default: '#2563EB' },
      backgroundColor: { type: String, default: '#FFFFFF' },
      signatureDataUrl: { type: String, default: '' },
      currency: {
        type: String,
        default: 'USD',
      },
      templateId: {
        type: String,
        default: 'modern',
      },
    },
    invoiceDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

invoiceSchema.index({ userId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ clientInfo: 'text', invoiceNumber: 'text' });

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);

export interface IInvoiceCounter extends Document {
  userId: Types.ObjectId;
  seq: number;
}

const invoiceCounterSchema = new Schema<IInvoiceCounter>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export const InvoiceCounter = mongoose.model<IInvoiceCounter>('InvoiceCounter', invoiceCounterSchema);
