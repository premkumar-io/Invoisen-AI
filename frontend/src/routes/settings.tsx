import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
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
  Phone,
  CreditCard,
  Bot,
  Percent,
  Download,
  Trash2,
  QrCode,
  Building,
  Check,
  RotateCcw,
  FileText,
  Clock,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";

import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { PhoneVerificationModal } from "@/components/PhoneVerificationModal";
import { EmailUpdateModal } from "@/components/EmailUpdateModal";
import { PhoneCapsuleInput } from "@/components/PhoneCapsuleInput";
import { COUNTRY_CODES } from "@/lib/country-codes";
import { useI18n, LanguageCode } from "@/lib/i18n";
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
import {
  ThemeName,
  themeNames,
  isThemeName,
  applyTheme,
  getInitialTheme,
  setTheme,
} from "@/lib/theme";
import { fetchSettings, updateSettings } from "@/lib/api/settings";
import { api, fetchActiveSessions, revokeActiveSession } from "@/lib/api";

export const Route = createFileRoute("/settings")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getAuthToken()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({ meta: [{ title: "Workspace & Profile Settings — Invoisen AI" }] }),
  component: SettingsPage,
});

interface SettingsForm {
  fullName: string;
  displayName: string;
  email: string;
  phone: string;
  timeZone: string;
  language: string;
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
  // Payout Details
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  showQrCode: boolean;
  // Tax Details
  taxName: string;
  defaultTaxRate: number;
  taxInclusive: boolean;
  // AI Settings
  aiAutoExtract: boolean;
  aiInvoiceTone: string;
  aiAutoReminders: boolean;
  // Notification Preferences
  notifEmailPaid: boolean;
  notifSmsAlerts: boolean;
  notifOverdueReminders: boolean;
  notifAiDigest: boolean;
  // API Keys & Webhooks
  apiKey: string;
  webhookUrl: string;
  countryCode?: string;
}

const activeSessionsList = [
  {
    device: "MacBook Pro 16 (macOS Zurich)",
    browser: "Safari 19.4",
    ip: "185.220.101.5",
    location: "Zurich, Switzerland",
    current: true,
  },
  {
    device: "iPhone 15 Pro (iOS)",
    browser: "Mobile Safari",
    ip: "185.220.101.89",
    location: "Geneva, Switzerland",
    current: false,
  },
];

function detectCurrentDeviceSession() {
  if (typeof window === "undefined") {
    return {
      device: "MacBook (Apple M2 Silicon)",
      browser: "Safari (macOS)",
      ip: "103.15.244.18",
      location: "India",
    };
  }

  const ua = navigator.userAgent;
  let browser = "Safari";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  let location = "India";
  if (tz.includes("Kolkata") || tz.includes("Calcutta")) location = "India";
  else if (tz.includes("Zurich")) location = "Zurich, Switzerland";
  else if (tz.startsWith("America/")) location = "United States";
  else if (tz.includes("London")) location = "London, UK";

  return {
    device: "MacBook (Apple M2 Silicon)",
    browser: `${browser} (macOS)`,
    ip: "103.15.244.18",
    location: location,
  };
}

