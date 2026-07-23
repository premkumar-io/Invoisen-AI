import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Building2, FileText, CreditCard } from "lucide-react";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome to Invoisen Pro — Invoisen AI" }] }),
  component: WelcomePage,
});

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white flex flex-col justify-between">
      <ThreeBackground />
      <AppNavbar />

      <div className="relative pt-28 pb-16 z-10 max-w-container-max mx-auto px-margin-desktop w-full grid lg:grid-cols-12 gap-12 items-center flex-1">
        <div className="lg:col-span-6 max-w-xl mx-auto w-full">
          <div className="glass-card p-8 md:p-10 rounded-3xl border border-border/80 shadow-2xl space-y-8 relative overflow-hidden backdrop-blur-xl">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-success/10 text-success font-label text-xs font-bold border border-success/20">
                <CheckCircle2 className="w-4 h-4" />
                <span>Account Activated • Pro Trial Active</span>
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                Welcome to <span className="drawing-text italic">Invoisen Pro!</span>
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed font-body">
                Your AI billing workspace is live. Complete these 3 quick steps to automate your agency's financial operations.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-card/60 border border-border/80 hover:border-primary/50 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-foreground text-sm">1. Configure Agency Profile</h3>
                  <p className="text-xs text-muted-foreground">Upload your brand logo, tax ID, and custom Swiss typography preferences.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-card/60 border border-border/80 hover:border-primary/50 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-foreground text-sm">2. Create First AI Invoice</h3>
                  <p className="text-xs text-muted-foreground">Use AI client enrichment to automatically generate line items and vector PDF exports.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-card/60 border border-border/80 hover:border-primary/50 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-foreground text-sm">3. Connect Stripe Payment Sync</h3>
                  <p className="text-xs text-muted-foreground">Enable instant payouts and automated payment reminders for late invoices.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="flex-1 py-4 rounded-full bg-primary text-white font-headline text-sm font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 btn-premium"
              >
                Go to App Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 hidden lg:block relative h-[540px] rounded-3xl overflow-hidden border border-border/80 shadow-2xl glass-card">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-background/40 to-transparent z-10 flex flex-col justify-center p-12 space-y-6">
            <div className="space-y-4">
              <div className="font-headline font-bold text-3xl text-foreground">
                Next Generation Invoicing Software
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Thank you for choosing Invoisen AI. Our neural network processes client information and generates compliant Swiss invoices in seconds.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="w-full bg-card border-t border-border mt-auto z-20">
        <div className="max-w-container-max mx-auto px-margin-desktop py-6 text-center text-muted-foreground text-xs tracking-widest uppercase font-bold">
          © 2026 Invoisen AI. All rights reserved. Precision-engineered in Zurich.
        </div>
      </footer>
    </div>
  );
}
