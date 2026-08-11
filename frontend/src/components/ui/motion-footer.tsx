"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { Link } from "@tanstack/react-router";
import { X, ShieldCheck, FileText, LifeBuoy, CheckCircle2, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

// -------------------------------------------------------------------------
// 1. THEME-ADAPTIVE INLINE STYLES
// -------------------------------------------------------------------------
const STYLES = `
.cinematic-footer-wrapper {
  font-family: var(--font-body, system-ui, sans-serif);
  -webkit-font-smoothing: antialiased;
  
  --pill-bg-1: color-mix(in oklch, var(--foreground) 4%, transparent);
  --pill-bg-2: color-mix(in oklch, var(--foreground) 1%, transparent);
  --pill-shadow: color-mix(in oklch, var(--background) 50%, transparent);
  --pill-highlight: color-mix(in oklch, var(--foreground) 10%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--background) 80%, transparent);
  --pill-border: color-mix(in oklch, var(--foreground) 10%, transparent);
  
  --pill-bg-1-hover: color-mix(in oklch, var(--foreground) 10%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, var(--foreground) 3%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--foreground) 25%, transparent);
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); }
  15%, 45% { transform: scale(1.2); }
  30% { transform: scale(1); }
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 35s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

.footer-bg-grid {
  background-size: 40px 40px;
  background-image: 
    linear-gradient(to right, color-mix(in oklch, var(--foreground) 4%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 4%, transparent) 1px, transparent 1px);
  mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
  -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
}

.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow: 0 4px 20px -5px var(--pill-shadow), inset 0 1px 1px var(--pill-highlight);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.3s ease;
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  color: var(--foreground);
}

.footer-giant-bg-text {
  font-size: min(18vw, 180px);
  line-height: 0.85;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in oklch, var(--foreground) 8%, transparent);
  background: linear-gradient(180deg, color-mix(in oklch, var(--foreground) 12%, transparent) 0%, transparent 80%);
  -webkit-background-clip: text;
  background-clip: text;
}
`;

// -------------------------------------------------------------------------
// 2. MAGNETIC BUTTON PRIMITIVE
// -------------------------------------------------------------------------
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & 
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
    to?: string;
    href?: string;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;

          gsap.to(element, {
            x: x * 0.25,
            y: y * 0.25,
            scale: 1.03,
            ease: "power2.out",
            duration: 0.3,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 0.8,
          });
        };

        element.addEventListener("mousemove", handleMouseMove as any);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          element.removeEventListener("mousemove", handleMouseMove as any);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement) => {
          (localRef as any).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as any).current = node;
        }}
        className={cn("cursor-pointer select-none", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

const MarqueeItem = () => (
  <div className="flex items-center space-x-8 px-4">
    <span>Autonomous AI Invoicing</span> <span className="text-primary/60">✦</span>
    <span>Swiss Tax Compliance</span> <span className="text-purple-500/60">✦</span>
    <span>160+ Multi-Currency</span> <span className="text-primary/60">✦</span>
    <span>Instant Vector PDFs</span> <span className="text-purple-500/60">✦</span>
    <span>Bank-Grade Encryption</span> <span className="text-primary/60">✦</span>
  </div>
);

export function CinematicFooter({ brandName = "INVOISEN" }: { brandName?: string }) {
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | "support" | null>(null);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <footer className="relative w-full overflow-hidden bg-card text-foreground border-t border-border/60 pt-16 pb-12 cinematic-footer-wrapper">
        {/* Ambient Light & Grid Background */}
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

        {/* 1. Marquee Banner */}
        <div className="relative z-10 w-full overflow-hidden border-y border-border/50 bg-surface/50 backdrop-blur-md py-3.5 mb-16">
          <div className="flex w-max animate-footer-scroll-marquee text-xs font-bold tracking-[0.25em] text-muted-foreground uppercase">
            <MarqueeItem />
            <MarqueeItem />
            <MarqueeItem />
          </div>
        </div>

        {/* 2. Main Content Container */}
        <div className="relative z-10 max-w-container-max mx-auto px-margin-desktop space-y-12 text-center">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-6xl font-black font-headline tracking-tight text-foreground">
              Ready to automate billing?
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-body">
              Join thousands of creators &amp; agencies generating invoices 10x faster with AI precision.
            </p>
          </div>

          {/* Interactive Navigation Pills */}
          <div className="flex flex-col items-center gap-6 max-w-3xl mx-auto">
            {/* Primary Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton
                as={Link}
                to="/signup"
                className="footer-glass-pill px-8 py-4 rounded-full text-foreground font-bold text-sm flex items-center gap-2.5 border border-border shadow-lg"
              >
                <span className="material-symbols-outlined text-primary text-lg">rocket_launch</span>
                Get Started Free
              </MagneticButton>

              <MagneticButton
                as={Link}
                to="/dashboard"
                className="footer-glass-pill px-8 py-4 rounded-full text-foreground font-bold text-sm flex items-center gap-2.5 border border-border shadow-lg"
              >
                <span className="material-symbols-outlined text-purple-500 text-lg">space_dashboard</span>
                Launch Workspace
              </MagneticButton>
            </div>

            {/* Modal Links */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal("privacy")}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <span className="text-border text-xs">•</span>
              <button
                type="button"
                onClick={() => setActiveModal("terms")}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <span className="text-border text-xs">•</span>
              <button
                type="button"
                onClick={() => setActiveModal("support")}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Help Center &amp; Support
              </button>
            </div>
          </div>

          {/* Brand Watermark */}
          <div className="pt-8 select-none pointer-events-none">
            <div className="footer-giant-bg-text mx-auto leading-none">
              {brandName}
            </div>
          </div>

          {/* 3. Bottom Bar */}
          <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-semibold">
            <div>
              © 2026 Invoisen AI Technologies. All rights reserved.
            </div>

            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border/60">
              <span>Crafted with</span>
              <span className="animate-footer-heartbeat text-destructive text-sm">❤</span>
              <span>for Freelancers &amp; Agencies</span>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="w-10 h-10 rounded-full border border-border bg-card hover:bg-surface text-foreground flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105"
              title="Back to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>

      {/* Modern Dialog Modal for Privacy, Terms & Support */}
      {activeModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-2xl animate-in fade-in duration-200 select-text">
            <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-primary/20 bg-card p-6 sm:p-8 shadow-2xl space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/80 pb-4">
                <div className="flex items-center gap-3">
                  {activeModal === "privacy" && (
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  )}
                  {activeModal === "terms" && (
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-500/20">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  {activeModal === "support" && (
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20">
                      <LifeBuoy className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-headline text-lg font-bold text-foreground">
                      {activeModal === "privacy" && "Privacy Policy & Data Protection"}
                      {activeModal === "terms" && "Terms of Service & Licensing"}
                      {activeModal === "support" && "Help Center & Support Desk"}
                    </h3>
                    <p className="text-xs text-muted-foreground">Invoisen AI Autonomous Invoicing Platform</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="w-9 h-9 rounded-xl border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {activeModal === "privacy" && (
                  <>
                    <p className="font-medium text-foreground">
                      At Invoisen AI, your financial data, billing records, and client privacy are protected with zero-trust architecture.
                    </p>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-start gap-3 bg-muted/40 p-3.5 rounded-2xl border border-border/50">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-foreground">AES-256 &amp; TLS 1.3 Encryption:</span> All draft and published invoices are encrypted both at rest and in transit.
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-muted/40 p-3.5 rounded-2xl border border-border/50">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-foreground">AI Isolation Guarantee:</span> Prompt entries and client invoice details are never used to train global public AI models.
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-muted/40 p-3.5 rounded-2xl border border-border/50">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-foreground">Complete Data Ownership:</span> You can export or permanently delete your financial data, invoices, and client lists at any time.
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeModal === "terms" && (
                  <>
                    <p className="font-medium text-foreground">
                      Welcome to Invoisen AI. By using our platform, you agree to these standard SaaS subscription terms.
                    </p>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-start gap-3 bg-muted/40 p-3.5 rounded-2xl border border-border/50">
                        <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-foreground">Subscription &amp; Usage:</span> Starter and Pro Elite plans provide full access to vector PDF generation, multi-currency conversion, and AI client enrichment.
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-muted/40 p-3.5 rounded-2xl border border-border/50">
                        <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-foreground">99.9% Uptime SLA:</span> We guarantee continuous access to your invoice dashboard and API endpoints.
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-muted/40 p-3.5 rounded-2xl border border-border/50">
                        <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-foreground">Fair Usage Policy:</span> AI automation limits reset monthly based on your chosen billing plan.
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeModal === "support" && (
                  <>
                    <p className="font-medium text-foreground">
                      Need assistance with invoice generation, Swiss VAT rules, or custom branding? We're here to help.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 pt-2">
                      <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 space-y-2">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">AI Assistant</span>
                        <p className="text-xs text-foreground font-semibold">Instant AI Support Chat</p>
                        <p className="text-[11px] text-muted-foreground">Click the floating AI FAB button on the bottom right of any screen for instant guidance.</p>
                      </div>
                      <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/20 space-y-2">
                        <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">Direct Email</span>
                        <p className="text-xs text-foreground font-semibold">support@invoisen.com</p>
                        <p className="text-[11px] text-muted-foreground">Response time: within 2 hours for Pro &amp; Enterprise accounts.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer Action */}
              <div className="flex justify-end border-t border-border/80 pt-4">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2 rounded-xl bg-primary text-white font-bold text-xs shadow-md hover:scale-105 transition-all cursor-pointer"
                >
                  Close &amp; Continue
                </button>
              </div>

            </div>
          </div>,
          document.body
        )}
    </>
  );
}
