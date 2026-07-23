import { api } from "../api";

export async function fetchSettings() {
  return api.get<{
    _id: string;
    workspaceName: string;
    theme: string;
    defaultCurrency: string;
    invoicePrefix: string;
    invoiceNumberFormat: string;
    invoiceNextNumber: number;
    businessProfile?: {
      name?: string;
      address?: string;
      email?: string;
      phone?: string;
      gstNumber?: string;
      logoUrl?: string;
    };
  }>("/settings");
}

export async function updateSettings(payload: Record<string, unknown>) {
  return api.patch("/settings", payload);
}
