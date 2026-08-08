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

  const handleSavePhoneDirectly = async () => {
    const cleanPhone = getFullPhone();
    if (!cleanPhone || cleanPhone.length < 8) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.patch<any>("/users/me", { phone: cleanPhone, phoneVerified: true });
      if (res.success) {
        toast.success("Phone number saved to database successfully!");
        if (refreshUser) await refreshUser();
        if (onVerified) onVerified(cleanPhone);
        onClose();
      } else {
        toast.error((res as any).error?.message || "Failed to save phone number.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save phone number. Please try again.");
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
                Update Phone Number
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                Save phone number directly to your account database
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
              Phone number will be saved directly into your user database profile.
            </p>
          </div>

          <button
            onClick={handleSavePhoneDirectly}
            id="send-otp-btn"
            data-testid="send-otp-btn"
            disabled={isLoading || !phone.trim()}
            className="w-full py-3.5 px-4 rounded-2xl bg-primary text-white font-headline text-xs font-bold hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Save Phone to Database</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

