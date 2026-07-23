import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldAlert,
  Users,
  CreditCard,
  Headphones,
  TrendingUp,
  Activity,
  Cpu,
  Database,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Search,
  Sliders,
  MoreVertical,
  LogOut,
  Sparkles,
  Server,
  DollarSign,
  Download,
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
import { Input } from "@/components/ui/input";
import { getInitialTheme, setTheme, themeNames, type ThemeName } from "@/lib/theme";
import { getAuthToken } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getAuthToken()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({ meta: [{ title: "Admin Command Center — Invoisen AI" }] }),
  component: AdminPage,
});

const revenueAnalyticsData = [
  { month: "Jan", mrr: 42000, arr: 504000, users: 850 },
  { month: "Feb", mrr: 51200, arr: 614400, users: 1020 },
  { month: "Mar", mrr: 59800, arr: 717600, users: 1180 },
  { month: "Apr", mrr: 68400, arr: 820800, users: 1290 },
  { month: "May", mrr: 76900, arr: 922800, users: 1380 },
  { month: "Jun", mrr: 84200, arr: 1010400, users: 1420 },
];

const planDistributionData = [
  { name: "Pro Studio ($29/mo)", value: 920, color: "#22c55e" },
  { name: "Enterprise Ultra ($99/mo)", value: 280, color: "#3b82f6" },
  { name: "Starter Free", value: 220, color: "#94a3b8" },
];

const mockUsersList = [
  { id: "USR-9801", name: "Sarah Chen", email: "sarah@stratus.io", plan: "Pro Studio", mrr: "$29/mo", status: "Active", joined: "Jan 14, 2026" },
  { id: "USR-9802", name: "Marc Oberholzer", email: "m.oberholzer@baseltech.ch", plan: "Enterprise", mrr: "$99/mo", status: "Active", joined: "Feb 02, 2026" },
  { id: "USR-9803", name: "Elena Rostova", email: "elena@orbit.co", plan: "Pro Studio", mrr: "$29/mo", status: "Active", joined: "Mar 19, 2026" },
  { id: "USR-9804", name: "David Vance", email: "vance@nexus.com", plan: "Starter Free", mrr: "$0/mo", status: "Inactive", joined: "Apr 10, 2026" },
];

const mockSupportTickets = [
  { id: "TCK-401", user: "Stratus Tech", subject: "Custom Swiss QR Bill SVG styling issue", priority: "Urgent", status: "Open", time: "12m ago" },
  { id: "TCK-402", user: "Orbit Collective", subject: "Webhook integration payload delay", priority: "Normal", status: "In Progress", time: "1h ago" },
  { id: "TCK-403", user: "Nexus Studios", subject: "VAT Reverse charge invoice template question", priority: "Low", status: "Resolved", time: "3h ago" },
];

const mockSystemAuditLogs = [
  { id: "LOG-8801", event: "User Authentication", detail: "Admin Marc logged in via OAuth 2.0", ip: "185.220.101.5", time: "2 minutes ago" },
  { id: "LOG-8802", event: "API Secret Key Generated", detail: "Tenant USR-9801 issued sk_live_inv_***", ip: "185.220.101.89", time: "14 minutes ago" },
  { id: "LOG-8803", event: "Subscription Upgraded", detail: "BaselTech upgraded from Pro to Enterprise", ip: "194.230.145.1", time: "42 minutes ago" },
];

function AdminPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme());
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "users" | "subscriptions" | "support" | "analytics" | "revenue" | "health" | "activity"
  >("dashboard");
  const [userSearchQuery, setUserSearchQuery] = useState("");

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

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white">
      {/* 3D WebGL Canvas Background */}
      <ThreeBackground />

      {/* Top Navigation Bar */}
      <AppNavbar />

      {/* Main Page Area */}
      <div className="relative pt-28 pb-16 z-10">
        <div className="max-w-container-max mx-auto px-margin-desktop space-y-12">
          {/* Header Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-sm font-medium">
                <ShieldAlert className="w-4 h-4" /> Executive Telemetry &amp; System Command Center
              </div>
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                Admin <span className="drawing-text italic">Command Panel.</span>
              </h1>
              <p className="text-muted-foreground font-body text-lg">
                Monitor MRR growth, tenant activity, infrastructure telemetry, support queues, and audit logs.
              </p>
            </div>

            <button
              onClick={() => toast.success("System telemetry report exported.")}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-headline text-base font-bold shadow-xl shadow-primary/25 hover:scale-105 transition-all flex items-center gap-2 btn-premium self-start lg:self-center"
            >
              <Download className="w-5 h-5" /> Export Audit Ledger
            </button>
          </div>

          {/* Admin Navigation Tabs (8 Modules) */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-3xl bg-card/80 border border-border/80 shadow-2xl backdrop-blur-xl">
            {[
              { id: "dashboard", label: "Dashboard", icon: Activity },
              { id: "users", label: "Users & Tenants", icon: Users },
              { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
              { id: "support", label: "Support Tickets", icon: Headphones },
              { id: "analytics", label: "Growth Analytics", icon: TrendingUp },
              { id: "revenue", label: "Revenue & MRR", icon: DollarSign },
              { id: "health", label: "System Health", icon: Server },
              { id: "activity", label: "Audit Logs", icon: ShieldAlert },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[130px] py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Module 1: Admin Overview Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Executive KPI Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-2xl hover:-translate-y-1 transition-transform">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Monthly Recurring Revenue</span>
                    <DollarSign className="w-5 h-5 text-success" />
                  </div>
                  <div className="font-headline text-3xl font-black text-foreground">$84,200.00</div>
                  <p className="text-xs text-success font-bold mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +24.8% MoM Growth
                  </p>
                </div>

                <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-2xl hover:-translate-y-1 transition-transform">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Active Tenants</span>
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="font-headline text-3xl font-black text-foreground">1,420</div>
                  <p className="text-xs text-primary font-bold mt-1">+140 New this month</p>
                </div>

                <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-2xl hover:-translate-y-1 transition-transform">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase text-muted-foreground">System Uptime</span>
                    <Server className="w-5 h-5 text-success" />
                  </div>
                  <div className="font-headline text-3xl font-black text-foreground">99.99%</div>
                  <p className="text-xs text-success font-bold mt-1">Zurich Data Center OK</p>
                </div>

                <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-2xl hover:-translate-y-1 transition-transform">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Open Support Tickets</span>
                    <Headphones className="w-5 h-5 text-warning" />
                  </div>
                  <div className="font-headline text-3xl font-black text-foreground">3</div>
                  <p className="text-xs text-warning font-bold mt-1">Avg response 4m</p>
                </div>
              </div>

              {/* Chart & Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                  <h3 className="font-headline text-2xl font-bold text-foreground">ARR &amp; MRR Acceleration Curve</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueAnalyticsData}>
                      <defs>
                        <linearGradient id="adminMrrGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                      <Tooltip contentStyle={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "1rem" }} />
                      <Area type="monotone" dataKey="mrr" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#adminMrrGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="lg:col-span-4 glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                  <h3 className="font-headline text-xl font-bold text-foreground">Plan Tier Distribution</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={planDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={45}>
                        {planDistributionData.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "1rem" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Module 2: Users Management Table */}
          {activeTab === "users" && (
            <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border">
                <div>
                  <h3 className="font-headline text-2xl font-bold text-foreground">Registered User Directory</h3>
                  <p className="text-xs text-muted-foreground">Manage active accounts, plan tiers, and permissions</p>
                </div>
                <Input
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search user by name or email..."
                  className="rounded-full text-xs w-64"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">User ID</th>
                      <th className="py-3 px-4">Name &amp; Email</th>
                      <th className="py-3 px-4">Plan Tier</th>
                      <th className="py-3 px-4">MRR</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {mockUsersList.map((u) => (
                      <tr key={u.id} className="hover:bg-card/60 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-foreground">{u.id}</td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-foreground">{u.name}</div>
                          <div className="text-[11px] text-muted-foreground">{u.email}</div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary" className="font-bold text-[10px]">{u.plan}</Badge>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-foreground">{u.mrr}</td>
                        <td className="py-4 px-4">
                          <Badge variant="default" className={u.status === "Active" ? "bg-success text-white" : "bg-muted text-muted-foreground"}>
                            {u.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">{u.joined}</td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => toast.info(`Impersonating ${u.name}...`)}
                            className="px-3 py-1.5 rounded-full border border-border text-[10px] font-bold hover:bg-primary hover:text-white transition-colors"
                          >
                            Impersonate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 3: Subscriptions */}
          {activeTab === "subscriptions" && (
            <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <h3 className="font-headline text-2xl font-bold text-foreground">Subscriptions Ledger</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="p-6 rounded-2xl bg-card border border-border space-y-2">
                  <span className="text-muted-foreground block font-bold">Pro Studio ($29/mo)</span>
                  <div className="font-headline text-3xl font-black text-foreground">920 Tenants</div>
                  <p className="text-success font-bold">$26,680.00 Monthly MRR</p>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-border space-y-2">
                  <span className="text-muted-foreground block font-bold">Enterprise Ultra ($99/mo)</span>
                  <div className="font-headline text-3xl font-black text-foreground">280 Tenants</div>
                  <p className="text-primary font-bold">$27,720.00 Monthly MRR</p>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-border space-y-2">
                  <span className="text-muted-foreground block font-bold">Starter Free</span>
                  <div className="font-headline text-3xl font-black text-foreground">220 Tenants</div>
                  <p className="text-muted-foreground font-bold">Freemium Tier</p>
                </div>
              </div>
            </div>
          )}

          {/* Module 4: Support Tickets Queue */}
          {activeTab === "support" && (
            <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <h3 className="font-headline text-2xl font-bold text-foreground">Customer Support Queue</h3>
              <div className="space-y-4">
                {mockSupportTickets.map((t) => (
                  <div key={t.id} className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="font-bold text-foreground text-sm flex items-center gap-2">
                        <span>{t.subject}</span>
                        <Badge variant={t.priority === "Urgent" ? "destructive" : "secondary"}>{t.priority}</Badge>
                      </div>
                      <div className="text-muted-foreground">{t.user} • Ticket {t.id} • {t.time}</div>
                    </div>
                    <button
                      onClick={() => toast.success(`Responding to ticket ${t.id}`)}
                      className="px-4 py-2 rounded-full bg-primary text-white font-bold text-xs btn-premium"
                    >
                      Respond
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module 5: Growth Analytics */}
          {activeTab === "analytics" && (
            <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <h3 className="font-headline text-2xl font-bold text-foreground">Growth Velocity &amp; Cohort Retentions</h3>
              <p className="text-xs text-muted-foreground">User conversion rate is currently 84.2% from free trial to paid tier.</p>
            </div>
          )}

          {/* Module 6: Revenue Ledger */}
          {activeTab === "revenue" && (
            <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <h3 className="font-headline text-2xl font-bold text-foreground">Revenue Breakdown &amp; ARR Projection</h3>
              <div className="font-mono text-3xl font-black text-foreground">$1,010,400.00 ARR Projected</div>
            </div>
          )}

          {/* Module 7: System Health */}
          {activeTab === "health" && (
            <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                <Server className="w-6 h-6 text-success" /> Infrastructure Telemetry
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
                  <div className="font-bold text-foreground">CPU Utilization</div>
                  <div className="font-mono text-2xl font-black text-primary">18.4%</div>
                  <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[18%]" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
                  <div className="font-bold text-foreground">RAM Memory</div>
                  <div className="font-mono text-2xl font-black text-success">4.2 GB / 16 GB</div>
                  <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                    <div className="bg-success h-full w-[26%]" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
                  <div className="font-bold text-foreground">Redis Cache Hit Ratio</div>
                  <div className="font-mono text-2xl font-black text-primary">99.4%</div>
                  <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[99%]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module 8: Audit Activity Logs */}
          {activeTab === "activity" && (
            <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <h3 className="font-headline text-2xl font-bold text-foreground">System Audit Activity Stream</h3>
              <div className="space-y-3 text-xs">
                {mockSystemAuditLogs.map((l) => (
                  <div key={l.id} className="p-4 rounded-2xl bg-card border border-border flex justify-between items-center">
                    <div>
                      <div className="font-bold text-foreground text-sm">{l.event}</div>
                      <div className="text-muted-foreground">{l.detail}</div>
                    </div>
                    <div className="font-mono text-right text-muted-foreground">
                      <div>{l.ip}</div>
                      <div className="text-[10px]">{l.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-card border-t border-border mt-16">
        <div className="max-w-container-max mx-auto px-margin-desktop py-8 text-center text-muted-foreground text-xs tracking-widest uppercase font-bold">
          © 2026 Invoisen AI Admin Console. All rights reserved. Precision-engineered in Zurich.
        </div>
      </footer>
    </div>
  );
}
