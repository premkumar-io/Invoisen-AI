import React from "react";
import { Link } from "@tanstack/react-router";

interface LogoProps {
  to?: string;
  subtitle?: string;
  className?: string;
  height?: number | string;
  iconOnly?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function Logo({
  to,
  subtitle,
  className = "",
  height = 20,
  iconOnly = false,
  onClick,
}: LogoProps) {
  const fontSizeStyle = height
    ? { fontSize: typeof height === "number" ? `${height}px` : height }
    : undefined;

  const content = (
    <div
      style={fontSizeStyle}
      className={`inline-flex items-center select-none text-base sm:text-lg ${className}`}
    >
      {/* 3D Capsule Pill Icon scaled to 0.72em so its top & bottom match 'N' perfectly */}
      <img
        src="/invoisen-icon.png"
        alt="I"
        className="object-contain shrink-0 transition-transform duration-200 hover:scale-105 inline-block align-middle"
        style={{
          height: "0.72em",
          width: "auto",
        }}
      />

      {/* Rest of brand wordmark: 'NVOISEN' */}
      {!iconOnly && (
        <span
          className="font-headline font-black tracking-[0.20em] text-foreground uppercase leading-none inline-block align-middle"
          style={{ paddingLeft: "0.20em" }}
        >
          NVOISEN
        </span>
      )}

      {subtitle && !iconOnly && (
        <span className="text-[10px] font-extrabold tracking-widest uppercase text-muted-foreground bg-muted/90 px-2.5 py-0.5 rounded-full border border-border/50 shadow-sm shrink-0 ml-2">
          {subtitle}
        </span>
      )}
    </div>
  );

  return to ? (
    <Link to={to} onClick={onClick} className="inline-flex items-center hover:opacity-90 transition-opacity">
      {content}
    </Link>
  ) : (
    content
  );
}

export default Logo;
