import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { InteractiveDashboardPreview } from "@/components/InteractiveDashboardPreview";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden py-10 relative">
      <ContainerScroll
        titleComponent={
          <div className="space-y-4 max-w-4xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Interactive Scroll Animation</span>
            </div>
            <h2 className="text-3xl md:text-6xl font-extrabold text-foreground tracking-tight font-headline">
              Unleash the power of <br />
              <span className="text-4xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500 leading-none">
                Autonomous Billing
              </span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto font-medium">
              Watch your invoice engine tilt and transform in real-time as you scroll down.
            </p>
          </div>
        }
      >
        <div className="h-full w-full bg-card/90 rounded-2xl border border-border/80 p-2 md:p-6 overflow-y-auto relative shadow-2xl backdrop-blur-xl">
          {/* Header Bar inside Card */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <div className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <div className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs font-mono font-bold text-muted-foreground ml-2">
                invoisen.ai/live-session
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <Zap className="w-3.5 h-3.5" />
              <span>LIVE AI SYNC</span>
            </div>
          </div>

          <InteractiveDashboardPreview />
        </div>
      </ContainerScroll>
    </div>
  );
}
