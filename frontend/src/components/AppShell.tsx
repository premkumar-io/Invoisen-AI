"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AiAssistant } from "@/components/AiAssistant";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeName, themeNames, getInitialTheme, setTheme } from "@/lib/theme";

export function AppShell({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme());

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground transition-colors duration-300">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 hidden items-center justify-between gap-4 border-b border-border/60 bg-background/80 px-8 py-4 backdrop-blur-xl lg:flex">
            <Link
              to={isAuthenticated ? "/dashboard" : "/"}
              className="font-display text-2xl font-bold tracking-tight text-primary"
            >
              Invoisen
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-surface-container-low/80 px-3 py-1 text-xs font-medium backdrop-blur">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: "var(--primary)" }}
                />
                <span className="capitalize text-muted-foreground">Theme: {theme}</span>
              </div>
              <Select value={theme} onValueChange={(value) => setThemeState(value as ThemeName)}>
                <SelectTrigger className="h-9 min-w-40 rounded-full border-border/80 bg-card px-4 text-xs font-medium shadow-sm hover:border-primary/50">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border bg-popover/95 backdrop-blur-xl">
                  {themeNames.map((themeOption) => (
                    <SelectItem key={themeOption} value={themeOption} className="rounded-xl">
                      {themeOption === "light" && "☀️ Light"}
                      {themeOption === "dark" && "🌙 Dark"}
                      {themeOption === "purple" && "✨ Purple AI"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </header>

          <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl lg:hidden">
            <SidebarTrigger />
            <Link
              to={isAuthenticated ? "/dashboard" : "/"}
              className="font-display font-bold text-primary"
            >
              Invoisen
            </Link>
            <div className="ml-auto">
              <Select value={theme} onValueChange={(value) => setThemeState(value as ThemeName)}>
                <SelectTrigger className="h-8 rounded-full border-border/80 px-3 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {themeNames.map((themeOption) => (
                    <SelectItem key={themeOption} value={themeOption}>
                      {themeOption === "light" && "☀️ Light"}
                      {themeOption === "dark" && "🌙 Dark"}
                      {themeOption === "purple" && "✨ Purple AI"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1280px]">{children}</div>
          </main>
          <AiAssistant />
        </div>
      </div>
    </SidebarProvider>
  );
}
