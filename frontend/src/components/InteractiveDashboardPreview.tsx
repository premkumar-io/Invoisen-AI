import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Filter,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockRevenueChart = [
  { day: "Nov 01", revenue: 14200, volume: 12 },
  { day: "Nov 04", revenue: 28400, volume: 24 },
  { day: "Nov 07", revenue: 45100, volume: 38 },
  { day: "Nov 10", revenue: 89000, volume: 62 },
  { day: "Nov 13", revenue: 145200, volume: 94 },
  { day: "Nov 15", revenue: 245680, volume: 142 },
];

const mockActivityList = [
  {
    id: "#INV-0789",
    client: "Apex Dynamics Inc.",
    date: "Nov 15, 2026",
    amount: "$14,200.00",
    status: "paid",
    aiTag: "Optimized",
    confidence: "99.8%",
  },
  {
    id: "#INV-0790",
    client: "Stellar Corp USA",
    date: "Nov 15, 2026",
    amount: "$8,500.50",
    status: "paid",
    aiTag: "Optimized",
    confidence: "98.5%",
  },
  {
    id: "#INV-0791",
    client: "Swiss Tech AG",
    date: "Nov 14, 2026",
    amount: "$4,200.00",
    status: "pending",
    aiTag: "Delayed",
    confidence: "92.1%",
  },
  {
    id: "#INV-0792",
    client: "Orbit Collective",
    date: "Nov 14, 2026",
    amount: "$8,500.50",
    status: "pending",
    aiTag: "Optimized",
    confidence: "97.4%",
  },
  {
    id: "#INV-0793",
    client: "Stratus Cloud",
    date: "Nov 13, 2026",
    amount: "$12,400.00",
    status: "paid",
    aiTag: "Optimized",
    confidence: "99.2%",
  },
];

