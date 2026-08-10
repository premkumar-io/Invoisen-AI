import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  CreditCard,
  Check,
  Zap,
  Sparkles,
  Download,
  ShieldCheck,
  Plus,
  Clock,
  ArrowRight,
  TrendingUp,
  Sliders,
  DollarSign,
  LogOut,
  ChevronRight,
  Trash2,
  Eye,
  X,
  FileText,
  CheckCircle2,
  Lock,
  Star,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { AppFooter } from "@/components/AppFooter";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getInitialTheme, setTheme, themeNames, type ThemeName } from "@/lib/theme";
import { getAuthToken } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";

import { getRegionalPricing } from "@/lib/pricing";
import { processRazorpayPayment } from "@/lib/razorpay";

export const Route = createFileRoute("/billing")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getAuthToken()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({ meta: [{ title: "Billing & Subscription — Invoisen AI" }] }),
  component: BillingPage,
});

export type SavedCard = {
  id: string;
  cardholder: string;
  cardNumber: string;
  expDate: string;
  brand: "Visa" | "Mastercard" | "RuPay" | "Amex";
  isPrimary: boolean;
  tierBadge?: string;
};

export type BillingReceipt = {
  id: string;
  date: string;
  plan: string;
  amount: number;
  status: "Paid" | "Pending" | "Refunded";
  card: string;
};

