import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AiAssistant } from "@/components/AiAssistant";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { Hero3DModel } from "@/components/Hero3DModel";
import { InteractiveDashboardPreview } from "@/components/InteractiveDashboardPreview";
import { getInitialTheme, setTheme, themeNames, type ThemeName } from "@/lib/theme";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Invoisen — Invoicing at the Speed of Thought" },
      {
        name: "description",
        content:
          "The elite AI-powered invoice engine for freelancers and agencies. Automate your entire billing lifecycle with surgical precision.",
      },
      { property: "og:title", content: "Invoisen — Invoicing at the Speed of Thought" },
      {
        property: "og:description",
        content:
          "Automate your entire billing lifecycle with surgical precision using AI client intelligence and instant PDF generation.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme());
  const [activePreviewTab, setActivePreviewTab] = useState<"dashboard" | "studio">("dashboard");
  const [activeTemplateCategory, setActiveTemplateCategory] = useState<string>("all");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleTheme = () => {
    const currentIndex = themeNames.indexOf(theme);
    const nextTheme = themeNames[(currentIndex + 1) % themeNames.length];
    setThemeState(nextTheme);
    setTheme(nextTheme);
  };

  useEffect(() => {
    // Parallax effect for interactive floating screens
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / 60;
      const y = (e.clientY - window.innerHeight / 2) / 60;
      const screens = document.querySelectorAll(".interactive-float");
      screens.forEach((screen, index) => {
        const element = screen as HTMLElement;
        const factor = index === 0 ? 1 : -0.5;
        element.style.transform = `translate(${x * factor}px, ${y * factor}px) ${index === 0 ? "rotate(-3deg)" : "rotate(2deg)"
          }`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const templates = [
    {
      id: "zurich",
      title: "Zurich Minimalist",
      category: "minimalist",
      desc: "Clean, high-contrast typography designed for luxury consulting.",
    },
    {
      id: "elite",
      title: "Elite Agency Pro",
      category: "corporate",
      desc: "Modern multi-currency layout for large design and dev agencies.",
    },
    {
      id: "neural",
      title: "Neural Violet",
      category: "ai",
      desc: "Deep purple gradients and glowing AI badges for tech startups.",
    },
    {
      id: "swiss-mono",
      title: "Swiss Mono Dark",
      category: "brutalist",
      desc: "Tabular monochrome precision for quantitative engineering teams.",
    },
  ];

  const filteredTemplates =
    activeTemplateCategory === "all"
      ? templates
      : templates.filter((t) => t.category === activeTemplateCategory);

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white">
      {/* Dynamic 3D Hero Canvas */}
      <ThreeBackground />

      {/* Global Navigation Bar */}
      <AppNavbar />

      {/* 1. HERO SECTION */}
      <header id="platform" className="relative min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden">
        <div className="max-w-container-max mx-auto px-margin-desktop relative z-10 grid lg:grid-cols-2 gap-gutter items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-sm font-medium backdrop-blur-md">
              <span className="material-symbols-outlined text-[18px] animate-spin">auto_awesome</span>
              v4.0 Released — Autonomous Client Intelligence
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-foreground max-w-xl leading-[1.1] tracking-tight">
              Invoicing at the <span className="drawing-text italic">Speed of Thought.</span>
            </h1>
            <p className="text-muted-foreground font-body text-xl max-w-lg leading-relaxed">
              The elite AI-powered invoicing engine for agency owners and high-income freelancers. Automate your billing, tax compliance, and revenue collection with surgical precision.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/signup"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-headline text-lg font-bold hover:shadow-2xl hover:shadow-primary/40 transition-all flex items-center gap-3 group btn-premium"
              >
                Start Free Trial
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
              <a
                href="#preview"
                className="px-8 py-4 rounded-full font-headline text-lg border border-border text-foreground bg-card/40 backdrop-blur-md hover:bg-card transition-all hover:scale-105"
              >
                Explore Product Demo
              </a>
            </div>
            <div className="flex items-center gap-6 pt-4 text-xs font-label text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-success text-[18px]">verified</span>
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-success text-[18px]">verified</span>
                Instant PDF &amp; Stripe Sync
              </span>
            </div>
          </div>
          <div className="relative h-[550px] hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-purple-600/30 to-sky-500/20 rounded-full blur-[140px] scale-125"></div>
            <div className="relative z-10 glass-card p-4 rounded-3xl border border-border/80 shadow-2xl overflow-hidden transition-all duration-500 hover:border-primary/50 flex flex-col h-full justify-between backdrop-blur-xl">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-card/60 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-destructive/80"></span>
                  <span className="w-3 h-3 rounded-full bg-warning/80"></span>
                  <span className="w-3 h-3 rounded-full bg-success/80"></span>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground ml-2">invoisen.ai/3d-viewport</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Interactive 3D Model</span>
                </div>
              </div>

              {/* 3D WebGL Interactive Model */}
              <div className="relative flex-1 w-full rounded-2xl overflow-hidden bg-card/30 border border-border/40 flex items-center justify-center">
                <Hero3DModel />

                {/* Overlay Floating Metric Badges */}
                <div className="absolute top-4 right-4 glass-card p-3 rounded-2xl border border-border/80 shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-pulse pointer-events-none">
                  <div className="w-8 h-8 rounded-xl bg-success/20 text-success flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">Payout Verified</div>
                    <div className="text-xs font-headline font-extrabold text-foreground">$14,200.00</div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 glass-card p-3.5 rounded-2xl border border-border/80 shadow-2xl backdrop-blur-xl flex items-center gap-3 pointer-events-none">
                  <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                    ⚡
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">3D Matrix Core</div>
                    <div className="text-xs font-headline font-extrabold text-primary">Drag mouse to rotate 3D card</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. TRUSTED COMPANIES TICKER */}
      <section className="py-16 border-y border-border/40 bg-surface/50 backdrop-blur-md">
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <p className="text-center font-label text-xs text-muted-foreground mb-10 tracking-[0.25em] uppercase font-bold">
            Powering billing for 24,000+ elite agencies &amp; studios worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-14 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <div className="font-headline text-2xl font-black tracking-tighter text-foreground hover:text-primary transition-colors cursor-default">NEXUS</div>
            <div className="font-headline text-2xl font-black tracking-tighter text-foreground hover:text-primary transition-colors cursor-default">STRATUS</div>
            <div className="font-headline text-2xl font-black tracking-tighter text-foreground hover:text-primary transition-colors cursor-default">VELOCITY</div>
            <div className="font-headline text-2xl font-black tracking-tighter text-foreground hover:text-primary transition-colors cursor-default">ORBIT</div>
            <div className="font-headline text-2xl font-black tracking-tighter text-foreground hover:text-primary transition-colors cursor-default">ZENITH</div>
            <div className="font-headline text-2xl font-black tracking-tighter text-foreground hover:text-primary transition-colors cursor-default">PULSE</div>
          </div>
        </div>
      </section>

      {/* 3. BENTO GRID FEATURES SECTION */}
      <section id="features" className="py-32 relative overflow-hidden">
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <div className="text-center mb-24 space-y-4">
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-foreground">Precision Engineering</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Every detail of Invoisen is crafted to eliminate billing friction and maximize your billable rate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="md:col-span-4 glass-card rounded-3xl p-10 flex flex-col justify-between min-h-[450px] relative group overflow-hidden shadow-xl">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-colors"></div>
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                </div>
                <h3 className="font-headline text-3xl font-bold text-foreground">AI-First Generation</h3>
                <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
                  Our neural engine learns your billing patterns, predicting line items, client entity data, and calculating complex tax jurisdictions automatically.
                </p>
              </div>
              <div className="mt-8 bg-card/60 rounded-2xl p-8 border border-border/50 relative z-10 ai-shimmer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/30 animate-pulse"></div>
                  <div className="h-4 w-36 bg-foreground/20 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-2.5 w-full bg-foreground/10 rounded-full"></div>
                  <div className="h-2.5 w-4/5 bg-foreground/10 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 glass-card rounded-3xl p-10 flex flex-col justify-between min-h-[450px] group shadow-xl">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-white shadow-lg shadow-secondary/30 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">palette</span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-foreground">Adaptive Themes</h3>
                <p className="text-muted-foreground">Switch between Light, Dark, and immersive Purple AI mode with a single keystroke.</p>
              </div>
              <div className="flex gap-4 mt-8 justify-center">
                <div
                  onClick={() => {
                    setThemeState("light");
                    setTheme("light");
                  }}
                  title="Switch to Light Theme"
                  className="w-14 h-14 rounded-full bg-white border border-border shadow-xl hover:scale-110 transition-transform cursor-pointer"
                ></div>
                <div
                  onClick={() => {
                    setThemeState("dark");
                    setTheme("dark");
                  }}
                  title="Switch to Dark Theme"
                  className="w-14 h-14 rounded-full bg-slate-950 border border-border shadow-xl hover:scale-110 transition-transform cursor-pointer"
                ></div>
                <div
                  onClick={() => {
                    setThemeState("purple");
                    setTheme("purple");
                  }}
                  title="Switch to Purple AI Theme"
                  className="w-14 h-14 rounded-full bg-purple-600 border border-border shadow-xl hover:scale-110 transition-transform cursor-pointer"
                ></div>
              </div>
            </div>

            <div className="md:col-span-2 glass-card rounded-3xl p-10 flex flex-col justify-between min-h-[400px] group shadow-xl">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-tertiary flex items-center justify-center text-white transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-foreground">Instant Vector PDF</h3>
                <p className="text-muted-foreground">Precision-engineered exports with vector typography, custom fonts, and crisp logos.</p>
              </div>
              <div className="h-40 bg-card/40 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center group-hover:border-primary/50 transition-colors gap-3">
                <span className="material-symbols-outlined text-5xl text-primary/70 animate-bounce">download</span>
                <span className="text-muted-foreground font-label text-sm uppercase tracking-widest font-bold">Rendering Vector...</span>
              </div>
            </div>

            <div className="md:col-span-4 glass-card rounded-3xl p-10 flex items-center gap-10 min-h-[400px] group relative overflow-hidden shadow-xl">
              <div className="hidden lg:block w-1/3">
                <div className="aspect-square bg-gradient-to-br from-primary to-secondary rounded-full opacity-25 blur-[60px] group-hover:scale-125 transition-transform duration-1000"></div>
              </div>
              <div className="space-y-6 flex-1 relative z-10">
                <h3 className="font-headline text-3xl font-bold text-foreground">Global Multi-Currency</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Support for 160+ currencies with real-time exchange rates and localized tax compliance in 45 countries.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD"].map((curr) => (
                    <span
                      key={curr}
                      className="px-6 py-2 rounded-full bg-card/60 border border-border text-foreground font-label text-sm hover:bg-primary hover:text-white transition-all cursor-default"
                    >
                      {curr}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI FEATURES SECTION */}
      <section className="py-32 relative overflow-hidden bg-surface/40 border-y border-border/40">
        <div className="max-w-container-max mx-auto px-margin-desktop relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="text-primary font-bold tracking-[0.2em] text-sm uppercase">Neural Engine</div>
              <h2 className="font-headline text-4xl md:text-6xl font-extrabold leading-tight text-foreground">
                Client Intelligence is your unfair advantage.
              </h2>
              <p className="text-muted-foreground font-body text-xl leading-relaxed">
                Invoisen AI doesn't just fill fields—it researches. Type a business name, and our neural crawler automatically retrieves VAT/tax registration IDs, billing addresses, and matching corporate branding colors.
              </p>
              <ul className="space-y-5">
                <li className="flex items-center gap-4 group">
                  <span className="material-symbols-outlined text-primary group-hover:scale-125 transition-transform text-3xl">check_circle</span>
                  <span className="text-foreground text-lg font-medium">Automated Corporate Research &amp; VAT Enrichment</span>
                </li>
                <li className="flex items-center gap-4 group">
                  <span className="material-symbols-outlined text-primary group-hover:scale-125 transition-transform text-3xl">check_circle</span>
                  <span className="text-foreground text-lg font-medium">Smart Line Item &amp; Rate Prediction</span>
                </li>
                <li className="flex items-center gap-4 group">
                  <span className="material-symbols-outlined text-primary group-hover:scale-125 transition-transform text-3xl">check_circle</span>
                  <span className="text-foreground text-lg font-medium">Payment Behavior &amp; Late-Risk Forecasting</span>
                </li>
              </ul>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-1000"></div>
              <div className="relative glass-card border border-border rounded-3xl p-10 shadow-2xl">
                <div className="space-y-8">
                  <div className="flex justify-between items-center border-b border-border pb-6">
                    <span className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-success animate-ping"></span>
                      Autonomous Intelligence
                    </span>
                    <span className="material-symbols-outlined text-primary text-3xl animate-pulse">hub</span>
                  </div>
                  <div className="space-y-5">
                    <div className="bg-card/70 p-6 rounded-2xl space-y-2 border border-border">
                      <div className="text-primary text-[11px] font-bold uppercase tracking-widest">Client Entity Searched</div>
                      <div className="text-foreground font-bold text-xl">Stratus Technologies Inc.</div>
                    </div>
                    <div className="bg-primary/10 p-6 rounded-2xl space-y-3 border border-primary/20">
                      <div className="text-primary text-[11px] font-bold uppercase tracking-widest">AI Agent Analysis</div>
                      <div className="text-foreground text-lg leading-relaxed">
                        Payment likely in <span className="text-primary font-bold">12-14 days</span>. Verified California Tax Rate: <span className="font-bold">8.5%</span>. Tax ID: <span className="font-mono text-sm">US-984210385</span>.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5, 6 & 7. INTERACTIVE PRODUCT PREVIEW, DASHBOARD & INVOICE STUDIO PREVIEW */}
      <section id="preview" className="py-32 relative">
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-foreground">Interactive Workspace Demo</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the seamless fluid workflow of our Dashboard and AI Invoice Studio.
            </p>
            {/* Tab Switcher Buttons */}
            <div className="inline-flex p-1.5 rounded-full bg-card border border-border shadow-inner mt-6">
              <button
                onClick={() => setActivePreviewTab("dashboard")}
                className={`px-8 py-3 rounded-full font-label text-sm font-bold transition-all ${activePreviewTab === "dashboard"
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-foreground/70 hover:text-foreground"
                  }`}
              >
                Dashboard Workspace
              </button>
              <button
                onClick={() => setActivePreviewTab("studio")}
                className={`px-8 py-3 rounded-full font-label text-sm font-bold transition-all ${activePreviewTab === "studio"
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-foreground/70 hover:text-foreground"
                  }`}
              >
                Invoice Studio Pro
              </button>
            </div>
          </div>

          {/* Tab 1: Live Interactive Dashboard Command Center */}
          {activePreviewTab === "dashboard" && (
            <InteractiveDashboardPreview />
          )}

          {/* Tab 2: Invoice Studio Mockup */}
          {activePreviewTab === "studio" && (
            <div className="glass-card rounded-3xl overflow-hidden border border-border shadow-2xl p-6 md:p-10 transition-all duration-500">
              <div className="flex flex-wrap justify-between items-center pb-8 border-b border-border gap-4">
                <div>
                  <h3 className="font-headline text-2xl font-bold text-foreground">AI Invoice Studio Pro</h3>
                  <p className="text-muted-foreground text-sm">Editing #INV-2026-089 (Stratus Tech)</p>
                </div>
                <div className="flex gap-4">
                  <button className="px-6 py-2.5 rounded-full bg-card border border-border text-foreground text-sm font-bold hover:bg-surface">
                    Preview PDF
                  </button>
                  <button className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold shadow-md">
                    Send to Client
                  </button>
                </div>
              </div>
              <div className="grid lg:grid-cols-3 gap-8 my-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                    <h4 className="font-bold text-lg text-foreground">Client Details (AI Enriched)</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs font-bold uppercase">Company</span>
                        <div className="font-bold text-foreground">Stratus Technologies Inc.</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs font-bold uppercase">Tax / VAT ID</span>
                        <div className="font-mono text-foreground font-bold">US-984210385</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                    <h4 className="font-bold text-lg text-foreground">Line Items</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-xl bg-surface/60 border border-border text-sm">
                        <span className="font-medium text-foreground">Design System &amp; Component Tokens</span>
                        <span className="font-mono font-bold text-foreground">$8,500.00</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-surface/60 border border-border text-sm">
                        <span className="font-medium text-foreground">Full-Stack AI Integration &amp; Testing</span>
                        <span className="font-mono font-bold text-foreground">$6,200.00</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-6">
                  <h4 className="font-bold text-lg text-foreground flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                    Invoice Summary
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-mono font-bold text-foreground">$14,700.00</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax (8.5% CA)</span>
                      <span className="font-mono font-bold text-foreground">$1,249.50</span>
                    </div>
                    <div className="pt-3 border-t border-border flex justify-between text-lg font-bold">
                      <span className="text-foreground">Total Due</span>
                      <span className="font-mono text-primary">$15,949.50</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 8. TEMPLATES SHOWCASE */}
      <section id="templates" className="py-32 bg-surface/40 border-y border-border/40">
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-foreground">Swiss-Inspired Templates</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose from pixel-perfect invoice layouts tailored for luxury consultants, agencies, and developers.
            </p>
            {/* Filter Pills */}
            <div className="flex flex-wrap justify-center gap-3 pt-6">
              {[
                { id: "all", label: "All Templates" },
                { id: "minimalist", label: "Minimalist" },
                { id: "corporate", label: "Corporate" },
                { id: "ai", label: "AI Native" },
                { id: "brutalist", label: "Brutalist" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTemplateCategory(cat.id)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTemplateCategory === cat.id
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "bg-card border border-border text-foreground/80 hover:text-foreground"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredTemplates.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-3xl p-5 group cursor-pointer hover:-translate-y-2 transition-all shadow-xl"
              >
                <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-6 bg-card border border-border shadow-inner relative p-4 flex flex-col justify-between group-hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-center pb-2 border-b border-border/60">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="font-headline text-[11px] font-bold text-foreground tracking-tight uppercase">{item.id}</span>
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground">#INV-2026</span>
                  </div>

                  <div className="space-y-2 py-3">
                    <div className="h-2 w-3/4 rounded bg-primary/20" />
                    <div className="h-2 w-1/2 rounded bg-muted/40" />
                    <div className="my-2 border-t border-dashed border-border/60" />
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground">Design Tokens</span>
                      <span className="font-mono font-bold text-foreground">$8,500</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground">AI Automation</span>
                      <span className="font-mono font-bold text-foreground">$5,700</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/80 flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground font-bold">Total</span>
                    <span className="text-xs font-mono font-bold text-primary">$14,200.00</span>
                  </div>
                </div>
                <h4 className="font-bold text-xl text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. ANALYTICS SHOWCASE */}
      <section id="analytics" className="py-32 relative">
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="text-primary font-bold tracking-[0.2em] text-sm uppercase">Financial Analytics</div>
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold leading-tight text-foreground">
                Real-Time Growth &amp; Cashflow Insights.
              </h2>
              <p className="text-muted-foreground font-body text-xl leading-relaxed">
                Gain instant clarity over your revenue velocity, invoice aging, and recurring billing streams. Make data-backed financial decisions effortlessly.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="p-6 rounded-2xl bg-card border border-border space-y-2">
                  <span className="text-3xl font-extrabold text-primary font-numeric">+142%</span>
                  <p className="text-sm font-medium text-muted-foreground">MoM Revenue Growth</p>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-border space-y-2">
                  <span className="text-3xl font-extrabold text-success font-numeric">99.4%</span>
                  <p className="text-sm font-medium text-muted-foreground">On-Time Payout Rate</p>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-3xl p-8 border border-border shadow-2xl relative">
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-border pb-4">
                  <h4 className="font-bold text-xl text-foreground">Monthly Recurring Revenue</h4>
                  <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">2026 Trend</span>
                </div>
                <div className="h-64 flex items-end justify-between gap-4 pt-6">
                  {[45, 62, 58, 80, 95, 110, 135].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <div
                        style={{ height: `${val}%` }}
                        className="w-full bg-gradient-to-t from-primary/40 to-primary rounded-t-xl group-hover:brightness-125 transition-all"
                      ></div>
                      <span className="text-[11px] text-muted-foreground font-bold">M{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. TESTIMONIALS */}
      <section className="py-32 bg-surface/40 border-y border-border/40">
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <div className="text-center mb-24 space-y-4">
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-foreground">Loved by Elite Builders</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Read how leading agency founders and tech leads transformed their billing operations.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-10 rounded-3xl group hover:-translate-y-2 transition-all shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xl border border-primary/20">
                  SC
                </div>
                <div>
                  <div className="font-bold text-foreground text-lg">Sarah Chen</div>
                  <div className="text-sm text-muted-foreground">Lead Designer, Nexus Studios</div>
                </div>
              </div>
              <div className="text-warning mb-4 text-sm">★★★★★</div>
              <p className="text-foreground/90 italic text-lg leading-relaxed">
                "Invoisen changed how we think about billing. The AI research feature alone saves our team 5 hours a week."
              </p>
            </div>
            <div className="glass-card p-10 rounded-3xl group hover:-translate-y-2 transition-all shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-secondary text-xl border border-secondary/20">
                  MK
                </div>
                <div>
                  <div className="font-bold text-foreground text-lg">Marcus King</div>
                  <div className="text-sm text-muted-foreground">CEO, Orbit Collective</div>
                </div>
              </div>
              <div className="text-warning mb-4 text-sm">★★★★★</div>
              <p className="text-foreground/90 italic text-lg leading-relaxed">
                "The most beautiful invoicing platform I've ever used. It reflects the premium quality of our agency work."
              </p>
            </div>
            <div className="glass-card p-10 rounded-3xl group hover:-translate-y-2 transition-all shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-tertiary/20 flex items-center justify-center font-bold text-tertiary text-xl border border-tertiary/20">
                  LV
                </div>
                <div>
                  <div className="font-bold text-foreground text-lg">Lena Vogel</div>
                  <div className="text-sm text-muted-foreground">Global Tech Consultant</div>
                </div>
              </div>
              <div className="text-warning mb-4 text-sm">★★★★★</div>
              <p className="text-foreground/90 italic text-lg leading-relaxed">
                "Surgical precision for international client billing. I can send invoices in 12 currencies without lifting a finger."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. PRICING PREVIEW */}
      <section id="pricing" className="py-32 relative">
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <div className="text-center mb-20 space-y-4">
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-foreground">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground text-xl">Choose the plan that fits your growth trajectory.</p>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-card border border-border shadow-inner mt-6">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingPeriod === "monthly" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("annual")}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingPeriod === "annual" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Annual <span className="text-[10px] text-success font-extrabold uppercase ml-1">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="glass-card rounded-3xl p-10 flex flex-col justify-between border border-border shadow-xl">
              <div className="space-y-6">
                <h3 className="font-headline text-2xl font-bold text-foreground">Starter</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-foreground">{billingPeriod === "monthly" ? "$19" : "$15"}</span>
                  <span className="text-muted-foreground font-bold">/month</span>
                </div>
                <ul className="space-y-4 text-muted-foreground text-sm">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <span>Up to 20 Invoices / mo</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <span>Instant PDF Exports</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <span>Stripe &amp; PayPal Integration</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/signup"
                className="block text-center w-full py-4 rounded-full bg-card border border-border text-foreground font-bold hover:bg-surface transition-all mt-8"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Pro Elite (Most Popular) */}
            <div className="glass-card rounded-3xl p-10 flex flex-col justify-between border-2 border-primary shadow-2xl relative bg-primary/5">
              <div className="absolute -top-4 right-8">
                <span className="bg-primary text-white px-5 py-1.5 rounded-full text-xs font-black tracking-widest animate-pulse">
                  MOST POPULAR
                </span>
              </div>
              <div className="space-y-6">
                <h3 className="font-headline text-2xl font-bold text-foreground">Pro Elite</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-foreground">{billingPeriod === "monthly" ? "$49" : "$39"}</span>
                  <span className="text-muted-foreground font-bold">/month</span>
                </div>
                <ul className="space-y-4 text-foreground/90 text-sm">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">verified</span>
                    <span className="font-bold">Unlimited AI Invoice Generation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">verified</span>
                    <span className="font-bold">Autonomous Client Intelligence</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">verified</span>
                    <span className="font-bold">Custom Swiss Branding &amp; Fonts</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">verified</span>
                    <span className="font-bold">Global Tax Compliance Suite</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/signup"
                className="block text-center w-full py-4 rounded-full bg-primary text-white font-bold shadow-xl shadow-primary/30 hover:scale-105 transition-all mt-8"
              >
                Get Started Now
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="glass-card rounded-3xl p-10 flex flex-col justify-between border border-border shadow-xl">
              <div className="space-y-6">
                <h3 className="font-headline text-2xl font-bold text-foreground">Enterprise</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-foreground">{billingPeriod === "monthly" ? "$149" : "$119"}</span>
                  <span className="text-muted-foreground font-bold">/month</span>
                </div>
                <ul className="space-y-4 text-muted-foreground text-sm">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <span>Multi-Team Seat Access</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <span>Dedicated API &amp; Webhooks</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <span>24/7 Priority Concierge</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/signup"
                className="block text-center w-full py-4 rounded-full bg-card border border-border text-foreground font-bold hover:bg-surface transition-all mt-8"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FAQ SECTION */}
      <section className="py-32 bg-surface/40 border-y border-border/40">
        <div className="max-w-3xl mx-auto px-margin-desktop">
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-center mb-20 text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "How secure is my client & financial data?",
                a: "We use bank-grade AES-256 encryption for data at rest and TLS 1.3 for data in transit. Your financial data is private and never trained on public models.",
              },
              {
                q: "Can I import existing invoices from QuickBooks or Stripe?",
                a: "Yes! Our AI engine can ingest PDFs and CSV files from legacy accounting tools and reconstruct your billing history in under 60 seconds.",
              },
              {
                q: "Does Invoisen support global multi-currency and VAT laws?",
                a: "Absolutely. We support 160+ world currencies with automatic exchange rate calculations and localized tax laws across 45 countries.",
              },
              {
                q: "What happens if I decide to cancel my subscription?",
                a: "You retain full ownership of your data. You can export all your invoices, client profiles, and reports in PDF/CSV format anytime.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="glass-card rounded-2xl p-8 cursor-pointer group hover:bg-card transition-all shadow-xl"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-foreground text-xl">{faq.q}</h4>
                  <span
                    className={`material-symbols-outlined text-primary transition-transform duration-300 ${openFaqIndex === idx ? "rotate-180" : ""
                      }`}
                  >
                    expand_more
                  </span>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaqIndex === idx ? "max-h-40 mt-6" : "max-h-0"
                    }`}
                >
                  <p className="text-muted-foreground text-lg leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. HIGH IMPACT CTA */}
      <section className="py-40 relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent)]"></div>
        <div className="max-w-container-max mx-auto px-margin-desktop relative z-10 text-center space-y-12">
          <h2 className="font-headline text-5xl md:text-7xl font-black max-w-5xl mx-auto leading-tight tracking-tight">
            Ready to transform your financial operations?
          </h2>
          <p className="text-white/80 text-2xl max-w-2xl mx-auto">
            Join thousands of high-income freelancers and agencies who have automated their future.
          </p>
          <div className="flex flex-wrap justify-center gap-6 pt-6">
            <Link
              to="/signup"
              className="bg-white text-primary px-12 py-6 rounded-full font-headline text-2xl font-black hover:scale-105 transition-transform shadow-2xl"
            >
              Start Free Trial
            </Link>
            <a
              href="#preview"
              className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-12 py-6 rounded-full font-headline text-2xl font-black hover:bg-white/20 transition-all"
            >
              View Product Demo
            </a>
          </div>
        </div>
      </section>

      {/* 14. FOOTER */}
      <footer className="w-full bg-card border-t border-border">
        <div className="max-w-container-max mx-auto px-margin-desktop py-24 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-gutter">
          <div className="col-span-2">
            <div className="font-headline text-3xl font-black text-foreground mb-8 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-black">
                ⚡
              </span>
              INVOISEN
            </div>
            <p className="text-muted-foreground max-w-xs mb-10 text-base leading-relaxed">
              Elevating professional finance through artificial intelligence, vector precision, and Swiss-inspired design.
            </p>
            <div className="flex gap-6">
              <span className="material-symbols-outlined text-muted-foreground cursor-pointer hover:text-primary hover:scale-125 transition-all text-2xl">
                public
              </span>
              <span className="material-symbols-outlined text-muted-foreground cursor-pointer hover:text-primary hover:scale-125 transition-all text-2xl">
                alternate_email
              </span>
              <span className="material-symbols-outlined text-muted-foreground cursor-pointer hover:text-primary hover:scale-125 transition-all text-2xl">
                hub
              </span>
            </div>
          </div>
          <div>
            <h5 className="font-bold text-foreground mb-8 uppercase tracking-widest text-xs">Product</h5>
            <ul className="space-y-4">
              <li><a className="text-muted-foreground hover:text-primary transition-colors text-sm" href="#features">Features</a></li>
              <li><a className="text-muted-foreground hover:text-primary transition-colors text-sm" href="#preview">Demo</a></li>
              <li><a className="text-muted-foreground hover:text-primary transition-colors text-sm" href="#templates">Templates</a></li>
              <li><a className="text-muted-foreground hover:text-primary transition-colors text-sm" href="#pricing">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-foreground mb-8 uppercase tracking-widest text-xs">Company</h5>
            <ul className="space-y-4">
              <li><a className="text-muted-foreground hover:text-primary transition-colors text-sm" href="#">About Us</a></li>
              <li><a className="text-muted-foreground hover:text-primary transition-colors text-sm" href="#">Careers</a></li>
              <li><a className="text-muted-foreground hover:text-primary transition-colors text-sm" href="#">Press Kit</a></li>
              <li><a className="text-muted-foreground hover:text-primary transition-colors text-sm" href="#">Manifesto</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-foreground mb-8 uppercase tracking-widest text-xs">Legal</h5>
            <ul className="space-y-4">
              <li><a className="text-muted-foreground hover:text-primary transition-colors text-sm" href="#">Privacy Policy</a></li>
              <li><a className="text-muted-foreground hover:text-primary transition-colors text-sm" href="#">Terms of Service</a></li>
              <li><a className="text-muted-foreground hover:text-primary transition-colors text-sm" href="#">Cookie Policy</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-foreground mb-8 uppercase tracking-widest text-xs">Support</h5>
            <ul className="space-y-4">
              <li><a className="text-muted-foreground hover:text-primary transition-colors text-sm" href="#">Help Center</a></li>
              <li><a className="text-muted-foreground hover:text-primary transition-colors text-sm" href="#">API Documentation</a></li>
              <li><a className="text-muted-foreground hover:text-primary transition-colors text-sm" href="#">Status Page</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-container-max mx-auto px-margin-desktop py-12 border-t border-border text-center text-muted-foreground text-xs tracking-widest uppercase font-bold">
          © 2026 Invoisen AI. All rights reserved. Precision-engineered in Zurich.
        </div>
      </footer>

      <AiAssistant />
    </div>
  );
}
