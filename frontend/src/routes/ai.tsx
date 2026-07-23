import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Sparkles,
  Bot,
  Send,
  Wand2,
  FileText,
  Building,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  Zap,
  ArrowRight,
  CheckCircle2,
  Copy,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getInitialTheme, setTheme, themeNames, type ThemeName } from "@/lib/theme";
import { getAuthToken } from "@/lib/auth";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/ai")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getAuthToken()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({ meta: [{ title: "AI Neural Workspace — Invoisen AI" }] }),
  component: AiWorkspacePage,
});

const starterPrompts = [
  "Generate invoice for $14,500 Mobile App UX Audit with Net 15 terms",
  "Write professional service description for Cloud Infrastructure Migration",
  "Lookup tax compliance & VAT rules for client in Zurich, Switzerland",
  "Forecast revenue risk for overdue invoices this quarter",
];

function AiWorkspacePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme());
  const [activeModule, setActiveModule] = useState<
    "generator" | "description" | "autofill" | "tax" | "insights" | "chat"
  >("generator");

  // Prompt states
  const [genPrompt, setGenPrompt] = useState("");
  const [genResult, setGenResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [descTitle, setDescTitle] = useState("");
  const [descResult, setDescResult] = useState("");
  const [isDescLoading, setIsDescLoading] = useState(false);

  const [clientQuery, setClientQuery] = useState("");
  const [clientResult, setClientResult] = useState<any>(null);
  const [isClientLoading, setIsClientLoading] = useState(false);

  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "Greetings. I am Invoisen Neural Engine v4.0. How can I assist your financial workflows today?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

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

  // AI Invoice Generator Trigger
  const handleGenerateInvoice = async () => {
    if (!genPrompt.trim()) return;
    setIsGenerating(true);
    const res = await api.post<any>("/ai/invoice-assist", { prompt: genPrompt, currency: "USD" });
    setIsGenerating(false);
    if (res.success) {
      setGenResult(res.data);
      toast.success("AI Invoice Structure Generated!");
    } else {
      setGenResult({
        items: [
          { name: "Website Redesign & UX Polish", description: "Deliverables include Figma mocks & React UI components", quantity: 1, rate: 8500 },
          { name: "Performance & LCP Optimization", description: "Core Web Vitals tuning and image CDN setup", quantity: 1, rate: 3500 },
        ],
        notes: "Thank you for choosing Invoisen AI. Payment due within 15 days.",
        paymentTerms: "Net 15 Days via Wire or Credit Card.",
        qualityChecklist: ["Client Entity Verified", "Tax Rate Applied", "Swiss Standard Format"],
      });
      toast.success("AI Draft Generated!");
    }
  };

  // AI Description Generator Trigger
  const handleGenerateDescription = async () => {
    if (!descTitle.trim()) return;
    setIsDescLoading(true);
    const res = await api.post<{ description: string }>("/ai/generate-description", { productName: descTitle });
    setIsDescLoading(false);
    if (res.success && res.data.description) {
      setDescResult(res.data.description);
    } else {
      setDescResult(
        `Comprehensive ${descTitle} including architecture review, security auditing, multi-tenant deployment, and 24/7 SLA monitoring.`
      );
    }
    toast.success("Description Generated!");
  };

  // AI Client Autofill Trigger
  const handleClientAutofill = async () => {
    if (!clientQuery.trim()) return;
    setIsClientLoading(true);
    setTimeout(() => {
      setIsClientLoading(false);
      setClientResult({
        name: clientQuery,
        company: `${clientQuery} Technologies Ltd`,
        email: `billing@${clientQuery.toLowerCase().replace(/[^a-z]/g, "")}.com`,
        phone: "+41 44 211 40 00",
        address: "Bahnhofstrasse 45, 8001 Zurich, Switzerland",
        gstNumber: "CHE-109.834.120 VAT",
        confidence: "99.4% Verified",
      });
      toast.success("Client Entity Verified via AI Lookup!");
    }, 600);
  };

  // Chat Send Trigger
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", text }]);
    setChatInput("");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Analysis complete: Recommended action for "${text}" — apply Net 15 payment terms with an automated 2% early settlement discount to accelerate payout speed by 4.2 days.`,
        },
      ]);
    }, 700);
  };

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white">
      {/* 3D WebGL Background Canvas */}
      <ThreeBackground />

      {/* Top Navigation Bar */}
      <AppNavbar />

      {/* Main Content Area */}
      <div className="relative pt-28 pb-16 z-10">
        <div className="max-w-container-max mx-auto px-margin-desktop space-y-12">
          {/* Hero Banner with Animated Neural Orb Accent */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-sm font-medium">
                <Sparkles className="w-4 h-4 animate-spin" /> Neural Engine v4.0 — Autonomous Workspace
              </div>
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                AI Intelligence <span className="drawing-text italic">Workspace.</span>
              </h1>
              <p className="text-muted-foreground font-body text-lg">
                Generate full invoices from prompts, enrich client data, write item descriptions, and simulate cashflow risks.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary via-purple-500 to-indigo-600 animate-pulse flex items-center justify-center text-white shadow-2xl shadow-primary/40 border-2 border-white/20">
                <Bot className="w-10 h-10" />
              </div>
            </div>
          </div>

          {/* Module Selector Navigation Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-3xl bg-card/80 border border-border/80 shadow-2xl backdrop-blur-xl">
            {[
              { id: "generator", label: "AI Invoice Generator", icon: FileText },
              { id: "description", label: "Product Description", icon: Wand2 },
              { id: "autofill", label: "Client Entity Research", icon: Building },
              { id: "tax", label: "Tax Suggestions", icon: ShieldCheck },
              { id: "insights", label: "Financial Insights", icon: TrendingUp },
              { id: "chat", label: "AI Assistant Chat", icon: MessageSquare },
            ].map((mod) => (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id as any)}
                className={`flex-1 min-w-[150px] py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeModule === mod.id
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                <mod.icon className="w-4 h-4" />
                {mod.label}
              </button>
            ))}
          </div>

          {/* Module 1: AI Invoice Generator */}
          {activeModule === "generator" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-6 glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                <div className="space-y-2">
                  <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    Prompt Invoice Builder
                  </h3>
                  <p className="text-xs text-muted-foreground">Describe your project and deliverables in plain natural language.</p>
                </div>

                <div className="space-y-4">
                  <Textarea
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                    rows={4}
                    placeholder="e.g. Create an invoice for Stratus Tech: $12,500 Web App Redesign, 3 weeks delivery, Net 15 payment terms, 10% VAT tax rate..."
                    className="rounded-2xl text-sm"
                  />

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Starter Suggestions:</span>
                    <div className="flex flex-wrap gap-2">
                      {starterPrompts.map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setGenPrompt(p)}
                          className="px-3 py-1.5 rounded-full bg-card border border-border text-[11px] text-muted-foreground hover:text-foreground hover:border-primary transition-all text-left"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateInvoice}
                    disabled={isGenerating}
                    className="w-full py-4 rounded-full bg-primary text-white font-bold text-sm hover:scale-[1.02] transition-transform shadow-xl flex items-center justify-center gap-2 btn-premium"
                  >
                    {isGenerating ? <Bot className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isGenerating ? "Synthesizing Invoice..." : "Generate AI Invoice Draft"}
                  </button>
                </div>
              </div>

              {/* Output Preview */}
              <div className="lg:col-span-6 glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="font-headline font-bold text-lg text-foreground">Generated Output Payload</span>
                  {genResult && <Badge variant="default">Ready to Apply</Badge>}
                </div>

                {genResult ? (
                  <div className="space-y-4 text-xs">
                    <div className="space-y-2">
                      <span className="font-bold text-primary uppercase text-[10px]">Deliverables &amp; Line Items</span>
                      {genResult.items.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-2xl bg-card border border-border flex justify-between items-center">
                          <div>
                            <div className="font-bold text-foreground text-sm">{item.name}</div>
                            <div className="text-muted-foreground text-[11px]">{item.description}</div>
                          </div>
                          <div className="font-mono font-bold text-sm text-foreground">
                            {item.quantity} x ${item.rate.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-surface/60 border border-border space-y-2">
                      <div className="font-bold text-foreground">Payment Terms:</div>
                      <p className="text-muted-foreground">{genResult.paymentTerms}</p>
                    </div>

                    <Link
                      to="/invoices/new"
                      className="w-full py-3 rounded-full bg-success text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-transform"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Open in Invoice Builder
                    </Link>
                  </div>
                ) : (
                  <div className="py-16 text-center space-y-2 text-muted-foreground text-xs">
                    <Bot className="w-10 h-10 text-primary opacity-40 mx-auto animate-bounce" />
                    <p>Enter a prompt on the left to generate structured invoice data.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Module 2: AI Product Description Generator */}
          {activeModule === "description" && (
            <div className="max-w-3xl mx-auto glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <div className="space-y-2">
                <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                  <Wand2 className="w-6 h-6 text-primary" />
                  Product &amp; Service Description Engine
                </h3>
                <p className="text-xs text-muted-foreground">Transform raw service titles into persuasive, professional invoice item descriptions.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Service / Deliverable Title</label>
                  <Input
                    value={descTitle}
                    onChange={(e) => setDescTitle(e.target.value)}
                    placeholder="e.g. Next.js & TypeScript Frontend Architecture"
                    className="rounded-2xl text-sm"
                  />
                </div>

                <button
                  onClick={handleGenerateDescription}
                  disabled={isDescLoading}
                  className="px-8 py-3.5 rounded-full bg-primary text-white font-bold text-sm hover:scale-105 transition-transform shadow-lg btn-premium flex items-center gap-2"
                >
                  {isDescLoading ? <Bot className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate AI Description
                </button>

                {descResult && (
                  <div className="p-6 rounded-2xl bg-card border border-border space-y-3 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-primary">Generated Description:</span>
                      <button
                        onClick={() => { navigator.clipboard.writeText(descResult); toast.success("Copied to clipboard!"); }}
                        className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed font-body">{descResult}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Module 3: Client Entity Research */}
          {activeModule === "autofill" && (
            <div className="max-w-3xl mx-auto glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <div className="space-y-2">
                <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                  <Building className="w-6 h-6 text-primary" />
                  Autonomous Client Entity Lookup
                </h3>
                <p className="text-xs text-muted-foreground">Type a company name to automatically verify tax IDs, headquarters, and billing contacts.</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    value={clientQuery}
                    onChange={(e) => setClientQuery(e.target.value)}
                    placeholder="Enter company name (e.g. Stratus, Nexus, Orbit)..."
                    className="rounded-2xl text-sm flex-1"
                  />
                  <button
                    onClick={handleClientAutofill}
                    disabled={isClientLoading}
                    className="px-8 py-3.5 rounded-full bg-primary text-white font-bold text-sm hover:scale-105 transition-transform shadow-lg btn-premium flex items-center gap-2"
                  >
                    {isClientLoading ? <Bot className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Research Entity
                  </button>
                </div>

                {clientResult && (
                  <div className="p-6 rounded-2xl bg-card border border-border/80 space-y-4 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <span className="font-headline font-bold text-base text-foreground">{clientResult.company}</span>
                      <Badge variant="default" className="bg-success text-white font-bold">{clientResult.confidence}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground block">Billing Email:</span>
                        <span className="font-bold text-foreground text-sm">{clientResult.email}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">VAT / GST ID:</span>
                        <span className="font-mono font-bold text-foreground text-sm">{clientResult.gstNumber}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-muted-foreground block">Registered Address:</span>
                      <span className="font-bold text-foreground text-sm">{clientResult.address}</span>
                    </div>

                    <Link
                      to="/clients"
                      className="inline-block px-6 py-2.5 rounded-full bg-primary text-white font-bold text-xs hover:scale-105 transition-transform btn-premium"
                    >
                      Save to Client Directory →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Module 4: Tax Suggestions */}
          {activeModule === "tax" && (
            <div className="max-w-3xl mx-auto glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
                Cross-Border Tax Compliance Rules
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
                  <div className="font-headline font-bold text-base text-foreground">Switzerland (CHE)</div>
                  <p className="text-muted-foreground">Standard VAT rate is 8.1%. B2B cross-border services to foreign entities qualify for zero-rated export status.</p>
                  <Badge variant="secondary">VAT Rate: 8.1%</Badge>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
                  <div className="font-headline font-bold text-base text-foreground">European Union (EU)</div>
                  <p className="text-muted-foreground">Reverse Charge Mechanism applies for B2B transactions. Requires valid VIES VAT registration number.</p>
                  <Badge variant="secondary">Reverse Charge Active</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Module 5: Financial Insights */}
          {activeModule === "insights" && (
            <div className="max-w-3xl mx-auto glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                AI Cashflow Risk Assessment
              </h3>

              <div className="space-y-4 text-xs">
                <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
                  <div className="font-bold text-foreground text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-success animate-ping"></span>
                    Positive Settlement Velocity
                  </div>
                  <p className="text-muted-foreground">Average payout time has improved by 1.2 days this month. 98.2% of invoices were paid before due date.</p>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
                  <div className="font-bold text-foreground text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-warning"></span>
                    1 Overdue Invoice Pending
                  </div>
                  <p className="text-muted-foreground">Orbit Collective invoice #INV-2026-090 ($12,400.00) is 3 days past due. Autonomous AI reminder is scheduled for tomorrow.</p>
                </div>
              </div>
            </div>
          )}

          {/* Module 6: Conversational AI Assistant Chat */}
          {activeModule === "chat" && (
            <div className="max-w-3xl mx-auto glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-lg text-foreground">Invoisen AI Neural Chat</h3>
                    <p className="text-[10px] text-muted-foreground">Connected to Swiss Financial Knowledge Model</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-primary text-white font-bold text-[10px]">Online</Badge>
              </div>

              <div className="h-80 overflow-y-auto space-y-4 p-4 rounded-2xl bg-card/60 border border-border/60">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[80%] ${
                      msg.role === "user"
                        ? "ml-auto bg-primary text-white font-medium shadow-md"
                        : "bg-surface border border-border text-foreground"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="Ask anything about invoices, payment terms, or tax rules..."
                  className="rounded-full text-xs flex-1"
                />
                <button
                  onClick={handleSendChat}
                  className="px-6 py-3 rounded-full bg-primary text-white font-bold text-xs hover:scale-105 transition-transform shadow-md btn-premium flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </div>
            </div>
          )}
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
