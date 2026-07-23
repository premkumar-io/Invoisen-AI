import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, KeyRound, Mail, Sparkles, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { api } from "@/lib/api";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — Invoisen AI" }] }),
  component: ForgotPasswordPage,
});

interface ForgotPasswordForm {
  email: string;
}

function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setError("");
    try {
      await api.post("/auth/forgot-password", { email: data.email });
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset link.");
      setIsSubmitted(true);
    }
  };

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white flex flex-col justify-between">
      <ThreeBackground />
      <AppNavbar />

      <div className="relative pt-28 pb-16 z-10 max-w-container-max mx-auto px-margin-desktop w-full flex items-center justify-center flex-1">
        <div className="max-w-lg w-full">
          <div className="glass-card p-8 md:p-10 rounded-3xl border border-border/80 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
              <KeyRound className="w-6 h-6" />
            </div>

            {!isSubmitted ? (
              <>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Password Recovery</span>
                  </div>
                  <h1 className="font-headline text-3xl font-extrabold text-foreground tracking-tight">
                    Reset <span className="drawing-text italic">password.</span>
                  </h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Enter the email address associated with your Invoisen account, and we'll send you an encrypted recovery link.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                      Work Email Address
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
                    {isSubmitting ? "Sending Reset Link..." : "Send Password Recovery Email"}
                  </button>
                </form>
              </>
            ) : (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-headline text-2xl font-bold text-foreground">Check your inbox</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We've sent password reset instructions to your email address if an account exists.
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            )}

            <div className="text-center pt-2 border-t border-border/60">
              <Link to="/login" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
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
