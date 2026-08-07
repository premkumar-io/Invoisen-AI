import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LogOut, Sparkles, Sun, Moon, ChevronDown, User, Settings, Search, HelpCircle, Globe, Check, Menu, X, LayoutDashboard, FileText, Users, Package, BarChart3, Trash2, Plus } from "lucide-react";
import { getInitialTheme, setTheme, themeNames, type ThemeName } from "@/lib/theme";
import { useAuth } from "@/lib/auth-context";
import { useI18n, LanguageCode } from "@/lib/i18n";
import { CommandPalette } from "@/components/CommandPalette";
import { NotificationCenter } from "@/components/NotificationCenter";
import { HelpCenterModal } from "@/components/HelpCenterModal";
import { NavbarSearchDropdown } from "@/components/NavbarSearchDropdown";

export function AppNavbar() {
  const { logout, user } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme());
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [publicThemeMenuOpen, setPublicThemeMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const publicThemeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
      if (publicThemeMenuRef.current && !publicThemeMenuRef.current.contains(event.target as Node)) {
        setPublicThemeMenuOpen(false);
      }
    }
    if (menuOpen || langMenuOpen || themeMenuOpen || publicThemeMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen, langMenuOpen, themeMenuOpen, publicThemeMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const languagesList: { code: LanguageCode; label: string; flag: string }[] = [
    { code: "en", label: "English (US)", flag: "🇺🇸" },
    { code: "de", label: "Deutsch (DE)", flag: "🇩🇪" },
    { code: "fr", label: "Français (FR)", flag: "🇫🇷" },
    { code: "es", label: "Español (ES)", flag: "🇪🇸" },
  ];

  const themesList: {
    id: ThemeName;
    label: string;
    description: string;
    icon: typeof Sun;
  }[] = [
      {
        id: "light",
        label: "Solar Clarity",
        description: "Clean Light",
        icon: Sun,
      },
      {
        id: "dark",
        label: "Obsidian Night",
        description: "Midnight Dark",
        icon: Moon,
      },
      {
        id: "purple",
        label: "Neural Violet",
        description: "AI Cyber Glow",
        icon: Sparkles,
      },
    ];

  const [mounted, setMounted] = useState(false);
  const [activePublicSection, setActivePublicSection] = useState<string>("overview");
  const [avatarError, setAvatarError] = useState(false);
  const [effectiveAvatar, setEffectiveAvatar] = useState<string | null>(null);

  useEffect(() => {
    const syncAvatar = () => {
      setAvatarError(false);
      if (typeof window !== "undefined" && user?._id) {
        const localCached = localStorage.getItem(`invoisen_user_avatar_${user._id}`);
        if (localCached) {
          setEffectiveAvatar(localCached);
          return;
        }
      }
      setEffectiveAvatar(user?.avatar || null);
    };

    syncAvatar();
    window.addEventListener("avatarUpdated", syncAvatar);
    return () => window.removeEventListener("avatarUpdated", syncAvatar);
  }, [user?.avatar, user?._id]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      let nextSection = "overview";

      const faqEl = document.getElementById("faq");
      if (faqEl) {
        const rect = faqEl.getBoundingClientRect();
        if (rect.top <= 350 && rect.bottom >= 150) {
          nextSection = "faq";
        }
      }
      const pricingEl = document.getElementById("pricing");
      if (pricingEl && nextSection === "overview") {
        const rect = pricingEl.getBoundingClientRect();
        if (rect.top <= 350 && rect.bottom >= 150) {
          nextSection = "pricing";
        }
      }
      const templatesEl = document.getElementById("templates");
      if (templatesEl && nextSection === "overview") {
        const rect = templatesEl.getBoundingClientRect();
        if (rect.top <= 350 && rect.bottom >= 150) {
          nextSection = "templates";
        }
      }

      if (nextSection === "overview" && location.pathname === "/invoices/templates") {
        nextSection = scrollY < 300 ? "templates" : "overview";
      }

      setActivePublicSection((prev) => (prev !== nextSection ? nextSection : prev));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  type NavItem = {
    to: string;
    label: string;
    isAi?: boolean;
    hideOnMedium?: boolean;
  };

  const authenticatedNavItems: NavItem[] = [
    { to: "/dashboard", label: t("nav.dashboard", "Dashboard") },
    { to: "/invoices", label: t("nav.invoices", "Invoices") },
    { to: "/clients", label: t("nav.clients", "Clients") },
    { to: "/ai", label: "AI Workspace", isAi: true },
    { to: "/settings", label: t("nav.settings", "Settings") },
  ];

  const publicNavItems: NavItem[] = [
    { to: "/", label: t("nav.overview", "Overview") },
    { to: "/#templates", label: t("nav.templates", "Templates") },
    { to: "/#pricing", label: t("nav.pricing", "Pricing") },
    { to: "/#faq", label: t("nav.faq", "FAQ") },
  ];

  const currentNavItems = user ? authenticatedNavItems : publicNavItems;

  const getThemeBgClass = () => {
    if (theme === "purple") {
      return "bg-purple-100 border-purple-300 text-slate-950 shadow-xl shadow-purple-500/10";
    }
    if (theme === "dark") {
      return "bg-slate-950 border-slate-800 text-white shadow-xl shadow-black/60";
    }
    return "bg-white border-slate-200 text-slate-900 shadow-xl shadow-slate-200/50";
  };

  const getInnerTrackClass = () => {
    if (theme === "purple") {
      return "bg-purple-200/60 border-purple-300/80";
    }
    if (theme === "dark") {
      return "bg-slate-900 border-slate-800";
    }
    return "bg-slate-100 border-slate-200/90";
  };

  const getButtonBgClass = () => {
    if (theme === "purple") {
      return "bg-purple-200/80 hover:bg-purple-300/80 border-purple-300 text-purple-950";
    }
    if (theme === "dark") {
      return "bg-slate-900 hover:bg-slate-800 border-slate-800 text-white";
    }
    return "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800";
  };

  const getLogoClass = () => {
    if (theme === "purple") {
      return "text-purple-950";
    }
    if (theme === "dark") {
      return "text-white";
    }
    return "text-slate-900";
  };

  const getAvatarBgClass = () => {
    if (theme === "purple") {
      return "bg-purple-200/70 hover:bg-purple-300/80 border-purple-300/90 text-purple-950";
    }
    if (theme === "dark") {
      return "bg-slate-900 hover:bg-slate-800 border-slate-800 text-white";
    }
    return "bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-900";
  };

  const getDropdownCardClass = () => {
    if (theme === "purple") {
      return "bg-purple-100/95 border-purple-300 text-purple-950 shadow-2xl shadow-purple-900/20";
    }
    if (theme === "dark") {
      return "bg-slate-950/95 border-slate-800 text-white shadow-2xl shadow-black/80";
    }
    return "bg-white/95 border-slate-200/90 text-slate-900 shadow-2xl shadow-slate-300/60";
  };

  const getDropdownHeaderClass = () => {
    if (theme === "purple") {
      return "bg-purple-200/60 border-purple-300/80";
    }
    if (theme === "dark") {
      return "bg-slate-900 border-slate-800";
    }
    return "bg-slate-50 border-slate-200/80";
  };

  const getDropdownItemHoverClass = () => {
    if (theme === "purple") {
      return "hover:bg-purple-200/80 text-purple-950";
    }
    if (theme === "dark") {
      return "hover:bg-slate-900 text-slate-200";
    }
    return "hover:bg-slate-100 text-slate-800";
  };

  const renderNavTrack = () => (
    <div
      className={`hidden md:flex items-center gap-1 p-1 rounded-full border transition-all duration-300 relative ${getInnerTrackClass()}`}
    >
      {currentNavItems.map((item) => {
        const targetId = item.label.toLowerCase();
        const isActive = user
          ? location.pathname === item.to ||
          (item.to !== "/" && location.pathname.startsWith(item.to))
          : activePublicSection === targetId;

        const handleClick = (e: React.MouseEvent) => {
          if (!user) {
            setActivePublicSection(targetId);

            if (location.pathname === "/") {
              e.preventDefault();
              if (targetId === "overview") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                const el = document.getElementById(targetId);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }
            } else {
              e.preventDefault();
              navigate({ to: "/" }).then(() => {
                setTimeout(() => {
                  if (targetId === "overview") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    const el = document.getElementById(targetId);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                }, 120);
              });
            }
          }
        };

        return (
          <Link
            key={item.to + item.label}
            to={item.to}
            id={`nav-${item.to.replace(/[^a-z0-9]/gi, "-").replace(/^-+|-+$/g, "") || "home"}-link`}
            data-testid={`nav-${item.to.replace(/[^a-z0-9]/gi, "-").replace(/^-+|-+$/g, "") || "home"}-link`}
            onClick={handleClick}
            className={`font-label text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-300 items-center gap-1.5 shrink-0 relative select-none ${item.hideOnMedium ? "hidden 2xl:flex" : "flex"
              } ${isActive
                ? "text-white font-bold"
                : theme === "dark"
                  ? "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  : theme === "purple"
                    ? "text-purple-950 hover:text-purple-900 hover:bg-purple-200/50"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
          >
            {isActive && (
              <motion.div
                layoutId="navbar-active-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-blue-600 to-purple-600 shadow-md shadow-primary/30 z-0"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span>{item.label}</span>
              {item.isAi && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 ${isActive
                    ? "bg-white/20 text-white"
                    : "bg-gradient-to-r from-purple-500/20 to-primary/20 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                    }`}
                >
                  <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                  AI
                </span>
              )}
            </span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <nav
      className={`fixed inset-x-0 z-50 flex justify-center pointer-events-none max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop transition-all duration-500 ease-in-out ${scrolled ? "top-2" : "top-4"
        }`}
    >
      <motion.div
        initial={false}
        animate={{
          height: scrolled ? 46 : 60,
          maxWidth: scrolled ? "1020px" : "100%",
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
        className={`w-full pointer-events-auto flex items-center justify-between gap-3 sm:gap-4 lg:gap-5 rounded-full border backdrop-blur-2xl transition-all duration-500 ${getThemeBgClass()} ${scrolled
            ? "px-3.5 sm:px-5 border-primary/50 shadow-2xl shadow-primary/20"
            : "px-5 sm:px-7 shadow-xl hover:border-primary/30"
          }`}
      >
        {/* Left Section: Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 shrink-0">
          <Link
            to={user ? "/dashboard" : "/"}
            onClick={(e) => {
              if (!user && location.pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className={`font-headline text-sm sm:text-base font-black tracking-[0.2em] hover:opacity-90 transition-opacity shrink-0 flex items-center h-8.5 px-1 ${getLogoClass()}`}
          >
            INVOISEN
          </Link>

          {user && renderNavTrack()}
        </div>

        {/* Middle Section: Centered Public Nav Track (Logged Out) or Search Bar (Logged In) */}
        {user ? (
          <div className="hidden md:flex items-center justify-center flex-1 max-w-xs lg:max-w-sm">
            <NavbarSearchDropdown scrolled={scrolled} bgClass={getButtonBgClass()} />
          </div>
        ) : (
          <div className="hidden md:flex items-center justify-center flex-1">
            {renderNavTrack()}
          </div>
        )}

        {/* Right Section: Utility Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
          {user ? (
            <>
              {/* Global Language Selector Dropdown (Desktop Only) */}
              <div ref={langMenuRef} className="relative hidden md:block">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  aria-label="Select Language"
                  className={`flex items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${scrolled ? "w-8 h-8" : "w-9 h-9"
                    } ${getButtonBgClass()}`}
                  title="Change Language"
                >
                  <Globe className="w-4 h-4 text-primary shrink-0" />
                </button>

                {langMenuOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-44 rounded-2xl border p-1.5 z-50 animate-in fade-in zoom-in-95 duration-200 ${getDropdownCardClass()}`}
                  >
                    <div className="p-2 border-b border-border/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                      <span>{t("common.selectLanguage", "Select Language")}</span>
                    </div>
                    <div className="space-y-0.5 mt-1">
                      {languagesList.map((item) => (
                        <button
                          key={item.code}
                          onClick={() => {
                            setLanguage(item.code);
                            setLangMenuOpen(false);
                          }}
                          aria-label={`Switch language to ${item.label}`}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${getDropdownItemHoverClass()} ${language === item.code ? "bg-primary/10 text-primary font-bold" : ""
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{item.flag}</span>
                            <span>{item.label}</span>
                          </span>
                          {language === item.code && <Check className="w-3.5 h-3.5 text-primary" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Center Popover (Visible on Mobile & Desktop) */}
              <NotificationCenter theme={theme} />

              {/* Theme Switcher Dropdown (Desktop Only) */}
              <div ref={themeMenuRef} className="relative hidden md:block">
                <button
                  onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                  aria-label="Switch Theme"
                  className={`flex items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${scrolled ? "w-8 h-8" : "w-9 h-9"
                    } ${getButtonBgClass()}`}
                  title="Switch Theme"
                >
                  {mounted && theme === "purple" ? (
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  ) : mounted && theme === "dark" ? (
                    <Moon className="w-4 h-4 text-slate-200 shrink-0" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                </button>

                {themeMenuOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-56 rounded-2xl border p-1.5 z-50 animate-in fade-in zoom-in-95 duration-200 ${getDropdownCardClass()}`}
                  >
                    <div className="p-2 border-b border-border/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                      <span>{t("common.selectTheme", "Select Theme")}</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {themesList.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = theme === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setThemeState(item.id);
                              setTheme(item.id);
                              setThemeMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${getDropdownItemHoverClass()} ${isActive ? "bg-primary/10 text-primary font-bold shadow-sm" : ""
                              }`}
                          >
                            <span className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.id === "purple"
                                  ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                                  : item.id === "dark"
                                    ? "bg-slate-800 text-slate-200"
                                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                  }`}
                              >
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col text-left min-w-0">
                                <span className="text-xs font-bold truncate leading-snug">{item.label}</span>
                                <span className="text-[10px] text-muted-foreground font-medium leading-none mt-0.5">
                                  {item.description}
                                </span>
                              </div>
                            </span>
                            {isActive && <Check className="w-4 h-4 text-primary shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Circular Button (Desktop Only) */}
              <div ref={profileMenuRef} className="relative hidden md:block">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`relative flex items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm p-0.5 ${scrolled ? "w-8 h-8" : "w-9 h-9"
                    } ${getButtonBgClass()}`}
                  title={`User Profile (${user.displayName || user.fullName || "User"})`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-tr from-primary to-purple-600 text-white font-extrabold text-xs shadow-inner">
                    {effectiveAvatar && !avatarError ? (
                      <img
                        src={effectiveAvatar}
                        alt={user.displayName || user.fullName || "User"}
                        className="w-full h-full object-cover rounded-full"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (user.displayName || user.fullName) ? (
                      (user.displayName || user.fullName).charAt(0).toUpperCase()
                    ) : (
                      "U"
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-56 rounded-2xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-200 ${getDropdownCardClass()}`}
                  >
                    <div className={`p-3 rounded-xl mb-1 ${getDropdownHeaderClass()}`}>
                      <p className="text-xs font-bold truncate">
                        {user.displayName || user.fullName || "Logged User"}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {user.email || "user@invoisen.ai"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Link
                        to="/settings"
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors ${getDropdownItemHoverClass()}`}
                      >
                        <User className="w-4 h-4 text-primary" />
                        {t("nav.profileSettings", "My Profile & Settings")}
                      </Link>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setHelpModalOpen(true);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors ${getDropdownItemHoverClass()}`}
                      >
                        <HelpCircle className="w-4 h-4 text-secondary" />
                        {t("nav.helpSupport", "Help & Support")}
                      </button>

                      <div
                        className={`my-1 border-t ${theme === "dark"
                          ? "border-slate-800"
                          : theme === "purple"
                            ? "border-purple-200"
                            : "border-slate-100"
                          }`}
                      />

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-colors ${theme === "dark"
                          ? "text-red-400 hover:bg-red-950/40"
                          : theme === "purple"
                            ? "text-red-700 hover:bg-red-100/80"
                            : "text-red-600 hover:bg-red-50"
                          }`}
                      >
                        <LogOut className="w-4 h-4" />
                        {t("nav.logout", "Sign Out")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/login"
                id="login-link"
                data-testid="login-link"
                className={`font-label text-[11px] sm:text-xs font-bold transition-colors px-2 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full ${theme === "purple"
                  ? "text-purple-950 hover:bg-purple-200/60"
                  : theme === "dark"
                    ? "text-slate-300 hover:text-white hover:bg-slate-900"
                    : "text-slate-700 hover:text-primary hover:bg-slate-100"
                  }`}
              >
                Log In
              </Link>
              <Link
                to="/signup"
                id="signup-link"
                data-testid="signup-link"
                className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white px-3 py-1.5 sm:px-5 sm:py-2 rounded-full font-headline text-[11px] sm:text-xs font-extrabold shadow-lg shadow-primary/25 hover:scale-105 hover:shadow-primary/40 active:scale-95 transition-all btn-premium whitespace-nowrap"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Drawer Hamburger Trigger */}
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            aria-label="Toggle navigation menu"
            className={`md:hidden flex items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${scrolled ? "w-8 h-8" : "w-9 h-9"
              } ${getButtonBgClass()}`}
          >
            {mobileDrawerOpen ? (
              <X className="w-4 h-4 text-primary shrink-0" />
            ) : (
              <Menu className="w-4 h-4 text-primary shrink-0" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Mobile Drawer Overlay Backdrop */}
      {mobileDrawerOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md md:hidden pointer-events-auto"
        />
      )}

      {/* Mobile Menu Dropdown Panel */}
      {mobileDrawerOpen && (
        <motion.div
          initial={{ opacity: 0, y: -15, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className={`fixed top-16 inset-x-3 sm:inset-x-6 z-50 rounded-3xl border p-4 sm:p-5 pointer-events-auto md:hidden shadow-2xl max-h-[82vh] overflow-y-auto ${getDropdownCardClass()}`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <span className="font-headline font-black tracking-widest text-sm text-primary">
                INVOISEN
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                Menu
              </span>
            </div>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="p-1 rounded-full hover:bg-surface-container-high transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="py-3 space-y-4">
            {user ? (
              <>
                {/* Mobile User Profile Header Card */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${getDropdownHeaderClass()}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-gradient-to-tr from-primary to-purple-600 text-white font-black text-sm shadow-md">
                      {effectiveAvatar && !avatarError ? (
                        <img
                          src={effectiveAvatar}
                          alt={user.displayName || user.fullName || "User"}
                          className="w-full h-full object-cover rounded-full"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (user.displayName || user.fullName) ? (
                        (user.displayName || user.fullName).charAt(0).toUpperCase()
                      ) : (
                        "U"
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate text-foreground">
                        {user.displayName || user.fullName || "Logged User"}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {user.email || "user@invoisen.ai"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      handleLogout();
                    }}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Search Button */}
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border border-border/80 bg-card/60 text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-primary" />
                    <span>Search invoices, clients, actions...</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-muted">⌘K</span>
                </button>

                {/* Primary Action Button */}
                <Link
                  to="/invoices/new"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-primary text-primary-foreground font-headline text-xs font-extrabold shadow-lg shadow-primary/20"
                >
                  <Plus className="w-4 h-4" /> Create New Invoice
                </Link>

                {/* Navigation Links */}
                <div className="space-y-1">
                  {[
                    { to: "/dashboard", label: t("nav.dashboard", "Dashboard"), icon: LayoutDashboard },
                    { to: "/invoices", label: t("nav.invoices", "Invoices"), icon: FileText },
                    { to: "/clients", label: t("nav.clients", "Clients"), icon: Users },
                    { to: "/products", label: t("nav.products", "Catalog"), icon: Package },
                    { to: "/ai", label: "AI Workspace", icon: Sparkles, isAi: true },
                    { to: "/reports", label: t("nav.reports", "Reports"), icon: BarChart3 },
                    { to: "/settings", label: t("nav.settings", "Settings"), icon: Settings },
                    { to: "/trash", label: t("nav.trash", "Trash"), icon: Trash2 },
                  ].map((item) => {
                    const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${isActive
                          ? "bg-primary text-white shadow-md shadow-primary/25"
                          : getDropdownItemHoverClass()
                          }`}
                      >
                        <span className="flex items-center gap-3">
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </span>
                        {item.isAi && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                            AI
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Theme & Language Preferences Section */}
                <div className="pt-3 border-t border-border/50 space-y-3">
                  {/* Mobile Theme Selector */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block px-1">
                      Theme Mode
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-card/80 border border-border/60">
                      {themesList.map((tItem) => {
                        const IconComp = tItem.icon;
                        const isSelected = theme === tItem.id;
                        return (
                          <button
                            key={tItem.id}
                            onClick={() => {
                              setThemeState(tItem.id);
                              setTheme(tItem.id);
                            }}
                            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
                              isSelected
                                ? "bg-primary text-white shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <IconComp className="w-3.5 h-3.5" />
                            <span className="capitalize">{tItem.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Language Selector */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block px-1">
                      Language
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {languagesList.map((lItem) => {
                        const isSelected = language === lItem.code;
                        return (
                          <button
                            key={lItem.code}
                            onClick={() => setLanguage(lItem.code)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                              isSelected
                                ? "border-primary/50 bg-primary/10 text-primary font-bold"
                                : "border-border/60 bg-card/60 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span>{lItem.flag}</span>
                              <span className="truncate">{lItem.code.toUpperCase()}</span>
                            </span>
                            {isSelected && <Check className="w-3 h-3 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {[
                  { to: "/", label: t("nav.overview", "Overview"), targetId: "overview" },
                  { to: "/#templates", label: t("nav.templates", "Templates"), targetId: "templates" },
                  { to: "/#pricing", label: t("nav.pricing", "Pricing"), targetId: "pricing" },
                  { to: "/#faq", label: t("nav.faq", "FAQ"), targetId: "faq" },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={(e) => {
                      setMobileDrawerOpen(false);
                      if (location.pathname === "/") {
                        e.preventDefault();
                        if (item.targetId === "overview") {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        } else {
                          const el = document.getElementById(item.targetId);
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }
                      }
                    }}
                    className={`flex items-center px-4 py-3 rounded-2xl text-xs font-bold transition-all ${getDropdownItemHoverClass()}`}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Mobile Theme Selector for Guest Users */}
                <div className="pt-3 border-t border-border/50 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block px-1">
                    Theme Mode
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-card/80 border border-border/60">
                    {themesList.map((tItem) => {
                      const IconComp = tItem.icon;
                      const isSelected = theme === tItem.id;
                      return (
                        <button
                          key={tItem.id}
                          onClick={() => {
                            setThemeState(tItem.id);
                            setTheme(tItem.id);
                          }}
                          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
                            isSelected
                              ? "bg-primary text-white shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <IconComp className="w-3.5 h-3.5" />
                          <span className="capitalize">{tItem.id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="w-full text-center py-2.5 rounded-2xl border border-border text-xs font-bold"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="w-full text-center py-2.5 rounded-2xl bg-primary text-white text-xs font-extrabold shadow-lg shadow-primary/20"
                  >
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Help & Support Modal */}
      <HelpCenterModal open={helpModalOpen} onOpenChange={setHelpModalOpen} />
    </nav>
  );
}


export default AppNavbar;
