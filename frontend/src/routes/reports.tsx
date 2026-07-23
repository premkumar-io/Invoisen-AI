import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BarChart3,
  CircleDollarSign,
  Clock,
  Download,
  Loader2,
  TrendingUp,
  PieChart as PieIcon,
  ArrowUpRight,
  Sparkles,
  Calendar as CalendarIcon,
  FileSpreadsheet,
  LogOut,
  Users,
  ShieldCheck,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { Badge } from "@/components/ui/badge";
import { getAuthToken } from "@/lib/auth";
import { getInitialTheme, setTheme, themeNames, type ThemeName } from "@/lib/theme";
import { formatCurrency, getCurrencySymbol } from "@/lib/utils";
import { exportReportCsv, fetchReportSummary } from "@/lib/api/report";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/reports")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getAuthToken()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({ meta: [{ title: "Reports & Analytics — Invoisen AI" }] }),
  component: ReportsPage,
});

const revenueTrendData = [
  { month: "Jan", revenue: 14500, expenses: 3200, margin: 11300 },
  { month: "Feb", revenue: 18200, expenses: 4100, margin: 14100 },
  { month: "Mar", revenue: 16800, expenses: 3800, margin: 13000 },
  { month: "Apr", revenue: 22400, expenses: 4500, margin: 17900 },
  { month: "May", revenue: 26900, expenses: 5200, margin: 21700 },
  { month: "Jun", revenue: 29650, expenses: 5800, margin: 23850 },
];

const paymentStatusDistribution = [
  { name: "Settled Paid", value: 128450, color: "#22c55e" },
  { name: "Pending Authorization", value: 14200, color: "#f59e0b" },
  { name: "Overdue Reminders", value: 4800, color: "#ef4444" },
];

function ReportsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme());
  const [dateRange, setDateRange] = useState<"30d" | "90d" | "ytd">("30d");
  const [activeChart, setActiveChart] = useState<"cashflow" | "margins">("cashflow");

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
    data: summary,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["reportSummary"],
    queryFn: fetchReportSummary,
  });

  const exportMutation = useMutation({
    mutationFn: exportReportCsv,
    onSuccess: () => {
      toast.success("CSV financial report export started.");
    },
    onError: (err) => {
      toast.error("Failed to export report", { description: err.message });
    },
  });

  const reportData = summary?.totals || {
    collected: 128450,
    outstanding: 14200,
    overdue: 4800,
    gst: 16400,
    invoiceCount: 46,
    billed: 147450,
  };

  const topClientsList = summary?.topClients || [
    { clientName: "Stratus Tech Inc.", invoiceCount: 12, totalBilled: 42500 },
    { clientName: "Nexus Studios", invoiceCount: 8, totalBilled: 28400 },
    { clientName: "Orbit Collective", invoiceCount: 5, totalBilled: 19800 },
  ];

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white">
      {/* 3D WebGL Canvas Background */}
      <ThreeBackground />

      {/* Top Navigation Bar Matching Landing Page & Dashboard */}
      <AppNavbar />

      {/* Main Page Area */}
      <div className="relative pt-28 pb-16 z-10">
        <div className="max-w-container-max mx-auto px-margin-desktop space-y-12">
          {/* Header Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-sm font-medium">
                <Sparkles className="w-4 h-4" /> Autonomous Tax &amp; Margin Ledger
              </div>
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                Financial <span className="drawing-text italic">Reports &amp; Analytics.</span>
              </h1>
              <p className="text-muted-foreground font-body text-lg">
                Track revenue growth, cashflow velocity, GST/VAT tax liabilities, and client profitability.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => exportMutation.mutate()}
                disabled={exportMutation.isPending}
                className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-headline text-base font-bold shadow-xl shadow-primary/25 hover:scale-105 transition-all flex items-center gap-2 btn-premium"
              >
                {exportMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                Export Financial CSV
              </button>
            </div>
          </div>

          {/* KPI Summary Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-2xl hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase text-muted-foreground">Collected Revenue</span>
                <CircleDollarSign className="w-5 h-5 text-success" />
              </div>
              <div className="font-headline text-3xl font-black text-foreground">
                ${reportData.collected.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-success mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% MoM Growth
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-2xl hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase text-muted-foreground">Outstanding Payouts</span>
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div className="font-headline text-3xl font-black text-foreground">
                ${reportData.outstanding.toLocaleString()}
              </div>
              <p className="text-xs text-warning font-bold mt-1">3 Pending Settlements</p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-2xl hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase text-muted-foreground">Overdue Liabilities</span>
                <BarChart3 className="w-5 h-5 text-destructive" />
              </div>
              <div className="font-headline text-3xl font-black text-foreground">
                ${reportData.overdue.toLocaleString()}
              </div>
              <p className="text-xs text-destructive font-bold mt-1">AI Reminders active</p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-2xl hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase text-muted-foreground">GST/VAT Tracked</span>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="font-headline text-3xl font-black text-foreground">
                ${reportData.gst.toLocaleString()}
              </div>
              <p className="text-xs text-primary font-bold mt-1">Tax Audit Ready</p>
            </div>
          </div>

          {/* Interactive Financial Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Area Chart */}
            <div className="lg:col-span-8 glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <div className="flex flex-wrap justify-between items-center pb-4 border-b border-border gap-4">
                <div>
                  <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    Revenue &amp; Margin Velocity
                  </h3>
                  <p className="text-sm text-muted-foreground">Monthly collected cashflow vs operational expenses</p>
                </div>

                <div className="inline-flex p-1 rounded-full bg-card border border-border shadow-inner">
                  <button
                    onClick={() => setActiveChart("cashflow")}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                      activeChart === "cashflow" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Gross Cashflow
                  </button>
                  <button
                    onClick={() => setActiveChart("margins")}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                      activeChart === "margins" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Net Margins
                  </button>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={340}>
                <AreaChart data={revenueTrendData}>
                  <defs>
                    <linearGradient id="repRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "1rem",
                    }}
                    formatter={(val) => [`$${Number(val).toLocaleString()}`, "Amount"]}
                  />
                  <Area
                    type="monotone"
                    dataKey={activeChart === "cashflow" ? "revenue" : "margin"}
                    stroke="var(--color-primary)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#repRevenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Payment Status Breakdown */}
            <div className="lg:col-span-4 glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <div className="pb-2 border-b border-border">
                <h3 className="font-headline text-xl font-bold text-foreground flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-primary" />
                  Settlement Breakdown
                </h3>
                <p className="text-xs text-muted-foreground">Invoice status distribution</p>
              </div>

              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={paymentStatusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                    {paymentStatusDistribution.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "1rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2 pt-2 border-t border-border">
                {paymentStatusDistribution.map((st, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: st.color }} />
                      <span>{st.name}</span>
                    </div>
                    <span className="font-mono font-bold">${st.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Billed Clients & Tax Liability Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <h3 className="font-headline text-xl font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Top Billed Clients
                </h3>
                <Link to="/clients" className="text-xs font-bold text-primary hover:underline">
                  Directory →
                </Link>
              </div>

              <div className="space-y-4">
                {topClientsList.map((client, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-2xl bg-card/60 border border-border/70 shadow-sm hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 font-bold text-primary flex items-center justify-center text-sm border border-primary/20">
                        {client.clientName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground">{client.clientName}</div>
                        <div className="text-xs text-muted-foreground">{client.invoiceCount} invoices billed</div>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-base text-foreground">
                      ${client.totalBilled.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <h3 className="font-headline text-xl font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Tax Liabilities &amp; Audit Compliance
                </h3>
                <Badge variant="secondary" className="font-bold text-[10px]">
                  Audit Ready
                </Badge>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-surface/50 border border-border/60 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-foreground text-sm">GST Tracked (India &amp; APAC)</div>
                    <div className="text-muted-foreground">Autonomous CGST + SGST Calculation</div>
                  </div>
                  <div className="font-mono font-bold text-base text-foreground">$12,400.00</div>
                </div>

                <div className="p-4 rounded-2xl bg-surface/50 border border-border/60 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-foreground text-sm">VAT Tracked (EU &amp; UK)</div>
                    <div className="text-muted-foreground">Reverse Charge Mechanism Enabled</div>
                  </div>
                  <div className="font-mono font-bold text-base text-foreground">$4,000.00</div>
                </div>
              </div>
            </div>
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
