import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  CheckCircle2,
  Building2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { AppFooter } from "@/components/AppFooter";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { getRegionalPricing } from "@/lib/pricing";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Choose Your Plan — Welcome to Invoisen AI" }] }),
  component: WelcomePlanPage,
});

function WelcomePlanPage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [selectedPlan, setSelectedPlan] = useState<"free" | "pro" | "enterprise">(user?.plan as any || "pro");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const welcomeName = user?.displayName || (user?.fullName ? user.fullName.split(' ')[0] : "");
    toast.success(welcomeName ? `🎉 Welcome to Invoisen AI, ${welcomeName}!` : "🎉 Welcome to Invoisen AI!", {
      description: "Let's activate your workspace and select your invoicing plan.",
      duration: 5000,
    });
  }, [user?.fullName, user?.displayName]);

  const regionalPricing = getRegionalPricing(user?.phone, user?.country);

  const handleSelectPlan = async (plan: "free" | "pro" | "enterprise") => {
    setIsSubmitting(true);
    try {
      await updateProfile({ plan });
      if (plan === "pro") {
        toast.success("✨ Pro Plan Activated!", {
          description: "Welcome to Invoisen AI. All 12 Pro templates are now unlocked.",
        });
      } else if (plan === "free") {
        toast.success("Free Starter Plan Activated", {
          description: "You can upgrade to Pro anytime from billing.",
        });
      } else {
        toast.success("Enterprise Interest Recorded", {
          description: "Our concierge team will reach out shortly.",
        });
      }
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error("Error setting plan", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white flex flex-col justify-between">
      {/* 3D Canvas Background */}
      <ThreeBackground />

      {/* App Navbar */}
      <AppNavbar />

      {/* Main Content Area */}
      <div className="relative pt-28 pb-16 z-10 max-w-container-max mx-auto px-margin-desktop w-full space-y-12 flex-1">
        {/* Step Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Step 1 of 2 • Activate Your Workspace
          </div>
          <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
            Select Your <span className="drawing-text italic">Invoicing Plan.</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg font-body leading-relaxed max-w-2xl mx-auto">
            Choose the plan that fits your business. Upgrade to Pro (unlocks all 12 templates &amp; AI features) or select the free starter tier.
          </p>

          {/* Regional Currency Badge */}
          <div className="pt-2 inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-card/80 border border-border shadow-lg backdrop-blur-md">
            <span className="text-lg">{regionalPricing.flag}</span>
            <div className="text-left text-xs">
              <span className="font-bold text-foreground">
                Regional Currency: {regionalPricing.currencyCode} ({regionalPricing.currencySymbol})
              </span>
              <p className="text-[10px] text-muted-foreground">
                {user?.phone ? `Matched via Phone ${user.phone}` : "Indian Region Rates (INR ₹)"}
              </p>
            </div>
          </div>



          {/* Monthly vs Yearly Toggle */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex p-1.5 rounded-full bg-card/80 border border-border shadow-xl backdrop-blur-xl">
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
                <span>Yearly Billing</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {/* 🟢 Free Plan */}
          <div className="glass-card rounded-3xl p-8 border border-border/80 shadow-xl space-y-6 flex flex-col justify-between h-full group hover:-translate-y-1 transition-all duration-300 bg-card/60 backdrop-blur-xl">
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
              </div>
            </div>

            <button
              disabled={isSubmitting}
              onClick={() => handleSelectPlan("free")}
              className="w-full py-4 rounded-full font-headline text-sm font-bold bg-card border border-border text-foreground hover:bg-surface transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
            >
              <span>Continue with Free Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 🔵 Pro Plan (RECOMMENDED / MOST POPULAR) */}
          <div className="glass-card rounded-3xl p-8 border-2 border-primary ring-4 ring-primary/20 shadow-2xl bg-primary/5 space-y-6 flex flex-col justify-between h-full group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden backdrop-blur-xl">
            <div className="bg-gradient-to-r from-amber-500 via-primary to-purple-600 text-white px-4 py-2 text-[10px] font-black tracking-widest uppercase shadow-md flex items-center justify-center gap-1.5 rounded-t-2xl -mx-8 -mt-8 mb-1">
              <Sparkles className="w-3.5 h-3.5 fill-white shrink-0" /> MOST POPULAR • RECOMMENDED
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex justify-between items-center">
                <span className="font-headline font-bold text-2xl text-foreground flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shrink-0 animate-pulse"></span>
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

              <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px] flex items-center font-medium">
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
              disabled={isSubmitting}
              onClick={() => handleSelectPlan("pro")}
              className="w-full py-4 rounded-full font-headline text-sm font-bold bg-primary text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2 mt-6 cursor-pointer btn-premium"
            >
              <span>Get Started with Pro</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 🟣 Enterprise Plan */}
          <div className="glass-card rounded-3xl p-8 border border-border/80 shadow-xl space-y-6 flex flex-col justify-between h-full group hover:-translate-y-1 transition-all duration-300 bg-card/60 backdrop-blur-xl">
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
              </div>
            </div>

            <button
              disabled={isSubmitting}
              onClick={() => handleSelectPlan("enterprise")}
              className="w-full py-4 rounded-full font-headline text-sm font-bold bg-card border border-border text-foreground hover:bg-surface transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
            >
              <span>Contact Sales</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Direct Skip Link */}
        <div className="text-center pt-4">
          <button
            onClick={() => handleSelectPlan("free")}
            className="text-xs text-muted-foreground hover:text-foreground font-medium underline-offset-4 hover:underline transition-all cursor-pointer"
          >
            Skip for now and continue with Free Plan →
          </button>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
