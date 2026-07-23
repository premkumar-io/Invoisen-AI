import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { InvoiceEditor } from "@/components/invoice/InvoiceEditor";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { getAuthToken } from "@/lib/auth";
import { getInitialTheme, setTheme, themeNames, type ThemeName } from "@/lib/theme";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/invoices/new")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getAuthToken()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "New Invoice Builder — Invoisen AI" },
      { name: "description", content: "Create a professional Swiss-standard invoice with 3D live preview." },
    ],
  }),
  component: NewInvoicePage,
});

function NewInvoicePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme());

  const toggleTheme = () => {
    const currentIndex = themeNames.indexOf(theme);
    const nextTheme = themeNames[(currentIndex + 1) % themeNames.length];
    setThemeState(nextTheme);
    setTheme(nextTheme);
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white">
      <ThreeBackground />

      {/* Landing Page Style Navigation Bar */}
      <AppNavbar />

      {/* Main Builder Area */}
      <div className="relative pt-28 pb-16 z-10">
        <div className="max-w-container-max mx-auto px-margin-desktop space-y-6">
          <InvoiceEditor mode="create" />
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
