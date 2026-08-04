import { api, apiCall, getApiUrl } from "@/lib/api";
import type { BackendError } from "@/lib/api";
import type { InvoiceForm } from "@/components/invoice/InvoiceEditor";

export interface IInvoice extends Omit<InvoiceForm, "calculations"> {
  _id: string;
  calculations: InvoiceForm["calculations"] & {
    subtotal: number;
    total: number;
  };
  // other backend-specific fields can be added here
}

interface PaginatedInvoices {
  data: IInvoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchInvoices(params: {
  status?: string;
  search?: string;
  trash?: boolean;
}): Promise<{ success: boolean; data?: IInvoice[]; pagination?: any; error?: BackendError }> {
  const queryString = buildQueryString({
    status: params.status,
    search: params.search,
    trash: params.trash,
  });
  const res = await api.get<any>(`/invoices${queryString}`);
  if (res.success && res.data) {
    if (Array.isArray(res.data)) {
      return { success: true, data: res.data };
    }
    if (Array.isArray(res.data.data)) {
      return { success: true, data: res.data.data, pagination: res.data.pagination };
    }
  }
  return { success: res.success, data: [], error: res.success ? undefined : res.error };
}

export async function fetchInvoice(
  invoiceId: string,
): Promise<{ success: boolean; data?: IInvoice; error?: BackendError }> {
  const response = await api.get<IInvoice>(`/invoices/${invoiceId}`);
  if (response.success) return response;
  return { success: false, error: response.error };
}

export async function createInvoice(invoiceData: Partial<InvoiceForm>): Promise<IInvoice> {
  const response = await api.post<IInvoice>("/invoices", invoiceData);
  if (response.success) return response.data;
  throw new Error(response.error?.message || "Failed to create invoice");
}

export async function updateInvoice(
  invoiceId: string,
  invoiceData: Partial<InvoiceForm>,
): Promise<IInvoice> {
  const response = await api.patch<IInvoice>(`/invoices/${invoiceId}`, invoiceData);
  if (response.success) return response.data;
  throw new Error(response.error?.message || "Failed to update invoice");
}

export async function downloadInvoicePdf(invoiceId: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("invoisen_access_token") : null;
  const headers: Record<string, string> = {
    Accept: "application/pdf",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(getApiUrl(`/invoices/${invoiceId}/pdf`), {
    method: "GET",
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    const errData = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(errData?.error?.message || "Failed to download PDF");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `invoice-${invoiceId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function duplicateInvoice(invoiceId: string): Promise<IInvoice> {
  const response = await api.post<IInvoice>(`/invoices/${invoiceId}/duplicate`);
  if (response.success) return response.data;
  throw new Error(response.error?.message || "Failed to duplicate invoice");
}

export interface PaymentRecord {
  _id?: string;
  amount: number;
  date: string;
  method: string;
  reference?: string;
  notes?: string;
}

export async function addPayment(
  invoiceId: string,
  paymentData: Omit<PaymentRecord, "_id">,
): Promise<IInvoice> {
  const response = await api.post<IInvoice>(`/invoices/${invoiceId}/payments`, paymentData);
  if (response.success) return response.data;
  throw new Error(response.error?.message || "Failed to add payment");
}

export async function deletePayment(invoiceId: string, paymentId: string): Promise<IInvoice> {
  const response = await api.delete<IInvoice>(`/invoices/${invoiceId}/payments/${paymentId}`);
  if (response.success) return response.data;
  throw new Error(response.error?.message || "Failed to delete payment");
}

export async function deleteInvoice(invoiceId: string): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/invoices/${invoiceId}`);
  if (response.success) return response.data;
  throw new Error(response.error?.message || "Failed to delete invoice");
}

export async function sendInvoiceByEmail(
  invoiceId: string,
  recipientEmail?: string
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>(`/ai/send-invoice/${invoiceId}`, {
    email: recipientEmail,
  });
  if (response.success) return response.data;
  throw new Error(response.error?.message || "Failed to send invoice");
}

export async function restoreInvoice(
  invoiceId: string,
): Promise<{ success: boolean; error?: BackendError }> {
  return api.patch(`/invoices/${invoiceId}/restore`);
}

export async function permanentDeleteInvoice(
  invoiceId: string,
): Promise<{ success: boolean; error?: BackendError }> {
  return api.delete(`/invoices/${invoiceId}/permanent`);
}
