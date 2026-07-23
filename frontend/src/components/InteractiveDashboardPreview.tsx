import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Sparkles, TrendingUp, ArrowUpRight, CheckCircle2, Clock, ShieldCheck, Filter, Plus } from "lucide-react";
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
  { id: "#INV-0789", client: "Apex Dynamics Inc.", date: "Nov 15, 2026", amount: "$14,200.00", status: "paid", aiTag: "Optimized", confidence: "99.8%" },
  { id: "#INV-0790", client: "Stellar Corp USA", date: "Nov 15, 2026", amount: "$8,500.50", status: "paid", aiTag: "Optimized", confidence: "98.5%" },
  { id: "#INV-0791", client: "Swiss Tech AG", date: "Nov 14, 2026", amount: "$4,200.00", status: "pending", aiTag: "Delayed", confidence: "92.1%" },
  { id: "#INV-0792", client: "Orbit Collective", date: "Nov 14, 2026", amount: "$8,500.50", status: "pending", aiTag: "Optimized", confidence: "97.4%" },
  { id: "#INV-0793", client: "Stratus Cloud", date: "Nov 13, 2026", amount: "$12,400.00", status: "paid", aiTag: "Optimized", confidence: "99.2%" },
];

export function InteractiveDashboardPreview() {
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending">("all");
  const [activeMetric, setActiveMetric] = useState<"revenue" | "volume">("revenue");

  const filteredInvoices = filterStatus === "all"
    ? mockActivityList
    : mockActivityList.filter((inv) => inv.status === filterStatus);

  return (
    <div className="glass-card rounded-3xl border border-border/80 shadow-2xl p-6 md:p-8 space-y-8 backdrop-blur-xl relative overflow-hidden">
      {/* Glow effect header backdrop */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Interactive Command Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center font-bold text-primary text-sm border border-primary/30 shadow-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline text-xl font-bold text-foreground">INVOISEN — Command Center</h3>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                Live Interactive Demo
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Autonomous AI Billing &amp; Predictive Cashflow Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="inline-flex p-1 rounded-full bg-card/80 border border-border/80 text-xs font-bold">
            <button
              onClick={() => setActiveMetric("revenue")}
              className={`px-3.5 py-1.5 rounded-full transition-all ${activeMetric === "revenue" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"}`}
            >
              Revenue Growth
            </button>
            <button
              onClick={() => setActiveMetric("volume")}
              className={`px-3.5 py-1.5 rounded-full transition-all ${activeMetric === "volume" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"}`}
            >
              Invoice Volume
            </button>
          </div>

          <Link
            to="/invoices/new"
            className="px-4 py-2 rounded-full bg-primary text-white text-xs font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 btn-premium"
          >
            <Plus className="w-3.5 h-3.5" /> New Invoice
          </Link>
        </div>
      </div>

      {/* Top 3 Metric Summary Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-card/60 border border-border/80 space-y-2 relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span>Total Revenue</span>
            <span className="text-success flex items-center gap-1 font-numeric text-xs font-extrabold">
              <TrendingUp className="w-3.5 h-3.5" /> +12.5% YoY
            </span>
          </div>
          <div className="text-3xl font-headline font-extrabold text-foreground tracking-tight">$245,680.50</div>
          <p className="text-xs text-muted-foreground">1,284 invoices settled in Q3</p>
        </div>

        <div className="p-6 rounded-2xl bg-card/60 border border-border/80 space-y-2 relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span>Outstanding Invoices</span>
            <span className="text-warning font-[#f59e0b] font-bold text-xs">7 Invoices</span>
          </div>
          <div className="text-3xl font-headline font-extrabold text-foreground tracking-tight">$32,950.40</div>
          <p className="text-xs text-muted-foreground">Average payout speed: 4.2 days</p>
        </div>

        <div className="p-6 rounded-2xl bg-card/60 border border-border/80 space-y-2 relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span>AI Predictive Accuracy</span>
            <span className="text-primary font-bold text-xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Active Model
            </span>
          </div>
          <div className="text-3xl font-headline font-extrabold text-primary tracking-tight">88% Accuracy</div>
          <p className="text-xs text-muted-foreground">0 overdue risk flags detected</p>
        </div>
      </div>

      {/* Main Grid: Interactive Area Chart & AI Radial Predictions */}
      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        {/* Left 8 Cols: Live Interactive Chart */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-card/40 border border-border/80 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-headline font-bold text-base text-foreground">Cashflow Velocity Curve</h4>
              <p className="text-xs text-muted-foreground">30-day automated settlement trajectory</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-success px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
              Live Real-Time Sync
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRevenueChart}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderColor: "rgba(124, 58, 237, 0.4)",
                    borderRadius: "16px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#chartGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 4 Cols: AI Predictions Circular Card */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> AI Cash Flow Forecast
            </div>
            <h4 className="font-headline font-bold text-lg text-foreground">88% Predicted Settlement</h4>
            <p className="text-xs text-muted-foreground">Neural model expects $32.9k payout within 4.2 days.</p>
          </div>

          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-border"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary"
                strokeDasharray="88, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <div className="font-headline text-2xl font-extrabold text-foreground">88%</div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase">Confidence</div>
            </div>
          </div>

          <div className="pt-2 border-t border-primary/20 flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>Upcoming Payout</span>
            <span className="text-foreground font-mono font-bold">$14,200.00 (Apex)</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Live Tabular Ledger */}
      <div className="p-6 rounded-2xl bg-card/60 border border-border/80 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="font-headline font-bold text-lg text-foreground">Recent Invoicing Activity</h4>
            <p className="text-xs text-muted-foreground">Real-time ledger synced across client portals</p>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="inline-flex p-1 rounded-full bg-card border border-border text-xs font-bold">
              {(["all", "paid", "pending"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-full capitalize transition-all ${filterStatus === st ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Client Entity</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">AI Insights</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">{inv.id}</td>
                  <td className="py-3.5 px-4 font-bold text-foreground">{inv.client}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{inv.date}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">{inv.amount}</td>
                  <td className="py-3.5 px-4">
                    {inv.status === "paid" ? (
                      <span className="px-2.5 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold border border-success/20 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> PAID
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-warning/10 text-warning font-[#f59e0b] text-[10px] font-bold border border-warning/20 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> PENDING
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {inv.aiTag} ({inv.confidence})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
