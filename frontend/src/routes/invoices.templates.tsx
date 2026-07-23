import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, ArrowRight, Layers } from "lucide-react";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";

export const Route = createFileRoute("/invoices/templates")({
  head: () => ({ meta: [{ title: "Swiss & AI Templates Showcase — Invoisen AI" }] }),
  component: TemplatesShowcasePage,
});

const templatesList = [
  {
    id: "modern",
    name: "Zurich Modern",
    description: "Vibrant gradients, rounded glass cards, and dynamic typography tailored for tech agencies and AI startups.",
    accent: "from-blue-600 to-indigo-600",
    badge: "Popular",
    features: ["Gradient Accent Bar", "Client Entity Badges", "Dynamic Line Item Table"],
  },
  {
    id: "minimal",
    name: "Basel Minimal",
    description: "Ultra-clean monochrome aesthetic inspired by Swiss International Typographic Style and Apple clarity.",
    accent: "from-slate-700 to-slate-900",
    badge: "Swiss Classic",
    features: ["Precision Micro-Grid", "High Legibility Typography", "Minimal Watermark"],
  },
  {
    id: "professional",
    name: "Geneva Corporate",
    description: "Formal structured layout with corporate header, VAT breakdown tables, and official verification badges.",
    accent: "from-blue-700 to-cyan-700",
    badge: "Enterprise",
    features: ["Structured VAT Breakdown", "Official Seal Placement", "Dual-Currency Summary"],
  },
  {
    id: "corporate",
    name: "St. Gallen Enterprise",
    description: "Heavyweight financial template designed for high-value enterprise contracts and cross-border billing.",
    accent: "from-purple-700 to-indigo-800",
    badge: "High-Value",
    features: ["Multi-Bank Wire Instructions", "Regulatory Tax Footer", "Audit Stamp"],
  },
  {
    id: "elegant",
    name: "Lucerne Deluxe",
    description: "Luxurious luxury-brand invoice design featuring gold serif typography and elegant signature borders.",
    accent: "from-amber-600 to-orange-600",
    badge: "Luxury",
    features: ["Cursive Signature Box", "Gold Foil Border Accents", "Bespoke Note Card"],
  },
];

function TemplatesShowcasePage() {
  const [selectedTemplate, setSelectedTemplate] = useState("modern");

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white">
      <ThreeBackground />
      <AppNavbar />

      <div className="relative pt-28 pb-16 z-10">
        <div className="max-w-container-max mx-auto px-margin-desktop space-y-12">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Precision-Engineered Swiss Templates
            </div>
            <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-foreground tracking-tight">
              Invoice Design <span className="drawing-text italic">Showcase.</span>
            </h1>
            <p className="text-muted-foreground text-lg font-body">
              Choose from 5 world-class invoice layouts engineered for maximum conversion, trust, and instant PDF rendering.
            </p>
          </div>

          {/* Template Showcase Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templatesList.map((tpl) => (
              <div
                key={tpl.id}
                className={`glass-card rounded-3xl p-8 border transition-all duration-500 space-y-6 flex flex-col justify-between group hover:-translate-y-2 ${
                  selectedTemplate === tpl.id
                    ? "border-primary ring-2 ring-primary/40 shadow-2xl bg-primary/5"
                    : "border-border/80 hover:border-primary/50 shadow-xl"
                }`}
              >
                <div className="space-y-4">
                  <div className="h-40 rounded-2xl bg-gradient-to-tr p-4 flex flex-col justify-between text-white shadow-inner relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="font-headline font-bold text-sm tracking-wider uppercase">{tpl.name}</span>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-md text-[10px] font-bold">
                        {tpl.badge}
                      </Badge>
                    </div>
                    <div className="w-full h-1 bg-white/40 rounded-full" />
                    <div className="text-[10px] font-mono opacity-80 flex justify-between">
                      <span>INV-2026-088</span>
                      <span>$14,700.00</span>
                    </div>
                  </div>

                  <h3 className="font-headline font-bold text-xl text-foreground">{tpl.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-body">{tpl.description}</p>

                  <div className="space-y-2 pt-2 border-t border-border">
                    {tpl.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <Check className="w-3.5 h-3.5 text-success shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to="/invoices/new"
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className="w-full py-3.5 rounded-full font-headline text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 bg-primary text-white hover:scale-105 btn-premium mt-4"
                >
                  Use Template in Builder <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="w-full bg-card border-t border-border mt-16">
        <div className="max-w-container-max mx-auto px-margin-desktop py-8 text-center text-muted-foreground text-xs tracking-widest uppercase font-bold">
          © 2026 Invoisen AI. All rights reserved. Precision-engineered in Zurich.
        </div>
      </footer>
    </div>
  );
}
