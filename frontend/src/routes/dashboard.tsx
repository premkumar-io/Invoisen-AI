import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  TrendingUp,
  Activity,
  Sparkles,
  UserPlus,
  Calendar as CalendarIcon,
  Bell,
  ArrowUpRight,
  Send,
  Zap,
  Users,
  ShieldCheck,
  BarChart3,
  Layers,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from "recharts";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { AiAssistant } from "@/components/AiAssistant";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInitialTheme, setTheme, themeNames, type ThemeName } from "@/lib/theme";
import { fetchDashboardStats } from "@/lib/api/dashboard";
import { getCurrencySymbol } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Invoisen AI" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme());
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<"revenue" | "breakdown">("revenue");
  const [activeDateRange, setActiveDateRange] = useState<"7d" | "30d" | "ytd">("30d");

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

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="bg-background text-foreground min-h-screen p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="font-headline text-lg font-bold">Syncing Invoisen Dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-background text-foreground min-h-screen p-8 flex items-center justify-center">
        <div className="glass-card p-8 rounded-3xl border border-destructive/30 bg-destructive/10 max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="font-headline text-2xl font-bold text-destructive">Failed to Load Dashboard</h2>
          <p className="text-sm text-muted-foreground">{error?.message || "Unknown error"}</p>
          <Link to="/" className="inline-block px-6 py-2.5 rounded-full bg-primary text-white font-bold text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const overview = data?.overview || {
    totalRevenue: 128450,
    paidInvoices: 42,
    pendingInvoices: 3,
    overdueInvoices: 1,
    totalInvoices: 46,
  };

  const monthlyRevenue = data?.monthlyRevenue || [
    { label: "Jan", revenue: 14500, invoices: 6 },
    { label: "Feb", revenue: 18200, invoices: 8 },
    { label: "Mar", revenue: 16800, invoices: 7 },
    { label: "Apr", revenue: 22400, invoices: 9 },
    { label: "May", revenue: 26900, invoices: 11 },
    { label: "Jun", revenue: 29650, invoices: 12 },
  ];

  const invoiceStatusBreakdown = [
    { name: "Paid", count: overview.paidInvoices, color: "#22c55e" },
    { name: "Pending", count: overview.pendingInvoices, color: "#f59e0b" },
    { name: "Overdue", count: overview.overdueInvoices, color: "#ef4444" },
  ];

  const recentActivity = data?.recentActivity || [
    {
      _id: "act-1",
      type: "invoice_paid",
      title: "Invoice #INV-2026-088 Paid",
      description: "Stratus Tech paid $14,700.00 via Credit Card",
      date: "Just now",
      amount: 14700,
      currency: "USD",
    },
    {
      _id: "act-2",
      type: "invoice_created",
      title: "New Invoice #INV-2026-089 Drafted",
      description: "AI Enriched entity details for Nexus Studios",
      date: "12 minutes ago",
      amount: 8500,
      currency: "USD",
    },
    {
      _id: "act-3",
      type: "ai_lookup",
      title: "Autonomous Entity Research Completed",
      description: "Retrieved VAT ID US-984210385 for Orbit Corp",
      date: "1 hour ago",
    },
    {
      _id: "act-4",
      type: "pdf_download",
      title: "Vector PDF Export Generated",
      description: "Downloaded Zurich Minimalist template export",
      date: "3 hours ago",
    },
  ];

  const latestInvoices = data?.latestInvoices || [
    {
      _id: "inv-1",
      invoiceNumber: "INV-2026-088",
      clientName: "Stratus Tech Inc.",
      amount: 14700,
      currency: "USD",
      paymentStatus: "paid",
      date: new Date().toISOString(),
    },
    {
      _id: "inv-2",
      invoiceNumber: "INV-2026-089",
      clientName: "Nexus Studios",
      amount: 8500,
      currency: "USD",
      paymentStatus: "pending",
      date: new Date().toISOString(),
    },
    {
      _id: "inv-3",
      invoiceNumber: "INV-2026-090",
      clientName: "Orbit Collective",
      amount: 12400,
      currency: "EUR",
      paymentStatus: "overdue",
      date: new Date().toISOString(),
    },
    {
      _id: "inv-4",
      invoiceNumber: "INV-2026-091",
      clientName: "Zenith Design Group",
      amount: 6200,
      currency: "GBP",
      paymentStatus: "paid",
      date: new Date().toISOString(),
    },
  ];

  const currencySymbol = getCurrencySymbol(latestInvoices[0]?.currency || "USD");

  const recentClients = [
    { name: "Stratus Tech Inc.", email: "billing@stratus.com", totalBilled: "$42,500", status: "Active", invoices: 12 },
    { name: "Nexus Studios", email: "finance@nexus.io", totalBilled: "$28,400", status: "Active", invoices: 8 },
    { name: "Orbit Collective", email: "accounts@orbit.co", totalBilled: "$19,800", status: "Review", invoices: 5 },
    { name: "Apex Labs", email: "invoices@apexlabs.com", totalBilled: "$15,200", status: "Active", invoices: 4 },
  ];

  const upcomingCalendarEvents = [
    { title: "Stratus Payout Scheduled", date: "Tomorrow, 10:00 AM", type: "Payout", badge: "High Priority" },
    { title: "Orbit Auto-Reminder", date: "Jul 26, 2026", type: "Reminder", badge: "Automated" },
    { title: "Nexus Invoice #089 Due", date: "Jul 28, 2026", type: "Due Date", badge: "Pending" },
    { title: "Quarterly Tax Sync", date: "Aug 01, 2026", type: "Tax Sync", badge: "System" },
  ];

  const notificationsList = [
    { title: "Payment Received", desc: "Stratus Tech paid $14,700.00", time: "5m ago" },
    { title: "AI Research Completed", desc: "VAT ID verified for Orbit Corp", time: "1h ago" },
    { title: "Invoice Overdue", desc: "INV-2026-090 is 3 days past due", time: "2h ago" },
  ];

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white">
      {/* 3D Canvas Background */}
      <ThreeBackground />

      {/* Landing Page Style Navigation Bar */}
      <AppNavbar />

      {/* Main Dashboard Hero Section (Matching Landing Page Hero Layout) */}
      <div className="relative pt-28 pb-16 z-10">
        <div className="max-w-container-max mx-auto px-margin-desktop space-y-12">
          {/* Top Banner Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-sm font-medium backdrop-blur-md">
                <span className="material-symbols-outlined text-[18px] animate-spin">auto_awesome</span>
                v4.0 Released — Autonomous Intelligence Active
              </div>
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                Welcome to your <span className="drawing-text italic">Command Center.</span>
              </h1>
              <p className="text-muted-foreground font-body text-lg leading-relaxed">
                Track real-time revenue, manage Swiss-style invoices, and run automated AI client research.
              </p>
            </div>

            {/* Hero Quick Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/invoices/new"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-headline text-base font-bold shadow-xl shadow-primary/25 hover:scale-105 transition-all flex items-center gap-2 btn-premium"
              >
                <Plus className="w-5 h-5" />
                Create New Invoice
              </Link>
              <Link
                to="/clients"
                className="px-8 py-4 rounded-full font-headline text-base font-bold border border-border text-foreground bg-card/60 backdrop-blur-md hover:bg-card transition-all hover:scale-105 flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5 text-primary" />
                Add Client
              </Link>
            </div>
          </div>

          {/* Bento Grid Metrics Cards (Matching Landing Page Bento Grid Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card rounded-3xl p-8 border border-border/80 shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Revenue</span>
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
                <div className="font-headline text-4xl font-black text-foreground">
                  {currencySymbol}{overview.totalRevenue.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-success">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+18.4% MoM Growth</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 border border-border/80 shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Paid Invoices</span>
                  <div className="w-12 h-12 rounded-2xl bg-success flex items-center justify-center text-white shadow-lg shadow-success/30 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
                <div className="font-headline text-4xl font-black text-foreground">
                  {overview.paidInvoices}
                </div>
                <p className="text-xs text-muted-foreground font-medium">100% collected on-time</p>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 border border-border/80 shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pending Balance</span>
                  <div className="w-12 h-12 rounded-2xl bg-warning flex items-center justify-center text-white shadow-lg shadow-warning/30 group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
                <div className="font-headline text-4xl font-black text-foreground">
                  $14,200.00
                </div>
                <p className="text-xs text-warning font-bold">3 Invoices awaiting payout</p>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 border border-border/80 shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payment Speed</span>
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6" />
                  </div>
                </div>
                <div className="font-headline text-4xl font-black text-foreground">4.2 Days</div>
                <p className="text-xs text-primary font-bold">3.5x faster than industry average</p>
              </div>
            </div>
          </div>

          {/* Quick Actions Banners Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link
              to="/invoices/new"
              className="glass-card p-6 rounded-3xl border border-border/80 hover:border-primary/50 transition-all flex items-center gap-4 group shadow-xl hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/25">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-base text-foreground">New Invoice</div>
                <div className="text-xs text-muted-foreground">AI Builder Studio</div>
              </div>
            </Link>

            <Link
              to="/clients"
              className="glass-card p-6 rounded-3xl border border-border/80 hover:border-primary/50 transition-all flex items-center gap-4 group shadow-xl hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-secondary/25">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-base text-foreground">Add Client</div>
                <div className="text-xs text-muted-foreground">Entity Research</div>
              </div>
            </Link>

            <Link
              to="/reports"
              className="glass-card p-6 rounded-3xl border border-border/80 hover:border-primary/50 transition-all flex items-center gap-4 group shadow-xl hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-tertiary text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-tertiary/25">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-base text-foreground">Financial Reports</div>
                <div className="text-xs text-muted-foreground">Cashflow &amp; Taxes</div>
              </div>
            </Link>

            <Link
              to="/settings"
              className="glass-card p-6 rounded-3xl border border-border/80 hover:border-primary/50 transition-all flex items-center gap-4 group shadow-xl hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-purple-600/25">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-base text-foreground">Swiss Branding</div>
                <div className="text-xs text-muted-foreground">Design Templates</div>
              </div>
            </Link>
          </div>

          {/* Interactive Financial Analytics & AI Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 Columns: Charts Area */}
            <div className="lg:col-span-8 glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <div className="flex flex-wrap justify-between items-center pb-4 border-b border-border gap-4">
                <div>
                  <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    Financial Analytics
                  </h3>
                  <p className="text-sm text-muted-foreground">Real-time revenue velocity &amp; invoice distribution</p>
                </div>

                <div className="inline-flex p-1 rounded-full bg-card border border-border shadow-inner">
                  <button
                    onClick={() => setActiveChartTab("revenue")}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                      activeChartTab === "revenue" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Revenue Curve
                  </button>
                  <button
                    onClick={() => setActiveChartTab("breakdown")}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                      activeChartTab === "breakdown" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Invoice Status
                  </button>
                </div>
              </div>

              {activeChartTab === "revenue" ? (
                <ResponsiveContainer width="100%" height={340}>
                  <AreaChart data={monthlyRevenue}>
                    <defs>
                      <linearGradient id="dashRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="var(--color-muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${currencySymbol}${Number(val) / 1000}k`}
                    />
                    <Tooltip
                      cursor={{ stroke: "var(--color-primary)", strokeWidth: 1, strokeDasharray: "4 4" }}
                      contentStyle={{
                        background: "var(--color-background)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "1rem",
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value) => [`${currencySymbol}${Number(value).toLocaleString()}`, "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#dashRevenueGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={invoiceStatusBreakdown}>
                    <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-background)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "1rem",
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {invoiceStatusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Right 4 Columns: AI Insights & Live Stream */}
            <div className="lg:col-span-4 space-y-8">
              <div className="glass-card p-8 rounded-3xl border border-primary/30 bg-primary/5 shadow-2xl relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-headline text-xl font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary animate-spin" />
                      AI Intelligence
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-primary/20 text-primary">
                      Active Recommendations
                    </span>
                  </div>
                  <div className="p-5 rounded-2xl bg-card/80 border border-border/80 text-xs space-y-3 shadow-sm">
                    <div className="font-bold text-foreground flex items-center justify-between">
                      <span>Send Reminder for INV-2026-090</span>
                      <span className="text-warning font-mono font-bold">Overdue</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Orbit Collective invoice is 3 days past due date. Sending an AI polite reminder increases payment probability by 89%.
                    </p>
                    <button className="px-4 py-2.5 rounded-full bg-primary text-white font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform shadow-md btn-premium">
                      <Send className="w-3.5 h-3.5" /> Send AI Reminder Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity Stream */}
              <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <h3 className="font-headline text-lg font-bold text-foreground flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Live Activity Stream
                  </h3>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Real-Time</span>
                </div>
                <div className="space-y-4 pt-2">
                  {recentActivity.map((act) => (
                    <div key={act._id} className="flex items-start gap-3.5 text-xs">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                        {act.type === "invoice_paid" ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                          <FileText className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="font-bold text-foreground text-sm">{act.title}</div>
                        <div className="text-muted-foreground">{act.description}</div>
                        <div className="text-[10px] text-muted-foreground/70">{act.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Swiss Clients, Calendar Timeline & Latest Invoices */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Recent Clients */}
            <div className="lg:col-span-4 glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <h3 className="font-headline text-xl font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Recent Clients
                </h3>
                <Link to="/clients" className="text-xs font-bold text-primary hover:underline">
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {recentClients.map((client, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-2xl bg-card/60 border border-border/70 hover:border-primary/40 transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 font-bold text-primary flex items-center justify-center text-sm border border-primary/20">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground">{client.name}</div>
                        <div className="text-xs text-muted-foreground">{client.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-foreground">{client.totalBilled}</div>
                      <span className="text-[10px] text-muted-foreground font-medium">{client.invoices} invoices</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar Timeline Widget */}
            <div className="lg:col-span-8 glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <h3 className="font-headline text-xl font-bold text-foreground flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Billing Calendar &amp; Upcoming Payouts
                </h3>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-success animate-ping"></span>
                  <span className="text-xs text-muted-foreground font-bold">Stripe Sync Active</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {upcomingCalendarEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-card border border-border space-y-2 hover:border-primary/40 transition-colors shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        {evt.type}
                      </span>
                      <Badge variant="secondary" className="text-[9px] font-bold">
                        {evt.badge}
                      </Badge>
                    </div>
                    <div className="font-bold text-sm text-foreground">{evt.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{evt.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Latest Invoices Table */}
          <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <div>
                <h3 className="font-headline text-2xl font-bold text-foreground">Latest Invoices</h3>
                <p className="text-xs text-muted-foreground">Recent transactions across all clients</p>
              </div>
              <Link to="/invoices" className="text-xs font-bold text-primary hover:underline">
                View All Invoices →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="font-bold text-foreground text-xs uppercase">Client Entity</TableHead>
                    <TableHead className="font-bold text-foreground text-xs uppercase">Invoice #</TableHead>
                    <TableHead className="font-bold text-foreground text-xs uppercase">Status</TableHead>
                    <TableHead className="font-bold text-foreground text-xs uppercase">Issue Date</TableHead>
                    <TableHead className="font-bold text-foreground text-xs uppercase text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestInvoices.map((inv) => (
                    <TableRow key={inv._id} className="border-border hover:bg-card/40 transition-colors">
                      <TableCell className="font-bold text-foreground text-base">{inv.clientName}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{inv.invoiceNumber}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            inv.paymentStatus === "paid"
                              ? "default"
                              : inv.paymentStatus === "overdue"
                                ? "destructive"
                                : "secondary"
                          }
                          className="capitalize font-bold text-xs px-3 py-1"
                        >
                          {inv.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(inv.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-foreground text-lg">
                        {getCurrencySymbol(inv.currency)}
                        {inv.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Matching Landing Page Style Footer */}
      <footer className="w-full bg-card border-t border-border mt-16">
        <div className="max-w-container-max mx-auto px-margin-desktop py-8 text-center text-muted-foreground text-xs tracking-widest uppercase font-bold">
          © 2026 Invoisen AI. All rights reserved. Precision-engineered in Zurich.
        </div>
      </footer>

      <AiAssistant />
    </div>
  );
}
