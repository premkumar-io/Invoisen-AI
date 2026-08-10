import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { Hero3DModel } from "@/components/Hero3DModel";
import { useAuth } from "@/lib/auth-context";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { getAuthToken, saveAuthToken, cleanupExcessLocalStorage } from "@/lib/auth";

type LoginSearch = {
  error?: string;
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      error: typeof search.error === "string" ? search.error : undefined,
    };
  },
  beforeLoad: () => {
    if (typeof window !== "undefined" && getAuthToken()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({ meta: [{ title: "Log In — Invoisen AI" }] }),
  component: LoginPage,
});

interface LoginForm {
  email: string;
  password: string;
}

function LoginPage() {
  const { user, isAuthenticated, isLoading, login, handleGoogleCallback } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [dismissedError, setDismissedError] = useState(false);

  useEffect(() => {
    if (!isLoading && (isAuthenticated || user || getAuthToken())) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  const searchParams = Route.useSearch();

  useEffect(() => {
    if (searchParams.error) {
      const rawErr = searchParams.error;
      const formatted =
        rawErr === "invalid_request"
          ? "Google sign-in request could not be processed. Please try again."
          : rawErr === "access_denied"
            ? "Google access request was cancelled or declined. Please select your account and grant permission to continue."
            : rawErr === "google-auth-invalid-state"
              ? "Authentication session expired. Please click Continue with Google again."
              : rawErr === "google-auth-unavailable"
                ? "Google authentication is not configured on the server."
                : rawErr === "google-auth-failed"
                  ? "Google sign-in could not be completed. Please try again or use your password."
                  : rawErr;

      setError(formatted);
      setDismissedError(false);

      if (typeof window !== "undefined" && window.location.search.includes("error=")) {
        const url = new URL(window.location.href);
        url.searchParams.delete("error");
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
      }
    }
  }, [searchParams.error]);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError("");
    try {
      await login(data.email, data.password);
      await navigate({ to: "/dashboard" });
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "QuotaExceededError" || err.message.toLowerCase().includes("quota")) {
          cleanupExcessLocalStorage();
          setError("Browser storage limit was reached. Storage has been cleared—please click Log In again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Login failed. Please check your credentials.");
      }
    }
  };

  const handleGoogleSuccess = async (accessToken: string) => {
    setError("");
    try {
      await handleGoogleCallback(accessToken);
      await navigate({ to: "/welcome" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    }
  };

  const handleGoogleError = (message: string) => {
    setDismissedError(false);
    setError(message);
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
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register("email", { required: true })}
                    id="email"
                    data-testid="login-email"
                    type="text"
                    placeholder="name@agency.com or username"
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
                    id="password"
                    data-testid="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    required
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
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary"
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>

              {error && !dismissedError && (
                <div
                  id="login-error-alert"
                  data-testid="login-error-alert"
                  role="alert"
                  aria-live="assertive"
                  className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold leading-relaxed flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="shrink-0 font-extrabold uppercase bg-destructive/20 text-destructive px-2 py-0.5 rounded text-[10px] tracking-wider">
                      {error.includes("cancelled") || error.includes("declined") ? "Notice" : "Auth Note"}
                    </span>
                    <span>{error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDismissedError(true)}
                    className="p-1 rounded-full hover:bg-destructive/20 text-destructive transition-colors cursor-pointer shrink-0"
                    title="Dismiss notification"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                type="submit"
                id="login-submit-btn"
                data-testid="login-submit-btn"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-primary text-white font-headline text-sm font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 btn-premium"
              >
                {isSubmitting ? "Authenticating..." : "Log In to Workspace"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/80"></div>
              </div>
              <span className="relative bg-card px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border/60 rounded-full">
                OR
              </span>
            </div>

            <GoogleSignInButton
              text="continue_with"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />

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

        {/* Right Side: Ultra-Aesthetic Live Dashboard Showcase */}
        <div className="lg:col-span-7 hidden lg:block relative min-h-[600px] h-full rounded-3xl overflow-hidden border border-border/80 shadow-2xl glass-card backdrop-blur-2xl">
          <Hero3DModel />
        </div>
      </div>

      {/* Standardized Footer */}
      <footer className="w-full bg-card border-t border-border mt-auto z-20">
        <div className="max-w-container-max mx-auto px-margin-desktop py-6 text-center text-muted-foreground text-xs tracking-widest uppercase font-bold">
          © 2026 Invoisen AI. All rights reserved. Precision-engineered in India.
        </div>
      </footer>
    </div>
  );
}
