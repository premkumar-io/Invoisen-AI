import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Sparkles,
  Download,
  Send,
  Loader2,
  Trash2,
  Copy,
  Plus,
  Filter,
  DollarSign,
  CheckCircle2,
  Clock,
  Zap,
  Bell,
  LogOut,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getInitialTheme, setTheme, themeNames, type ThemeName } from "@/lib/theme";
import { getAuthToken } from "@/lib/auth";
import {
  downloadInvoicePdf,
  duplicateInvoice,
  fetchInvoices,
  sendInvoiceByEmail,
  type IInvoice,
} from "@/lib/api/invoice";
import { cn, formatCurrency, getCurrencySymbol } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/invoices/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getAuthToken()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Invoices — Invoisen AI" },
      {
        name: "description",
        content: "Browse, filter, and export your full invoice history in Invoisen.",
      },
    ],
  }),
  component: InvoiceHistoryPage,
});

const tabs = ["All", "Draft", "Published", "Archived"] as const;

function InvoiceHistoryPage() {
  const { logout } = useAuth();
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [search, setSearch] = useState("");
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme());
  const [showNotifications, setShowNotifications] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const currentIndex = themeNames.indexOf(theme);
    const nextTheme = themeNames[(currentIndex + 1) % themeNames.length];
    setThemeState(nextTheme);
    setTheme(nextTheme);
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  const {
    data: invoicesResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["invoices", { tab, search }],
    queryFn: async () => {
      const response = await fetchInvoices({
        status: tab === "All" ? undefined : tab.toLowerCase(),
        search: search || undefined,
        trash: false,
      });
      if (!response.success) {
        throw new Error(response.error!.message || "Failed to fetch invoices");
      }
      return response.data;
    },
  });

  const invoices: IInvoice[] = invoicesResponse?.data ?? [];

  const downloadMutation = useMutation({
    mutationFn: downloadInvoicePdf,
    onSuccess: () => {
      toast.success("PDF download started.");
    },
    onError: (err) => {
      toast.error("PDF download failed", { description: err.message });
    },
  });

  const sendMutation = useMutation({
    mutationFn: sendInvoiceByEmail,
    onSuccess: (data) => {
      toast.success("Invoice sent successfully.", { description: data.message });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: (err) => {
      toast.error("Failed to send invoice via email", { description: err.message });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateInvoice,
    onSuccess: (newInvoice) => {
      toast.success("Invoice duplicated. Opening draft...");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      navigate({ to: "/invoices/$invoiceId", params: { invoiceId: newInvoice._id } });
    },
    onError: (err) => {
      toast.error("Failed to duplicate invoice", { description: err.message });
    },
  });

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white">
      {/* 3D WebGL Background Canvas */}
      <ThreeBackground />

      {/* Top Navigation Bar Matching Landing Page & Dashboard */}
      <AppNavbar />

      {/* Main Page Content */}
      <div className="relative pt-28 pb-16 z-10">
        <div className="max-w-container-max mx-auto px-margin-desktop space-y-12">
          {/* Hero Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-sm font-medium">
                <Sparkles className="w-4 h-4" /> Swiss PDF &amp; Vector Engine Active
              </div>
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                Invoice <span className="drawing-text italic">Management Studio.</span>
              </h1>
              <p className="text-muted-foreground font-body text-lg">
                Create, track, duplicate, and export Swiss-standard invoices with autonomous client verification.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/invoices/new"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-headline text-base font-bold shadow-xl shadow-primary/25 hover:scale-105 transition-all flex items-center gap-2 btn-premium"
              >
                <Plus className="w-5 h-5" />
                New Invoice
              </Link>
              <Link
                to="/invoices/templates"
                className="px-8 py-4 rounded-full font-headline text-base font-bold border border-border text-foreground bg-card/60 backdrop-blur-md hover:bg-card transition-all flex items-center gap-2"
              >
                <Layers className="w-5 h-5 text-primary" />
                Templates Showcase
              </Link>
            </div>
          </div>

          {/* Metric Summary Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-2xl hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase text-muted-foreground">Total Invoices</span>
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div className="font-headline text-3xl font-black text-foreground">{invoices.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active ledger count</p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-2xl hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase text-muted-foreground">Paid Invoices</span>
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div className="font-headline text-3xl font-black text-foreground">
                {invoices.filter((i) => i.paymentStatus === "paid" || i.status === "published").length}
              </div>
              <p className="text-xs text-success font-bold mt-1">100% Verified settlements</p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-2xl hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase text-muted-foreground">Drafts</span>
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div className="font-headline text-3xl font-black text-foreground">
                {invoices.filter((i) => i.status === "draft").length}
              </div>
              <p className="text-xs text-warning font-bold mt-1">In-progress drafts</p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-2xl hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase text-muted-foreground">Export Velocity</span>
                <Zap className="w-5 h-5 text-purple-500" />
              </div>
              <div className="font-headline text-3xl font-black text-foreground">Instant</div>
              <p className="text-xs text-primary font-bold mt-1">Vector PDF Rendering</p>
            </div>
          </div>

          {/* Search, Filter & Main Data Table */}
          <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
              {/* Tabs */}
              <div className="inline-flex p-1 rounded-full bg-card border border-border shadow-inner">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                      tab === t ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Search input & Trash trigger */}
              <div className="flex items-center gap-3">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search invoices..."
                    className="pl-10 rounded-full text-xs bg-card/60"
                  />
                </div>
                <Link
                  to="/trash"
                  className="p-2.5 rounded-full border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="View Trash"
                >
                  <Trash2 className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Table Content */}
            {isLoading ? (
              <div className="py-12 text-center space-y-2">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                <p className="text-sm font-bold text-muted-foreground">Loading Invoice Records...</p>
              </div>
            ) : isError ? (
              <div className="p-4 rounded-2xl bg-destructive/10 text-destructive text-sm text-center">
                {error?.message}
              </div>
            ) : !invoices.length ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-base font-bold text-foreground">No Invoices Found</p>
                <p className="text-xs text-muted-foreground">Try clearing your filters or create a new invoice.</p>
                <Link
                  to="/invoices/new"
                  className="inline-block px-6 py-2.5 rounded-full bg-primary text-white font-bold text-xs btn-premium"
                >
                  + Create Invoice
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/80 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="py-4 px-4">Invoice #</th>
                      <th className="py-4 px-4">Client Entity</th>
                      <th className="py-4 px-4">Date Issued</th>
                      <th className="py-4 px-4">Amount</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv._id} className="border-b border-border/40 hover:bg-card/40 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-primary">{inv.invoiceNumber}</td>
                        <td className="py-4 px-4 font-bold text-foreground text-base">
                          {inv.clientInfo?.name || "Unassigned Client"}
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-xs">
                          {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-foreground text-lg">
                          {getCurrencySymbol(inv.customization?.currency || "USD")}
                          {(inv.calculations?.total || 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={
                              inv.paymentStatus === "paid"
                                ? "default"
                                : inv.status === "draft"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="capitalize font-bold text-xs px-3 py-1"
                          >
                            {inv.paymentStatus || inv.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              to="/invoices/$invoiceId"
                              params={{ invoiceId: inv._id }}
                              className="px-4 py-1.5 rounded-full bg-card border border-border text-xs font-bold hover:bg-surface transition-colors"
                            >
                              Open
                            </Link>
                            <button
                              onClick={() => downloadMutation.mutate(inv._id)}
                              className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => duplicateMutation.mutate(inv._id)}
                              className="p-2 rounded-full hover:bg-secondary/10 text-secondary transition-colors"
                              title="Duplicate Invoice"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-card border-t border-border mt-16">
        <div className="max-w-container-max mx-auto px-margin-desktop py-8 text-center text-muted-foreground text-xs tracking-widest uppercase font-bold">
          © 2026 Invoisen AI. All rights reserved. Precision-engineered in Zurich.
        </div>
      </footer>
    </div>
  );
}
