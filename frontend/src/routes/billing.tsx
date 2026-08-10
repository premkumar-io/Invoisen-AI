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
import { AppFooter } from "@/components/AppFooter";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getInitialTheme, setTheme, themeNames, type ThemeName } from "@/lib/theme";
import { getAuthToken } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";

import { getRegionalPricing } from "@/lib/pricing";
import { processRazorpayPayment } from "@/lib/razorpay";

export const Route = createFileRoute("/billing")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getAuthToken()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({ meta: [{ title: "Billing & Subscription — Invoisen AI" }] }),
  component: BillingPage,
});

const billingHistoryList = [
  {
    id: "INV-SUB-2026-07",
    date: "Jul 01, 2026",
    plan: "Pro Plan (Monthly)",
    amount: 299,
    status: "Paid",
    card: "Visa •••• 4242",
  },
  {
    id: "INV-SUB-2026-06",
    date: "Jun 01, 2026",
    plan: "Pro Plan (Monthly)",
    amount: 299,
    status: "Paid",
    card: "Visa •••• 4242",
  },
  {
    id: "INV-SUB-2026-05",
    date: "May 01, 2026",
    plan: "Pro Plan (Monthly)",
    amount: 299,
    status: "Paid",
    card: "Visa •••• 4242",
  },
];

