import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { api, getGoogleAuthUrl } from "@/lib/api";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { Hero3DModel } from "@/components/Hero3DModel";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log In — Invoisen AI" }] }),
  component: LoginPage,
});

interface LoginForm {
  email: string;
  password: string;
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleAuthEnabled, setIsGoogleAuthEnabled] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(true);

  const { error: queryError } = Route.useSearch() as { error?: string };

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>();

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

  const onGoogleLogin = () => {
    window.location.href = getGoogleAuthUrl();
  };

  const onSubmit = async (data: LoginForm) => {
    setError("");
    try {
      await login(data.email, data.password);
      await navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
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
                <span>Encrypted Command Center</span>
              </div>
              <h1 className="font-headline text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
                Welcome <span className="drawing-text italic">back.</span>
              </h1>
              <p className="text-muted-foreground text-sm font-body">
                Log in to manage your AI invoices, clients, and cashflow.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register("email", { required: true })}
                    type="email"
                    placeholder="name@agency.com"
                    required
                    className="w-full rounded-2xl border border-border/80 bg-card/60 px-11 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register("password", { required: true })}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    required
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
              </div>

              {(error || queryError) && (
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold animate-shake">
                  {error || queryError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-primary text-white font-headline text-sm font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 btn-premium"
              >
                {isSubmitting ? "Authenticating..." : "Log In to Workspace"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {(isGoogleAuthEnabled || isLoadingGoogle) && (
              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/80"></div>
                </div>
                <span className="relative bg-card px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border/60 rounded-full">
                  OR
                </span>
              </div>
            )}

            {isLoadingGoogle && (
              <div className="w-full py-3.5 rounded-full bg-card border border-border/80 text-center text-xs font-bold text-muted-foreground animate-pulse">
                Checking Google Authentication...
              </div>
            )}

            {!isLoadingGoogle && isGoogleAuthEnabled && (
              <button
                type="button"
                onClick={onGoogleLogin}
                className="w-full py-3.5 rounded-full bg-card/80 border border-border/80 hover:bg-card text-foreground font-bold text-xs flex items-center justify-center gap-3 transition-all hover:scale-[1.01] shadow-md"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.651-3.356-11.303-7.96H6.306C9.656,39.663,16.318,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238C44.383,36.218,48,30.455,48,24C48,22.659,47.862,21.35,47.611,20.083z" />
                </svg>
                Continue with Google
              </button>
            )}

            <div className="pt-2 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>AES-256 Bank-Grade Encryption</span>
            </div>

            <div className="text-center pt-2 border-t border-border/60">
              <span className="text-xs text-muted-foreground">New to Invoisen? </span>
              <Link to="/signup" className="text-xs font-bold text-primary hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive 3D Visual Showcase */}
        <div className="lg:col-span-7 hidden lg:block relative h-[580px] rounded-3xl overflow-hidden border border-border/80 shadow-2xl glass-card">
          <div className="absolute inset-0 z-0 flex items-center justify-center">
            <Hero3DModel />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-end p-8 space-y-4 bg-gradient-to-t from-background/90 via-background/30 to-transparent pointer-events-none">
            <div className="glass-card p-6 rounded-3xl border border-border/80 max-w-xl space-y-3 shadow-2xl backdrop-blur-xl pointer-events-auto">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center font-bold text-primary text-xs border border-primary/30 shadow-md">
                  ⚡
                </div>
                <div>
                  <div className="font-headline font-bold text-foreground text-sm">Autonomous AI Invoicing</div>
                  <div className="text-[11px] text-muted-foreground">Neural Tax Match &amp; Multi-Currency Sync</div>
                </div>
              </div>
              <p className="text-foreground/90 italic text-xs leading-relaxed">
                "Invoisen handles our global multi-currency invoicing with total precision. The AI client research saves us hours on every client setup."
              </p>
            </div>

            <div className="flex gap-3 pointer-events-auto">
              <div className="glass-card px-4 py-2.5 rounded-2xl border border-border/80 backdrop-blur-md">
                <div className="text-[10px] text-muted-foreground font-bold">Global Invoices</div>
                <div className="font-headline font-extrabold text-base text-primary">$14.8M+</div>
              </div>
              <div className="glass-card px-4 py-2.5 rounded-2xl border border-border/80 backdrop-blur-md">
                <div className="text-[10px] text-muted-foreground font-bold">Active Agencies</div>
                <div className="font-headline font-extrabold text-base text-foreground">24,000+</div>
              </div>
              <div className="glass-card px-4 py-2.5 rounded-2xl border border-border/80 backdrop-blur-md">
                <div className="text-[10px] text-muted-foreground font-bold">Compliance</div>
                <div className="font-headline font-extrabold text-base text-success">100% Swiss</div>
              </div>
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
