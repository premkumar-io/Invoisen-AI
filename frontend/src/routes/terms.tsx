import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  Shield,
  Scale,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Building2,
  Sparkles,
  HelpCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { AppNavbar } from "@/components/AppNavbar";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — Invoisen AI" }] }),
  component: TermsPage,
});

function TermsPage() {
  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "accounts", title: "2. Account Registration & Verification" },
    { id: "ai-services", title: "3. AI Workspace & Invoicing Accuracy" },
    { id: "payments", title: "4. Billing, Subscriptions & Taxes" },
    { id: "ip", title: "5. Intellectual Property & Data Ownership" },
    { id: "prohibited", title: "6. Prohibited Uses & Compliance" },
    { id: "limitation", title: "7. Limitation of Liability" },
    { id: "termination", title: "8. Termination & Suspensions" },
    { id: "contact", title: "9. Governing Law & Contact" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      <AppNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors bg-card/60 px-3.5 py-2 rounded-xl border border-border/60 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Signup</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>Last Updated: July 30, 2026</span>
          </div>
        </div>

        {/* Hero Banner Header */}
        <div className="glass-card p-8 sm:p-10 rounded-3xl border border-primary/20 bg-gradient-to-br from-card/90 via-card/60 to-primary/5 shadow-2xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Terms of Service
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
            Please read these Terms of Service carefully before using the <strong className="text-foreground font-bold">Invoisen AI</strong> platform, services, AI Assistants, and automated tax invoicing tools. By creating an account or accessing our services, you agree to be bound by these terms.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { icon: Shield, label: "Enterprise Security" },
              { icon: Sparkles, label: "AI Assisted Workspace" },
              { icon: CheckCircle2, label: "GST & Tax Compliant" },
              { icon: Lock, label: "Full Data Ownership" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-2xl bg-background/60 border border-border/50 text-xs font-semibold text-foreground shadow-sm"
              >
                <item.icon className="w-4 h-4 text-primary shrink-0" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Quick Jump Sidebar */}
          <aside className="lg:col-span-1 space-y-3 hidden lg:block sticky top-24 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">
              Table of Contents
            </h3>
            <nav className="space-y-1">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all border border-transparent hover:border-border/60"
                >
                  {sec.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Detailed Legal Content */}
          <div className="lg:col-span-3 space-y-8 glass-card p-6 sm:p-10 rounded-3xl border border-border/80 bg-card/90 shadow-xl">
            {/* Section 1 */}
            <section id="acceptance" className="space-y-3 border-b border-border/60 pb-6">
              <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                1. Acceptance of Terms
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By registering, accessing, or using Invoisen AI (operated by Invoisen Inc. and its affiliates), you affirm that you are at least 18 years of age or have legal authority to represent your organization. These terms constitute a legally binding agreement between you and Invoisen AI.
              </p>
            </section>

            {/* Section 2 */}
            <section id="accounts" className="space-y-3 border-b border-border/60 pb-6">
              <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                2. Account Registration & Verification
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To access features such as AI Invoice generation, customer ledger management, and tax rules calculation, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2">
                <li>Provide accurate, current, and verifiable account details (full name, email, phone number).</li>
                <li>Complete Email and Phone OTP verification when updating account credentials.</li>
                <li>Maintain the confidentiality of your account password and API keys.</li>
                <li>Promptly notify support@invoisen.ai upon discovering unauthorized access.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="ai-services" className="space-y-3 border-b border-border/60 pb-6">
              <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                3. AI Workspace & Invoicing Accuracy Disclaimer
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Invoisen AI integrates advanced LLM models (powered by Google Gemini API) to assist with invoice extraction, GST rate verification, customer messaging, and financial summaries.
              </p>
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>AI Accuracy Commitment &amp; Human Review</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  While Invoisen AI strives for over 90%+ statistical accuracy in document extraction and automated suggestions, users are responsible for final review before issuing legally binding invoices to clients or filing tax returns.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section id="payments" className="space-y-3 border-b border-border/60 pb-6">
              <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                4. Billing, Subscriptions & Taxes
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Subscription tiers (Free, Pro, Enterprise) determine invoice creation limits, team member seats, and AI API quotas. Fees are billed in advance on a recurring monthly or annual basis. All applicable taxes (including GST/VAT) are computed dynamically based on your registered business address.
              </p>
            </section>

            {/* Section 5 */}
            <section id="ip" className="space-y-3 border-b border-border/60 pb-6">
              <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                5. Intellectual Property & Data Ownership
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You retain complete, unencumbered ownership of all invoice data, client lists, company branding, logos, and financial records uploaded to Invoisen AI. Invoisen AI retains all rights to its platform software, proprietary algorithms, design tokens, and brand marks.
              </p>
            </section>

            {/* Section 6 */}
            <section id="prohibited" className="space-y-3 border-b border-border/60 pb-6">
              <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                6. Prohibited Uses & Compliance
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You agree not to use Invoisen AI for fraudulent invoicing, illegal tax evasion, issuing counterfeit receipts, automated scraping of third-party systems, or reverse engineering any part of the service.
              </p>
            </section>

            {/* Section 7 */}
            <section id="limitation" className="space-y-3 border-b border-border/60 pb-6">
              <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                7. Limitation of Liability
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, Invoisen AI shall not be liable for any indirect, incidental, special, or consequential damages resulting from lost profits, tax penalties, service interruptions, or reliance on AI-generated suggestions.
              </p>
            </section>

            {/* Section 8 */}
            <section id="termination" className="space-y-3 border-b border-border/60 pb-6">
              <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                8. Account Termination & Data Export
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You may terminate your account at any time via Settings &rarr; Download &amp; Delete Account. Invoisen AI permits you to export all your invoice data in standard JSON format before account deletion.
              </p>
            </section>

            {/* Section 9 */}
            <section id="contact" className="space-y-3">
              <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                9. Contact & Legal Notices
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you have questions or legal notices regarding these Terms of Service, please reach out to our legal team:
              </p>
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Invoisen AI Legal Department</p>
                  <p className="text-xs text-muted-foreground font-mono">legal@invoisen.ai | support@invoisen.ai</p>
                </div>
                <Link
                  to="/privacy"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <span>Privacy Policy</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
