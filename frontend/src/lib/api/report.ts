import { api, apiCall } from "@/lib/api";

export interface ReportTotals {
  billed: number;
  collected: number;
  outstanding: number;
  overdue: number;
  invoiceCount: number;
  gst: number;
}

export interface TopClient {
  clientName: string;
  invoiceCount: number;
  totalBilled: number;
  totalPaid: number;
}

export interface ReportSummary {
  totals: ReportTotals;
  topClients: TopClient[];
}

export async function fetchReportSummary(): Promise<ReportSummary> {
  const response = await api.get<ReportSummary>("/reports/summary");
  if (response.success) {
    return response.data;
  }
  throw new Error(response.error?.message || "Failed to fetch report summary");
}

export async function exportReportCsv(): Promise<void> {
  const response = await apiCall<Blob>("GET", "/reports/export", undefined, {
    headers: { Accept: "text/csv" },
  });

  if (!response.success) {
    throw new Error(response.error?.message || "Failed to export report");
  }

  const blob = response.data as unknown as Blob;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "invoisen-report.csv";
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  URL.revokeObjectURL(url);
}
