import { api } from "../api";

export type ClientRecord = {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchClients(params?: {
  search?: string;
  page?: number;
  limit?: number;
  trash?: boolean;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.trash) query.set("trash", "true");

  return api.get<{
    data: ClientRecord[];
    pagination?: { total: number; page: number; limit: number; totalPages: number };
  }>(`/clients${query.toString() ? `?${query.toString()}` : ""}`);
}

export async function fetchClientOptions() {
  return api.get<ClientRecord[]>("/clients/options");
}

export async function createClient(payload: Partial<ClientRecord>) {
  return api.post<ClientRecord>("/clients", payload);
}

export async function updateClient(clientId: string, payload: Partial<ClientRecord>) {
  return api.patch<ClientRecord>(`/clients/${clientId}`, payload);
}

export async function deleteClient(clientId: string) {
  return api.delete(`/clients/${clientId}`);
}

export async function restoreClient(clientId: string) {
  return api.patch(`/clients/${clientId}/restore`);
}

export async function permanentDeleteClient(clientId: string) {
  return api.delete(`/clients/${clientId}/permanent`);
}
