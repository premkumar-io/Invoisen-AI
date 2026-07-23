import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { getInitialTheme, setTheme, themeNames, type ThemeName } from "@/lib/theme";
import { useAuth } from "@/lib/auth-context";

export function AppNavbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/invoices", label: "Invoices" },
    { to: "/clients", label: "Clients" },
    { to: "/ai", label: "AI Workspace", isAi: true },
    { to: "/reports", label: "Reports" },
    { to: "/billing", label: "Billing" },
    { to: "/settings", label: "Settings" },
    { to: "/admin", label: "Admin" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-background/70 backdrop-blur-xl border-b border-border/40 z-50 transition-all duration-500">
      <div className="max-w-container-max mx-auto px-margin-desktop w-full flex justify-between items-center py-4">
        {/* Brand Logo */}
        <Link to="/" className="font-headline text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-black shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
            ⚡
          </span>
          INVOISEN
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`font-label text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive ? "text-primary font-bold" : "text-foreground/80 hover:text-primary"
                  }`}
              >
                <span>{item.label}</span>
                {item.isAi && (
                  <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Utility Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-card/60 backdrop-blur-md border border-border text-foreground hover:text-primary hover:border-primary/40 transition-all shadow-sm"
            title="Switch Theme (Light / Dark / Purple AI)"
          >
            <span className="material-symbols-outlined text-[20px]">
              {theme === "purple" ? "auto_awesome" : theme === "dark" ? "dark_mode" : "contrast"}
            </span>
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm border border-primary/30 shadow-inner">
                {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : "SC"}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="font-label text-sm font-bold text-foreground/80 hover:text-primary transition-colors px-3 py-2">
                Log In
              </Link>
              <Link to="/signup" className="bg-primary text-white px-5 py-2 rounded-full font-headline text-xs font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-all btn-premium">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
