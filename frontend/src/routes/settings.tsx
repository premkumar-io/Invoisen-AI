import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bell,
  Building2,
  Hash,
  Image as ImageIcon,
  Loader2,
  Palette,
  Save,
  UserRound,
  X,
  Key,
  Shield,
  Laptop,
  CheckCircle2,
  Copy,
  Sparkles,
  LogOut,
  Sliders,
} from "lucide-react";

import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAuthToken } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { ThemeName, themeNames, isThemeName, applyTheme, getInitialTheme, setTheme } from "@/lib/theme";
import { fetchSettings, updateSettings } from "@/lib/api/settings";

export const Route = createFileRoute("/settings")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getAuthToken()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({ meta: [{ title: "Workspace Settings — Invoisen AI" }] }),
  component: SettingsPage,
});

interface SettingsForm {
  fullName: string;
  email: string;
  businessName: string;
  businessEmail: string;
  gstNumber: string;
  businessAddress: string;
  logoUrl: string;
  defaultCurrency: string;
  invoicePrefix: string;
  invoiceNumberFormat: string;
  invoiceNextNumber: number;
  theme: ThemeName;
}

const activeSessionsList = [
  { device: "MacBook Pro 16 (macOS Zurich)", browser: "Safari 19.4", ip: "185.220.101.5", location: "Zurich, Switzerland", current: true },
  { device: "iPhone 15 Pro (iOS)", browser: "Mobile Safari", ip: "185.220.101.89", location: "Geneva, Switzerland", current: false },
];