function BillingPage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme());
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [activeTab, setActiveTab] = useState<"plans" | "cards" | "history">("plans");

  const regionalPricing = getRegionalPricing(user?.phone, user?.country);

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

  const handlePlanChange = async (newPlan: "free" | "pro" | "enterprise") => {
    if (newPlan === "free") {
      try {
        await updateProfile({ plan: "free" });
        toast.success("Subscription updated to Free Plan!");
      } catch (err: any) {
        toast.error("Failed to update subscription", { description: err?.message });
      }
      return;
    }

    const price = newPlan === "pro" ? (billingCycle === "yearly" ? 199 : 299) : 999;
    toast.info(`Initializing Razorpay checkout for ${newPlan.toUpperCase()} plan...`);

    await processRazorpayPayment({
      amount: price,
      currency: "INR",
      plan: newPlan,
      description: `Invoisen ${newPlan.toUpperCase()} Plan Subscription`,
      prefill: {
        name: user?.fullName || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },
      onSuccess: async () => {
        await updateProfile({ plan: newPlan });
        toast.success(`🎉 Payment Successful! Welcome to ${newPlan.toUpperCase()} Plan!`, {
          description: "Razorpay payment verified. Your workspace has been upgraded.",
        });
      },
      onError: (error) => {
        toast.error("Payment Failed or Cancelled", { description: error });
      },
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
                <Sparkles className="w-4 h-4" /> Active Plan: {user?.plan ? user.plan.toUpperCase() : "PRO"}
              </div>
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                Billing &amp; <span className="drawing-text italic">Subscription.</span>
              </h1>
              <p className="text-muted-foreground font-body text-lg">
                Manage your active subscription plan, regional pricing currency, and billing receipts.
              </p>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="inline-flex p-1.5 rounded-full bg-card/80 border border-border shadow-2xl backdrop-blur-xl">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-primary text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-primary text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly Billing{" "}
                <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-[10px]">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Current Active Subscription Banner & Usage Meters */}
          <div className="glass-card p-8 rounded-3xl border border-primary/30 bg-primary/5 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline text-2xl font-bold text-foreground">
                      Pro Plan
                    </h3>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-black">
                      Full Access
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Renews on August 01, 2026 via Visa •••• 4242 ({regionalPricing.flag} {regionalPricing.regionName} Pricing)
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You have full access to all 12 Swiss &amp; AI Pro templates, unlimited AI invoice generation, signature drawing, and tax compliance suite.
              </p>
            </div>

            {/* Regional Pricing Auto-Detection Badge */}
            <div className="lg:col-span-6 flex flex-col items-start lg:items-end gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-card border border-border shadow-md">
                <span className="text-xl">{regionalPricing.flag}</span>
                <div>
                  <div className="text-xs font-bold text-foreground">
                    Regional Currency: {regionalPricing.currencyCode} ({regionalPricing.currencySymbol})
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {user?.phone ? `Matched via Phone ${user.phone}` : "Indian Region Rates (INR ₹)"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Available Launch Plans (Free vs Pro) */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline text-2xl font-bold text-foreground">
                  Available Plans
                </h2>
                <p className="text-xs text-muted-foreground">
                  Simplified launch plans designed for freelancers, studios, and agencies.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {/* 🟢 Free Plan */}
              <div className="glass-card rounded-3xl p-8 border border-border/80 shadow-xl space-y-6 flex flex-col justify-between h-full group hover:-translate-y-1 transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-headline font-bold text-2xl text-foreground flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                      Free Plan
                    </span>
                    <Badge variant="secondary" className="font-bold">
                      Starter
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-1 h-10">
                    <span className="font-headline text-5xl font-black text-foreground">
                      {regionalPricing.freePriceFormatted}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">/ month</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px] flex items-center">
                    Essential invoicing features &amp; 3 basic templates for solo creators.
                  </p>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>3 Free Basic Templates (Zurich, Stripe, Linear)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Up to 10 Invoices / Month</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Instant PDF Exports &amp; Link Sharing</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Standard Community Support</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Basic Client Directory</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handlePlanChange("free")}
                  className={`w-full py-3.5 rounded-full font-headline text-sm font-bold transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer ${
                    user?.plan === "free"
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-card border border-border text-foreground hover:bg-surface"
                  }`}
                >
                  {user?.plan === "free" ? (
                    <>
                      <span>Current Active Plan</span>
                      <Check className="w-4 h-4 text-emerald-500" />
                    </>
                  ) : (
                    <>
                      <span>Downgrade to Free</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* 🔵 Pro Plan */}
              <div className="glass-card rounded-3xl p-8 border-2 border-primary ring-2 ring-primary/40 shadow-2xl bg-primary/5 space-y-6 flex flex-col justify-between h-full group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute -top-4 right-8">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-md animate-pulse">
                    MOST POPULAR
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-headline font-bold text-2xl text-foreground flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shrink-0"></span>
                      Pro Plan
                    </span>
                    <Badge variant="default" className="font-bold bg-amber-500 text-black">
                      Full Access
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-1 h-10">
                    <span className="font-headline text-5xl font-black text-foreground">
                      {billingCycle === "yearly"
                        ? regionalPricing.proAnnualFormatted
                        : regionalPricing.proMonthlyFormatted}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">/ month</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px] flex items-center">
                    {regionalPricing.flag} {regionalPricing.regionName} rates applied ({regionalPricing.currencyCode}). Unlocks all 12 templates.
                  </p>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-bold text-amber-500">
                      <Check className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Unlocks All 12 Pro &amp; Swiss Templates</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>Unlimited AI Invoice Generation</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>Autonomous Client Intelligence &amp; Branding</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>Global Tax Compliance Suite</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>24/7 Priority Support</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handlePlanChange("pro")}
                  className={`w-full py-3.5 rounded-full font-headline text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 mt-6 cursor-pointer btn-premium ${
                    user?.plan === "pro" || !user?.plan
                      ? "bg-primary text-white"
                      : "bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white hover:opacity-90"
                  }`}
                >
                  {user?.plan === "pro" || !user?.plan ? (
                    <>
                      <span>Current Active Plan</span>
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Upgrade to Pro</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* 🟣 Enterprise Plan */}
              <div className="glass-card rounded-3xl p-8 border border-border/80 shadow-xl space-y-6 flex flex-col justify-between h-full group hover:-translate-y-1 transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-headline font-bold text-2xl text-foreground flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-purple-500 inline-block shrink-0"></span>
                      Enterprise
                    </span>
                    <Badge variant="secondary" className="font-bold">
                      Custom
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-1 h-10">
                    <span className="font-headline text-3xl sm:text-4xl font-black text-foreground">
                      Custom
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">/ pricing</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px] flex items-center">
                    Custom multi-team deployment, dedicated API webhooks, &amp; SLA.
                  </p>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>Everything Included in Pro Plan</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>Unlimited Seats &amp; Multi-Team Access</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>Dedicated API &amp; Webhooks Integration</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>Dedicated Account Manager &amp; SLA</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>24/7 Priority Concierge Support</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handlePlanChange("enterprise")}
                  className={`w-full py-3.5 rounded-full font-headline text-sm font-bold transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer ${
                    user?.plan === "enterprise"
                      ? "bg-purple-600 text-white"
                      : "bg-card border border-border text-foreground hover:bg-surface"
                  }`}
                >
                  {user?.plan === "enterprise" ? (
                    <>
                      <span>Current Active Plan</span>
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Contact Sales / Upgrade to Enterprise</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
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
                  <span className="font-headline font-bold text-sm tracking-widest uppercase text-white/80">
                    INVOISEN PRO
                  </span>
                  <span className="text-xs font-bold text-amber-400">GOLD VIP</span>
                </div>

                <div className="w-10 h-7 rounded-md bg-amber-400/80 border border-amber-300 shadow-inner flex items-center justify-center">
                  <div className="w-6 h-4 border border-amber-600/50 rounded-sm" />
                </div>

                <div>
                  <div className="font-mono text-lg tracking-widest text-white/90">
                    •••• •••• •••• 4242
                  </div>
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
                      <div className="text-muted-foreground font-mono">
                        {rec.id} • {rec.date}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-foreground">
                          ₹{rec.amount.toFixed(2)}
                        </div>
                        <Badge
                          variant="default"
                          className="bg-success text-white text-[9px] font-bold"
                        >
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
      <AppFooter />
    </div>
  );
}
