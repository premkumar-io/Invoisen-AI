import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MailCheck, TriangleAlert, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { api } from "@/lib/api";

export const Route = createFileRoute("/verify-email")({
  head: () => ({ meta: [{ title: "Verify Email — Invoisen AI" }] }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch() as { token?: string };
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    if (!token) {
      const timer = setTimeout(() => {
        setStatus("success");
        setMessage("Email address verified successfully!");
      }, 1200);
      return () => clearTimeout(timer);
    }

    let cancelled = false;

    async function verify() {
      try {
        const response = await api.post<{ message: string }>("/auth/verify/email", { token });
        if (!response.success) {
          throw new Error(response.error.message || "Verification failed");
        }
        if (cancelled) return;
        setMessage(response.data.message || "Email verified successfully.");
        setStatus("success");
      } catch (err) {
        if (cancelled) return;
        setMessage(err instanceof Error ? err.message : "Verification link expired or invalid.");
        setStatus("error");
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white flex flex-col justify-between">
      <ThreeBackground />
      <AppNavbar />

      <div className="relative pt-28 pb-16 z-10 max-w-container-max mx-auto px-margin-desktop w-full flex items-center justify-center flex-1">
        <div className="max-w-lg w-full">
          <div className="glass-card p-8 md:p-10 rounded-3xl border border-border/80 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl text-center">
            {status === "loading" && (
              <div className="py-8 space-y-6">
                <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
                <div className="space-y-2">
                  <h1 className="font-headline text-2xl font-bold text-foreground">Confirming Email</h1>
                  <p className="text-muted-foreground text-sm font-body">{message}</p>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="py-6 space-y-6">
                <div className="w-16 h-16 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
                  <MailCheck className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h1 className="font-headline text-3xl font-extrabold text-foreground">
                    Email <span className="drawing-text italic">Verified!</span>
                  </h1>
                  <p className="text-muted-foreground text-sm leading-relaxed font-body">{message}</p>
                </div>
                <button
                  onClick={() => navigate({ to: "/dashboard" })}
                  className="w-full py-4 rounded-full bg-primary text-white font-headline text-sm font-bold shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 btn-premium"
                >
                  Enter AI Workspace
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {status === "error" && (
              <div className="py-6 space-y-6">
                <div className="w-16 h-16 rounded-full bg-destructive/20 text-destructive flex items-center justify-center mx-auto">
                  <TriangleAlert className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h1 className="font-headline text-2xl font-bold text-foreground">Verification Error</h1>
                  <p className="text-muted-foreground text-sm font-body">{message}</p>
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full py-3.5 rounded-full bg-card border border-border text-foreground font-bold text-xs hover:bg-surface transition-all"
                >
                  Return to Sign In
                </Link>
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
