/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { Mail, CheckCircle2, ArrowRight, Loader2, X, ShieldCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface EmailUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onUpdated?: (newEmail: string) => void;
}

export function EmailUpdateModal({
  isOpen,
  onClose,
  initialEmail = "",
  onUpdated,
}: EmailUpdateModalProps) {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [email, setEmail] = useState(initialEmail);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail);
      setStep("email");
      setDevOtp(null);
      setOtpDigits(Array(6).fill(""));
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  const handleSendOtp = async (isResend = false) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (user?.emailVerified && cleanEmail === initialEmail.toLowerCase() && !isResend) {
      toast.info("Your current account email is already verified. Please enter a new email address to update it.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post<any>("/auth/send-email-otp", { email: cleanEmail });

      if (res.success) {
        if (res.data?.devOtp) {
          setDevOtp(res.data.devOtp);
        }
        toast.success(res.data?.message || "Verification code sent to your email!");
        setStep("otp");
        setCooldown(60);
        setOtpDigits(Array(6).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 150);
      } else {
        toast.error((res as any).error?.message || "Failed to send verification OTP.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue && value !== "") return;

    const newDigits = [...otpDigits];
    newDigits[index] = numericValue.slice(-1);
    setOtpDigits(newDigits);

    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newDigits = Array(6).fill("");
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpDigits.join("");
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    setIsLoading(true);
    try {
      const res = await api.post<any>("/auth/verify-email-otp", {
        email: cleanEmail,
        otp: code,
      });

      if (res.success) {
        setVerifiedEmail(cleanEmail);
        setStep("success");
        toast.success("Account email updated successfully!");
        await refreshUser();
        if (onUpdated) onUpdated(cleanEmail);
      } else {
        toast.error((res as any).error?.message || "Invalid verification code.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Verification failed. Please check the code and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative max-w-md w-full glass-card p-6 sm:p-8 rounded-3xl border border-primary/20 shadow-2xl space-y-6 backdrop-blur-2xl bg-card/95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline text-lg font-extrabold text-foreground">
                Email Verification
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {step === "email" && (user?.emailVerified ? "Enter your new email address" : "Verify your email or enter a new address")}
                {step === "otp" && "Enter the 6-digit code sent to your email"}
                {step === "success" && "Verification Complete"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Enter New Email Address */}
        {step === "email" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>Account Email</span>
              </label>

              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl bg-background border border-border/80 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-inner pl-10 pr-4 py-3.5"
                />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {user?.emailVerified
                  ? "Enter your new email address. We will send a 6-digit verification OTP code to confirm your request."
                  : "Verify your current email or enter a new address. We will send a 6-digit OTP code."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSendOtp(false)}
              disabled={isLoading || !email.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-primary text-white font-headline text-xs font-bold hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Enter 6-Digit OTP */}
        {step === "otp" && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">
                We sent a 6-digit verification code to:
              </p>
              <p className="text-sm font-mono font-bold text-primary">{email}</p>
            </div>


            {/* 6 Individual OTP Boxes */}
            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-2xl bg-background border border-border/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-muted-foreground hover:text-foreground font-semibold"
              >
                Change Email
              </button>

              <button
                type="button"
                onClick={() => handleSendOtp(true)}
                disabled={cooldown > 0 || isLoading}
                className="text-primary hover:underline font-bold flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
              </button>
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isLoading || otpDigits.join("").length !== 6}
              className="w-full py-3.5 px-4 rounded-2xl bg-primary text-white font-headline text-xs font-bold hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Verify Email</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 3: Success Verified */}
        {step === "success" && (
          <div className="text-center py-4 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="font-headline text-xl font-bold text-foreground">
                Email Address Verified!
              </h4>
              <p className="text-xs text-muted-foreground font-mono font-semibold">
                {verifiedEmail}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 text-white font-headline text-xs font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
