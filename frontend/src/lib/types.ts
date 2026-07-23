export type InvoiceStatus = "Paid" | "Pending" | "Draft" | "Overdue";

export interface Invoice {
  _id?: string;
  id?: string;
  number: string;
  client: string;
  email: string;
  amount: number;
  status: InvoiceStatus;
  date: string;
  initials: string;
  avatarTone: "purple" | "blue" | "red" | "green" | "gray";
}

export interface Client {
  _id?: string;
  id?: string;
  name: string;
  email: string;
}

export interface DashboardStats {
  label: string;
  value: string;
  delta?: string;
  progress: number;
  kind: "total" | "draft" | "published" | "archived";
}

export interface HistoryStats {
  label: string;
  value: string;
  note?: string;
  tone: "primary" | "warning" | "success" | "destructive";
}

// Mock data for when API is unavailable
export const invoices: Invoice[] = [
  {
    id: "1",
    number: "INV-2024-001",
    client: "Nexus Labs",
    email: "billing@nexuslabs.io",
    amount: 12450,
    status: "Paid",
    date: "Oct 12, 2024",
    initials: "NL",
    avatarTone: "purple",
  },
  {
    id: "2",
    number: "INV-2024-002",
    client: "Acme Media",
    email: "accounts@acmemedia.com",
    amount: 3200,
    status: "Pending",
    date: "Oct 14, 2024",
    initials: "AM",
    avatarTone: "blue",
  },
  {
    id: "3",
    number: "INV-2024-003",
    client: "Cloud Dynamics",
    email: "finance@clouddyn.com",
    amount: 8900,
    status: "Draft",
    date: "Oct 15, 2024",
    initials: "CD",
    avatarTone: "blue",
  },
  {
    id: "4",
    number: "INV-2024-004",
    client: "Vortex Tech",
    email: "pay@vortex.tech",
    amount: 1450,
    status: "Paid",
    date: "Oct 16, 2024",
    initials: "VT",
    avatarTone: "red",
  },
  {
    id: "5",
    number: "INV-2024-005",
    client: "Stripe Inc",
    email: "billing@stripe.com",
    amount: 19200,
    status: "Pending",
    date: "Oct 17, 2024",
    initials: "S",
    avatarTone: "blue",
  },
  {
    id: "6",
    number: "INV-2024-006",
    client: "Apex Systems",
    email: "finance@apex.org",
    amount: 5000,
    status: "Overdue",
    date: "Oct 18, 2024",
    initials: "AS",
    avatarTone: "gray",
  },
  {
    id: "7",
    number: "INV-2024-007",
    client: "Global Corp",
    email: "invoices@global.net",
    amount: 980,
    status: "Draft",
    date: "Oct 20, 2024",
    initials: "GC",
    avatarTone: "gray",
  },
  {
    id: "8",
    number: "INV-2024-008",
    client: "Venture Quest",
    email: "billing@vq.io",
    amount: 3100,
    status: "Paid",
    date: "Oct 22, 2024",
    initials: "VQ",
    avatarTone: "green",
  },
];

export const dashboardStats: DashboardStats[] = [
  { label: "Total Invoices", value: "$45,200", delta: "+12.5%", progress: 100, kind: "total" },
  { label: "Draft", value: "5", progress: 25, kind: "draft" },
  { label: "Published", value: "12", progress: 75, kind: "published" },
  { label: "Archived", value: "3", progress: 15, kind: "archived" },
];

export const historyStats: HistoryStats[] = [
  { label: "Total Revenue", value: "$42,920.00", note: "+12%", tone: "primary" },
  { label: "Outstanding", value: "$8,450.00", note: "8 Pending", tone: "warning" },
  { label: "Paid Invoices", value: "124", note: "", tone: "success" },
  { label: "Overdue", value: "3", note: "", tone: "destructive" },
];

export const clients: Client[] = [
  { id: "1", name: "Nexus Labs", email: "billing@nexuslabs.io" },
  { id: "2", name: "Acme Media", email: "accounts@acmemedia.com" },
  { id: "3", name: "Cloud Dynamics", email: "finance@clouddyn.com" },
  { id: "4", name: "Vortex Tech", email: "pay@vortex.tech" },
  { id: "5", name: "Stripe Inc", email: "billing@stripe.com" },
];

export const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
