export type CurrencyCode = "USD" | "INR" | "EUR" | "GBP" | "AUD" | "CAD";
export type InvoiceStatus = "draft" | "published" | "archived";
export type PaymentStatus = "unpaid" | "partially_paid" | "paid" | "overdue";

export type Client = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  gstNumber?: string;
  notes?: string;
  isDeleted?: boolean;
  createdAt?: string;
};

export type Invoice = {
  _id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  businessInfo: {
    name?: string;
    logoUrl?: string;
    address?: string;
    email?: string;
    phone?: string;
    gstNumber?: string;
  };
  clientInfo: {
    name: string;
    email?: string;
    address?: string;
    clientId?: string;
  };
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  calculations: {
    subtotal: number;
    taxType: "GST" | "VAT" | "Sales Tax" | "Custom" | "None";
    taxRate: number;
    taxAmount: number;
    discount: number;
    total: number;
  };
  payment: {
    amountPaid: number;
    amountDue: number;
    paymentRecords: Array<{
      _id: string;
      amount: number;
      date: string;
      method?: string;
      reference?: string;
      notes?: string;
    }>;
  };
  reminders?: {
    lastReminderAt: string | null;
    reminderCount: number;
  };
  customization: {
    currency: CurrencyCode;
    templateId: string;
    signatureMode?: string;
    signatureName?: string;
    signatureTitle?: string;
  };
  notes?: string;
  invoiceDate: string;
  dueDate: string;
  createdAt: string;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type Settings = {
  workspaceName: string;
  theme: "light" | "dark" | "purple";
  defaultCurrency: CurrencyCode;
  invoicePrefix: string;
  businessProfile: {
    name: string;
    logoUrl: string;
    address: string;
    email: string;
    phone: string;
    gstNumber: string;
  };
};

export type ReportSummary = {
  totals: {
    invoiceCount: number;
    billed: number;
    collected: number;
    outstanding: number;
    overdue: number;
    gst: number;
  };
  topClients: Array<{
    clientName: string;
    invoiceCount: number;
    totalBilled: number;
    totalPaid: number;
  }>;
  invoices: Array<{
    _id: string;
    invoiceNumber: string;
    clientName: string;
    invoiceDate: string;
    dueDate: string;
    status: InvoiceStatus;
    paymentStatus: PaymentStatus;
    currency: CurrencyCode;
    total: number;
    taxAmount: number;
    amountPaid: number;
    amountDue: number;
  }>;
};

export function currency(value: number, code: CurrencyCode = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}
