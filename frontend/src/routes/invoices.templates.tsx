import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  LayoutGrid,
  Columns,
  Search,
  Check,
  ChevronRight,
  Lock,
} from "lucide-react";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { AppFooter } from "@/components/AppFooter";
import { useAuth } from "@/lib/auth-context";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import type { InvoiceForm } from "@/components/invoice/InvoiceEditor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/invoices/templates")({
  head: () => ({
    meta: [
      { title: "Swiss & AI Templates Studio — Invoisen AI" },
      {
        name: "description",
        content: "Explore precision-engineered invoice templates with real-time live preview and builder integration.",
      },
    ],
  }),
  component: TemplatesShowcasePage,
});

interface TemplateItem {
  id: string;
  name: string;
  category: "modern" | "minimal" | "corporate" | "luxury" | "cyber";
  categoryLabel: string;
  description: string;
  accentGradient: string;
  accentColor: string;
  badge: string;
  recommendedFor: string;
  features: string[];
  isPro?: boolean;
}

const templatesList: TemplateItem[] = [
  {
    id: "modern",
    name: "Zurich Modern",
    category: "modern",
    categoryLabel: "Tech & Startups",
    isPro: false,
    description:
      "Vibrant gradient accents, rounded glass cards, and clean typography tailored for SaaS, tech agencies, and AI startups.",
    accentGradient: "from-blue-600 via-indigo-600 to-purple-600",
    accentColor: "#3b82f6",
    badge: "Popular",
    recommendedFor: "AI & Tech Startups, Digital Agencies",
    features: [
      "Vibrant Blue Gradient Accents",
      "Rounded Card Container",
      "Dynamic Tax & Subtotal Breakdown",
      "Instant PDF & Link Share Ready",
    ],
  },
  {
    id: "stripe",
    name: "Stripe SaaS Minimal",
    category: "modern",
    categoryLabel: "Tech & Startups",
    isPro: false,
    description:
      "Sleek API-inspired layout with clean line borders, code font subheaders, and Stripe dashboard aesthetics.",
    accentGradient: "from-indigo-600 via-violet-600 to-blue-600",
    accentColor: "#6366f1",
    badge: "Pro SaaS",
    recommendedFor: "SaaS Platforms, Subscription Services",
    features: [
      "API-Style Line Item Layout",
      "Code Font Transaction Headers",
      "Stripe Checkout Aesthetic",
      "Automatic Recurring Interval Badge",
    ],
  },
  {
    id: "linear",
    name: "Linear Monospace",
    category: "modern",
    categoryLabel: "Tech & Startups",
    isPro: false,
    description:
      "Dark monospace tech typography with high-density task line items and issue tracking aesthetics.",
    accentGradient: "from-violet-800 via-purple-900 to-slate-950",
    accentColor: "#8b5cf6",
    badge: "Developer",
    recommendedFor: "Software Engineers, DevOps & Quant Devs",
    features: [
      "Monospace Precision Grid",
      "Sprint & Work Item Tags",
      "High Density Item Table",
      "Git-Style Commit Hash Reference",
    ],
  },
  {
    id: "minimal",
    name: "Basel Minimal",
    category: "minimal",
    categoryLabel: "Swiss Minimal",
    isPro: true,
    description:
      "Ultra-clean monochrome aesthetic inspired by Swiss International Typographic Style and Apple product clarity.",
    accentGradient: "from-slate-800 via-slate-900 to-black",
    accentColor: "#0f172a",
    badge: "Swiss Classic",
    recommendedFor: "Designers, Consultants, Architects",
    features: [
      "Precision Swiss Grid Layout",
      "High-Legibility Monospaced Totals",
      "Minimalist Watermark & Seal",
      "Ultra-Compact Single Page Export",
    ],
  },
  {
    id: "apple",
    name: "Apple Cupertino Luxe",
    category: "minimal",
    categoryLabel: "Swiss Minimal",
    isPro: true,
    description:
      "Ultra-refined typography, generous whitespace, subtle translucent dividers, and Apple-grade precision.",
    accentGradient: "from-gray-700 via-slate-800 to-zinc-900",
    accentColor: "#334155",
    badge: "Cupertino",
    recommendedFor: "Product Designers, Creative Directors",
    features: [
      "Cupertino Minimalist Hierarchy",
      "Subtle Translucent Separators",
      "Refined Typography Ratios",
      "Clean Light & Dark Balance",
    ],
  },
  {
    id: "nordic",
    name: "Nordic Frost Minimal",
    category: "minimal",
    categoryLabel: "Swiss Minimal",
    isPro: true,
    description:
      "Cool ice-blue accents, crisp geometric structure, and Scandinavian minimalism for design studios.",
    accentGradient: "from-sky-700 via-slate-800 to-slate-950",
    accentColor: "#0284c7",
    badge: "Nordic",
    recommendedFor: "Nordic Studios, Content Creators",
    features: [
      "Scandinavian Ice Blue Accents",
      "Crisp Geometric Layout",
      "Spacious Line Heights",
      "Minimal Footnote Watermark",
    ],
  },
  {
    id: "professional",
    name: "Geneva Corporate",
    category: "corporate",
    categoryLabel: "Corporate Enterprise",
    isPro: true,
    description:
      "Formal structured layout with corporate header, VAT breakdown tables, and official verification badges.",
    accentGradient: "from-blue-800 via-cyan-800 to-slate-900",
    accentColor: "#1e3a8a",
    badge: "Enterprise",
    recommendedFor: "Corporate Services, Law & Legal Firms",
    features: [
      "Structured VAT Breakdown Grid",
      "Official Seal & Verification Placement",
      "Multi-Currency Settlement Notes",
      "Corporate Wire Transfer Table",
    ],
  },
  {
    id: "corporate",
    name: "St. Gallen Enterprise",
    category: "corporate",
    categoryLabel: "Corporate Enterprise",
    isPro: true,
    description:
      "Heavyweight financial template designed for high-value enterprise contracts and cross-border multi-currency billing.",
    accentGradient: "from-purple-900 via-indigo-900 to-slate-950",
    accentColor: "#4c1d95",
    badge: "High-Value",
    recommendedFor: "Financial Services, Audit & Investment",
    features: [
      "Multi-Bank Wire Instructions",
      "Regulatory Tax & Compliance Footer",
      "Audit Verification Stamp",
      "Enterprise Line Item Hierarchy",
    ],
  },
  {
    id: "elegant",
    name: "Lucerne Deluxe",
    category: "luxury",
    categoryLabel: "Luxury Deluxe",
    isPro: true,
    description:
      "Luxurious luxury-brand invoice design featuring gold serif typography, cursive signature box, and elegant borders.",
    accentGradient: "from-amber-700 via-amber-900 to-yellow-950",
    accentColor: "#78350f",
    badge: "Luxury",
    recommendedFor: "Bespoke Jewelry, Fine Art, Luxury Goods",
    features: [
      "Gold Foil Accent Borders",
      "Cursive Signature Box",
      "Serif Typography Hierarchy",
      "Bespoke Client Note Card",
    ],
  },
  {
    id: "emerald",
    name: "Emerald Luxe Executive",
    category: "luxury",
    categoryLabel: "Luxury Deluxe",
    isPro: true,
    description:
      "Deep emerald green gold foil accents, formal serif headers, and executive wealth management layout.",
    accentGradient: "from-emerald-800 via-teal-950 to-slate-950",
    accentColor: "#065f46",
    badge: "Executive",
    recommendedFor: "Private Banking, Wealth Advisors",
    features: [
      "Deep Emerald Green Frame",
      "Executive Seal Watermark",
      "Formal Signature Stamp",
      "High-Value Contract Summary",
    ],
  },
  {
    id: "cyber",
    name: "Matterhorn Cyber",
    category: "cyber",
    categoryLabel: "Web3 & Cyber",
    isPro: true,
    description:
      "High-contrast neon emerald & dark obsidian layout engineered for web3 protocols, quant devs, and cyber security firms.",
    accentGradient: "from-emerald-700 via-teal-900 to-slate-950",
    accentColor: "#047857",
    badge: "Web3 / Cyber",
    recommendedFor: "Web3 Developers, Quant Security, Crypto",
    features: [
      "High-Contrast Neon Border",
      "On-Chain Hash & Crypto Address Line",
      "Instant Crypto & Fiat Calculation",
      "Dark Theme High Contrast View",
    ],
  },
  {
    id: "brutalist",
    name: "Studio Neo-Brutalist",
    category: "cyber",
    categoryLabel: "Web3 & Cyber",
    isPro: true,
    description:
      "Bold black borders, stark contrast blocks, retro monospace badges, and raw creative agency vibes.",
    accentGradient: "from-yellow-500 via-orange-600 to-red-700",
    accentColor: "#d97706",
    badge: "Neo-Brutalist",
    recommendedFor: "Creative Agencies, Media Studios",
    features: [
      "Heavy Black Border Frame",
      "Stark High-Contrast Color Blocks",
      "Retro Monospace Badges",
      "Raw Creative Agency Layout",
    ],
  },
];

