import { useEffect, useState } from "react";
import { Sparkles, ShieldCheck, Zap, Layers, Cpu, CreditCard, HelpCircle, Rocket } from "lucide-react";

export function ThreeDLineStream() {
  const [pulsePos, setPulsePos] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePos((prev) => (prev >= 100 ? 0 : prev + 0.5));
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden hidden md:block">
      {/* Central 3D Glowing Beam Line */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent">
        {/* Animated 3D Laser Beam Pulse Packet */}
        <div
          className="absolute w-1 h-32 -left-[1.5px] bg-gradient-to-b from-transparent via-primary to-transparent blur-[2px] shadow-[0_0_15px_rgba(59,130,246,0.8)] transition-all duration-75"
          style={{ top: `${pulsePos}%` }}
        />
        <div
          className="absolute w-2 h-16 -left-[3.5px] bg-gradient-to-b from-transparent via-amber-400 to-transparent blur-[1px]"
          style={{ top: `${pulsePos}%` }}
        />
      </div>

      {/* SVG Connecting Path with Dashed Energy Flow */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="30%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#ec4899" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d="M 50% 0 V 100%"
          stroke="url(#lineGlow)"
          strokeWidth="2"
          strokeDasharray="8 12"
          className="animate-pulse"
        />
      </svg>

      {/* Interactive 3D Node Badges at Junction Points */}
      <div className="relative max-w-container-max mx-auto h-full">
        {/* Hero Junction Node */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[800px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
          </div>
        </div>

        {/* Features Junction Node */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[1600px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <Cpu className="w-3.5 h-3.5 text-purple-500" />
          </div>
        </div>

        {/* 3D Demo Junction Node */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[2400px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
        </div>

        {/* Templates Junction Node */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[3200px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
          </div>
        </div>

        {/* Pricing Junction Node */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[4000px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <CreditCard className="w-3.5 h-3.5 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
