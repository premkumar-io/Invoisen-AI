import { api, getApiUrl } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

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
  const summary = await fetchReportSummary();
  const invoices = (summary as any).invoices || [];

  const headers = [
    "Invoice #",
    "Client",
    "Invoice Date",
    "Due Date",
    "Status",
    "Payment Status",
    "Currency",
    "Total",
    "GST/Tax",
    "Paid",
    "Due",
  ];

  const rows = invoices.map((inv: any) => [
    inv.invoiceNumber || "INV-DRAFT",
    inv.clientName || "Client",
    inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().slice(0, 10) : "",
    inv.dueDate ? new Date(inv.dueDate).toISOString().slice(0, 10) : "",
    inv.status || "draft",
    inv.paymentStatus || "unpaid",
    inv.currency || "USD",
    inv.total || 0,
    inv.taxAmount || 0,
    inv.amountPaid || 0,
    inv.amountDue || 0,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((val: any) => {
          const raw = String(val ?? "");
          if (/[",\n]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
          return raw;
        })
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `invoisen-financial-report-${new Date().toISOString().slice(0, 10)}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  URL.revokeObjectURL(url);
}