const mockInvoiceForm: InvoiceForm = {
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
      name: "Cloud Infrastructure & Micro-Grid Setup",
      description: "High-availability multi-region cloud server setup and security audit.",
      quantity: 1,
      rate: 6200,
    },
  ],
  calculations: {
    taxType: "VAT",
    taxRate: 8,
    discount: 0,
    shipping: 0,
  },
  paymentTerms: "Net 15 Days. Bank wire or Stripe payment accepted.",
  notes: "Thank you for partnering with us! Please include invoice number INV-2026-088 in payment reference.",
  customization: {
    templateId: "modern",
    signatureMode: "draw",
    signatureName: "Prem Kumar",
    signatureTitle: "Founder & CEO",
  },
};

function TemplatesShowcasePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isProUser = user?.plan === "pro" || user?.plan === "enterprise";

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "studio">("grid");
  const [studioSelectedId, setStudioSelectedId] = useState("modern");
  const [selectedCurrency, setSelectedCurrency] = useState("$");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);

  const categories = [
    { id: "all", label: "All Templates" },
    { id: "modern", label: "Tech & Startups" },
    { id: "minimal", label: "Swiss Minimal" },
    { id: "corporate", label: "Corporate Enterprise" },
    { id: "luxury", label: "Luxury Deluxe" },
    { id: "cyber", label: "Web3 & Cyber" },
  ];

  const filteredTemplates = templatesList.filter((t) => {
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.recommendedFor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedStudioTemplate =
    templatesList.find((t) => t.id === studioSelectedId) || templatesList[0];

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white">
      {/* 3D WebGL Background Canvas */}
      <ThreeBackground />

      {/* Top Navigation Bar Matching Landing Page & Invoices Dashboard */}
      <AppNavbar />

      {/* Main Page Content Container */}
      <div className="relative pt-28 pb-16 z-10">
        <div className="max-w-container-max mx-auto px-margin-desktop space-y-12">
          {/* Hero Banner Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-sm font-medium">
                <Sparkles className="w-4 h-4" /> 6 Precision Swiss &amp; AI Vector Layouts
              </div>
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                Invoice Template <span className="drawing-text italic">Studio.</span>
              </h1>
              <p className="text-muted-foreground font-body text-lg">
                Explore precision-engineered invoice templates with real-time live preview,
                custom themes, tax breakdown matrix, and instant PDF builder integration.
              </p>
            </div>

            {/* View Mode Switcher Toggle */}
            <div className="flex items-center gap-2 bg-card/80 p-2 rounded-2xl border border-border/80 shadow-lg backdrop-blur-md shrink-0 self-start lg:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-headline text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Grid Gallery</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("studio")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-headline text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "studio"
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Columns className="w-4 h-4" />
                <span>Interactive Studio</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filters Bar */}
          <div className="glass-card rounded-3xl p-4 sm:p-5 md:p-6 border border-border/80 shadow-2xl backdrop-blur-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 overflow-hidden">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 min-w-0 flex-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-full font-headline text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeCategory === cat.id
                      ? "bg-primary text-white shadow-md shadow-primary/25"
                      : "bg-card/80 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-card"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72 xl:w-80 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by style or industry..."
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-border/80 bg-card/60 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* VIEW MODE 1: GRID GALLERY */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="glass-card rounded-3xl p-6 border border-border/80 hover:border-primary/60 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    {/* Real Live Scaled Invoice Container */}
                    <div
                      onClick={() => setPreviewTemplate(tpl)}
                      className="relative h-64 sm:h-72 rounded-2xl border border-border/70 bg-slate-100/90 dark:bg-slate-900/60 p-3 sm:p-4 overflow-hidden shadow-inner cursor-pointer group/preview flex justify-center items-start"
                    >
                      {/* Scaled Invoice Sheet Viewport */}
                      <div className="w-full h-full rounded-xl bg-white text-slate-900 border border-slate-200/90 shadow-md overflow-hidden relative">
                        <div className="w-[145%] h-[145%] transform scale-[0.68] origin-top-left pointer-events-none transition-transform duration-500 group-hover/preview:scale-[0.72]">
                          <InvoicePreview
                            data={{
                              ...mockInvoiceForm,
                              customization: {
                                ...mockInvoiceForm.customization,
                                templateId: tpl.id as any,
                              },
                            }}
                            templateId={tpl.id}
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

                      {/* Top Badge */}
                      <div className="absolute top-5 right-5 z-20">
                        {tpl.isPro ? (
                          isProUser ? (
                            <Badge
                              variant="secondary"
                              className="bg-emerald-600 text-white font-mono text-[10px] font-extrabold shadow-md px-3 py-1 rounded-full flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" /> PRO UNLOCKED
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-amber-500 text-black border border-amber-400 font-mono text-[10px] font-extrabold shadow-md px-3 py-1 rounded-full flex items-center gap-1"
                            >
                              <Lock className="w-3 h-3 text-black" /> PRO ONLY
                            </Badge>
                          )
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-600 text-white font-mono text-[10px] font-extrabold shadow-md px-3 py-1 rounded-full"
                          >
                            FREE
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-headline font-bold text-lg text-foreground">
                          {tpl.name}
                        </h3>
                        <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                          {tpl.categoryLabel}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed font-body line-clamp-2">
                        {tpl.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-border/60">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Target Industry
                      </div>
                      <div className="text-xs font-semibold text-primary">
                        {tpl.recommendedFor}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-border/60">
                      {tpl.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs font-medium text-foreground/90"
                        >
                          <Check className="w-3.5 h-3.5 text-success shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-border/40 mt-4">
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(tpl)}
                      className="flex-1 py-3 px-4 rounded-full font-headline text-xs font-bold border border-border/80 text-foreground hover:bg-muted transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-primary" />
                      <span>Preview</span>
                    </button>
                    {tpl.isPro && !isProUser ? (
                      <Link
                        to="/billing"
                        className="flex-1 py-3 px-4 rounded-full font-headline text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Upgrade to Unlock</span>
                      </Link>
                    ) : (
                      <Link
                        to="/invoices/new"
                        search={{ template: tpl.id }}
                        className="flex-1 py-3 px-4 rounded-full font-headline text-xs font-bold bg-primary text-white hover:bg-primary-hover shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer btn-premium"
                      >
                        <span>Use Template</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW MODE 2: INTERACTIVE STUDIO SPLIT VIEW */}
          {viewMode === "studio" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Template Selection Cards */}
              <div className="lg:col-span-5 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                  Select Template ({filteredTemplates.length})
                </div>
                <div className="space-y-3">
                  {filteredTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => setStudioSelectedId(tpl.id)}
                      className={`glass-card rounded-2xl p-5 border transition-all cursor-pointer flex items-center justify-between ${
                        studioSelectedId === tpl.id
                          ? "border-primary ring-2 ring-primary/30 shadow-2xl bg-primary/5"
                          : "border-border/80 hover:border-primary/40 hover:bg-card"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: tpl.accentColor }}
                          />
                          <h4 className="font-headline font-bold text-sm text-foreground">
                            {tpl.name}
                          </h4>
                          <Badge variant="outline" className="text-[9px] font-bold py-0">
                            {tpl.badge}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {tpl.description}
                        </p>
                        <div className="text-[10px] text-primary font-semibold">
                          {tpl.recommendedFor}
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-5 h-5 transition-transform ${
                          studioSelectedId === tpl.id
                            ? "text-primary translate-x-1"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Live Interactive Viewport */}
              <div className="lg:col-span-7 glass-card rounded-3xl p-6 border border-border/80 shadow-2xl space-y-6 sticky top-24">
                {/* Viewport Control Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/80">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline font-bold text-lg text-foreground">
                        {selectedStudioTemplate.name} Studio
                      </h3>
                      <Badge variant="secondary" className="text-xs font-bold">
                        Live Render
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Interactive real-time preview of your selected invoice layout
                    </p>
                  </div>

                  {/* Controls: Currency selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">Currency:</span>
                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
                      {["$", "€", "£", "CHF", "₹"].map((curr) => (
                        <button
                          key={curr}
                          type="button"
                          onClick={() => setSelectedCurrency(curr)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            selectedCurrency === curr
                              ? "bg-primary text-white shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Render Area */}
                <div className="border border-border/80 rounded-2xl overflow-hidden shadow-2xl bg-card">
                  <InvoicePreview
                    data={{
                      ...mockInvoiceForm,
                      customization: {
                        ...mockInvoiceForm.customization,
                        templateId: selectedStudioTemplate.id as any,
                      },
                    }}
                    templateId={selectedStudioTemplate.id}
                    currencySymbol={selectedCurrency}
                    hideOuterWrapper={true}
                  />
                </div>

                {/* Bottom Action Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-border/60">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    <span>Ready for instant PDF generation &amp; Client Portal</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/invoices/new",
                        search: { template: selectedStudioTemplate.id },
                      })
                    }
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-primary text-white font-headline text-xs font-bold shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 btn-premium cursor-pointer"
                  >
                    <span>Customize &amp; Create Invoice</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Full Template Live Preview Dialog */}
          <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
            <DialogContent className="w-[94vw] sm:w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/80 p-3 sm:p-6 backdrop-blur-2xl">
              <DialogHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl sm:text-2xl font-headline font-bold text-foreground">
                      {previewTemplate?.name}
                    </DialogTitle>
                    <Badge variant="secondary" className="text-xs font-bold">
                      {previewTemplate?.badge}
                    </Badge>
                  </div>
                  <DialogDescription className="text-xs text-muted-foreground">
                    {previewTemplate?.description}
                  </DialogDescription>
                </div>
              </DialogHeader>

              {previewTemplate && (
                <div className="py-3 sm:py-4 space-y-4 sm:space-y-6">
                  <div className="border border-border/80 rounded-2xl overflow-hidden shadow-2xl bg-card overflow-x-auto">
                    <InvoicePreview
                      data={{
                        ...mockInvoiceForm,
                        customization: {
                          ...mockInvoiceForm.customization,
                          templateId: previewTemplate.id as any,
                        },
                      }}
                      templateId={previewTemplate.id}
                      currencySymbol="$"
                      hideOuterWrapper={true}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      <span>Ready for instant PDF download &amp; client link sharing</span>
                    </div>
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPreviewTemplate(null)}
                        className="px-4 sm:px-5 py-2.5 rounded-full border border-border text-foreground font-bold text-xs hover:bg-muted transition-all cursor-pointer"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const tId = previewTemplate.id;
                          setPreviewTemplate(null);
                          navigate({ to: "/invoices/new", search: { template: tId } });
                        }}
                        className="px-5 sm:px-6 py-2.5 rounded-full bg-primary text-white font-bold text-xs shadow-lg hover:scale-105 transition-all cursor-pointer btn-premium flex items-center justify-center gap-2"
                      >
                        <span>Use Template</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Standard App Footer */}
          <AppFooter />
        </div>
      </div>
    </div>
  );
}
