import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Eye, Lock, ChevronDown, HelpCircle } from "lucide-react";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { Landing3DHero } from "@/components/Landing3DHero";
import { InteractiveDashboardPreview } from "@/components/InteractiveDashboardPreview";
import { ScrollReveal } from "@/components/ScrollReveal";
import { HeroScrollDemo } from "@/components/HeroScrollDemo";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { CinematicFooter } from "@/components/ui/motion-footer";
import ScrollMorphHero from "@/components/ui/scroll-morph-hero";
import { ThreeDLineStream } from "@/components/ui/ThreeDLineStream";
import { getInitialTheme, setTheme, themeNames, type ThemeName } from "@/lib/theme";
import { getAuthToken } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import type { InvoiceForm } from "@/components/invoice/InvoiceEditor";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const mockLandingInvoiceData: InvoiceForm = {
  invoiceNumber: "INV-2026-088",
  invoiceDate: "2026-07-28",
  dueDate: "2026-08-12",
  currency: "USD",
  businessInfo: {
    name: "Invoisen AI Technologies",
    email: "billing@invoisen.ai",
    address: "742 Paradeplatz, 8001 Zurich, Switzerland",
    country: "Switzerland",
    logoUrl: "",
  },
  clientInfo: {
    name: "Stratus Tech Solutions Inc.",
    email: "billing@stratustech.io",
    address: "100 Innovation Way, Suite 400, San Francisco, CA 94105",
    phone: "+1 (415) 892-3011",
    gstNumber: "US987654321",
  },
  items: [
    {
      name: "AI Design Tokens & UI Architecture",
      description: "Custom design system tokens and component library setup in Tailwind & React.",
      quantity: 1,
      rate: 8500,
    },
    {
      name: "Autonomous Invoice Engine Integration",
      description: "Full API integration with automated client intelligence.",
      quantity: 1,
      rate: 6200,
    },
  ],
  calculations: {
    taxRate: 0,
    discount: 0,
    taxType: "None",
    shipping: 0,
  },
  notes: "Thank you for partnering with Invoisen AI. Payment due within 15 days.",
  status: "published" as const,
  customization: {
    templateId: "modern" as const,
    signatureMode: "type" as const,
    currency: "USD",
  },
};

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
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme());
  const [activeTemplateCategory, setActiveTemplateCategory] = useState<string>("all");
  const [showAllTemplates, setShowAllTemplates] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const toggleTheme = () => {
    const currentIndex = themeNames.indexOf(theme);
    const nextTheme = themeNames[(currentIndex + 1) % themeNames.length];
    setThemeState(nextTheme);
    setTheme(nextTheme);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / 60;
      const y = (e.clientY - window.innerHeight / 2) / 60;
      const screens = document.querySelectorAll(".interactive-float");
      screens.forEach((screen, index) => {
        const element = screen as HTMLElement;
        const factor = index === 0 ? 1 : -0.5;
        element.style.transform = `translate(${x * factor}px, ${y * factor}px) ${
          index === 0 ? "rotate(-3deg)" : "rotate(2deg)"
        }`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const landingTemplates = [
    {
      id: "modern",
      title: "Zurich Modern",
      category: "tech",
      isPro: false,
      desc: "Vibrant gradients, rounded glass cards, and dynamic typography tailored for tech agencies and AI startups.",
      accent: "from-blue-600 via-indigo-600 to-purple-600",
      badge: "Popular (Free)",
      client: "Stratus Tech Inc.",
      amount: "$14,700.00",
      features: ["Gradient Accent Bar", "Client Entity Badges", "Dynamic Line Item Table"],
    },
    {
      id: "stripe",
      title: "Stripe SaaS Minimal",
      category: "tech",
      isPro: false,
      desc: "Sleek API-inspired layout with clean line borders, code font subheaders, and Stripe dashboard aesthetics.",
      accent: "from-indigo-600 via-violet-600 to-blue-600",
      badge: "Free Basic",
      client: "Vercel Cloud Hosting",
      amount: "$18,250.00",
      features: ["API Line Item Table", "Code Font Headers", "Stripe Checkout Aesthetic"],
    },
    {
      id: "linear",
      title: "Linear Monospace",
      category: "tech",
      isPro: false,
      desc: "Dark monospace tech typography with high-density task line items and issue tracking aesthetics.",
      accent: "from-violet-800 via-purple-900 to-slate-950",
      badge: "Free Basic",
      client: "Supabase Inc.",
      amount: "$11,400.00",
      features: ["Monospace Precision Grid", "Sprint Item Tags", "Commit Reference"],
    },
    {
      id: "minimal",
      title: "Basel Minimal",
      category: "swiss",
      isPro: true,
      desc: "Ultra-clean monochrome aesthetic inspired by Swiss International Typographic Style and Apple clarity.",
      accent: "from-slate-800 via-slate-900 to-black",
      badge: "PRO",
      client: "Novartis BioLab",
      amount: "$9,250.00",
      features: ["Precision Micro-Grid", "High Legibility Typography", "Minimal Watermark"],
    },
    {
      id: "apple",
      title: "Apple Cupertino Luxe",
      category: "swiss",
      isPro: true,
      desc: "Ultra-refined typography, generous whitespace, subtle translucent dividers, and Apple-grade precision.",
      accent: "from-gray-700 via-slate-800 to-zinc-900",
      badge: "PRO",
      client: "Figma Design Studio",
      amount: "$16,500.00",
      features: ["Cupertino Typography", "Translucent Separators", "Refined Ratios"],
    },
    {
      id: "nordic",
      title: "Nordic Frost Minimal",
      category: "swiss",
      isPro: true,
      desc: "Cool ice-blue accents, crisp geometric structure, and Scandinavian minimalism for design studios.",
      accent: "from-sky-700 via-slate-800 to-slate-950",
      badge: "PRO",
      client: "Volvo Brand Design",
      amount: "$12,800.00",
      features: ["Scandinavian Ice Blue", "Crisp Geometry", "Spacious Line Heights"],
    },
    {
      id: "professional",
      title: "Geneva Corporate",
      category: "corporate",
      isPro: true,
      desc: "Formal structured layout with corporate header, VAT breakdown tables, and official verification badges.",
      accent: "from-blue-800 via-cyan-800 to-slate-900",
      badge: "PRO Enterprise",
      client: "Logitech Europe S.A.",
      amount: "$28,400.00",
      features: ["Structured VAT Breakdown", "Official Seal Placement", "Dual-Currency Summary"],
    },
    {
      id: "corporate",
      title: "St. Gallen Enterprise",
      category: "corporate",
      isPro: true,
      desc: "Heavyweight financial template designed for high-value enterprise contracts and cross-border billing.",
      accent: "from-purple-900 via-indigo-900 to-slate-950",
      badge: "PRO",
      client: "UBS Investment Group",
      amount: "$54,000.00",
      features: ["Multi-Bank Wire Instructions", "Regulatory Tax Footer", "Audit Stamp"],
    },
    {
      id: "elegant",
      title: "Lucerne Deluxe",
      category: "luxury",
      isPro: true,
      desc: "Luxurious luxury-brand invoice design featuring gold serif typography and elegant signature borders.",
      accent: "from-amber-700 via-amber-900 to-yellow-950",
      badge: "PRO Luxury",
      client: "Richemont Fine Watches",
      amount: "$42,800.00",
      features: ["Cursive Signature Box", "Gold Foil Border Accents", "Bespoke Note Card"],
    },
    {
      id: "emerald",
      title: "Emerald Luxe Executive",
      category: "luxury",
      isPro: true,
      desc: "Deep emerald green gold foil accents, formal serif headers, and executive wealth management layout.",
      accent: "from-emerald-800 via-teal-950 to-slate-950",
      badge: "PRO Executive",
      client: "Credit Suisse Wealth",
      amount: "$65,000.00",
      features: ["Deep Emerald Frame", "Executive Seal Watermark", "Signature Stamp"],
    },
    {
      id: "cyber",
      title: "Matterhorn Cyber",
      category: "cyber",
      isPro: true,
      desc: "High-contrast neon emerald & dark obsidian layout engineered for web3 protocols, quant devs, and cyber security firms.",
      accent: "from-emerald-700 via-teal-900 to-slate-950",
      badge: "PRO Cyber",
      client: "Solana Foundation",
      amount: "$38,500.00",
      features: ["High-Contrast Cyber Border", "On-Chain Transaction Hash", "Instant Crypto Sync"],
    },
    {
      id: "brutalist",
      title: "Studio Neo-Brutalist",
      category: "cyber",
      isPro: true,
      desc: "Bold black borders, stark contrast blocks, retro monospace badges, and raw creative agency vibes.",
      accent: "from-yellow-500 via-orange-600 to-red-700",
      badge: "PRO",
      client: "Pentagram Creative",
      amount: "$24,000.00",
      features: ["Heavy Black Border Frame", "Stark Contrast Blocks", "Retro Badges"],
    },
  ];

  const filteredTemplates =
    activeTemplateCategory === "all"
      ? landingTemplates
      : landingTemplates.filter((t) => t.category === activeTemplateCategory);

  const displayedTemplates = showAllTemplates
    ? filteredTemplates
    : filteredTemplates.slice(0, 3);

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white">
      {/* Dynamic 3D Hero Canvas */}
      <ThreeBackground />

      {/* Global Navigation Bar */}
      <AppNavbar />

      <main className="relative z-10 shadow-2xl rounded-b-[2.5rem] border-b border-border/40 overflow-hidden">
        {/* 3D Vertical Laser Beam & Connecting Nodes Layer */}
        <ThreeDLineStream />
        {/* 1. HERO SECTION */}
        <header
          id="platform"
          className="relative min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden"
        >
          <div className="max-w-container-max mx-auto px-margin-desktop relative z-10 grid lg:grid-cols-2 gap-gutter items-center">
            <ScrollReveal direction="up" delay={100} duration={800} className="space-y-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-sm font-medium backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                v4.0 Released — Autonomous Client Intelligence
              </div>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-foreground max-w-xl leading-[1.1] tracking-tight">
                Invoicing at the <span className="drawing-text italic">Speed of Thought.</span>
              </h1>
              <p className="text-muted-foreground font-body text-xl max-w-lg leading-relaxed">
                The elite AI-powered invoicing engine for agency owners and high-income freelancers.
                Automate your billing, tax compliance, and revenue collection with surgical precision.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/signup"
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-headline text-lg font-bold hover:shadow-2xl hover:shadow-primary/40 transition-all flex items-center gap-3 group btn-premium"
                >
                  Get Started Free
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
            </ScrollReveal>
            <ScrollReveal direction="zoom" delay={250} duration={900} className="relative h-[380px] sm:h-[460px] lg:h-[550px] w-full mt-10 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-purple-600/30 to-sky-500/20 rounded-full blur-[140px] scale-125"></div>
              <div className="relative z-10 glass-card p-4 rounded-3xl border border-border/80 shadow-2xl overflow-hidden transition-all duration-500 hover:border-primary/50 flex flex-col h-full justify-between backdrop-blur-xl">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-card/60 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-destructive/80"></span>
                    <span className="w-3 h-3 rounded-full bg-warning/80"></span>
                    <span className="w-3 h-3 rounded-full bg-success/80"></span>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground ml-2">
                      invoisen.ai/3d-viewport
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                      Interactive 3D Model
                    </span>
                  </div>
                </div>

                {/* 3D WebGL Interactive Model */}
                <div className="relative flex-1 w-full rounded-2xl overflow-hidden bg-card/30 border border-border/40 flex items-center justify-center">
                  <Landing3DHero />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </header>

        {/* 2. TRUSTED COMPANIES TICKER */}
        <section className="py-16 border-y border-border/40 bg-surface/50 backdrop-blur-md">
          <ScrollReveal direction="up" delay={150} className="max-w-container-max mx-auto px-margin-desktop">
            <p className="text-center font-label text-xs text-muted-foreground mb-10 tracking-[0.25em] uppercase font-bold">
              Powering billing for 24,000+ elite agencies &amp; studios worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-14 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              <div className="font-headline text-2xl font-black tracking-tighter text-foreground hover:text-primary transition-colors cursor-default">
                NEXUS
              </div>
              <div className="font-headline text-2xl font-black tracking-tighter text-foreground hover:text-primary transition-colors cursor-default">
                STRATUS
              </div>
              <div className="font-headline text-2xl font-black tracking-tighter text-foreground hover:text-primary transition-colors cursor-default">
                VELOCITY
              </div>
              <div className="font-headline text-2xl font-black tracking-tighter text-foreground hover:text-primary transition-colors cursor-default">
                ORBIT
              </div>
              <div className="font-headline text-2xl font-black tracking-tighter text-foreground hover:text-primary transition-colors cursor-default">
                ZENITH
              </div>
              <div className="font-headline text-2xl font-black tracking-tighter text-foreground hover:text-primary transition-colors cursor-default">
                PULSE
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* 3. ULTRA-COOL BENTO GRID FEATURES SECTION */}
        <section id="features" className="py-28 relative overflow-hidden border-b border-border/40">
          <div className="max-w-container-max mx-auto px-margin-desktop space-y-16">
            <ScrollReveal direction="up" delay={100} className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> High-Performance Architecture
              </div>
              <h2 className="font-headline text-4xl md:text-6xl font-black text-foreground tracking-tight">
                Precision Engineering
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
                Every detail of Invoisen AI is crafted to eliminate billing friction and elevate your global enterprise presence.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              {/* Card 1: AI-First Generation */}
              <ScrollReveal direction="up" delay={100} className="md:col-span-4 glass-card rounded-3xl p-8 sm:p-10 flex flex-col justify-between min-h-[460px] relative group overflow-hidden shadow-2xl border border-border/80 backdrop-blur-xl">
                <GlowingEffect spread={50} glow={true} disabled={false} proximity={80} inactiveZone={0.01} borderWidth={2} />
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-primary/15 rounded-full blur-[120px] group-hover:bg-primary/25 transition-all duration-700"></div>

                <div className="space-y-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-xl shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="font-headline text-3xl font-extrabold text-foreground">
                    AI-First Generation Engine
                  </h3>
                  <p className="text-muted-foreground max-w-lg text-sm sm:text-base leading-relaxed">
                    Our neural crawler learns your billing habits, automatically enriching company tax IDs, localized currency rules, and itemized billing rates.
                  </p>
                </div>

                {/* Live Neural Preview Card */}
                <div className="mt-8 bg-card/80 backdrop-blur-md rounded-2xl p-6 border border-border/80 relative z-10 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-mono font-bold text-foreground">
                        Neural Parsing &bull; Stratus Technologies Inc.
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      ⚡ AI ENRICHED
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-surface/60 border border-border/60">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">VAT / Tax ID</span>
                      <div className="font-mono font-bold text-foreground text-xs mt-0.5">CHE-109.842.103</div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface/60 border border-border/60">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Invoice Value</span>
                      <div className="font-mono font-bold text-emerald-500 text-xs mt-0.5">$14,850.00 USD</div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface/60 border border-border/60 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Tax Rate</span>
                      <div className="font-mono font-bold text-foreground text-xs mt-0.5">8.1% (Swiss Standard)</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Card 2: Adaptive Themes */}
              <ScrollReveal direction="up" delay={200} className="md:col-span-2 glass-card rounded-3xl p-8 sm:p-10 flex flex-col justify-between min-h-[460px] relative group overflow-hidden shadow-2xl border border-border/80 backdrop-blur-xl">
                <div className="space-y-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-purple-600 flex items-center justify-center text-white shadow-xl shadow-secondary/30 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-3xl">palette</span>
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-foreground">
                    Adaptive Workspace Themes
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Instant seamless switching between Light, Dark, and Purple AI modes.
                  </p>
                </div>

                {/* Theme Selector Pills */}
                <div className="grid grid-cols-3 gap-3 mt-6 relative z-10">
                  {[
                    { id: "light", label: "Light", bg: "bg-white text-slate-900 border-slate-200" },
                    { id: "dark", label: "Midnight", bg: "bg-slate-950 text-white border-slate-800" },
                    { id: "purple", label: "Purple AI", bg: "bg-purple-600 text-white border-purple-400" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setThemeState(t.id as ThemeName);
                        setTheme(t.id as ThemeName);
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 hover:scale-105 transition-all shadow-md cursor-pointer ${t.bg} ${theme === t.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background font-bold" : ""
                        }`}
                    >
                      <div className="w-5 h-5 rounded-full border border-current opacity-80" />
                      <span className="text-[11px] font-bold">{t.label}</span>
                    </button>
                  ))}
                </div>
              </ScrollReveal>

              {/* Card 3: Instant Vector PDF */}
              <ScrollReveal direction="up" delay={300} className="md:col-span-2 glass-card rounded-3xl p-8 sm:p-10 flex flex-col justify-between min-h-[420px] relative group overflow-hidden shadow-2xl border border-border/80 backdrop-blur-xl">
                <div className="space-y-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-foreground">
                    Instant Vector PDF Export
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    600 DPI vector typography with embedded corporate branding &amp; signatures.
                  </p>
                </div>

                {/* PDF Export Interactive Badge */}
                <div className="mt-6 bg-card/80 rounded-2xl p-5 border border-border/80 flex flex-col items-center justify-center text-center gap-2 group-hover:border-primary/50 transition-colors relative z-10 shadow-md">
                  <span className="material-symbols-outlined text-4xl text-primary animate-bounce">
                    picture_as_pdf
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    Export Ready &bull; Vector PDF
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Supports Vector Logos &amp; E-Signatures
                  </span>
                </div>
              </ScrollReveal>

              {/* Card 4: Global Multi-Currency */}
              <ScrollReveal direction="up" delay={400} className="md:col-span-4 glass-card rounded-3xl p-8 sm:p-10 flex flex-col justify-between min-h-[420px] relative group overflow-hidden shadow-2xl border border-border/80 backdrop-blur-xl">
                <div className="space-y-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-3xl">currency_exchange</span>
                  </div>
                  <h3 className="font-headline text-3xl font-bold text-foreground">
                    Global Multi-Currency &amp; Tax Suite
                  </h3>
                  <p className="text-muted-foreground max-w-xl text-sm sm:text-base leading-relaxed">
                    Support for 160+ world currencies with live central bank exchange rates and localized compliance across 45 countries.
                  </p>
                </div>

                {/* Currency Badges */}
                <div className="flex flex-wrap gap-2.5 mt-6 relative z-10">
                  {[
                    { code: "USD", flag: "🇺🇸", rate: "$1.00" },
                    { code: "INR", flag: "🇮🇳", rate: "₹83.4" },
                    { code: "EUR", flag: "🇪🇺", rate: "€0.92" },
                    { code: "GBP", flag: "🇬🇧", rate: "£0.79" },
                    { code: "CHF", flag: "🇨🇭", rate: "CHF 0.88" },
                    { code: "JPY", flag: "🇯🇵", rate: "¥154.2" },
                    { code: "AUD", flag: "🇦🇺", rate: "A$1.52" },
                  ].map((c) => (
                    <div
                      key={c.code}
                      className="px-4 py-2 rounded-2xl bg-card/90 border border-border/80 text-foreground font-mono text-xs flex items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm"
                    >
                      <span className="text-sm">{c.flag}</span>
                      <span className="font-bold">{c.code}</span>
                      <span className="text-muted-foreground text-[10px]">{c.rate}</span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>



        {/* 5. INTERACTIVE 3D CONTAINER SCROLL DEMO */}
        <section id="preview" className="py-28 relative overflow-hidden border-b border-border/40">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            {/* Aceternity UI 3D Container Scroll Demo */}
            <HeroScrollDemo />
          </div>
        </section>

        {/* 6. AI WORKSPACE 3D SCROLL MORPH */}
        <section id="ai-workspace" className="py-28 relative overflow-hidden bg-surface/30 border-b border-border/40">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <ScrollMorphHero />
          </div>
        </section>

        {/* 7. TEMPLATES SHOWCASE */}
        <section id="templates" className="py-28 relative overflow-hidden border-b border-border/40">
          <div className="max-w-container-max mx-auto px-margin-desktop space-y-12">
            <ScrollReveal direction="up" className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" /> Precision-Engineered Swiss Templates
              </div>
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                Swiss-Inspired <span className="drawing-text italic font-normal">Templates.</span>
              </h2>
              <p className="text-muted-foreground text-lg font-body">
                Choose from 12 precision-engineered invoice layouts designed for maximum conversion, trust,
                and instant PDF rendering.
              </p>

              {/* Filter Pills */}
              <div className="flex flex-wrap justify-center items-center gap-2 pt-4 max-w-full overflow-x-auto no-scrollbar py-1">
                {[
                  { id: "all", label: "All Templates" },
                  { id: "tech", label: "Tech & Startups" },
                  { id: "swiss", label: "Swiss Minimal" },
                  { id: "corporate", label: "Corporate Enterprise" },
                  { id: "luxury", label: "Luxury Deluxe" },
                  { id: "cyber", label: "Web3 / Cyber" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveTemplateCategory(cat.id);
                      setShowAllTemplates(true);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${activeTemplateCategory === cat.id
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "bg-card border border-border text-foreground/80 hover:text-foreground"
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </ScrollReveal>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedTemplates.map((item, idx) => (
                <ScrollReveal
                  key={item.id}
                  direction="up"
                  delay={idx * 100}
                  className="glass-card rounded-3xl p-6 border border-border/80 hover:border-primary/50 shadow-xl transition-all duration-500 space-y-6 flex flex-col justify-between group hover:-translate-y-2"
                >
                  <div className="space-y-4">
                    {/* Real Live Scaled Invoice Container */}
                    <div
                      onClick={() => setPreviewTemplate(item)}
                      className="relative h-64 sm:h-72 rounded-2xl border border-border/70 bg-slate-100/90 dark:bg-slate-900/60 p-3 sm:p-4 overflow-hidden shadow-inner cursor-pointer group/preview flex justify-center items-start"
                    >
                      {/* Scaled Invoice Sheet Viewport */}
                      <div className="w-full h-full rounded-xl bg-white text-slate-900 border border-slate-200/90 shadow-md overflow-hidden relative">
                        <div className="w-[145%] h-[145%] transform scale-[0.68] origin-top-left pointer-events-none transition-transform duration-500 group-hover/preview:scale-[0.72]">
                          <InvoicePreview
                            data={{
                              ...mockLandingInvoiceData,
                              customization: {
                                ...mockLandingInvoiceData.customization,
                                templateId: item.id as any,
                              },
                            }}
                            templateId={item.id}
                            currencySymbol="$"
                            hideOuterWrapper={true}
                          />
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
                        <span className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs shadow-xl flex items-center gap-1.5 transform translate-y-2 group-hover/preview:translate-y-0 transition-transform">
                          <Eye className="w-3.5 h-3.5 text-primary" /> Full Live Preview
                        </span>
                      </div>

                      {/* Badge in top right */}
                      <div className="absolute top-5 right-5 z-20">
                        {item.isPro ? (
                          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-amber-500 text-black border border-amber-400 font-extrabold shadow-md flex items-center gap-1">
                            <Lock className="w-3 h-3" /> PRO
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold shadow-md">
                            FREE
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-headline text-xl font-bold text-foreground">
                          {item.title}
                        </h3>
                        {item.isPro && (
                          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            Pro Only
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/60">
                      {item.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs text-foreground/90">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-[9px] shrink-0">
                            ✓
                          </span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-2">
                    {item.isPro ? (
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById("pricing");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="w-full py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-headline text-xs font-bold transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Upgrade to Pro to Unlock</span>
                      </button>
                    ) : (
                      <Link
                        to="/invoices/new"
                        search={{ template: item.id }}
                        className="w-full py-3 rounded-2xl bg-primary text-white font-headline text-xs font-bold hover:bg-primary-hover shadow-md hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        <span>Use Template in Builder</span>
                        <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(item)}
                      className="text-center text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors py-1 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview Full Template Showcase</span>
                    </button>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Interactive Full Template Live Preview Dialog */}
            <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/80 p-6 backdrop-blur-2xl">
                <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-2xl font-headline font-bold text-foreground">
                        {previewTemplate?.title}
                      </DialogTitle>
                      {previewTemplate?.isPro ? (
                        <Badge className="bg-amber-500 text-black text-xs font-extrabold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> PRO LOCKED
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs font-bold">
                          FREE BASIC
                        </Badge>
                      )}
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground">
                      {previewTemplate?.desc}
                    </DialogDescription>
                  </div>
                </DialogHeader>

                {previewTemplate && (
                  <div className="py-4 space-y-6">
                    <div className="border border-border/80 rounded-2xl overflow-hidden shadow-2xl bg-card p-2 sm:p-4 relative">
                      <InvoicePreview
                        data={{
                          ...mockLandingInvoiceData,
                          customization: {
                            ...mockLandingInvoiceData.customization,
                            templateId: previewTemplate.id as any,
                          },
                        }}
                        templateId={previewTemplate.id}
                        currencySymbol="$"
                        hideOuterWrapper={true}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-[10px]">
                          ✓
                        </span>
                        <span>
                          {previewTemplate.isPro
                            ? "Pro Template — Upgrade to Pro (₹199/mo) to unlock all 12 templates"
                            : "Free Basic Template — Included with Free account"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPreviewTemplate(null)}
                          className="px-5 py-2.5 rounded-full border border-border text-foreground font-bold text-xs hover:bg-muted transition-all cursor-pointer"
                        >
                          Close Preview
                        </button>
                        {previewTemplate.isPro ? (
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewTemplate(null);
                              const el = document.getElementById("pricing");
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Upgrade to Pro (₹199/mo)</span>
                          </button>
                        ) : (
                          <Link
                            to="/invoices/new"
                            search={{ template: previewTemplate.id }}
                            onClick={() => setPreviewTemplate(null)}
                            className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-xs shadow-lg hover:scale-105 transition-all cursor-pointer btn-premium flex items-center gap-2"
                          >
                            <span>Use Template in Builder</span>
                            <span>→</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* View All Templates Toggle Button */}
            <div className="pt-8 text-center">
              {!showAllTemplates ? (
                <button
                  onClick={() => {
                    setShowAllTemplates(true);
                    setActiveTemplateCategory("all");
                  }}
                  className="px-8 py-3.5 rounded-full bg-primary text-white font-headline text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:bg-primary-hover hover:scale-105 transition-all duration-300 inline-flex items-center gap-2.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>View All Templates ({landingTemplates.length})</span>
                  <span className="text-white font-bold">→</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAllTemplates(false)}
                  className="px-6 py-2.5 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground font-headline text-xs font-bold transition-all duration-300 inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Show Less</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 11. PRICING PREVIEW */}
        <section id="pricing" className="py-28 relative overflow-hidden bg-surface/30 border-b border-border/40">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <div className="text-center mb-20 space-y-4">
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-foreground">
                Simple, Transparent Pricing
              </h2>
              <p className="text-muted-foreground text-xl">
                Choose the plan that fits your growth trajectory.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {/* 🟢 Free Plan */}
              <div className="glass-card rounded-3xl p-8 sm:p-10 flex flex-col justify-between border border-border shadow-xl h-full transition-all duration-300 hover:-translate-y-1">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                      Free
                    </h3>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/20">
                      Starter
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 h-10">
                    <span className="text-5xl font-black text-foreground">₹0</span>
                    <span className="text-muted-foreground font-bold">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px] flex items-center">
                    Essential invoicing features &amp; 3 basic templates for solo creators.
                  </p>
                  <ul className="space-y-3.5 text-muted-foreground text-sm border-t border-border/60 pt-4">
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-lg shrink-0">check_circle</span>
                      <span>3 Free Basic Templates (Zurich, Stripe, Linear)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-lg shrink-0">check_circle</span>
                      <span>Up to 10 Invoices / Month</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-lg shrink-0">check_circle</span>
                      <span>Instant PDF Exports &amp; Link Sharing</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-lg shrink-0">check_circle</span>
                      <span>Standard Community Support</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-lg shrink-0">check_circle</span>
                      <span>Basic Client Directory</span>
                    </li>
                  </ul>
                </div>
                <Link
                  to="/signup"
                  className="block text-center w-full py-3.5 rounded-full bg-card border border-border text-foreground font-bold hover:bg-surface transition-all mt-8"
                >
                  Get Started Free
                </Link>
              </div>

              {/* 🔵 Pro Plan (Recommended Launch Paid Plan with Regional Pricing) */}
              <div className="glass-card rounded-3xl p-8 sm:p-10 flex flex-col justify-between border-2 border-primary shadow-2xl relative bg-primary/5 h-full transition-all duration-300 hover:-translate-y-1">
                <div className="absolute -top-4 right-8">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-md animate-pulse">
                    MOST POPULAR
                  </span>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shrink-0"></span>
                      Pro
                    </h3>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500 text-black font-extrabold">
                      Full Access
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 h-10">
                    <span className="text-5xl font-black text-foreground">₹199</span>
                    <span className="text-muted-foreground font-bold">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px] flex items-center">
                    Full template access &amp; AI generation in Indian Rupees (🇮🇳 ₹199 / month).
                  </p>
                  <ul className="space-y-3.5 text-foreground/90 text-sm border-t border-border/60 pt-4">
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-amber-500 text-lg shrink-0">verified</span>
                      <span className="font-bold text-amber-500">Unlocks All 12 Pro &amp; Swiss Templates</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-lg shrink-0">verified</span>
                      <span className="font-bold">Unlimited AI Invoice Generation</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-lg shrink-0">verified</span>
                      <span className="font-bold">Autonomous Client Intelligence &amp; Branding</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-lg shrink-0">verified</span>
                      <span className="font-bold">Global Tax Compliance Suite</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-lg shrink-0">verified</span>
                      <span className="font-bold">24/7 Priority Support</span>
                    </li>
                  </ul>
                </div>
                <Link
                  to="/signup"
                  className="block text-center w-full py-3.5 rounded-full bg-primary text-white font-bold shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all mt-8 cursor-pointer btn-premium"
                >
                  Upgrade to Pro
                </Link>
              </div>

              {/* 🟣 Business Plan */}
              <div className="glass-card rounded-3xl p-8 sm:p-10 flex flex-col justify-between border border-border shadow-xl h-full transition-all duration-300 hover:-translate-y-1">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-purple-500 inline-block shrink-0"></span>
                      Business
                    </h3>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold border border-purple-500/20">
                      Business Tier
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 h-10">
                    <span className="text-5xl font-black text-foreground">₹399</span>
                    <span className="text-muted-foreground font-bold">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px] flex items-center">
                    Custom deployment &amp; dedicated SLA support for business teams (🇮🇳 ₹399 / month).
                  </p>
                  <ul className="space-y-3.5 text-muted-foreground text-sm border-t border-border/60 pt-4">
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-purple-500 text-lg shrink-0">check_circle</span>
                      <span>Everything Included in Pro Plan</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-purple-500 text-lg shrink-0">check_circle</span>
                      <span>Unlimited Seats &amp; Multi-Team Access</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-purple-500 text-lg shrink-0">check_circle</span>
                      <span>Dedicated API &amp; Webhooks Integration</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-purple-500 text-lg shrink-0">check_circle</span>
                      <span>Dedicated Account Manager &amp; SLA</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-purple-500 text-lg shrink-0">check_circle</span>
                      <span>24/7 Priority Concierge Support</span>
                    </li>
                  </ul>
                </div>
                <Link
                  to="/signup"
                  className="block text-center w-full py-3.5 rounded-full bg-card border border-border text-foreground font-bold hover:bg-surface transition-all mt-8"
                >
                  Upgrade to Business
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 12. MINIMAL ATTRACTIVE FAQ SECTION */}
        <section id="faq" className="py-28 relative border-b border-border/40 bg-surface/20">
          <div className="max-w-4xl mx-auto px-margin-desktop space-y-14">
            {/* Header */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
              </div>
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                Everything you need to know
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                Clear, transparent answers about template access, regional pricing, and financial data security.
              </p>
            </div>

            {/* Symmetrical Minimal Glass Accordion Box */}
            <div className="glass-card rounded-3xl border border-border/80 p-4 sm:p-8 shadow-2xl backdrop-blur-xl space-y-3">
              {[
                {
                  q: "How secure is my financial & client billing data?",
                  a: "We use bank-grade AES-256 encryption at rest and TLS 1.3 in transit. Your financial ledgers and client profiles are strictly private and NEVER used to train public foundation models.",
                },
                {
                  q: "What is the difference between Free and Pro templates?",
                  a: "Free accounts include 3 precision templates (Zurich Modern, Stripe SaaS Minimal, and Linear Monospace). Upgrading to Pro unlocks all 12 templates, signature pad, custom logos, and unlimited AI generation.",
                },
                {
                  q: "How does Indian regional pricing work?",
                  a: "Invoisen AI subscription plans are billed in Indian Rupees: Free (₹0/mo), Pro (🇮🇳 ₹199/mo), and Business (🇮🇳 ₹399/mo).",
                },
                {
                  q: "Can I customize branding, logos, signatures & tax rates?",
                  a: "Yes! Every template supports custom brand colors, high-res corporate logos, vector signatures (draw/type/upload), and multi-currency localized VAT/GST tax rates.",
                },
                {
                  q: "Can I export high-resolution PDFs and share live client links?",
                  a: "Absolutely. Invoisen AI provides instant vector PDF downloads and public web links for your clients to view, download, or settle invoices via Stripe & PayPal.",
                },
                {
                  q: "Can I upgrade, downgrade, or cancel my subscription anytime?",
                  a: "Yes, you retain 100% control over your account. You can upgrade, downgrade, or cancel anytime with 1-click in your Billing settings without hidden fees.",
                },
              ].map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className={`rounded-2xl transition-all duration-300 overflow-hidden border ${isOpen
                        ? "bg-primary/5 border-primary/40 shadow-lg"
                        : "border-transparent hover:border-border/80 hover:bg-muted/40"
                      }`}
                  >
                    <button
                      type="button"
                      className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <span className="font-headline font-bold text-foreground text-base sm:text-lg">
                        {faq.q}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? "bg-primary text-white rotate-180" : "bg-muted text-muted-foreground"
                          }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out px-5 ${isOpen ? "max-h-48 pb-5 opacity-100" : "max-h-0 pb-0 opacity-0"
                        }`}
                    >
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed border-t border-border/40 pt-3">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Support Banner */}
            <div className="text-center pt-2">
              <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-muted-foreground bg-card/80 border border-border/80 px-6 py-3 rounded-full shadow-md">
                <span>Still have questions?</span>
                <Link to="/support" className="text-primary font-bold hover:underline inline-flex items-center gap-1">
                  Chat with 24/7 AI Support &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 13. FUTURISTIC 3D GLASS HIGH IMPACT CTA */}
        <section className="py-28 relative overflow-hidden border-b border-border/40">
          <div className="max-w-6xl mx-auto px-margin-desktop relative">
            {/* Ambient Background Light Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/20 blur-[150px] rounded-full pointer-events-none"></div>

            <div className="glass-card rounded-[2.5rem] border border-primary/30 p-10 sm:p-20 relative z-10 overflow-hidden shadow-2xl backdrop-blur-2xl text-center space-y-8 bg-gradient-to-b from-primary/10 via-card/80 to-card">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-bold uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5" /> Unleash Your Billing Potential
              </div>

              <h2 className="font-headline text-4xl sm:text-6xl md:text-7xl font-black text-foreground tracking-tight max-w-4xl mx-auto leading-tight">
                Ready to transform your financial operations?
              </h2>

              <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
                Join over 24,000+ agency leads, founders, and creators generating invoices 10x faster with AI precision and global tax compliance.
              </p>

              <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
                <Link
                  to="/signup"
                  className="bg-primary text-white px-9 py-4 rounded-full font-headline text-base sm:text-lg font-bold hover:scale-105 transition-all shadow-xl shadow-primary/30 btn-premium"
                >
                  Get Started &rarr;
                </Link>
                <a
                  href="#templates"
                  className="bg-card/80 backdrop-blur-xl border border-border text-foreground px-9 py-4 rounded-full font-headline text-base sm:text-lg font-bold hover:bg-surface transition-all shadow-md"
                >
                  Explore Templates
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center items-center gap-6 pt-6 text-xs text-muted-foreground font-semibold border-t border-border/40 max-w-xl mx-auto">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">&check;</span> 10 Invoices Free Monthly
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">&check;</span> No Credit Card Required
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">&check;</span> Instant Setup
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 14. CINEMATIC FOOTER */}
      <CinematicFooter brandName="INVOISEN" />
    </div>
  );
}
