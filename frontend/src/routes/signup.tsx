import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
  UserRound,
  LockKeyhole,
  Phone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { Hero3DModel } from "@/components/Hero3DModel";
import { PhoneVerificationModal } from "@/components/PhoneVerificationModal";
import { PhoneCapsuleInput } from "@/components/PhoneCapsuleInput";
import { useAuth } from "@/lib/auth-context";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { getAuthToken, saveAuthToken } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && getAuthToken()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({ meta: [{ title: "Create Account — Invoisen AI" }] }),
  component: SignupPage,
});

interface SignupForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  plan?: "free" | "pro" | "enterprise";
  acceptTerms: boolean;
}

function detectUserCountryCode(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Calcutta") || tz.includes("Kolkata") || tz.includes("Colombo")) return "+91";
    if (tz.startsWith("America/")) return "+1";
    if (tz.includes("London") || tz.includes("Europe/London")) return "+44";
    if (tz.includes("Berlin")) return "+49";
    if (tz.includes("Paris")) return "+33";
    if (tz.includes("Australia")) return "+61";
    if (tz.includes("Singapore")) return "+65";
    if (tz.includes("Dubai")) return "+971";
    if (tz.includes("Zurich")) return "+41";
  } catch {
    // fallback
  }
  return "+91";
}

