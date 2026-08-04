/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, Phone, RefreshCw, CheckCircle2, ArrowRight, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PhoneCapsuleInput } from "@/components/PhoneCapsuleInput";
import { COUNTRY_CODES } from "@/lib/country-codes";

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: (phone: string) => void;
  initialPhone?: string;
  isCurrentPhoneVerified?: boolean;
  currentVerifiedPhone?: string;
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

export function PhoneVerificationModal({
  isOpen,
  onClose,
  onVerified,
  initialPhone = "",
  isCurrentPhoneVerified = false,
  currentVerifiedPhone = "",
}: PhoneVerificationModalProps) {
  const { refreshUser } = useAuth();
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");
  const [countryCode, setCountryCode] = useState(() => detectUserCountryCode());
  const [phone, setPhone] = useState(initialPhone);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verifiedPhone, setVerifiedPhone] = useState("");

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
      setStep("phone");
      setOtpDigits(Array(6).fill(""));
      if (isCurrentPhoneVerified) {
        setPhone("");
      } else if (initialPhone) {
        let clean = initialPhone.trim();
        const matched = COUNTRY_CODES.find((c) => clean.startsWith(c.dialCode));
        if (matched) {
          setCountryCode(matched.dialCode);
          clean = clean.slice(matched.dialCode.length).trim();
        }
        setPhone(clean);
      }
    }
  }, [isOpen, initialPhone, isCurrentPhoneVerified]);

  if (!isOpen) return null;

  const getFullPhone = () => {
    let raw = phone.trim().replace(/\D/g, "");
    if (!raw) return "";
    const codeDigits = countryCode.replace(/\D/g, "");
    if (raw.startsWith(codeDigits) && raw.length >= codeDigits.length + 10) {
      raw = raw.slice(codeDigits.length);
    }
    return `${countryCode}${raw}`;
  };

  const handleSendOtp = async (isResend = false) => {
    const cleanPhone = getFullPhone();
    if (!cleanPhone || cleanPhone.length < 8) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    const cleanCurrent = (currentVerifiedPhone || initialPhone || "").trim();
    if (isCurrentPhoneVerified && cleanCurrent && (cleanPhone === cleanCurrent || cleanPhone === formatE164(cleanCurrent, countryCode))) {
      toast.info("This phone number is already verified on your account. Enter a new phone number to update.");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isResend ? "/auth/resend-phone-otp" : "/auth/send-phone-otp";
      const res = await api.post<any>(endpoint, { phone: cleanPhone });

      if (res.success) {
        toast.success(res.data?.message || "Verification code sent to your WhatsApp number!");
        setStep("otp");
        setCooldown(60);
        setOtpDigits(Array(6).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 150);
      } else {
        toast.error((res as any).error?.message || "Failed to send WhatsApp verification code.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send OTP code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  function formatE164(raw: string, code: string) {
    if (raw.startsWith("+")) return raw;
    return `${code}${raw.replace(/\D/g, "")}`;
  }

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
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }

    const cleanPhone = getFullPhone();
    setIsLoading(true);
    try {
      const res = await api.post<any>("/auth/verify-phone-otp", {
        phone: cleanPhone,
        otp: code,
      });

      if (res.success) {
        setVerifiedPhone(cleanPhone);
        setStep("success");
        toast.success("Phone number verified successfully!");
        if (refreshUser) await refreshUser();
        if (onVerified) onVerified(cleanPhone);
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
                Phone Verification
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {step === "phone" && "Enter your phone number"}
                {step === "otp" && "Enter the 6-digit code sent to your WhatsApp"}
                {step === "success" && "Verification Complete"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Enter Phone Number */}
        {step === "phone" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span>Phone Number</span>
              </label>

              <PhoneCapsuleInput
                countryCode={countryCode}
                onCountryCodeChange={(code) => setCountryCode(code)}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Enter your WhatsApp phone number to receive a verification code.
              </p>
            </div>

            <button
              onClick={() => handleSendOtp(false)}
              id="send-otp-btn"
              data-testid="send-otp-btn"
              disabled={isLoading || !phone.trim()}
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
                We sent a 6-digit verification code via WhatsApp to:
              </p>
              <p className="text-sm font-mono font-bold text-primary">{getFullPhone() || phone}</p>
            </div>

            {/* 6 Individual OTP Boxes */}
            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  data-testid={`otp-input-${index}`}
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
                onClick={() => setStep("phone")}
                className="text-muted-foreground hover:text-foreground font-semibold"
              >
                Change Number
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
              onClick={handleVerifyOtp}
              id="verify-otp-btn"
              data-testid="verify-otp-btn"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-primary text-white font-headline text-xs font-bold hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Verify Code</span>
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
                Phone Number Verified!
              </h4>
              <p className="text-xs text-muted-foreground font-mono font-semibold">
                {verifiedPhone}
              </p>
            </div>

            <button
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