function SettingsPage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<
    "general" | "company" | "security" | "appearance" | "notifications" | "sessions" | "apikeys"
  >("general");
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme());
  const [apiKeyGenerated, setApiKeyGenerated] = useState<string | null>("sk_live_inv_98421038590123");

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

  const { register, handleSubmit, control, watch, setValue, reset } = useForm<SettingsForm>({
    defaultValues: { theme: getInitialTheme() },
  });

  const logoUrl = watch("logoUrl");
  const invoiceNumberFormat = watch("invoiceNumberFormat");
  const invoiceNextNumber = watch("invoiceNextNumber");
  const selectedTheme = watch("theme");

  const generateNextInvoiceNumber = () => {
    if (!invoiceNumberFormat || isNaN(invoiceNextNumber)) return "...";
    const now = new Date();
    return invoiceNumberFormat
      .replace("{YYYY}", String(now.getFullYear()))
      .replace("{YY}", String(now.getFullYear()).slice(-2))
      .replace("{MM}", String(now.getMonth() + 1).padStart(2, "0"))
      .replace("{DD}", String(now.getDate()).padStart(2, "0"))
      .replace(/\{N+\}/, (match) => String(invoiceNextNumber).padStart(match.length - 2, "0"));
  };

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  useEffect(() => {
    if (settings?.success && user) {
      reset({
        fullName: user.fullName ?? "",
        email: user.email ?? "",
        businessName: settings.data.businessProfile?.name ?? "",
        businessEmail: settings.data.businessProfile?.email ?? "",
        gstNumber: settings.data.businessProfile?.gstNumber ?? "",
        businessAddress: settings.data.businessProfile?.address ?? "",
        logoUrl: settings.data.businessProfile?.logoUrl ?? "",
        defaultCurrency: settings.data.defaultCurrency ?? "USD",
        invoicePrefix: settings.data.invoicePrefix ?? "INV",
        invoiceNumberFormat: settings.data.invoiceNumberFormat ?? "{prefix}-{YYYY}-{NNNN}",
        invoiceNextNumber: settings.data.invoiceNextNumber ?? 1,
        theme: isThemeName(settings.data.theme) ? settings.data.theme : getInitialTheme(),
      });
    }
  }, [settings, user, reset]);

  const mutation = useMutation({
    mutationFn: async (data: SettingsForm) => {
      const [profileResponse, settingsResponse] = await Promise.all([
        updateProfile({ fullName: data.fullName, email: data.email }),
        updateSettings({
          defaultCurrency: data.defaultCurrency,
          invoicePrefix: data.invoicePrefix,
          invoiceNumberFormat: data.invoiceNumberFormat,
          invoiceNextNumber: data.invoiceNextNumber,
          theme: data.theme,
          businessProfile: {
            name: data.businessName,
            email: data.businessEmail,
            gstNumber: data.gstNumber,
            address: data.businessAddress,
            logoUrl: data.logoUrl,
          },
        }),
      ]);

      if (!profileResponse || settingsResponse.success === false) {
        throw new Error("Unable to save settings");
      }
    },
    onSuccess: () => {
      toast.success("Settings saved successfully.");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error) => {
      toast.error("Failed to save settings", { description: error.message });
    },
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("logoUrl", reader.result as string, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: SettingsForm) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (selectedTheme) {
      setThemeState(selectedTheme);
      setTheme(selectedTheme);
    }
  }, [selectedTheme]);

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white">
      {/* 3D WebGL Canvas Background */}
      <ThreeBackground />

      {/* Top Navigation Bar */}
      <AppNavbar />

      {/* Main Content Area */}
      <div className="relative pt-28 pb-16 z-10">
        <div className="max-w-container-max mx-auto px-margin-desktop space-y-12">
          {/* Header Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-sm font-medium">
                <Sparkles className="w-4 h-4" /> Swiss Quality System Configuration
              </div>
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                Workspace <span className="drawing-text italic">Settings.</span>
              </h1>
              <p className="text-muted-foreground font-body text-lg">
                Manage your user profile, business entity branding, API keys, security sessions, and theme preferences.
              </p>
            </div>

            <button
              type="submit"
              form="settings-form"
              disabled={mutation.isPending}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-headline text-base font-bold shadow-xl shadow-primary/25 hover:scale-105 transition-all flex items-center gap-2 btn-premium self-start lg:self-center"
            >
              {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Workspace Changes
            </button>
          </div>

          {/* Main 7-Tab Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 4 Columns: Tabs Sidebar */}
            <div className="lg:col-span-4 glass-card p-4 rounded-3xl border border-border/80 shadow-2xl space-y-2 h-fit">
              {[
                { id: "general", label: "General & Profile", icon: UserRound },
                { id: "company", label: "Company & Branding", icon: Building2 },
                { id: "security", label: "Security & Passwords", icon: Shield },
                { id: "appearance", label: "Appearance & Themes", icon: Palette },
                { id: "notifications", label: "Notifications & Alerts", icon: Bell },
                { id: "sessions", label: "Active Sessions", icon: Laptop },
                { id: "apikeys", label: "API Keys & Developer", icon: Key },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full py-3.5 px-5 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 text-left ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface"
                  }`}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Right 8 Columns: Form Content */}
            <div className="lg:col-span-8">
              <form id="settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Tab 1: General */}
                {activeTab === "general" && (
                  <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                    <div className="pb-2 border-b border-border">
                      <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                        <UserRound className="w-6 h-6 text-primary" /> General Profile Settings
                      </h3>
                      <p className="text-xs text-muted-foreground">Your personal contact details and user preferences</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Full Name</Label>
                        <Input {...register("fullName")} className="rounded-2xl text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Account Email</Label>
                        <Input {...register("email")} type="email" className="rounded-2xl text-sm" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Company */}
                {activeTab === "company" && (
                  <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                    <div className="pb-2 border-b border-border">
                      <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-primary" /> Business Entity &amp; Branding
                      </h3>
                      <p className="text-xs text-muted-foreground">Details rendered on official Swiss PDF exports</p>
                    </div>

                    <div className="space-y-4">
                      {/* Logo Upload */}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold">Company Logo</Label>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-2xl bg-card border border-dashed border-border flex items-center justify-center p-2">
                            {logoUrl ? (
                              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          <Input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleLogoUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-2.5 rounded-full border border-border text-xs font-bold hover:bg-surface transition-colors"
                          >
                            Upload Logo
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold">Business Name</Label>
                          <Input {...register("businessName")} className="rounded-2xl text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold">GSTIN / VAT ID</Label>
                          <Input {...register("gstNumber")} placeholder="CHE-109.834.120" className="rounded-2xl text-sm font-mono" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Business Address</Label>
                        <Textarea {...register("businessAddress")} rows={3} className="rounded-2xl text-sm" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Security */}
                {activeTab === "security" && (
                  <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                    <div className="pb-2 border-b border-border">
                      <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary" /> Security &amp; Password
                      </h3>
                      <p className="text-xs text-muted-foreground">Manage your password and authentication options</p>
                    </div>

                    <div className="space-y-4 max-w-md">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Current Password</Label>
                        <Input type="password" placeholder="••••••••" className="rounded-2xl text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">New Password</Label>
                        <Input type="password" placeholder="••••••••" className="rounded-2xl text-sm" />
                      </div>
                      <button
                        type="button"
                        onClick={() => toast.success("Password updated successfully.")}
                        className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-xs btn-premium"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 4: Appearance & Themes */}
                {activeTab === "appearance" && (
                  <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                    <div className="pb-2 border-b border-border">
                      <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                        <Palette className="w-6 h-6 text-primary" /> Adaptive Theme System
                      </h3>
                      <p className="text-xs text-muted-foreground">Select your workspace design aesthetic</p>
                    </div>

                    <div className="space-y-6">
                      <Controller
                        name="theme"
                        control={control}
                        render={({ field }) => (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {themeNames.map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => field.onChange(t)}
                                className={`p-6 rounded-3xl border transition-all text-left space-y-3 ${
                                  field.value === t
                                    ? "border-primary ring-2 ring-primary/40 bg-primary/10 shadow-xl"
                                    : "border-border bg-card hover:border-primary/40"
                                }`}
                              >
                                <div className="font-headline font-bold text-lg text-foreground capitalize flex justify-between items-center">
                                  <span>{t} Theme</span>
                                  {field.value === t && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {t === "light"
                                    ? "Clean soft shadows & white Swiss cards."
                                    : t === "dark"
                                      ? "Sleek slate dark background with high contrast."
                                      : "Light purple background with neural AI glow."}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                      />

                      {/* Auto-Numbering Setup */}
                      <div className="p-6 rounded-2xl bg-card/60 border border-border space-y-4">
                        <div className="font-headline font-bold text-base text-foreground flex items-center gap-2">
                          <Hash className="w-5 h-5 text-primary" /> Auto-Numbering Generator
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Number Format</Label>
                            <Input {...register("invoiceNumberFormat")} className="rounded-2xl text-xs font-mono" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Next Sequence Number</Label>
                            <Input {...register("invoiceNextNumber", { valueAsNumber: true })} type="number" className="rounded-2xl text-xs" />
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-surface border border-border font-mono text-xs text-foreground">
                          Preview: {generateNextInvoiceNumber().replace("{prefix}", watch("invoicePrefix") || "INV")}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 5: Notifications */}
                {activeTab === "notifications" && (
                  <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                    <div className="pb-2 border-b border-border">
                      <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                        <Bell className="w-6 h-6 text-primary" /> Notifications &amp; Email Triggers
                      </h3>
                      <p className="text-xs text-muted-foreground">Configure automated email dispatches and reminders</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { title: "Invoice Payment Receipts", desc: "Instant email notification when a client pays" },
                        { title: "Overdue Reminders", desc: "Automated polite reminders sent 3 days after due date" },
                        { title: "AI Neural Tips", desc: "Weekly optimization suggestions for cashflow" },
                        { title: "Monthly Ledger Summaries", desc: "PDF report attached at the end of each month" },
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-card border border-border flex justify-between items-center">
                          <div>
                            <div className="font-bold text-foreground text-sm">{item.title}</div>
                            <div className="text-xs text-muted-foreground">{item.desc}</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 6: Active Sessions */}
                {activeTab === "sessions" && (
                  <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                    <div className="pb-2 border-b border-border">
                      <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                        <Laptop className="w-6 h-6 text-primary" /> Active Login Sessions
                      </h3>
                      <p className="text-xs text-muted-foreground">Manage logged in browsers and devices</p>
                    </div>

                    <div className="space-y-4">
                      {activeSessionsList.map((s, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-card border border-border flex justify-between items-center text-xs">
                          <div className="space-y-1">
                            <div className="font-bold text-foreground text-sm flex items-center gap-2">
                              <span>{s.device}</span>
                              {s.current && <Badge variant="default" className="bg-success text-white">Current</Badge>}
                            </div>
                            <div className="text-muted-foreground">{s.browser} • {s.ip} • {s.location}</div>
                          </div>
                          {!s.current && (
                            <button
                              type="button"
                              onClick={() => toast.success("Session revoked.")}
                              className="px-4 py-2 rounded-full border border-destructive/30 text-destructive font-bold hover:bg-destructive/10 transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 7: API Keys */}
                {activeTab === "apikeys" && (
                  <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                    <div className="pb-2 border-b border-border">
                      <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                        <Key className="w-6 h-6 text-primary" /> Developer API Keys
                      </h3>
                      <p className="text-xs text-muted-foreground">Programmatic API access to generate invoices via HTTP REST</p>
                    </div>

                    <div className="space-y-4">
                      {apiKeyGenerated && (
                        <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
                          <div className="font-mono text-xs text-foreground font-bold">{apiKeyGenerated}</div>
                          <button
                            type="button"
                            onClick={() => { navigator.clipboard.writeText(apiKeyGenerated); toast.success("API Key copied!"); }}
                            className="text-xs font-bold text-primary flex items-center gap-1"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copy Key
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const newKey = `sk_live_inv_${Math.random().toString(36).substring(2, 15)}`;
                          setApiKeyGenerated(newKey);
                          toast.success("New Secret API Key Generated!");
                        }}
                        className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-xs btn-premium"
                      >
                        Generate New API Secret Key
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-card border-t border-border mt-16">
        <div className="max-w-container-max mx-auto px-margin-desktop py-8 text-center text-muted-foreground text-xs tracking-widest uppercase font-bold">
          © 2026 Invoisen AI. All rights reserved. Precision-engineered in Zurich.
        </div>
      </footer>
    </div>
  );
}