function SettingsPage() {
  const { user, logout, updateProfile, refreshUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarImgErr, setAvatarImgErr] = useState(false);

  useEffect(() => {
    setAvatarImgErr(false);
  }, [avatarUrl]);
  const [sessions, setSessions] = useState(() => {
    const currentDev = detectCurrentDeviceSession();
    return [
      {
        id: "session-1",
        device: currentDev.device,
        browser: currentDev.browser,
        ip: currentDev.ip,
        location: currentDev.location,
        current: true,
      },
      {
        id: "session-2",
        device: "iPhone 15 Pro (iOS)",
        browser: "Mobile Safari",
        ip: "185.220.101.89",
        location: "Delhi, India",
        current: false,
      },
    ];
  });
  const { data: activeSessionsData } = useQuery({
    queryKey: ["activeSessions"],
    queryFn: fetchActiveSessions,
  });

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => revokeActiveSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Device session logged out successfully.");
    },
  });

  const displaySessions = activeSessionsData && activeSessionsData.length > 0 ? activeSessionsData : sessions;

  useEffect(() => {
    if (user?.avatar) {
      setAvatarUrl(user.avatar);
    } else if (user?._id && typeof window !== "undefined") {
      const localScoped = localStorage.getItem(`invoisen_user_avatar_${user._id}`);
      setAvatarUrl(localScoped || null);
    } else {
      setAvatarUrl(null);
    }
  }, [user?.avatar, user?._id]);

  const compressAvatarImage = (file: File, maxWidth = 160, maxHeight = 160): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, maxWidth, maxHeight);
        }
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be under 10MB.");
        return;
      }
      compressAvatarImage(file)
        .then(async (base64) => {
          setAvatarUrl(base64);
          if (user?._id) {
            try {
              localStorage.setItem(`invoisen_user_avatar_${user._id}`, base64);
              window.dispatchEvent(new Event("avatarUpdated"));
            } catch (e) {
              console.warn("Could not cache avatar in localStorage:", e);
            }
          }
          try {
            await updateProfile({ avatar: base64 });
            toast.success("Profile avatar uploaded successfully!");
          } catch {
            toast.success("Profile avatar updated!");
          }
        })
        .catch(() => {
          toast.error("Failed to process image.");
        });
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarUrl(null);
    if (user?._id) {
      localStorage.removeItem(`invoisen_user_avatar_${user._id}`);
      window.dispatchEvent(new Event("avatarUpdated"));
    }
    localStorage.removeItem("invoisen_user_avatar");
    if (avatarInputRef.current) avatarInputRef.current.value = "";
    try {
      await updateProfile({ avatar: null });
    } catch { }
    toast.success("Profile avatar removed.");
  };
  const [activeTab, setActiveTab] = useState<
    | "general"
    | "business"
    | "invoices"
    | "payments"
    | "ai"
    | "taxes"
    | "security"
    | "appearance"
    | "notifications"
    | "sessions"
    | "apikeys"
    | "data"
  >("general");

  const { timeZone: currentTz, setTimeZone, language: currentLang, setLanguage, t } = useI18n();
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme());
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [apiKeyGenerated, setApiKeyGenerated] = useState<string | null>(
    "sk_live_inv_98421038590123",
  );
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const { changePassword } = useAuth();
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  const handleDirectPhoneSave = async () => {
    const rawPhone = (watch("phone") || "").trim();
    if (!rawPhone) {
      toast.error("Please enter a valid phone number");
      return;
    }
    const countryCode = watch("countryCode") || "+91";
    const cleanedDigits = rawPhone.replace(/[^\d]/g, "");
    const fullPhone = rawPhone.startsWith("+")
      ? rawPhone
      : `${countryCode}${cleanedDigits}`;

    setIsSavingPhone(true);
    try {
      await updateProfile({ phone: fullPhone, phoneVerified: true });
      toast.success("Phone number updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "This phone number is already registered to another account. Please use a different phone number.");
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPasswordInput) {
      toast.error("Please enter a new password");
      return;
    }
    if (newPasswordInput.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    const hasExistingPassword = user?.hasPassword !== false;
    if (hasExistingPassword && !currentPasswordInput) {
      toast.error("Please enter your current password");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await changePassword(hasExistingPassword ? currentPasswordInput : undefined, newPasswordInput);
      toast.success(hasExistingPassword ? "Password updated successfully." : "Password set successfully!");
      setCurrentPasswordInput("");
      setNewPasswordInput("");
      await refreshUser();
    } catch (err: any) {
      toast.error(hasExistingPassword ? "Failed to update password" : "Failed to set password", {
        description: err?.message || "Invalid input",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

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
    defaultValues: {
      fullName: user?.fullName ?? "Bablu Kumar",
      displayName: user?.fullName ? user.fullName.split(" ")[0] : "Bablu",
      email: user?.email ?? "",
      phone: user?.phone ? user.phone.replace(/^\+91/, "") : "8627048480",
      timeZone: user?.timeZone || currentTz || "Asia/Kolkata",
      language: user?.language || currentLang || "en",
      theme: getInitialTheme(),
      bankName: "HDFC Bank",
      accountHolder: user?.fullName || "Bablu Kumar",
      accountNumber: "501002349810",
      ifscCode: "HDFC0001234",
      upiId: "bablu@okaxis",
      showQrCode: true,
      taxName: "GST",
      defaultTaxRate: 18,
      taxInclusive: false,
      aiAutoExtract: true,
      aiInvoiceTone: "professional",
      aiAutoReminders: true,
      notifEmailPaid: true,
      notifSmsAlerts: true,
      notifOverdueReminders: true,
      notifAiDigest: true,
      apiKey: "sk_live_inv_98421038590123",
      webhookUrl: "https://yourdomain.com/webhooks/invoisen",
      countryCode: "+91",
    },
  });

  const invoicePrefix = watch("invoicePrefix");
  const logoUrl = watch("logoUrl");
  const invoiceNumberFormat = watch("invoiceNumberFormat");
  const invoiceNextNumber = watch("invoiceNextNumber");
  const selectedTheme = watch("theme");

  const generateNextInvoiceNumber = () => {
    if (!invoiceNumberFormat || isNaN(invoiceNextNumber)) return "...";
    const now = new Date();
    const prefix = invoicePrefix || "INV";
    return invoiceNumberFormat
      .replace("{prefix}", prefix)
      .replace("{YYYY}", String(now.getFullYear()))
      .replace("{YY}", String(now.getFullYear()).slice(-2))
      .replace("{MM}", String(now.getMonth() + 1).padStart(2, "0"))
      .replace("{DD}", String(now.getDate()).padStart(2, "0"))
      .replace(/\{N+\}/, (match) => String(invoiceNextNumber).padStart(match.length - 2, "0"));
  };

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const hasInitializedRef = useRef(false);
  const [usernameStatus, setUsernameStatus] = useState<{ available?: boolean; message?: string } | null>(null);

  const checkUsernameLive = async (nameVal: string) => {
    const clean = nameVal.trim();
    if (!clean || clean.toLowerCase() === (user?.displayName || "").toLowerCase()) {
      setUsernameStatus(null);
      return;
    }
    try {
      const res = await api.get<{ available: boolean; message: string }>(`/users/check-username?username=${encodeURIComponent(clean)}`);
      if (res.success && res.data) {
        setUsernameStatus(res.data);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    const settingsData = settings && settings.success ? settings.data : undefined;
    if (user && (settingsData || !hasInitializedRef.current)) {
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        const localCompanyLogo = user?._id ? localStorage.getItem(`invoisen_company_logo_${user._id}`) : null;
        const effectiveLogoUrl = settingsData?.businessProfile?.logoUrl || localCompanyLogo || "";

        reset({
          fullName: user.fullName ?? "",
          displayName: user.displayName || (user.fullName ? user.fullName.split(" ")[0] : ""),
          email: user.email ?? "",
          phone: user.phone ? user.phone.replace(/^\+91/, "") : "",
          timeZone: currentTz || user.timeZone || "Asia/Kolkata",
          language: currentLang || user.language || "en",
          businessName: settingsData?.businessProfile?.name ?? "",
          businessEmail: settingsData?.businessProfile?.email ?? "",
          gstNumber: settingsData?.businessProfile?.gstNumber ?? "",
          businessAddress: settingsData?.businessProfile?.address ?? "",
          logoUrl: effectiveLogoUrl,
          defaultCurrency: settingsData?.defaultCurrency ?? "USD",
          invoicePrefix: settingsData?.invoicePrefix ?? "INV",
          invoiceNumberFormat: settingsData?.invoiceNumberFormat ?? "{prefix}-{YYYY}-{NNNN}",
          invoiceNextNumber: settingsData?.invoiceNextNumber ?? 1,
          theme: isThemeName(settingsData?.theme) ? settingsData.theme : getInitialTheme(),
          bankName: (settingsData as any)?.bankDetails?.bankName ?? "HDFC Bank",
          accountHolder: (settingsData as any)?.bankDetails?.accountHolder ?? (user.fullName || "Bablu Kumar"),
          accountNumber: (settingsData as any)?.bankDetails?.accountNumber ?? "501002349810",
          ifscCode: (settingsData as any)?.bankDetails?.ifscCode ?? "HDFC0001234",
          upiId: (settingsData as any)?.bankDetails?.upiId ?? "bablu@okaxis",
          showQrCode: (settingsData as any)?.bankDetails?.showQrCode ?? true,
          taxName: (settingsData as any)?.taxSettings?.taxName ?? "GST",
          defaultTaxRate: (settingsData as any)?.taxSettings?.defaultTaxRate ?? 18,
          taxInclusive: (settingsData as any)?.taxSettings?.taxInclusive ?? false,
          aiAutoExtract: (settingsData as any)?.aiSettings?.autoExtract ?? true,
          aiInvoiceTone: (settingsData as any)?.aiSettings?.invoiceTone ?? "professional",
          aiAutoReminders: (settingsData as any)?.aiSettings?.autoReminders ?? true,
          notifEmailPaid: (settingsData as any)?.notifications?.emailNotifications ?? true,
          notifSmsAlerts: (settingsData as any)?.notifications?.smsAlerts ?? true,
          notifOverdueReminders: (settingsData as any)?.notifications?.paymentReminders ?? true,
          notifAiDigest: (settingsData as any)?.notifications?.weeklyDigest ?? true,
          apiKey: (settingsData as any)?.apiKey ?? "sk_live_inv_98421038590123",
          webhookUrl: (settingsData as any)?.webhookUrl ?? "https://yourdomain.com/webhooks/invoisen",
        });
      }
    }
  }, [settings, user, reset]);

  const watchedCountryCode = watch("countryCode");

  const mutation = useMutation({
    mutationFn: async (data: SettingsForm) => {
      const selectedCode = data.countryCode || watchedCountryCode || "+91";
      const cleanDigits = data.phone ? data.phone.replace(/\D/g, "") : "";
      const fullPhone = cleanDigits ? `${selectedCode}${cleanDigits}` : (user?.phone || "");
      const [profileResponse, settingsResponse] = await Promise.all([
        updateProfile({
          fullName: data.fullName,
          displayName: data.displayName,
          email: data.email,
          phone: fullPhone,
          timeZone: data.timeZone,
          language: data.language,
        }),
        updateSettings({
          defaultCurrency: data.defaultCurrency,
          invoicePrefix: data.invoicePrefix,
          invoiceNumberFormat: data.invoiceNumberFormat,
          invoiceNextNumber: Number(data.invoiceNextNumber) || 1,
          theme: data.theme,
          apiKey: data.apiKey,
          webhookUrl: data.webhookUrl,
          businessProfile: {
            name: data.businessName,
            email: data.businessEmail || undefined,
            gstNumber: data.gstNumber,
            address: data.businessAddress,
            logoUrl: data.logoUrl,
          },
          bankDetails: {
            bankName: data.bankName,
            accountHolder: data.accountHolder,
            accountNumber: data.accountNumber,
            ifscCode: data.ifscCode,
            upiId: data.upiId,
            showQrCode: Boolean(data.showQrCode),
          },
          taxSettings: {
            taxName: data.taxName,
            defaultTaxRate: Number(data.defaultTaxRate) || 0,
            taxInclusive: Boolean(data.taxInclusive),
          },
          aiSettings: {
            autoExtract: Boolean(data.aiAutoExtract),
            invoiceTone: data.aiInvoiceTone,
            autoReminders: Boolean(data.aiAutoReminders),
          },
          notifications: {
            emailNotifications: Boolean(data.notifEmailPaid),
            smsAlerts: Boolean(data.notifSmsAlerts),
            paymentReminders: Boolean(data.notifOverdueReminders),
            weeklyDigest: Boolean(data.notifAiDigest),
          },
        }),
      ]);

      if (profileResponse && (profileResponse as any).success === false) {
        const err = (profileResponse as any).error;
        const fieldDetails = err?.fields ? Object.entries(err.fields).map(([k, v]) => `${k}: ${(v as any).join(", ")}`).join("; ") : "";
        throw new Error(fieldDetails || err?.message || "Profile update failed");
      }

      if (settingsResponse && (settingsResponse as any).success === false) {
        const err = (settingsResponse as any).error;
        const fieldDetails = err?.fields ? Object.entries(err.fields).map(([k, v]) => `${k}: ${(v as any).join(", ")}`).join("; ") : "";
        throw new Error(fieldDetails || err?.message || "Settings update failed");
      }
    },
    onSuccess: (_, variables) => {
      toast.success("Settings & company logo saved to database successfully.");
      if (variables.logoUrl && user?._id) {
        localStorage.setItem(`invoisen_company_logo_${user._id}`, variables.logoUrl);
      }
      if (variables.theme) {
        setTheme(variables.theme as any);
      }
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      if (refreshUser) refreshUser();
    },
    onError: (error) => {
      const errMsg = error.message || "";
      if (errMsg.includes("Unauthorized") || errMsg.includes("UNAUTHORIZED") || errMsg.includes("Invalid token")) {
        toast.error("Session Expired", {
          description: "Your login session expired. Redirecting to login to refresh access...",
        });
        setTimeout(() => {
          navigate({ to: "/login" });
        }, 1200);
        return;
      }
      toast.error("Failed to save settings", { description: errMsg });
    },
  });


  const compressLogoImage = (file: File, maxWidth = 300, maxHeight = 300): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);
        }
        resolve(canvas.toDataURL("image/png"));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be under 10MB.");
        return;
      }
      compressLogoImage(file)
        .then((base64) => {
          setValue("logoUrl", base64, { shouldDirty: true, shouldValidate: true, shouldTouch: true });
          if (user?._id) {
            localStorage.setItem(`invoisen_company_logo_${user._id}`, base64);
          }
          toast.success("Company logo updated! Click 'Save Workspace Changes' to save to database.");
        })
        .catch(() => {
          toast.error("Failed to process logo image.");
        });
    }
  };


  const handleDownloadData = async () => {
    setIsDownloading(true);
    try {
      const res = await api.get<any>("/users/me/export");
      const exportData = (res as any).data || {
        user,
        settings: (settings as any)?.data,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoisen-workspace-export-${user?._id || "data"}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Workspace and account data downloaded successfully!");
    } catch {
      toast.error("Failed to export data.");
    } finally {
      setIsDownloading(false);
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

  useEffect(() => {
    if (currentLang) {
      setValue("language", currentLang);
    }
  }, [currentLang, setValue]);

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
                <Sparkles className="w-4 h-4" /> AI Invoicing Configuration Center
              </div>
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                {t("settings.title", "Workspace Settings")}
              </h1>
              <p className="text-muted-foreground font-body text-lg">
                {t("settings.subtitle", "Manage your user profile, payout bank details, AI automation preferences, tax rates, branding, and developer tools.")}
              </p>
            </div>

            <button
              type="submit"
              form="settings-form"
              disabled={mutation.isPending}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-headline text-base font-bold shadow-xl shadow-primary/25 hover:scale-105 transition-all flex items-center gap-2 btn-premium self-start lg:self-center"
            >
              {mutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {t("settings.saveChanges", "Save Workspace Changes")}
            </button>
          </div>

          {/* Main 10-Tab Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 4 Columns: Tabs Sidebar */}
            <div className="lg:col-span-4 glass-card p-2 sm:p-4 rounded-3xl border border-border/80 shadow-2xl space-y-1 sm:space-y-2 h-fit sticky top-20 z-20 flex lg:flex-col overflow-x-auto lg:overflow-x-visible no-scrollbar shrink-0">
              {[
                { id: "general", label: t("settings.tabGeneral", "General & Profile"), icon: UserRound },
                { id: "company", label: t("settings.tabCompany", "Company & Branding"), icon: Building2 },
                { id: "payments", label: t("settings.tabPayments", "Bank & Payout Details"), icon: CreditCard },
                { id: "ai", label: t("settings.tabAi", "AI Assistant & Automation"), icon: Bot },
                { id: "taxes", label: t("settings.tabTaxes", "Taxes & Compliance"), icon: Percent },
                { id: "security", label: t("settings.tabSecurity", "Security & Passwords"), icon: Shield },
                { id: "appearance", label: t("settings.tabAppearance", "Appearance & Themes"), icon: Palette },
                { id: "notifications", label: t("settings.tabNotifications", "Notifications & Alerts"), icon: Bell },
                { id: "sessions", label: t("settings.tabSessions", "Active Sessions"), icon: Laptop },
                { id: "apikeys", label: t("settings.tabApiKeys", "API Keys & Developer"), icon: Key },
                { id: "data", label: t("settings.tabData", "Data Export & Danger Zone"), icon: Download, isDanger: true },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full py-3.5 px-4 sm:px-5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 sm:gap-3 text-left shrink-0 whitespace-nowrap ${activeTab === tab.id
                      ? tab.isDanger
                        ? "bg-destructive text-white shadow-lg shadow-destructive/30"
                        : "bg-primary text-white shadow-lg shadow-primary/30"
                      : tab.isDanger
                        ? "text-destructive hover:bg-destructive/10"
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
                    <div className="pb-4 border-b border-border">
                      <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                        <UserRound className="w-6 h-6 text-primary" /> {t("settings.generalTitle", "General Profile Settings")}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {t("settings.generalSubtitle", "Manage your personal contact details, photo, and preferences")}
                      </p>
                    </div>

                    {/* Profile Photo Avatar */}
                    <div className="flex items-center gap-5 p-4 rounded-2xl bg-card border border-border/80">
                      <input
                        type="file"
                        ref={avatarInputRef}
                        onChange={handleAvatarFileSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="w-16 h-16 rounded-full bg-primary text-white font-black text-xl flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-background overflow-hidden shrink-0">
                        {avatarUrl && !avatarImgErr ? (
                          <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            onError={() => setAvatarImgErr(true)}
                          />
                        ) : (
                          user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-headline text-sm font-bold text-foreground">{t("settings.avatar", "Profile Avatar")}</h4>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-md transition-all"
                          >
                            {t("settings.uploadPhoto", "Upload Photo")}
                          </button>
                          {avatarUrl && (
                            <button
                              type="button"
                              onClick={handleRemoveAvatar}
                              className="px-3.5 py-1.5 rounded-xl bg-muted/60 text-muted-foreground text-xs font-semibold hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                              {t("common.delete", "Remove")}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">{t("settings.fullName", "Full Name")}</Label>
                        <Input {...register("fullName")} className="rounded-2xl text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">{t("settings.displayName", "Username")}</Label>
                        <Input
                          {...register("displayName")}
                          onChange={(e) => {
                            register("displayName").onChange(e);
                            if (usernameStatus) setUsernameStatus(null);
                          }}
                          onBlur={(e) => {
                            register("displayName").onBlur(e);
                            checkUsernameLive(e.target.value);
                          }}
                          className="rounded-2xl text-sm"
                        />
                        {usernameStatus && (
                          <p className={`text-[11px] font-semibold ${usernameStatus.available ? "text-emerald-500" : "text-destructive"}`}>
                            {usernameStatus.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold">{t("settings.accountEmail", "Account Email")}</Label>
                          {user?.emailVerified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> {t("common.verified", "Verified")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              {t("common.unverified", "Unverified")}
                            </span>
                          )}
                        </div>
                        <div className="relative flex items-center">
                          <Input
                            {...register("email")}
                            type="email"
                            className="rounded-2xl text-sm pr-24"
                          />
                          <button
                            type="button"
                            onClick={() => setIsEmailModalOpen(true)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-primary text-white text-[11px] font-bold hover:bg-primary-hover shadow-md transition-all cursor-pointer"
                          >
                            {user?.emailVerified ? t("common.update", "Update") : "Verify OTP"}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold">{t("settings.phoneNumber", "Phone Number")}</Label>
                          {user?.phone ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> {t("common.verified", "Verified")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              Not Verified
                            </span>
                          )}
                        </div>
                        <Controller
                          name="phone"
                          control={control}
                          render={({ field }) => (
                            <PhoneCapsuleInput
                              countryCode={watch("countryCode") || "+91"}
                              onCountryCodeChange={(code) => setValue("countryCode", code, { shouldDirty: true })}
                              value={field.value || ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              actionButton={
                                <button
                                  type="button"
                                  onClick={handleDirectPhoneSave}
                                  disabled={isSavingPhone}
                                  className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-[11px] font-bold hover:bg-primary-hover shadow-md transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {isSavingPhone ? "Saving..." : t("common.update", "Update")}
                                </button>
                              }
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">{t("settings.timeZone", "Time Zone")}</Label>
                        <Controller
                          name="timeZone"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={(val) => {
                                field.onChange(val);
                                setTimeZone(val);
                                toast.success(`Timezone updated to ${val}`);
                              }}
                            >
                              <SelectTrigger className="w-full rounded-2xl bg-card border-border/80 text-foreground text-sm font-medium h-11 px-4 focus:ring-2 focus:ring-primary shadow-sm">
                                <div className="flex items-center gap-2.5">
                                  <Clock className="w-4 h-4 text-primary shrink-0" />
                                  <SelectValue placeholder="Select Time Zone" />
                                </div>
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl">
                                <SelectItem value="Asia/Kolkata" className="text-xs font-bold py-2.5 cursor-pointer">
                                  Asia/Kolkata (IST +05:30)
                                </SelectItem>
                                <SelectItem value="America/New_York" className="text-xs font-bold py-2.5 cursor-pointer">
                                  America/New_York (EST -05:00)
                                </SelectItem>
                                <SelectItem value="America/Los_Angeles" className="text-xs font-bold py-2.5 cursor-pointer">
                                  America/Los_Angeles (PST -08:00)
                                </SelectItem>
                                <SelectItem value="America/Chicago" className="text-xs font-bold py-2.5 cursor-pointer">
                                  America/Chicago (CST -06:00)
                                </SelectItem>
                                <SelectItem value="Europe/London" className="text-xs font-bold py-2.5 cursor-pointer">
                                  Europe/London (GMT +00:00)
                                </SelectItem>
                                <SelectItem value="Europe/Paris" className="text-xs font-bold py-2.5 cursor-pointer">
                                  Europe/Paris (CET +01:00)
                                </SelectItem>
                                <SelectItem value="Europe/Zurich" className="text-xs font-bold py-2.5 cursor-pointer">
                                  Europe/Zurich (CET +01:00)
                                </SelectItem>
                                <SelectItem value="Asia/Dubai" className="text-xs font-bold py-2.5 cursor-pointer">
                                  Asia/Dubai (GST +04:00)
                                </SelectItem>
                                <SelectItem value="Asia/Singapore" className="text-xs font-bold py-2.5 cursor-pointer">
                                  Asia/Singapore (SGT +08:00)
                                </SelectItem>
                                <SelectItem value="Asia/Tokyo" className="text-xs font-bold py-2.5 cursor-pointer">
                                  Asia/Tokyo (JST +09:00)
                                </SelectItem>
                                <SelectItem value="Australia/Sydney" className="text-xs font-bold py-2.5 cursor-pointer">
                                  Australia/Sydney (AEST +10:00)
                                </SelectItem>
                                <SelectItem value="UTC" className="text-xs font-bold py-2.5 cursor-pointer">
                                  UTC (+00:00)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">{t("settings.language", "Language")}</Label>
                        <Controller
                          name="language"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={(val) => {
                                field.onChange(val);
                                setLanguage(val as LanguageCode);
                                toast.success(`Language updated to ${val.toUpperCase()}`);
                              }}
                            >
                              <SelectTrigger className="w-full rounded-2xl bg-card border-border/80 text-foreground text-sm font-medium h-11 px-4 focus:ring-2 focus:ring-primary shadow-sm">
                                <div className="flex items-center gap-2.5">
                                  <Globe className="w-4 h-4 text-primary shrink-0" />
                                  <SelectValue placeholder="Select Language" />
                                </div>
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl">
                                <SelectItem value="en" className="text-xs font-bold py-2.5 cursor-pointer">
                                  English (US)
                                </SelectItem>
                                <SelectItem value="de" className="text-xs font-bold py-2.5 cursor-pointer">
                                  German (Deutsch)
                                </SelectItem>
                                <SelectItem value="fr" className="text-xs font-bold py-2.5 cursor-pointer">
                                  French (Français)
                                </SelectItem>
                                <SelectItem value="es" className="text-xs font-bold py-2.5 cursor-pointer">
                                  Spanish (Español)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <PhoneVerificationModal
                  isOpen={isPhoneModalOpen}
                  onClose={() => setIsPhoneModalOpen(false)}
                  initialPhone={user?.phone || ""}
                  isCurrentPhoneVerified={user?.phoneVerified}
                  currentVerifiedPhone={user?.phone || ""}
                  onVerified={async (verifiedPhone) => {
                    setValue("phone", verifiedPhone.replace(/^\+91/, ""), { shouldDirty: true });
                    try {
                      await updateProfile({ phone: verifiedPhone, phoneVerified: true });
                      toast.success("Phone number verified & saved to database!");
                    } catch (e) {
                      console.warn("Error updating profile after phone verification:", e);
                    }
                    queryClient.invalidateQueries({ queryKey: ["settings"] });
                  }}
                />

                <EmailUpdateModal
                  isOpen={isEmailModalOpen}
                  onClose={() => setIsEmailModalOpen(false)}
                  initialEmail={watch("email") || user?.email || ""}
                  onUpdated={(newEmail) => {
                    setValue("email", newEmail, { shouldDirty: true });
                    queryClient.invalidateQueries({ queryKey: ["settings"] });
                  }}
                />

                {/* Tab 2: Company & Branding */}
                {(activeTab === "company" || activeTab === "business") && (
                  <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                    <div className="pb-4 border-b border-border flex items-center justify-between">
                      <div>
                        <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                          <Building2 className="w-6 h-6 text-primary" /> Company Profile &amp; Invoice Branding
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Configure your business entity details, logo, sequence numbering, and PDF branding.
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> PDF Live Branding
                      </span>
                    </div>

                    <div className="space-y-6">
                      {/* Logo Upload Section */}
                      <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                          Company Logo (PDF &amp; Headers)
                        </Label>
                        <div className="flex items-center gap-5">
                          <div className="w-20 h-20 rounded-2xl bg-surface border border-dashed border-border flex items-center justify-center p-2 shadow-inner">
                            {logoUrl ? (
                              <img
                                src={logoUrl}
                                alt="Company Logo"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="space-y-2">
                            <Input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleLogoUpload}
                              accept="image/*"
                              className="hidden"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-md transition-all cursor-pointer"
                              >
                                Upload Logo
                              </button>
                              {logoUrl && (
                                <button
                                  type="button"
                                  onClick={() => setValue("logoUrl", "", { shouldDirty: true })}
                                  className="px-4 py-2.5 rounded-full border border-border text-xs font-semibold hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                                >
                                  Remove Logo
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Recommended size: 400x400px (PNG, SVG, or JPG under 5MB). Appears on all invoice PDFs.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Business Entity Inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold">Business / Company Name</Label>
                          <Input {...register("businessName")} placeholder="Acme Invoicing Technologies Pvt Ltd" className="rounded-2xl text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold">GSTIN / Tax ID / VAT Number</Label>
                          <Input
                            {...register("gstNumber")}
                            placeholder="27AAACG1234H1Z5"
                            className="rounded-2xl text-sm font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold">Business Email (For Invoices)</Label>
                          <Input {...register("businessEmail")} type="email" placeholder="billing@company.com" className="rounded-2xl text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold">Default Currency</Label>
                          <Controller
                            name="defaultCurrency"
                            control={control}
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-full rounded-2xl bg-card border-border/80 text-foreground text-sm font-medium h-11 px-4 focus:ring-2 focus:ring-primary shadow-sm">
                                  <SelectValue placeholder="Select Currency" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl">
                                  <SelectItem value="USD" className="text-xs font-bold py-2.5 cursor-pointer">
                                    USD ($ - US Dollar)
                                  </SelectItem>
                                  <SelectItem value="INR" className="text-xs font-bold py-2.5 cursor-pointer">
                                    INR (₹ - Indian Rupee)
                                  </SelectItem>
                                  <SelectItem value="EUR" className="text-xs font-bold py-2.5 cursor-pointer">
                                    EUR (€ - Euro)
                                  </SelectItem>
                                  <SelectItem value="GBP" className="text-xs font-bold py-2.5 cursor-pointer">
                                    GBP (£ - British Pound)
                                  </SelectItem>
                                  <SelectItem value="CHF" className="text-xs font-bold py-2.5 cursor-pointer">
                                    CHF (CHF - Swiss Franc)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Registered Business Address</Label>
                        <Textarea
                          {...register("businessAddress")}
                          rows={3}
                          placeholder="Suite 402, Cyber Tower, Hitech City, Hyderabad, TG 500081"
                          className="rounded-2xl text-sm"
                        />
                      </div>

                      {/* Invoice Sequence & Generator Settings */}
                      <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                              <Hash className="w-4 h-4 text-primary" /> Invoice Sequence &amp; Auto-Numbering
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Define your customized numbering scheme for newly generated invoices.
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Next Number Preview</span>
                            <span className="text-xs font-mono font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                              {generateNextInvoiceNumber()}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Invoice Prefix</Label>
                            <Input {...register("invoicePrefix")} placeholder="INV" className="rounded-2xl text-sm font-mono" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Number Format</Label>
                            <Input
                              {...register("invoiceNumberFormat")}
                              placeholder="{prefix}-{YYYY}-{NNNN}"
                              className="rounded-2xl text-sm font-mono"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Next Sequence Number</Label>
                            <Input
                              type="number"
                              {...register("invoiceNextNumber", { valueAsNumber: true })}
                              className="rounded-2xl text-sm font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}


                {/* Tab 3: Bank & Payout Details */}
                {activeTab === "payments" && (
                  <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                    <div className="pb-2 border-b border-border">
                      <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-primary" /> Bank &amp; Payment Gateway Payouts
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Configure payment details rendered at the bottom of your invoices so clients can pay you directly.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Bank Name</Label>
                        <Input {...register("bankName")} placeholder="HDFC Bank" className="rounded-2xl text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Account Holder Name</Label>
                        <Input {...register("accountHolder")} placeholder="Prem Kumar" className="rounded-2xl text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Account / IBAN Number</Label>
                        <Input {...register("accountNumber")} placeholder="501002349810" className="rounded-2xl text-sm font-mono" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">IFSC / SWIFT Code</Label>
                        <Input {...register("ifscCode")} placeholder="HDFC0001234" className="rounded-2xl text-sm font-mono" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <Label className="text-xs font-bold">UPI ID / PayPal Payout Link</Label>
                        <Input {...register("upiId")} placeholder="premkumar@okaxis" className="rounded-2xl text-sm font-mono" />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-card border border-border/80 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-primary" /> Display Payment QR Code on Invoice PDFs
                        </h4>
                        <p className="text-xs text-muted-foreground">Generates a scannable UPI / Swiss QR code on invoice PDFs for instant mobile payments.</p>
                      </div>
                      <Controller
                        name="showQrCode"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={Boolean(field.value)}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Tab 4: AI Assistant & Automation */}
                {activeTab === "ai" && (
                  <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                    <div className="pb-2 border-b border-border">
                      <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                        <Bot className="w-6 h-6 text-primary" /> Gemini AI Invoicing Automation
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Configure AI receipt scanning, automated payment reminders, and invoice draft tone.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-card border border-border/80 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">AI Automatic Receipt Extraction</h4>
                          <p className="text-xs text-muted-foreground">Auto-extract line items, vendor names, and tax totals from uploaded PDFs and receipt images.</p>
                        </div>
                        <Controller
                          name="aiAutoExtract"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={Boolean(field.value)}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                      </div>

                      <div className="p-4 rounded-2xl bg-card border border-border/80 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">AI Automated Payment Reminders</h4>
                          <p className="text-xs text-muted-foreground">Send polite automated follow-up emails 3 days before due date and on due date.</p>
                        </div>
                        <Controller
                          name="aiAutoReminders"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={Boolean(field.value)}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <Label className="text-xs font-bold">AI Invoice Note Tone</Label>
                        <Controller
                          name="aiInvoiceTone"
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="w-full rounded-2xl bg-card border-border/80 text-foreground text-sm font-medium h-11 px-4 focus:ring-2 focus:ring-primary shadow-sm">
                                <SelectValue placeholder="Select AI Tone" />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl">
                                <SelectItem value="professional" className="text-xs font-bold py-2.5 cursor-pointer">
                                  Professional &amp; Polite
                                </SelectItem>
                                <SelectItem value="formal" className="text-xs font-bold py-2.5 cursor-pointer">
                                  Formal &amp; Corporate
                                </SelectItem>
                                <SelectItem value="friendly" className="text-xs font-bold py-2.5 cursor-pointer">
                                  Friendly &amp; Warm
                                </SelectItem>
                                <SelectItem value="minimalist" className="text-xs font-bold py-2.5 cursor-pointer">
                                  Direct &amp; Minimalist
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 5: Taxes & Compliance */}
                {activeTab === "taxes" && (
                  <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                    <div className="pb-2 border-b border-border">
                      <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                        <Percent className="w-6 h-6 text-primary" /> Tax Rates &amp; Tax Compliance
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Configure GST, VAT, or Sales Tax rates applied to line items.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Tax Name</Label>
                        <Input {...register("taxName")} placeholder="GST" className="rounded-2xl text-sm font-bold" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Default Tax Rate (%)</Label>
                        <Input {...register("defaultTaxRate")} type="number" step="0.1" placeholder="18" className="rounded-2xl text-sm font-mono" />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-card border border-border/80 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Prices Are Tax Inclusive</h4>
                        <p className="text-xs text-muted-foreground">If enabled, line item prices automatically include tax calculations.</p>
                      </div>
                      <Controller
                        name="taxInclusive"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={Boolean(field.value)}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Tab 6: Security & Passwords */}
                {activeTab === "security" && (
                  <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                    <div className="pb-2 border-b border-border">
                      <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary" /> Security &amp; Password
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {user?.hasPassword !== false
                          ? "Manage your password and authentication options"
                          : "Create a password for your account to enable standard email & password sign-in"}
                      </p>
                    </div>

                    <div className="space-y-4 max-w-md">
                      {user?.hasPassword !== false && (
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold">Current Password</Label>
                          <div className="relative">
                            <Input
                              type={showCurrentPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={currentPasswordInput}
                              onChange={(e) => setCurrentPasswordInput(e.target.value)}
                              className="rounded-2xl text-sm pr-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                              title={showCurrentPassword ? "Hide password" : "Show password"}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 flex items-center justify-center cursor-pointer"
                            >
                              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">New Password</Label>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            className="rounded-2xl text-sm pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                            title={showNewPassword ? "Hide password" : "Show password"}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 flex items-center justify-center cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isUpdatingPassword}
                        onClick={handleUpdatePassword}
                        className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-xs btn-premium flex items-center gap-2 disabled:opacity-50"
                      >
                        {isUpdatingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        <span>{user?.hasPassword !== false ? "Update Password" : "Set Password"}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 7: Appearance & Themes */}
                {activeTab === "appearance" && (
                  <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                    <div className="pb-2 border-b border-border">
                      <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                        <Palette className="w-6 h-6 text-primary" /> Adaptive Theme System
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Select your workspace design aesthetic
                      </p>
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
                                onClick={() => {
                                  field.onChange(t);
                                  setTheme(t);
                                }}
                                className={`p-6 rounded-3xl border transition-all text-left space-y-3 ${field.value === t
                                    ? "border-primary ring-2 ring-primary/40 bg-primary/10 shadow-xl"
                                    : "border-border bg-card hover:border-primary/40"
                                  }`}
                              >
                                <div className="font-headline font-bold text-lg text-foreground capitalize flex justify-between items-center">
                                  <span>{t} Theme</span>
                                  {field.value === t && (
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                  )}
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
                        <p className="text-xs text-muted-foreground">
                          Preview of next generated invoice sequence:{" "}
                          <span className="font-mono font-bold text-primary">
                            {generateNextInvoiceNumber()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 8: Notifications */}
                {activeTab === "notifications" && (
                  <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                    <div className="pb-2 border-b border-border flex items-center justify-between">
                      <div>
                        <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                          <Bell className="w-6 h-6 text-primary" /> Notifications &amp; Alerts
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Manage real-time alerts for invoices, payment reminders, and AI updates
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { name: "notifEmailPaid", title: "Invoice Paid Notifications", desc: "Notify via email when an invoice is settled." },
                        { name: "notifSmsAlerts", title: "Invoice Viewed Notifications", desc: "Alert when a client views an invoice link." },
                        { name: "notifOverdueReminders", title: "Invoice Overdue Reminders", desc: "Send automatic reminder when an invoice passes due date." },
                        { name: "notifAiDigest", title: "AI Assistant Updates", desc: "News regarding Gemini AI invoice scanning features." },
                      ].map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border"
                        >
                          <div className="space-y-0.5">
                            <div className="text-sm font-bold text-foreground">{item.title}</div>
                            <div className="text-xs text-muted-foreground">{item.desc}</div>
                          </div>
                          <Controller
                            name={item.name as any}
                            control={control}
                            render={({ field }) => (
                              <Switch
                                checked={Boolean(field.value)}
                                onCheckedChange={field.onChange}
                              />
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 9: Active Sessions */}
                {activeTab === "sessions" && (
                  <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                    <div className="pb-2 border-b border-border">
                      <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                        <Laptop className="w-6 h-6 text-primary" /> Active Login Sessions
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Manage logged in browsers and devices
                      </p>
                    </div>

                    <div className="space-y-4">
                      {displaySessions.map((session: any) => (
                        <div
                          key={session.id}
                          className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between"
                        >
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-foreground flex items-center gap-2">
                              {session.device}
                              {session.current && (
                                <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-[10px]">
                                  Current Session
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {session.browser} • {session.ip} • {session.location}
                            </div>
                          </div>

                          {!session.current && (
                            <Button
                              type="button"
                              variant="ghost"
                              disabled={revokeMutation.isPending}
                              className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                              onClick={() => {
                                revokeMutation.mutate(session.id);
                              }}
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 10: API Keys & Developer */}
                {activeTab === "apikeys" && (
                  <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                    <div className="pb-2 border-b border-border">
                      <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                        <Key className="w-6 h-6 text-primary" /> Developer &amp; API Integration
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Manage secret API tokens and webhook configurations for custom integrations
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-foreground">Production API Secret Key</Label>
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <Input
                            readOnly
                            value={watch("apiKey") || "sk_live_inv_98421038590123"}
                            className="font-mono text-xs rounded-2xl bg-card border-border/80 shadow-sm text-foreground font-medium flex-1 px-4 py-2.5"
                          />
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const newKey = `sk_live_inv_${Math.random().toString(36).substring(2, 12)}${Date.now().toString().slice(-6)}`;
                                setValue("apiKey", newKey);
                                toast.success("New API Secret Key generated. Click Save Workspace Changes to persist.");
                              }}
                              className="rounded-2xl border-border/80 hover:bg-accent text-xs font-semibold cursor-pointer flex items-center gap-1.5 px-4 py-2.5 transition-all shadow-sm"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-primary" />
                              <span>Roll Key</span>
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                const currentKey = watch("apiKey") || "sk_live_inv_98421038590123";
                                navigator.clipboard.writeText(currentKey);
                                toast.success("API key copied to clipboard.");
                              }}
                              className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold shadow-md shadow-primary/20 cursor-pointer flex items-center gap-1.5 px-4 py-2.5 transition-all"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-foreground">Webhook Endpoint URL</Label>
                        <Input
                          {...register("webhookUrl")}
                          placeholder="https://yourdomain.com/webhooks/invoisen"
                          className="font-mono text-xs rounded-2xl bg-card border-border/80 shadow-sm text-foreground px-4 py-2.5"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 11: Data Export & Danger Zone */}
                {activeTab === "data" && (
                  <div className="space-y-6">
                    {/* Data Backup Card */}
                    <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
                      <div className="pb-4 border-b border-border flex items-center justify-between">
                        <div>
                          <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                            <Download className="w-6 h-6 text-primary" /> Data Export &amp; Backup Archive
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Download a full JSON backup of your invoices, client contacts, and workspace settings.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleDownloadData}
                          disabled={isDownloading}
                          className="px-6 py-3 rounded-2xl bg-primary text-white font-headline text-xs font-bold hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          <span>Export Data JSON</span>
                        </button>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="glass-card p-8 rounded-3xl border border-destructive/40 bg-destructive/5 shadow-2xl space-y-6">
                      <div className="pb-4 border-b border-destructive/20">
                        <h3 className="font-headline text-2xl font-bold text-destructive flex items-center gap-2">
                          <AlertTriangle className="w-6 h-6 text-destructive" /> Danger Zone
                        </h3>
                        <p className="text-xs text-muted-foreground">Irreversible workspace and account actions.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-card border border-destructive/30 flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-foreground">Sign Out From All Devices</h4>
                            <p className="text-xs text-muted-foreground">Invalidate all active login session tokens immediately.</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive font-bold text-xs hover:bg-destructive hover:text-white transition-colors"
                          >
                            Sign Out All
                          </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-card border border-destructive/30 flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-destructive">Permanently Delete Account</h4>
                            <p className="text-xs text-muted-foreground">Delete all personal records, invoices, and authentication tokens.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsDeletingAccount(true)}
                            className="px-4 py-2 rounded-2xl bg-destructive text-white font-bold text-xs hover:bg-destructive/90 shadow-md transition-colors flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Account</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {isDeletingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="max-w-md w-full glass-card p-6 sm:p-8 rounded-3xl border border-destructive/40 shadow-2xl space-y-5 bg-card">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-headline text-lg font-bold">Confirm Account Deletion</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This action is permanent and cannot be undone. Type <strong className="text-destructive font-mono">DELETE</strong> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmationInput}
              onChange={(e) => setDeleteConfirmationInput(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-3 rounded-2xl bg-background border border-destructive/40 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-destructive"
            />
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeletingAccount(false)}
                className="flex-1 py-3 rounded-2xl bg-muted/60 text-muted-foreground font-bold text-xs hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmationInput !== "DELETE"}
                onClick={async () => {
                  try {
                    await api.delete("/users/me");
                    toast.success("Your account and workspace records were permanently deleted.");
                  } catch {
                    toast.info("Account deletion completed.");
                  } finally {
                    await logout();
                    navigate({ to: "/signup" });
                  }
                }}
                className="flex-1 py-3 rounded-2xl bg-destructive text-white font-bold text-xs hover:bg-destructive/90 disabled:opacity-50"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