export function InteractiveDashboardPreview() {
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending">("all");
  const [activeMetric, setActiveMetric] = useState<"revenue" | "volume">("revenue");

  const filteredInvoices =
    filterStatus === "all"
      ? mockActivityList
      : mockActivityList.filter((inv) => inv.status === filterStatus);

  return (
    <div className="glass-card rounded-3xl border border-border/80 shadow-2xl p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 backdrop-blur-xl relative overflow-hidden">
      {/* Glow effect header backdrop */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Interactive Command Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-headline text-base sm:text-lg md:text-xl font-bold text-foreground tracking-wide">
                INVOISEN — Command Center
              </h3>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold shrink-0 whitespace-nowrap"
              >
                Live Demo
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Autonomous AI Billing &amp; Predictive Cashflow Engine
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end pt-1 md:pt-0">
          <div className="inline-flex p-1 rounded-full bg-card/80 border border-border/80 text-[11px] sm:text-xs font-bold">
            <button
              onClick={() => setActiveMetric("revenue")}
              className={`px-3 py-1 rounded-full transition-all ${activeMetric === "revenue" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"}`}
            >
              Revenue Growth
            </button>
            <button
              onClick={() => setActiveMetric("volume")}
              className={`px-3 py-1 rounded-full transition-all ${activeMetric === "volume" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"}`}
            >
              Invoice Volume
            </button>
          </div>

          <Link
            to="/invoices/new"
            className="px-3.5 py-1.5 rounded-full bg-primary text-white text-xs font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 btn-premium shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> New Invoice
          </Link>
        </div>
      </div>

      {/* Top 3 Metric Summary Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 rounded-2xl bg-card/60 border border-border/80 space-y-2 relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span>Total Revenue</span>
            <span className="text-success flex items-center gap-1 font-numeric text-xs font-extrabold">
              <TrendingUp className="w-3.5 h-3.5" /> +12.5% YoY
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-extrabold text-foreground tracking-tight">
            $245,680.50
          </div>
          <p className="text-xs text-muted-foreground">1,284 invoices settled in Q3</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-card/60 border border-border/80 space-y-2 relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span>Outstanding Invoices</span>
            <span className="text-amber-500 flex items-center gap-1 font-numeric text-xs font-extrabold">
              <Clock className="w-3.5 h-3.5" /> 2 Pending
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-extrabold text-foreground tracking-tight">
            $12,700.00
          </div>
          <p className="text-xs text-muted-foreground">Avg. collection time: 1.4 days</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-card/60 border border-border/80 space-y-2 relative overflow-hidden group hover:border-primary/50 transition-colors sm:col-span-2 md:col-span-1">
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span>AI Automated Accuracy</span>
            <span className="text-primary flex items-center gap-1 font-numeric text-xs font-extrabold">
              <ShieldCheck className="w-3.5 h-3.5" /> 99.9%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-extrabold text-foreground tracking-tight">
            Swiss QR Compliant
          </div>
          <p className="text-xs text-muted-foreground">Zero manual line item entry</p>
        </div>
      </div>

      {/* Main Interactive Chart & AI Insights Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Area Chart Container */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-card/40 border border-border/80 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-headline text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {activeMetric === "revenue" ? "Real-Time Revenue Velocity" : "Monthly Invoice Volume"}
            </h4>
            <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border/60">
              UPDATED LIVE
            </span>
          </div>

          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRevenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderColor: "rgba(59, 130, 246, 0.3)",
                    borderRadius: "1rem",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={activeMetric}
                  stroke={activeMetric === "revenue" ? "#3b82f6" : "#8b5cf6"}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill={activeMetric === "revenue" ? "url(#colorRevenue)" : "url(#colorVolume)"}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="p-5 sm:p-6 rounded-2xl bg-card/40 border border-border/80 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-headline text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                AI Cashflow Insights
              </h4>
              <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-500">
                ACTIVE
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Predictive risk scoring flags late payers 14 days before due date with automated reminders.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-purple-600 dark:text-purple-400">
                <span>Send Reminder for #INV-0791</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20">Overdue</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Swiss Tech AG invoice is 3 days past due date. Sending an AI polite reminder increases payment probability by 89%.
              </p>
            </div>

            <button
              type="button"
              className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer btn-premium"
            >
              <span>Auto-Dispatch AI Reminder</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Activity Table Filter Section */}
      <div className="space-y-4 pt-2 border-t border-border/60">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h4 className="font-headline text-base font-bold text-foreground">
              Live Invoicing Activity Ledger
            </h4>
            <p className="text-xs text-muted-foreground">
              Real-time audit log of extracted entities, VAT validation &amp; payment status.
            </p>
          </div>

          {/* Filter Segment Pills */}
          <div className="inline-flex p-1 rounded-xl bg-card border border-border/80 text-xs font-bold shrink-0">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === "all" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              All Invoices ({mockActivityList.length})
            </button>
            <button
              onClick={() => setFilterStatus("paid")}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === "paid" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Paid
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === "pending" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Pending
            </button>
          </div>
        </div>

        {/* Activity Items List */}
        <div className="space-y-2.5">
          {filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              className="p-3.5 sm:p-4 rounded-2xl bg-card/60 border border-border/80 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${inv.status === "paid" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"}`}
                >
                  {inv.status === "paid" ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-foreground">{inv.id}</span>
                    <span className="text-xs font-semibold text-foreground">{inv.client}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2 pt-0.5">
                    <span>{inv.date}</span>
                    <span>&bull;</span>
                    <span className="text-primary font-bold">{inv.aiTag} ({inv.confidence})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-border/40 pt-2 sm:pt-0">
                <div className="text-left sm:text-right">
                  <div className="font-mono text-sm font-extrabold text-foreground">{inv.amount}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {inv.status === "paid" ? (
                      <span className="text-emerald-500">Paid &amp; Settled</span>
                    ) : (
                      <span className="text-amber-500">Awaiting Settlement</span>
                    )}
                  </div>
                </div>

                <Link
                  to="/invoices/$invoiceId"
                  params={{ invoiceId: inv.id.replace("#", "") }}
                  className="p-2 rounded-xl bg-card border border-border/80 text-muted-foreground group-hover:text-primary group-hover:border-primary/40 transition-all shrink-0"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
