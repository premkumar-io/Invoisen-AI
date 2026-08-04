import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Lock,
  Eye,
  ArrowLeft,
  CheckCircle2,
  Database,
  Key,
  Globe2,
  Clock,
  ChevronRight,
  Server,
  FileSpreadsheet,
} from "lucide-react";
import { AppNavbar } from "@/components/AppNavbar";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Invoisen AI" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const privacySections = [
    { id: "collection", title: "1. Information We Collect" },
    { id: "usage", title: "2. How We Use Your Data" },
    { id: "ai-privacy", title: "3. AI Processing & Confidentiality" },
    { id: "security", title: "4. Encryption & Security Infrastructure" },
    { id: "sharing", title: "5. Third-Party Services & Integrations" },
    { id: "cookies", title: "6. Cookies & Session Storage" },
    { id: "rights", title: "7. Your Data Rights & GDPR/CCPA Rights" },
    { id: "retention", title: "8. Retention & Account Erasure" },
    { id: "contact", title: "9. Privacy Officer Contact" },
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
        <div className="glass-card p-8 sm:p-10 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-card/90 via-card/60 to-emerald-500/5 shadow-2xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data Protection Guarantee</span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
            At <strong className="text-foreground font-bold">Invoisen AI</strong>, your privacy and business confidentiality are paramount. This policy details how we handle your personal identity, invoice records, financial statistics, and AI interactions with complete transparency and bank-grade security.
          </p>

          {/* Privacy Value Props */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { icon: Lock, label: "AES-256 Encryption" },
              { icon: Eye, label: "Zero Data Selling" },
              { icon: Database, label: "Private DB Storage" },
              { icon: Server, label: "Isolated AI Context" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-2xl bg-background/60 border border-border/50 text-xs font-semibold text-foreground shadow-sm"
              >
                <item.icon className="w-4 h-4 text-emerald-500 shrink-0" />
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
              Privacy Outline
            </h3>
            <nav className="space-y-1">
              {privacySections.map((sec) => (
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

          {/* Detailed Policy Content */}
          <div className="lg:col-span-3 space-y-8 glass-card p-6 sm:p-10 rounded-3xl border border-border/80 bg-card/90 shadow-xl">
            {/* Section 1 */}
            <section id="collection" className="space-y-3 border-b border-border/60 pb-6">
              <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-500" />
                1. Information We Collect
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To provide invoicing, automated tax calculation, and profile synchronization, we collect:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2">
                <li><strong className="text-foreground">Identity Data:</strong> Full name, display name, account email, phone number, avatar image, time zone, and language.</li>
                <li><strong className="text-foreground">Business Data:</strong> Company name, GSTIN/Tax ID, business email, physical address, and bank/UPI payment details.</li>
                <li><strong className="text-foreground">Financial &amp; Invoice Data:</strong> Client profiles, item descriptions, rates, quantities, tax computations, and payment status history.</li>
                <li><strong className="text-foreground">Authentication Data:</strong> Encrypted password hashes, Google Sign-In tokens, and 6-digit Email &amp; Phone OTP records.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section id="usage" className="space-y-3 border-b border-border/60 pb-6">
              <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                2. How We Use Your Data
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We process your data strictly to fulfill service functionality:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 text-xs space-y-1">
                  <p className="font-bold text-foreground">Invoice Generation</p>
                  <p className="text-muted-foreground">Formatting, PDF compilation, and dynamic tax calculation for your clients.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 text-xs space-y-1">
                  <p className="font-bold text-foreground">Account Verification</p>
                  <p className="text-muted-foreground">Enforcing secure access via Email &amp; Phone 6-digit OTP verification.</p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="ai-privacy" className="space-y-3 border-b border-border/60 pb-6">
              <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-500" />
                3. AI Processing &amp; Confidentiality
              </h2>
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>No Public Model Training Guarantee</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your business invoices, client list, and tax documents processed by the Invoisen AI Workspace are <strong className="text-foreground">NEVER used to train public foundation models</strong>. Prompts sent to Gemini API endpoints are executed in stateless, enterprise-grade isolated sessions.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section id="security" className="space-y-3 border-b border-border/60 pb-6">
              <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-500" />
                4. Encryption &amp; Security Infrastructure
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All network communications enforce TLS 1.3 encryption. MongoDB databases utilize AES-256 encryption at rest. Sensitive fields such as passwords and verification codes are hashed using bcrypt before storage.
              </p>
            </section>

            {/* Section 5 */}
            <section id="sharing" className="space-y-3 border-b border-border/60 pb-6">
              <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-emerald-500" />
                5. Third-Party Services &amp; Integrations
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We do not sell, rent, or trade your personal or business data to advertisers. We share data only with necessary service providers:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2">
                <li>Google OAuth (for Google Sign-In authentication)</li>
                <li>MongoDB Atlas (secure cloud database infrastructure)</li>
                <li>Gemini API (stateless AI document parsing and tax assistant)</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="cookies" className="space-y-3 border-b border-border/60 pb-6">
              <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-500" />
                6. Cookies &amp; Session Storage
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Invoisen AI uses local browser storage and essential HTTP cookies exclusively to maintain your active authentication session and store user preferences (such as dark/light theme). We do not use intrusive third-party tracking cookies.
              </p>
            </section>

            {/* Section 7 */}
            <section id="rights" className="space-y-3 border-b border-border/60 pb-6">
              <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                7. Your Data Rights (GDPR / CCPA / DPDP Compliance)
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Depending on your location, you have statutory rights regarding your data:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-background border border-border/60 text-xs space-y-1">
                  <p className="font-bold text-foreground">Right to Export</p>
                  <p className="text-muted-foreground">Download all profile &amp; invoice data in JSON format.</p>
                </div>
                <div className="p-3 rounded-2xl bg-background border border-border/60 text-xs space-y-1">
                  <p className="font-bold text-foreground">Right to Rectify</p>
                  <p className="text-muted-foreground">Update profile name, email, phone, and time zone anytime in Settings.</p>
                </div>
                <div className="p-3 rounded-2xl bg-background border border-border/60 text-xs space-y-1">
                  <p className="font-bold text-foreground">Right to Erasure</p>
                  <p className="text-muted-foreground">Permanently delete your account and remove all data from MongoDB.</p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="retention" className="space-y-3 border-b border-border/60 pb-6">
              <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" />
                8. Retention &amp; Account Erasure
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your data is stored for as long as your account remains active. Upon triggering account deletion, all user profile documents, settings, customer ledgers, and invoice records are permanently purged within 30 days.
              </p>
            </section>

            {/* Section 9 */}
            <section id="contact" className="space-y-3">
              <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                9. Data Protection Officer Contact
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For privacy inquiries, data export requests, or security audit reports, contact our Data Protection Officer:
              </p>
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Invoisen Data Privacy Office</p>
                  <p className="text-xs text-muted-foreground font-mono">privacy@invoisen.ai | dpo@invoisen.ai</p>
                </div>
                <Link
                  to="/terms"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 hover:underline"
                >
                  <span>Terms of Service</span>
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