function SignupPage() {
  const { user, isAuthenticated, isLoading, signup, handleGoogleCallback } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [countryCode, setCountryCode] = useState(() => detectUserCountryCode());
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [pendingPhone, setPendingPhone] = useState("");

  useEffect(() => {
    if (!isLoading && (isAuthenticated || user || getAuthToken())) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm<SignupForm>({ mode: "onBlur" });
  const password = watch("password", "");

  const handleGoogleSuccess = async (accessToken: string) => {
    setError("");
    try {
      await handleGoogleCallback(accessToken);
      await navigate({ to: "/welcome" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google signup failed.");
    }
  };

  const handleGoogleError = (message: string) => {
    setError(message);
  };

  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
  const passedCount = Object.values(passwordChecks).filter(Boolean).length;
  const strength = password.length === 0 ? 0 : Math.min(4, Math.max(1, passedCount - 1));
  const strengthMeta = [
    { label: "", color: "bg-border" },
    { label: "Weak", color: "bg-destructive" },
    { label: "Fair", color: "bg-warning" },
    { label: "Good", color: "bg-success" },
    { label: "Strong", color: "bg-success" },
  ][strength];

  const onSubmit = async (data: SignupForm) => {
    setError("");
    try {
      const rawPhone = data.phone.trim();
      const fullPhone = rawPhone.startsWith("+") ? rawPhone : `${countryCode}${rawPhone.replace(/\D/g, "")}`;
      await signup(data.fullName, data.email, data.password, fullPhone);
      // Directly navigate to welcome after successful signup, no OTP flow
      await navigate({ to: "/welcome", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    }
  };

  const handlePhoneVerified = async () => {
    setIsPhoneModalOpen(false);
    await navigate({ to: "/welcome", replace: true });
  };

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white flex flex-col justify-between">
      {/* 3D WebGL Background Canvas */}
      <ThreeBackground />

      {/* Global Top Navbar */}
      <AppNavbar />

      {/* Split Auth Section */}
      <div className="relative pt-28 pb-16 z-10 max-w-container-max mx-auto px-margin-desktop w-full grid lg:grid-cols-12 gap-8 items-center flex-1">
        {/* Left Side: Glass Auth Form */}
        <div className="lg:col-span-5 max-w-lg mx-auto w-full">
          <div className="glass-card p-5 sm:p-8 md:p-10 rounded-3xl border border-border/80 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Setup • AI Workspace</span>
              </div>
              <h1 className="font-headline text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
                Create <span className="drawing-text italic">account.</span>
              </h1>
              <p className="text-muted-foreground text-sm font-body">
                Join 24,000+ agencies automating invoice workflows with AI precision.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                  Full Name
                </label>
                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register("fullName", { required: "Full name is required" })}
                    id="fullName"
                    data-testid="signup-fullname"
                    type="text"
                    placeholder="Marc Benioff"
                    className="w-full rounded-2xl border border-border/80 bg-card/60 px-11 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register("email", { required: "Email is required" })}
                    id="email"
                    data-testid="signup-email"
                    type="email"
                    placeholder="name@company.com"
                    className="w-full rounded-2xl border border-border/80 bg-card/60 px-11 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                  Phone Number
                </label>
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: "Phone number is required for OTP verification" }}
                  render={({ field }) => (
                    <PhoneCapsuleInput
                      countryCode={countryCode}
                      onCountryCodeChange={(code) => setCountryCode(code)}
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/80 flex items-center justify-between">
                  <span>Select Pricing Plan</span>
                  <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    ⚡ Instant Access
                  </span>
                </label>
                <Controller
                  name="plan"
                  control={control}
                  defaultValue="pro"
                  render={({ field }) => (
                    <div className="grid grid-cols-3 gap-2 md:gap-2.5">
                      {[
                        {
                          id: "pro",
                          name: "Pro Tier",
                          price: "₹299/mo",
                          sub: "Full Features",
                          badge: "Popular",
                          icon: Sparkles,
                        },
                        {
                          id: "free",
                          name: "Starter",
                          price: "₹0/mo",
                          sub: "Basic Features",
                          icon: Zap,
                        },
                        {
                          id: "enterprise",
                          name: "Enterprise",
                          price: "Custom",
                          sub: "Dedicated API",
                          icon: ShieldCheck,
                        },
                      ].map((p) => {
                        const Icon = p.icon;
                        const isSelected = (field.value || "pro") === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => field.onChange(p.id)}
                            className={`relative p-2.5 md:p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-md translate-y-[-1px]"
                                : "border-border/80 bg-card/60 hover:border-primary/40 hover:bg-card/90"
                            }`}
                          >
                            {p.badge && (
                              <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-primary to-indigo-500 text-[8px] md:text-[9px] font-extrabold text-white shadow-sm uppercase tracking-wider">
                                {p.badge}
                              </span>
                            )}
                            <div className="flex items-center justify-between mb-1">
                              <div
                                className={`w-6 h-6 md:w-7 md:h-7 rounded-xl flex items-center justify-center ${
                                  isSelected ? "bg-primary text-white" : "bg-muted/50 text-muted-foreground"
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-primary font-bold" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-foreground leading-tight">{p.name}</div>
                              <div className="text-[11px] font-extrabold text-primary">{p.price}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register("password", { required: "Password is required" })}
                    id="password"
                    data-testid="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-border/80 bg-card/60 px-11 py-3.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 flex items-center justify-center cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-border overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strengthMeta.color}`}
                          style={{ width: `${(strength / 4) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">
                        {strengthMeta.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  {...register("acceptTerms", { required: true })}
                  type="checkbox"
                  id="terms"
                  className="mt-1 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary font-bold hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary font-bold hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                id="signup-submit-btn"
                data-testid="signup-submit-btn"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-primary text-white font-headline text-sm font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 btn-premium"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/80"></div>
              </div>
              <span className="relative bg-card px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border/60 rounded-full">
                OR
              </span>
            </div>

            <GoogleSignInButton
              text="signup_with"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />

            <div className="text-center pt-2 border-t border-border/60">
              <span className="text-xs text-muted-foreground">Already registered? </span>
              <Link to="/login" className="text-xs font-bold text-primary hover:underline">
                Log in to account
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Ultra-Aesthetic Live Dashboard Showcase */}
        <div className="lg:col-span-7 hidden lg:block relative min-h-[600px] h-full rounded-3xl overflow-hidden border border-border/80 shadow-2xl glass-card backdrop-blur-2xl">
          <Hero3DModel />
        </div>
      </div>

      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        initialPhone={pendingPhone}
        onVerified={handlePhoneVerified}
      />

      {/* Standardized Footer */}
      <footer className="w-full bg-card border-t border-border mt-auto z-20">
        <div className="max-w-container-max mx-auto px-margin-desktop py-6 text-center text-muted-foreground text-xs tracking-widest uppercase font-bold">
          © 2026 Invoisen AI. All rights reserved. Precision-engineered in India.
        </div>
      </footer>
    </div>
  );
}
