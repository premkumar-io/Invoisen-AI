import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Eye, EyeOff, Mail, ShieldCheck, Sparkles, UserRound, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { Hero3DModel } from "@/components/Hero3DModel";
import { useAuth } from "@/lib/auth-context";
import { api, getGoogleAuthUrl } from "@/lib/api";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create Account — Invoisen AI" }] }),
  component: SignupPage,
});

interface SignupForm {
  fullName: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(true);
  const [isGoogleAuthEnabled, setIsGoogleAuthEnabled] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm<SignupForm>({ mode: "onBlur" });
  const password = watch("password", "");

  useEffect(() => {
    async function fetchAuthConfig() {
      try {
        const response = await api.get<{ isGoogleAuthEnabled: boolean }>("/auth/config");
        if (response.success) {
          setIsGoogleAuthEnabled(response.data.isGoogleAuthEnabled);
        }
      } catch (err) {
        console.error("Failed to fetch auth config", err);
      } finally {
        setIsLoadingGoogle(false);
      }
    }
    fetchAuthConfig();
  }, []);

  const onGoogleSignup = () => {
    window.location.href = getGoogleAuthUrl();
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
      const result = await signup(data.fullName, data.email, data.password);
      const verificationUrl = result?.verificationUrl;

      if (verificationUrl) {
        const url = new URL(verificationUrl);
        const token = url.searchParams.get("token");
        if (token) {
          await navigate({ to: "/verify-email", search: { token }, replace: true });
        } else {
          await navigate({ to: "/verify-email", replace: true });
        }
      } else {
        await navigate({ to: "/verify-email", replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    }
  };

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white flex flex-col justify-between">
      {/* 3D WebGL Background Canvas */}
      <ThreeBackground />

      {/* Global Top Navbar */}
      <AppNavbar />

      {/* Split Auth Section */}
      <div className="relative pt-28 pb-16 z-10 max-w-container-max mx-auto px-margin-desktop w-full grid lg:grid-cols-12 gap-12 items-center flex-1">
        {/* Left Side: Glass Auth Form */}
        <div className="lg:col-span-5 max-w-lg mx-auto w-full">
          <div className="glass-card p-8 md:p-10 rounded-3xl border border-border/80 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>14-Day Free Trial • Instant Setup</span>
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
                    type="email"
                    placeholder="name@company.com"
                    className="w-full rounded-2xl border border-border/80 bg-card/60 px-11 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register("password", { required: "Password is required" })}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-border/80 bg-card/60 px-11 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-border overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${strengthMeta.color}`} style={{ width: `${(strength / 4) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">{strengthMeta.label}</span>
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
                  I agree to the <Link to="/terms" className="text-primary font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>.
                </label>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-primary text-white font-headline text-sm font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 btn-premium"
              >
                {isSubmitting ? "Creating Account..." : "Start Free Trial"}
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

            {isLoadingGoogle ? (
              <div className="w-full py-3 rounded-full bg-card border border-border/80 text-center text-xs font-bold text-muted-foreground animate-pulse">
                Loading Google Authentication...
              </div>
            ) : isGoogleAuthEnabled ? (
              <button
                type="button"
                onClick={onGoogleSignup}
                className="w-full py-3.5 rounded-full bg-card/80 border border-border/80 hover:bg-card text-foreground font-bold text-xs flex items-center justify-center gap-3 transition-all hover:scale-[1.01] shadow-md"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.651-3.356-11.303-7.96H6.306C9.656,39.663,16.318,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238C44.383,36.218,48,30.455,48,24C48,22.659,47.862,21.35,47.611,20.083z" />
                </svg>
                Sign up with Google
              </button>
            ) : null}

            <div className="text-center pt-2 border-t border-border/60">
              <span className="text-xs text-muted-foreground">Already registered? </span>
              <Link to="/login" className="text-xs font-bold text-primary hover:underline">
                Log in to account
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive 3D Visual Showcase */}
        <div className="lg:col-span-7 hidden lg:block relative h-[580px] rounded-3xl overflow-hidden border border-border/80 shadow-2xl glass-card">
          <div className="absolute inset-0 z-0 flex items-center justify-center">
            <Hero3DModel />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between p-8 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none">
            <div className="space-y-3 pointer-events-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold text-xs">
                ⚡ Included in your free trial
              </div>
              <h2 className="font-headline text-2xl font-extrabold text-foreground tracking-tight max-w-lg">
                Everything you need to automate billing &amp; get paid faster.
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 pointer-events-auto">
              {[
                "AI Line Item Description Generator",
                "Swiss Standard QR PDF Exporter",
                "Cross-Border Multi-Currency Support",
                "Automated Client Entity Research",
                "Real-Time Cashflow Predictive Analytics",
                "Bank-Grade AES-256 Security Architecture",
              ].map((item, idx) => (
                <div key={idx} className="glass-card p-3 rounded-2xl border border-border/80 flex items-center gap-2.5 backdrop-blur-md">
                  <div className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0 font-bold text-[10px]">
                    ✓
                  </div>
                  <span className="text-[11px] font-bold text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Standardized Footer */}
      <footer className="w-full bg-card border-t border-border mt-auto z-20">
        <div className="max-w-container-max mx-auto px-margin-desktop py-6 text-center text-muted-foreground text-xs tracking-widest uppercase font-bold">
          © 2026 Invoisen AI. All rights reserved. Precision-engineered in Zurich.
        </div>
      </footer>
    </div>
  );
}
