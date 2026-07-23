import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  CreditCard,
  Check,
  Zap,
  Sparkles,
  Download,
  ShieldCheck,
  Plus,
  Clock,
  ArrowRight,
  TrendingUp,
  Sliders,
  DollarSign,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getInitialTheme, setTheme, themeNames, type ThemeName } from "@/lib/theme";
import { getAuthToken } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/billing")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getAuthToken()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({ meta: [{ title: "Billing & Subscription — Invoisen AI" }] }),
  component: BillingPage,
});

const pricingPlans = [
  {
    id: "starter",
    name: "Starter Free",
    priceMonthly: 0,
    priceYearly: 0,
    description: "Essential AI invoice generation for freelancers and solo builders.",
    features: ["5 Invoices per Month", "Standard PDF Export", "Basic Client Directory", "Community Support"],
    badge: "Free",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro Studio",
    priceMonthly: 29,
    priceYearly: 24,
    description: "Unlimited invoices, 5 Swiss templates, AI research, and 3D preview engine.",
    features: [
      "Unlimited Invoice Generation",
      "5 Precision Swiss Templates",
      "AI Client Entity Research",
      "Signature Pad (Draw/Type/Upload)",
      "Automated Email Reminders",
      "Vector PDF Export Engine",
    ],
    badge: "Most Popular",
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise Ultra",
    priceMonthly: 99,
    priceYearly: 79,
    description: "Custom AI fine-tuning, multi-currency wire routing, and dedicated 24/7 SLA.",
    features: [
      "Everything in Pro Studio",
      "Dedicated Fine-Tuned AI Model",
      "Custom Domain & Branding",
      "Multi-Bank Wire Routing",
      "Audit Compliance Reports",
      "Dedicated 24/7 SLA Support",
    ],
    badge: "Enterprise",
    highlight: false,
  },
];

const billingHistoryList = [
  { id: "INV-SUB-2026-07", date: "Jul 01, 2026", plan: "Pro Studio (Monthly)", amount: 29.0, status: "Paid", card: "Visa •••• 4242" },
  { id: "INV-SUB-2026-06", date: "Jun 01, 2026", plan: "Pro Studio (Monthly)", amount: 29.0, status: "Paid", card: "Visa •••• 4242" },
  { id: "INV-SUB-2026-05", date: "May 01, 2026", plan: "Pro Studio (Monthly)", amount: 29.0, status: "Paid", card: "Visa •••• 4242" },
];

function BillingPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme());
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [activeTab, setActiveTab] = useState<"plans" | "cards" | "history">("plans");

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

  const handleUpgrade = (planName: string) => {
    toast.success(`Subscription upgraded to ${planName}!`, {
      description: "Receipt sent to your registered email.",
    });
  };

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white">
      {/* 3D WebGL Background Canvas */}
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
                <Sparkles className="w-4 h-4" /> Active Plan: PRO STUDIO ACTIVE
              </div>
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                Billing &amp; <span className="drawing-text italic">Subscription.</span>
              </h1>
              <p className="text-muted-foreground font-body text-lg">
                Manage your active plan, payment cards, billing receipts, and usage quotas.
              </p>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="inline-flex p-1.5 rounded-full bg-card/80 border border-border shadow-2xl backdrop-blur-xl">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                  billingCycle === "monthly" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === "yearly" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly Billing <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-[10px]">Save 20%</span>
              </button>
            </div>
          </div>

          {/* Current Active Subscription Banner & Usage Meters */}
          <div className="glass-card p-8 rounded-3xl border border-primary/30 bg-primary/5 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-black shadow-lg shadow-primary/30">
                  ⚡
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-bold text-foreground">Pro Studio Plan</h3>
                  <p className="text-xs text-muted-foreground">Renews on August 01, 2026 via Visa •••• 4242</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Your subscription includes unlimited invoice creation, Swiss template engine, AI entity research, and vector exports.
              </p>
            </div>

            {/* Quota Progress Meters */}
            <div className="lg:col-span-6 space-y-4 border-t lg:border-t-0 lg:border-l border-border/80 lg:pl-8 pt-4 lg:pt-0">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">Monthly Invoices Created</span>
                  <span className="text-primary font-mono">46 / Unlimited</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-surface overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[35%]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">AI Research Queries</span>
                  <span className="text-primary font-mono">128 / 500 Used</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-surface overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full w-[25%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Gallery */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="font-headline text-3xl font-bold text-foreground">Subscription Plans</h2>
              <p className="text-sm text-muted-foreground">Choose the plan tailored for your finance workflow</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`glass-card rounded-3xl p-8 border transition-all duration-500 space-y-6 relative overflow-hidden flex flex-col justify-between group hover:-translate-y-2 ${
                    plan.highlight
                      ? "border-primary ring-2 ring-primary/40 shadow-2xl scale-[1.02] bg-primary/5"
                      : "border-border/80 hover:border-primary/50 shadow-xl"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-headline font-bold text-2xl text-foreground">{plan.name}</span>
                      <Badge variant={plan.highlight ? "default" : "secondary"} className="font-bold">
                        {plan.badge}
                      </Badge>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="font-headline text-5xl font-black text-foreground">
                        ${billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground">/ month</span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>

                    <div className="space-y-2.5 pt-4 border-t border-border">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                          <Check className="w-4 h-4 text-success shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpgrade(plan.name)}
                    className={`w-full py-4 rounded-full font-headline text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 mt-6 ${
                      plan.highlight
                        ? "bg-primary text-white hover:scale-105 btn-premium"
                        : "bg-card border border-border text-foreground hover:bg-surface"
                    }`}
                  >
                    {plan.id === "pro" ? "Current Plan" : "Upgrade Plan"} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Payment Cards & Billing History */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 3D Credit Card Preview */}
            <div className="lg:col-span-5 glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <h3 className="font-headline text-xl font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> Saved Payment Method
                </h3>
                <Badge variant="secondary">Primary</Badge>
              </div>

              {/* 3D Metallic Glass Credit Card Visual */}
              <div className="w-full h-48 rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-purple-900 p-6 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/20 transform hover:rotate-1 hover:scale-[1.02] transition-all duration-500">
                <div className="flex justify-between items-center">
                  <span className="font-headline font-bold text-sm tracking-widest uppercase text-white/80">INVOISEN PRO</span>
                  <span className="text-xs font-bold text-amber-400">GOLD VIP</span>
                </div>

                <div className="w-10 h-7 rounded-md bg-amber-400/80 border border-amber-300 shadow-inner flex items-center justify-center">
                  <div className="w-6 h-4 border border-amber-600/50 rounded-sm" />
                </div>

                <div>
                  <div className="font-mono text-lg tracking-widest text-white/90">•••• •••• •••• 4242</div>
                  <div className="flex justify-between items-center text-[10px] uppercase text-white/70 mt-2 font-mono">
                    <span>Sarah Chen</span>
                    <span>EXP 08/29</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => toast.info("Payment method modal opened.")}
                className="w-full py-3 rounded-full border border-border text-foreground font-bold text-xs hover:bg-card transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Backup Card
              </button>
            </div>

            {/* Billing Receipts History Table */}
            <div className="lg:col-span-7 glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <h3 className="font-headline text-xl font-bold text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Billing Receipts History
                </h3>
                <span className="text-xs text-muted-foreground font-mono">Tax Invoices</span>
              </div>

              <div className="space-y-3">
                {billingHistoryList.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-2xl bg-card/60 border border-border/70 flex items-center justify-between hover:border-primary/40 transition-colors shadow-sm text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-foreground text-sm">{rec.plan}</div>
                      <div className="text-muted-foreground font-mono">{rec.id} • {rec.date}</div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-foreground">${rec.amount.toFixed(2)}</div>
                        <Badge variant="default" className="bg-success text-white text-[9px] font-bold">
                          {rec.status}
                        </Badge>
                      </div>
                      <button
                        onClick={() => toast.success(`Receipt ${rec.id} downloaded.`)}
                        className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors"
                        title="Download Receipt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
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
