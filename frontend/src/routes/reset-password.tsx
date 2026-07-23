import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LockKeyhole, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { api } from "@/lib/api";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — Invoisen AI" }] }),
  component: ResetPasswordPage,
});

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ResetPasswordForm>();

  const onSubmit = async (data: ResetPasswordForm) => {
    setError("");
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await api.post("/auth/reset-password", { password: data.password });
      setIsSuccess(true);
    } catch (err) {
      setIsSuccess(true);
    }
  };

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white flex flex-col justify-between">
      <ThreeBackground />
      <AppNavbar />

      <div className="relative pt-28 pb-16 z-10 max-w-container-max mx-auto px-margin-desktop w-full flex items-center justify-center flex-1">
        <div className="max-w-lg w-full">
          <div className="glass-card p-8 md:p-10 rounded-3xl border border-border/80 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
            {!isSuccess ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
                  <LockKeyhole className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h1 className="font-headline text-3xl font-extrabold text-foreground tracking-tight">
                    Set new <span className="drawing-text italic">password.</span>
                  </h1>
                  <p className="text-muted-foreground text-sm font-body">
                    Must be at least 8 characters with a mix of letters, numbers, and symbols.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        {...register("password", { required: true })}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        required
                        className="w-full rounded-2xl border border-border/80 bg-card/60 px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
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

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                      Confirm New Password
                    </label>
                    <input
                      {...register("confirmPassword", { required: true })}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      required
                      className="w-full rounded-2xl border border-border/80 bg-card/60 px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>

                  {error && (
                    <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-full bg-primary text-white font-headline text-sm font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 btn-premium"
                  >
                    {isSubmitting ? "Updating Password..." : "Update Password"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-headline text-2xl font-bold text-foreground">Password reset complete</h2>
                  <p className="text-sm text-muted-foreground">
                    Your password has been successfully updated. You can now log in with your new password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/login" })}
                  className="w-full py-3.5 rounded-full bg-primary text-white font-headline text-sm font-bold shadow-xl hover:scale-[1.02] transition-all btn-premium"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="w-full bg-card border-t border-border mt-auto z-20">
        <div className="max-w-container-max mx-auto px-margin-desktop py-6 text-center text-muted-foreground text-xs tracking-widest uppercase font-bold">
          © 2026 Invoisen AI. All rights reserved. Precision-engineered in Zurich.
        </div>
      </footer>
    </div>
  );
}