function BillingPage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme());
  const [activeTab, setActiveTab] = useState<"plans" | "cards" | "history">("plans");

  const regionalPricing = getRegionalPricing(user?.phone, user?.country);

  const toggleTheme = () => {
    const currentIndex = themeNames.indexOf(theme);
    const nextTheme = themeNames[(currentIndex + 1) % themeNames.length];
    setThemeState(nextTheme);
    setTheme(nextTheme);
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  const [savedCards, setSavedCards] = useState<SavedCard[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("invoisen_saved_cards");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return [
      {
        id: "card_primary_1",
        cardholder: user?.fullName?.toUpperCase() || "SARAH CHEN",
        cardNumber: "4242",
        expDate: "08/29",
        brand: "Visa",
        isPrimary: true,
        tierBadge: "GOLD VIP",
      },
      {
        id: "card_backup_2",
        cardholder: user?.fullName?.toUpperCase() || "SARAH CHEN",
        cardNumber: "8891",
        expDate: "11/28",
        brand: "Mastercard",
        isPrimary: false,
      },
    ];
  });

  const [billingHistory, setBillingHistory] = useState<BillingReceipt[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("invoisen_billing_history");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return [
      {
        id: "INV-SUB-2026-07",
        date: "Jul 01, 2026",
        plan: "Pro Plan (Monthly)",
        amount: 199,
        status: "Paid",
        card: "Visa •••• 4242",
      },
      {
        id: "INV-SUB-2026-06",
        date: "Jun 01, 2026",
        plan: "Pro Plan (Monthly)",
        amount: 199,
        status: "Paid",
        card: "Visa •••• 4242",
      },
      {
        id: "INV-SUB-2026-05",
        date: "May 01, 2026",
        plan: "Pro Plan (Monthly)",
        amount: 199,
        status: "Paid",
        card: "Visa •••• 4242",
      },
    ];
  });

  // Modal States
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<SavedCard | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<BillingReceipt | null>(null);

  // Add Card Form State
  const [cardHolderInput, setCardHolderInput] = useState(user?.fullName || "");
  const [cardNumberInput, setCardNumberInput] = useState("");
  const [cardExpInput, setCardExpInput] = useState("");
  const [cardCvvInput, setCardCvvInput] = useState("");
  const [setAsPrimaryInput, setSetAsPrimaryInput] = useState(false);

  // Edit Card Form State
  const [editHolderInput, setEditHolderInput] = useState("");
  const [editNumInput, setEditNumInput] = useState("");
  const [editExpInput, setEditExpInput] = useState("");
  const [editPrimaryInput, setEditPrimaryInput] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("invoisen_saved_cards", JSON.stringify(savedCards));
    }
  }, [savedCards]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("invoisen_billing_history", JSON.stringify(billingHistory));
    }
  }, [billingHistory]);

  const primaryCard = savedCards.find((c) => c.isPrimary) || savedCards[0];

  const handleSetPrimaryCard = (cardId: string) => {
    setSavedCards((prev) =>
      prev.map((c) => ({
        ...c,
        isPrimary: c.id === cardId,
      }))
    );
    toast.success("Primary payment card updated successfully!");
  };

  const handleDeleteCard = (cardId: string) => {
    if (savedCards.length <= 1) {
      toast.error("Cannot delete card", { description: "You must keep at least one payment method." });
      return;
    }
    const cardToDelete = savedCards.find((c) => c.id === cardId);
    const updated = savedCards.filter((c) => c.id !== cardId);
    if (cardToDelete?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    setSavedCards(updated);
    toast.success(`Payment card ending in •••• ${cardToDelete?.cardNumber} removed.`);
  };

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = cardNumberInput.replace(/\s+/g, "");
    if (cleanNum.length < 12) {
      toast.error("Invalid card number", { description: "Please enter a valid card number." });
      return;
    }
    const last4 = cleanNum.slice(-4);
    let brand: "Visa" | "Mastercard" | "RuPay" | "Amex" = "Visa";
    if (cleanNum.startsWith("5")) brand = "Mastercard";
    else if (cleanNum.startsWith("3")) brand = "Amex";
    else if (cleanNum.startsWith("6")) brand = "RuPay";

    const newCard: SavedCard = {
      id: `card_${Date.now()}`,
      cardholder: (cardHolderInput.trim() || user?.fullName || "CARD HOLDER").toUpperCase(),
      cardNumber: last4,
      expDate: cardExpInput.trim() || "12/29",
      brand,
      isPrimary: setAsPrimaryInput || savedCards.length === 0,
    };

    setSavedCards((prev) => {
      if (newCard.isPrimary) {
        return [newCard, ...prev.map((c) => ({ ...c, isPrimary: false }))];
      }
      return [...prev, newCard];
    });

    setCardNumberInput("");
    setCardExpInput("");
    setCardCvvInput("");
    setShowAddCardModal(false);
    toast.success(`🎉 ${brand} card ending in •••• ${last4} added successfully!`);
  };

  const handleOpenEditCardModal = (card: SavedCard) => {
    setEditingCard(card);
    setEditHolderInput(card.cardholder);
    setEditNumInput(`•••• •••• •••• ${card.cardNumber}`);
    setEditExpInput(card.expDate);
    setEditPrimaryInput(card.isPrimary);
  };

  const handleEditCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    let last4 = editingCard.cardNumber;
    let brand = editingCard.brand;

    const cleanNum = editNumInput.replace(/\s+/g, "");
    if (cleanNum.length >= 12 && !cleanNum.includes("•")) {
      last4 = cleanNum.slice(-4);
      if (cleanNum.startsWith("5")) brand = "Mastercard";
      else if (cleanNum.startsWith("3")) brand = "Amex";
      else if (cleanNum.startsWith("6")) brand = "RuPay";
      else if (cleanNum.startsWith("4")) brand = "Visa";
    }

    const updatedCardholder = (editHolderInput.trim() || user?.fullName || "CARD HOLDER").toUpperCase();
    const updatedExpDate = editExpInput.trim() || editingCard.expDate;

    setSavedCards((prev) =>
      prev.map((c) => {
        if (c.id === editingCard.id) {
          return {
            ...c,
            cardholder: updatedCardholder,
            cardNumber: last4,
            expDate: updatedExpDate,
            brand,
            isPrimary: editPrimaryInput,
          };
        }
        if (editPrimaryInput) {
          return { ...c, isPrimary: false };
        }
        return c;
      })
    );

    setEditingCard(null);
    toast.success(`🎉 ${brand} card ending in •••• ${last4} updated successfully!`);
  };

  const downloadTaxInvoice = (rec: BillingReceipt) => {
    const baseAmount = (rec.amount / 1.18).toFixed(2);
    const gstAmount = (rec.amount - parseFloat(baseAmount)).toFixed(2);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tax Invoice - ${rec.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; background: #f8fafc; padding: 40px; margin: 0; }
    .invoice-card { max-width: 650px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6366f1; padding-bottom: 24px; margin-bottom: 32px; }
    .logo { font-size: 26px; font-weight: 900; color: #4f46e5; letter-spacing: -0.5px; }
    .badge { background: #10b981; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 6px 12px; border-radius: 20px; letter-spacing: 0.5px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; font-size: 13px; line-height: 1.6; }
    .meta-title { font-weight: 800; color: #64748b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 13px; }
    th { text-align: left; background: #f1f5f9; padding: 12px 14px; font-weight: 800; color: #475569; text-transform: uppercase; font-size: 11px; }
    td { padding: 16px 14px; border-bottom: 1px solid #e2e8f0; }
    .total-row td { border-bottom: none; font-weight: 900; font-size: 16px; color: #0f172a; background: #f8fafc; }
    .footer { text-align: center; border-top: 1px solid #e2e8f0; padding-top: 24px; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="logo">INVOISEN AI</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 600;">Precision AI Financial Intelligence Suite</div>
      </div>
      <div>
        <span class="badge">Paid Tax Receipt</span>
      </div>
    </div>

    <div class="meta-grid">
      <div>
        <div class="meta-title">Billed To</div>
        <div style="font-weight: 700; font-size: 14px;">${user?.fullName || "Sarah Chen"}</div>
        <div>${user?.email || "sarah@invoisen.ai"}</div>
        <div>Phone: ${user?.phone || "+91 98765 43210"}</div>
      </div>
      <div style="text-align: right;">
        <div class="meta-title">Receipt Reference</div>
        <div style="font-weight: 800; font-family: monospace; font-size: 14px; color: #4f46e5;">${rec.id}</div>
        <div>Date: ${rec.date}</div>
        <div>Payment Method: ${rec.card}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div style="font-weight: 700;">${rec.plan}</div>
            <div style="font-size: 11px; color: #64748b;">Full workspace template access &amp; AI invoice generation</div>
          </td>
          <td style="text-align: center;">1</td>
          <td style="text-align: right;">₹${baseAmount}</td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: right; color: #64748b; font-weight: 600;">IGST / CGST+SGST (18%)</td>
          <td style="text-align: right; font-weight: 600;">₹${gstAmount}</td>
        </tr>
        <tr class="total-row">
          <td colspan="2" style="text-align: right;">Total Billed Amount:</td>
          <td style="text-align: right; color: #10b981;">₹${rec.amount.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <div style="font-weight: 700;">GSTIN: 27AABCT3518Q1Z9 • Official Electronic Tax Invoice Receipt</div>
      <div style="margin-top: 4px;">Thank you for your business! All payments processed securely in Indian Rupees (₹).</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoisen_Tax_Invoice_${rec.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Tax Invoice ${rec.id} downloaded successfully!`);
  };

  const handlePlanChange = async (newPlan: "free" | "pro" | "enterprise" | "business") => {
    if (newPlan === "free") {
      try {
        await updateProfile({ plan: "free" });
        toast.success("Subscription updated to Free Plan!");
      } catch (err: any) {
        toast.error("Failed to update subscription", { description: err?.message });
      }
      return;
    }

    const price = newPlan === "pro" ? regionalPricing.proMonthlyPrice : newPlan === "business" || newPlan === "enterprise" ? regionalPricing.businessMonthlyPrice : 399;
    toast.info(`Initializing Razorpay checkout for ${newPlan.toUpperCase()} plan...`);

    await processRazorpayPayment({
      amount: price,
      currency: "INR",
      plan: newPlan,
      description: `Invoisen ${newPlan.toUpperCase()} Plan Subscription`,
      prefill: {
        name: user?.fullName || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },
      onSuccess: async () => {
        await updateProfile({ plan: newPlan });
        
        // Append new receipt dynamically!
        const today = new Date();
        const dateStr = today.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
        const randomId = `INV-SUB-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        
        const newRec: BillingReceipt = {
          id: randomId,
          date: dateStr,
          plan: `${newPlan.toUpperCase()} Plan (Monthly)`,
          amount: price,
          status: "Paid",
          card: `${primaryCard ? primaryCard.brand : "Card"} •••• ${primaryCard ? primaryCard.cardNumber : "4242"}`,
        };

        setBillingHistory((prev) => [newRec, ...prev]);

        toast.success(`🎉 Payment Successful! Welcome to ${newPlan.toUpperCase()} Plan!`, {
          description: `Razorpay payment verified. Receipt ${randomId} generated and saved to history.`,
        });
      },
      onError: (error) => {
        toast.error("Payment Failed or Cancelled", { description: error });
      },
    });
  };

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white">
      {/* 3D WebGL Background Canvas */}
      <ThreeBackground />

      {/* Top Navigation Bar */}
      <AppNavbar />

      {/* Main Page Area */}
      <div className="relative pt-28 pb-16 z-10">
        <div className="max-w-container-max mx-auto px-margin-desktop space-y-12">
          {/* Header Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-sm font-medium">
                <Sparkles className="w-4 h-4" /> Active Plan: {user?.plan ? user.plan.toUpperCase() : "PRO"}
              </div>
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                Billing &amp; <span className="drawing-text italic">Subscription.</span>
              </h1>
              <p className="text-muted-foreground font-body text-lg">
                Manage your active subscription plan, regional pricing currency, and billing receipts.
              </p>
            </div>
          </div>

          {/* Available Launch Plans (Free vs Pro) */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline text-2xl font-bold text-foreground">
                  Available Plans
                </h2>
                <p className="text-xs text-muted-foreground">
                  Simplified launch plans designed for freelancers, studios, and agencies.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {/* 🟢 Free Plan */}
              <div className="glass-card rounded-3xl p-8 border border-border/80 shadow-xl space-y-6 flex flex-col justify-between h-full group hover:-translate-y-1 transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-headline font-bold text-2xl text-foreground flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                      Free Plan
                    </span>
                    <Badge variant="secondary" className="font-bold">
                      Starter
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-1 h-10">
                    <span className="font-headline text-5xl font-black text-foreground">
                      {regionalPricing.freePriceFormatted}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">/ month</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px] flex items-center">
                    Essential invoicing features &amp; 3 basic templates for solo creators.
                  </p>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>3 Free Basic Templates (Zurich, Stripe, Linear)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Up to 10 Invoices / Month</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Instant PDF Exports &amp; Link Sharing</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Standard Community Support</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Basic Client Directory</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handlePlanChange("free")}
                  className={`w-full py-3.5 rounded-full font-headline text-sm font-bold transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer ${
                    user?.plan === "free"
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-card border border-border text-foreground hover:bg-surface"
                  }`}
                >
                  {user?.plan === "free" ? (
                    <>
                      <span>Current Active Plan</span>
                      <Check className="w-4 h-4 text-emerald-500" />
                    </>
                  ) : (
                    <>
                      <span>Downgrade to Free</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* 🔵 Pro Plan */}
              <div className="glass-card rounded-3xl p-8 border-2 border-primary ring-2 ring-primary/40 shadow-2xl bg-primary/5 space-y-6 flex flex-col justify-between h-full group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute -top-4 right-8">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-md animate-pulse">
                    MOST POPULAR
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-headline font-bold text-2xl text-foreground flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shrink-0"></span>
                      Pro Plan
                    </span>
                    <Badge variant="default" className="font-bold bg-amber-500 text-black">
                      Full Access
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-1 h-10">
                    <span className="font-headline text-5xl font-black text-foreground">
                      {regionalPricing.proMonthlyFormatted}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">/ month</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px] flex items-center">
                    {regionalPricing.flag} {regionalPricing.regionName} rates applied ({regionalPricing.currencyCode}). Unlocks all 12 templates.
                  </p>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-bold text-amber-500">
                      <Check className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Unlocks All 12 Pro &amp; Swiss Templates</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>Unlimited AI Invoice Generation</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>Autonomous Client Intelligence &amp; Branding</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>Global Tax Compliance Suite</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>24/7 Priority Support</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handlePlanChange("pro")}
                  className={`w-full py-3.5 rounded-full font-headline text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 mt-6 cursor-pointer btn-premium ${
                    user?.plan === "pro" || !user?.plan
                      ? "bg-primary text-white"
                      : "bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white hover:opacity-90"
                  }`}
                >
                  {user?.plan === "pro" || !user?.plan ? (
                    <>
                      <span>Current Active Plan</span>
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Upgrade to Pro</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* 🟣 Business Plan */}
              <div className="glass-card rounded-3xl p-8 border border-border/80 shadow-xl space-y-6 flex flex-col justify-between h-full group hover:-translate-y-1 transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-headline font-bold text-2xl text-foreground flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-purple-500 inline-block shrink-0"></span>
                      Business
                    </span>
                    <Badge variant="secondary" className="font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      Business Tier
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-1 h-10">
                    <span className="font-headline text-5xl font-black text-foreground">
                      {regionalPricing.businessMonthlyFormatted}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">/ month</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px] flex items-center">
                    Custom multi-team deployment, dedicated API webhooks, &amp; SLA.
                  </p>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>Everything Included in Pro Plan</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>Unlimited Seats &amp; Multi-Team Access</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>Dedicated API &amp; Webhooks Integration</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>Dedicated Account Manager &amp; SLA</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <Check className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>24/7 Priority Concierge Support</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handlePlanChange("business")}
                  className={`w-full py-3.5 rounded-full font-headline text-sm font-bold transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer ${
                    user?.plan === "business" || user?.plan === "enterprise"
                      ? "bg-purple-600 text-white"
                      : "bg-card border border-border text-foreground hover:bg-surface"
                  }`}
                >
                  {user?.plan === "business" || user?.plan === "enterprise" ? (
                    <>
                      <span>Current Active Plan</span>
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Upgrade to Business</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 3D Payment Cards & Billing History */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 3D Credit Card Preview */}
            <div className="lg:col-span-5 glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <h3 className="font-headline text-xl font-bold text-foreground flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" /> Saved Payment Method
                  </h3>
                  <Badge variant="secondary" className="font-bold bg-primary/10 text-primary">
                    {savedCards.length} Saved Card{savedCards.length > 1 ? "s" : ""}
                  </Badge>
                </div>

                {/* 3D Metallic Glass Credit Card Visual */}
                {primaryCard && (
                  <div className="w-full h-48 rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-purple-900 p-6 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/20 transform hover:rotate-1 hover:scale-[1.02] transition-all duration-500">
                    <div className="flex justify-between items-center">
                      <span className="font-headline font-bold text-sm tracking-widest uppercase text-white/80">
                        {primaryCard.brand} • INVOISEN
                      </span>
                      <span className="text-xs font-bold text-amber-400">
                        {primaryCard.tierBadge || "PRIMARY CARD"}
                      </span>
                    </div>

                    <div className="w-10 h-7 rounded-md bg-amber-400/80 border border-amber-300 shadow-inner flex items-center justify-center">
                      <div className="w-6 h-4 border border-amber-600/50 rounded-sm" />
                    </div>

                    <div>
                      <div className="font-mono text-lg tracking-widest text-white/90">
                        •••• •••• •••• {primaryCard.cardNumber}
                      </div>
                      <div className="flex justify-between items-center text-[10px] uppercase text-white/70 mt-2 font-mono">
                        <span>{primaryCard.cardholder}</span>
                        <span>EXP {primaryCard.expDate}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Saved Cards List */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Saved Payment Cards
                  </div>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {savedCards.map((card) => (
                      <div
                        key={card.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between text-xs ${
                          card.isPrimary
                            ? "bg-primary/10 border-primary/40 text-foreground"
                            : "bg-card/60 border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center text-foreground font-black text-[10px]">
                            {card.brand.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-bold text-foreground flex items-center gap-1.5">
                              <span>•••• {card.cardNumber}</span>
                              {card.isPrimary && (
                                <Badge variant="default" className="text-[9px] px-1.5 py-0 bg-primary text-white font-bold">
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              Exp {card.expDate} • {card.cardholder}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {!card.isPrimary && (
                            <button
                              onClick={() => handleSetPrimaryCard(card.id)}
                              className="px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold transition-colors cursor-pointer"
                              title="Make Primary Payment Method"
                            >
                              Make Primary
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditCardModal(card)}
                            className="p-1.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                            title="Edit Card Details"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                            title="Remove Card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowAddCardModal(true)}
                className="w-full py-3 rounded-full border border-border text-foreground font-bold text-xs hover:bg-card transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Plus className="w-4 h-4" /> Add Backup Card
              </button>
            </div>

            {/* Billing Receipts History Table */}
            <div className="lg:col-span-7 glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <h3 className="font-headline text-xl font-bold text-foreground flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Billing Receipts History
                  </h3>
                  <span className="text-xs text-muted-foreground font-mono">Tax Invoices</span>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {billingHistory.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-2xl bg-card/60 border border-border/70 flex items-center justify-between hover:border-primary/40 transition-all shadow-sm text-xs group"
                    >
                      <div
                        onClick={() => setSelectedReceipt(rec)}
                        className="space-y-0.5 cursor-pointer flex-1"
                      >
                        <div className="font-bold text-foreground text-sm group-hover:text-primary transition-colors flex items-center gap-2">
                          <span>{rec.plan}</span>
                          <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                        </div>
                        <div className="text-muted-foreground font-mono text-[11px]">
                          {rec.id} • {rec.date} • {rec.card}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="font-mono font-bold text-sm text-foreground">
                            ₹{rec.amount.toFixed(2)}
                          </div>
                          <Badge
                            variant="default"
                            className="bg-emerald-500 text-white text-[9px] font-bold"
                          >
                            {rec.status}
                          </Badge>
                        </div>
                        <button
                          onClick={() => downloadTaxInvoice(rec)}
                          className="p-2.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all hover:scale-110 cursor-pointer"
                          title="Download Official Tax Invoice PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center pt-2 border-t border-border">
                <span className="text-[11px] text-muted-foreground font-mono">
                  All receipts include 18% GST breakdown. Click any record to inspect full tax invoice summary.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🟡 Edit Payment Card Modal */}
      {editingCard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-border shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditingCard(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                <Pencil className="w-6 h-6 text-primary" /> Edit Payment Card
              </h3>
              <p className="text-xs text-muted-foreground">
                Update cardholder name, expiration date, or primary status.
              </p>
            </div>

            <form onSubmit={handleEditCardSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-foreground">Cardholder Name</label>
                <Input
                  value={editHolderInput}
                  onChange={(e) => setEditHolderInput(e.target.value)}
                  placeholder="e.g. PREM KUMAR"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-foreground">Card Number (Last 4 or New Card)</label>
                <Input
                  value={editNumInput}
                  onChange={(e) => setEditNumInput(e.target.value)}
                  placeholder="•••• •••• •••• 4242"
                  className="rounded-xl font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-foreground">Expiration Date</label>
                <Input
                  value={editExpInput}
                  onChange={(e) => setEditExpInput(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="rounded-xl font-mono"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editPrimaryCb"
                  checked={editPrimaryInput}
                  onChange={(e) => setEditPrimaryInput(e.target.checked)}
                  className="rounded accent-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="editPrimaryCb" className="text-xs font-medium text-foreground cursor-pointer">
                  Set as Primary Payment Method
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="w-1/2 py-3 rounded-full border border-border text-foreground font-bold text-xs hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-full bg-primary text-white font-bold text-xs shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  Update Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🟢 Add Payment Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-border shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddCardModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="font-headline text-2xl font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-primary" /> Add Payment Card
              </h3>
              <p className="text-xs text-muted-foreground">
                Save a backup credit/debit card for seamless workspace renewals.
              </p>
            </div>

            <form onSubmit={handleAddCardSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-foreground">Cardholder Name</label>
                <Input
                  value={cardHolderInput}
                  onChange={(e) => setCardHolderInput(e.target.value)}
                  placeholder="e.g. SARAH CHEN"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-foreground">Card Number</label>
                <Input
                  value={cardNumberInput}
                  onChange={(e) => setCardNumberInput(e.target.value)}
                  placeholder="4532 •••• •••• 8892"
                  maxLength={19}
                  className="rounded-xl font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-foreground">Expiration</label>
                  <Input
                    value={cardExpInput}
                    onChange={(e) => setCardExpInput(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="rounded-xl font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-foreground">CVV</label>
                  <Input
                    value={cardCvvInput}
                    onChange={(e) => setCardCvvInput(e.target.value)}
                    placeholder="•••"
                    type="password"
                    maxLength={4}
                    className="rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="setPrimaryCb"
                  checked={setAsPrimaryInput}
                  onChange={(e) => setSetAsPrimaryInput(e.target.checked)}
                  className="rounded accent-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="setPrimaryCb" className="text-xs font-medium text-foreground cursor-pointer">
                  Set as Primary Payment Method
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(false)}
                  className="w-1/2 py-3 rounded-full border border-border text-foreground font-bold text-xs hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-full bg-primary text-white font-bold text-xs shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🟣 Receipt Details Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-border shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <Badge variant="default" className="bg-emerald-500 text-white font-bold text-[10px]">
                OFFICIAL TAX INVOICE
              </Badge>
              <h3 className="font-headline text-2xl font-bold text-foreground">
                {selectedReceipt.id}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Billed on {selectedReceipt.date}
              </p>
            </div>

            <div className="space-y-3 border-t border-b border-border py-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subscription Plan</span>
                <span className="font-bold text-foreground">{selectedReceipt.plan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-mono text-foreground">{selectedReceipt.card}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Base Amount</span>
                <span className="font-mono text-foreground">₹{(selectedReceipt.amount / 1.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">GST (18%)</span>
                <span className="font-mono text-foreground">₹{(selectedReceipt.amount - selectedReceipt.amount / 1.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border/60 text-sm font-bold">
                <span className="text-foreground">Total Billed</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">₹{selectedReceipt.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-1/2 py-3 rounded-full border border-border text-foreground font-bold text-xs hover:bg-muted transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  downloadTaxInvoice(selectedReceipt);
                  setSelectedReceipt(null);
                }}
                className="w-1/2 py-3 rounded-full bg-primary text-white font-bold text-xs shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <AppFooter />
    </div>
  );
}
