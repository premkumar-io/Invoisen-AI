import React from "react";
import { Link } from "@tanstack/react-router";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  to?: string;
  subtitle?: string;
}

export function Logo({ to, subtitle, ...props }: LogoProps) {
  const content = (
    <div className="flex items-center space-x-2">
      <svg
        {...props}
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Invoisen Logo</title>
        <defs>
          <linearGradient id="inv-face" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#A88BFA" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="inv-edge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6D28D9" />
            <stop offset="1" stopColor="#5B21B6" />
          </linearGradient>
          <radialGradient id="inv-orb" cx="0.4" cy="0.35" r="0.75">
            <stop offset="0" stopColor="#A78BFA" />
            <stop offset="0.6" stopColor="#7C3AED" />
            <stop offset="1" stopColor="#6D28D9" />
          </radialGradient>
          <radialGradient id="inv-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#A88BFA" stopOpacity="0.45" />
            <stop offset="1" stopColor="#A88BFA" stopOpacity="0" />
          </radialGradient>
          <filter id="inv-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#5B21B6" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* AI orb glow + neural nodes */}
        <circle cx="36" cy="11" r="9" fill="url(#inv-glow)" />
        <g stroke="#C4B5FD" strokeWidth="0.8" opacity="0.85">
          <line x1="36" y1="11" x2="31" y2="6" />
          <line x1="36" y1="11" x2="41" y2="7" />
          <line x1="36" y1="11" x2="40" y2="16" />
        </g>
        <g fill="#A78BFA">
          <circle cx="31" cy="6" r="1" />
          <circle cx="41" cy="7" r="1" />
          <circle cx="40" cy="16" r="1" />
        </g>
        <circle cx="36" cy="11" r="3.6" fill="url(#inv-orb)" />
        <circle cx="34.6" cy="9.6" r="1" fill="#FFFFFF" opacity="0.6" />

        {/* Invoice sheet: extruded depth + lit face */}
        <rect x="9" y="13" width="22" height="30" rx="4" fill="url(#inv-edge)" />
        <rect
          x="9"
          y="11"
          width="22"
          height="30"
          rx="4"
          fill="url(#inv-face)"
          filter="url(#inv-shadow)"
        />

        {/* Text lines */}
        <rect x="12" y="15" width="14" height="1.6" rx="0.8" fill="#EFF6FF" opacity="0.9" />
        <rect x="12" y="19" width="16" height="1.3" rx="0.65" fill="#DBEAFE" opacity="0.8" />
        <rect x="12" y="22.5" width="11" height="1.3" rx="0.65" fill="#DBEAFE" opacity="0.8" />

        {/* Total chip */}
        <rect x="12" y="27" width="16" height="4" rx="1.4" fill="#FFFFFF" opacity="0.95" />
        <rect x="13.4" y="28.4" width="7" height="1.2" rx="0.6" fill="#7C3AED" />
        <rect x="21" y="28.2" width="5" height="1.6" rx="0.8" fill="#6D28D9" />
      </svg>
      <div className="flex flex-col">
        <span className="font-bold text-xl">Invoisen</span>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}
