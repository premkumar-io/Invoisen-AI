import { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Zap,
  Globe2,
  FileCheck2,
  Lock,
  Bot,
} from "lucide-react";

export function Hero3DModel() {
  const [activeTab, setActiveTab] = useState<"preview" | "workflow">("preview");
  const [pulseCount, setPulseCount] = useState(142850);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount((prev) => prev + Math.floor(Math.random() * 120 + 30));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full p-6 md:p-8 flex flex-col justify-between relative overflow-hidden select-none min-h-[560px]">
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/12 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: "10s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Header: System Telemetry Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </div>
          <div>
            <div className="font-mono text-[11px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
              <span>SYS_OK</span>
              <span className="text-border">•</span>
              <span className="text-foreground">AI MATRIX CORE v3.4</span>
            </div>
            <div className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Real-Time Autonomous Sync</span>
            </div>
          </div>
        </div>

        {/* View Segment Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-card/60 border border-border/60 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === "preview"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Live Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("workflow")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === "workflow"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            AI Engine Flow
          </button>
        </div>
      </div>

      {/* Main Feature Showcase Area */}
      <div className="relative z-10 my-auto py-6 space-y-6">
        {activeTab === "preview" ? (
          /* Live Dashboard Preview Card */
          <div className="space-y-4">
            {/* Primary Glowing Invoice Summary Card */}
            <div className="glass-card p-6 rounded-3xl border border-white/20 bg-card/60 shadow-2xl backdrop-blur-xl relative overflow-hidden group hover:border-primary/40 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/30 to-purple-500/10 rounded-bl-full pointer-events-none" />

              <div className="flex items-start justify-between relative z-10 mb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-muted-foreground tracking-widest uppercase">
                    Processed Monthly Revenue
                  </span>
                  <div className="font-headline text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mt-1 flex items-baseline gap-2">
                    <span>${pulseCount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +28.4%
                    </span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 text-primary flex items-center justify-center font-bold shadow-inner">
                  <Bot className="w-5 h-5" />
                </div>
              </div>

              {/* Sample Extracted Line Item Stack */}
              <div className="space-y-2.5 pt-2 relative z-10">
                <div className="p-3 rounded-2xl bg-card/80 border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs">
                      AI
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Global Enterprise Retainer</div>
                      <div className="text-[10px] text-muted-foreground font-medium">Acme Corp • Swiss QR Compliant</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-foreground">$45,000.00</div>
                    <div className="text-[10px] font-bold text-emerald-500">Auto-Audited</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-card/80 border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center font-bold text-xs">
                      FX
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Neural Infrastructure Setup</div>
                      <div className="text-[10px] text-muted-foreground font-medium">USD / EUR / CHF Auto Sync</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-foreground">$97,850.00</div>
                    <div className="text-[10px] font-bold text-primary">Settled Instant</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Micro Feature Badges Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-3.5 rounded-2xl border border-border/80 bg-card/40 flex items-center gap-3 backdrop-blur-md">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">99.9% Extraction</div>
                  <div className="text-[10px] text-muted-foreground font-medium">Zero Manual Data Entry</div>
                </div>
              </div>

              <div className="glass-card p-3.5 rounded-2xl border border-border/80 bg-card/40 flex items-center gap-3 backdrop-blur-md">
                <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shrink-0">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">150+ Currencies</div>
                  <div className="text-[10px] text-muted-foreground font-medium">Live FX Exchange Rate</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Autonomous Workflow Visualizer Step Cards */
          <div className="space-y-3">
            {[
              {
                step: "01",
                title: "Smart Document Ingestion",
                desc: "PDFs, Receipts, & Emails parsed in 0.1 seconds via Gemini Vision AI.",
                icon: FileCheck2,
                color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
              },
              {
                step: "02",
                title: "Swiss Tax & Entity Audit",
                desc: "Automatic VAT calculation, client background research, and IBAN validation.",
                icon: Sparkles,
                color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
              },
              {
                step: "03",
                title: "One-Click Settlement Link",
                desc: "Instant Stripe & Swiss QR Code payment links embedded into your invoice.",
                icon: ArrowUpRight,
                color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
              },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="glass-card p-4 rounded-2xl border border-border/80 bg-card/50 backdrop-blur-xl flex items-start gap-4 transition-all hover:translate-x-1"
                >
                  <div className={`w-10 h-10 rounded-xl ${item.color} border flex items-center justify-center shrink-0 font-bold font-mono text-sm`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground">
                        STEP {item.step}
                      </span>
                      <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Footer: Security & Social Proof Banner */}
      <div className="relative z-10 pt-4 border-t border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <span className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-background flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
              PK
            </span>
            <span className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
              AC
            </span>
            <span className="w-7 h-7 rounded-full bg-purple-500 border-2 border-background flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
              ZH
            </span>
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">24,000+ Active Teams</div>
            <div className="text-[10px] text-muted-foreground font-medium">Processing $14.8M+ Monthly</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-card/60 px-3 py-1.5 rounded-full border border-border/60 backdrop-blur-md">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>SOC-2 Certified</span>
        </div>
      </div>
    </div>
  );
}
