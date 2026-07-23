import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch, type UseFormReset } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AiDescriptionDialog } from "@/components/AiDescriptionDialog";
import { AiInvoiceDialog } from "@/components/AiInvoiceDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreditCard,
  Download,
  Image as ImageIcon,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Type,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { SignaturePad } from "@/components/invoice/SignaturePad";
import { PaymentDialog } from "@/components/invoice/PaymentDialog";
import { getClientSuggestions, getTaxSuggestion, type ClientSuggestion } from "@/lib/ai-api";
import {
  addPayment,
  createInvoice,
  deletePayment,
  downloadInvoicePdf,
  fetchInvoice,
  updateInvoice,
  type PaymentRecord,
} from "@/lib/api/invoice";
import { fetchSettings } from "@/lib/api/settings";
import { useAuth } from "@/lib/auth-context";

// Based on the project's API_DOCUMENTATION.md
export interface InvoiceForm {
  _id?: string;
  invoiceNumber?: string;
  businessInfo: {
    name: string;
    address: string;
    email: string;
    country: string;
    logoUrl?: string;
  };
  clientInfo: {
    name: string;
    email: string;
    address: string;
    phone?: string;
    gstNumber?: string;
  };
  invoiceDate: string;
  dueDate: string;
  currency: string;
  items: {
    name: string;
    description: string;
    quantity: number;
    rate: number;
  }[];
  calculations: {
    taxType: "GST" | "VAT" | "Sales Tax" | "None";
    taxRate: number;
    discount: number;
    shipping: number;
  };
  customization: {
    templateId: "modern" | "minimal" | "professional" | "corporate" | "elegant";
    signatureMode: "none" | "draw" | "type" | "upload";
    signatureDataUrl?: string;
    signatureName?: string;
    signatureTitle?: string;
    currency?: string;
  };
  payment?: {
    amountPaid: number;
    amountDue: number;
    paymentRecords: {
      _id?: string;
      amount: number;
      date: string;
      method: string;
      notes?: string;
    }[];
  };
  notes?: string;
  paymentTerms?: string;
  status?: "draft" | "published" | "archived";
  paymentStatus?: "paid" | "unpaid" | "partially_paid" | "overdue";
}

interface InvoiceEditorProps {
  mode: "create" | "edit";
  invoiceId?: string;
}

const currencies = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
];

const countries = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
];

const templates = [
  { id: "modern", name: "Modern" },
  { id: "minimal", name: "Minimal" },
  { id: "professional", name: "Professional" },
  { id: "corporate", name: "Corporate" },
  { id: "elegant", name: "Elegant" },
] as const;

const taxTypes = ["None", "GST", "VAT", "Sales Tax"];

const getCurrencySymbol = (code: string) => {
  return currencies.find((c) => c.code === code)?.symbol || "$";
};

// Helper for typed signature
function generateTypedSignature(name: string, title?: string): string {
  if (!name) return "";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="250" height="60" viewBox="0 0 250 60">
      <text x="10" y="35" style="font: italic bold 24px cursive; fill: #0f172a;">${name}</text>
      ${title ? `<text x="10" y="52" style="font: 12px sans-serif; fill: #64748b;">${title}</text>` : ""}
    </svg>
  `
    .replace(/\n/g, "")
    .replace(/>\s+</g, "><");
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function InvoiceEditor({ mode, invoiceId }: InvoiceEditorProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, control, getValues, setValue, handleSubmit, watch, reset } =
    useForm<InvoiceForm>({
      defaultValues: {
        customization: { templateId: "modern" },
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    itemIndex: number | null;
  }>({
    isOpen: false,
    itemIndex: null,
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isAiInvoiceDialogOpen, setIsAiInvoiceDialogOpen] = useState(false);
  const [isSuggestionDismissed, setIsSuggestionDismissed] = useState(false);
  const [clientSuggestions, setClientSuggestions] = useState<ClientSuggestion[]>([]);
  const [isClientSuggestionsLoading, setIsClientSuggestionsLoading] = useState(false);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const clientSuggestionsRef = useRef<HTMLDivElement>(null);

  const openDescriptionGenerator = (index: number) => {
    setDialogState({ isOpen: true, itemIndex: index });
  };

  const handleApplyDescription = (description: string) => {
    if (dialogState.itemIndex !== null) {
      setValue(`items.${dialogState.itemIndex}.description`, description, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const currentItemName =
    dialogState.itemIndex !== null ? getValues(`items.${dialogState.itemIndex}.name`) : "";

  const watchedItems = useWatch({ control, name: "items" }) || [];
  const watchedCalculations = useWatch({ control, name: "calculations" }) || {
    taxRate: 0,
    discount: 0,
  };
  const watchedCurrency = useWatch({ control, name: "currency" });
  const watchedCountry = useWatch({ control, name: "businessInfo.country" });
  const watchedTemplate = useWatch({ control, name: "customization.templateId" });
  const watchedSignatureMode = useWatch({ control, name: "customization.signatureMode" });
  const watchedSignatureName = useWatch({ control, name: "customization.signatureName" });
  const watchedSignatureTitle = useWatch({ control, name: "customization.signatureTitle" });
  const watchedClientName = watch("clientInfo.name");

  const currencySymbol = getCurrencySymbol(watchedCurrency);

  const subtotal = watchedItems.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.rate || 0),
    0,
  );
  const discountAmount = watchedCalculations.discount || 0;
  const shippingAmount = watchedCalculations.shipping || 0;
  const taxAmount = (subtotal - discountAmount) * ((watchedCalculations.taxRate || 0) / 100);
  const total = subtotal - discountAmount + taxAmount + shippingAmount;

  const allFormData = watch();

  const { data: settingsData, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const { data: invoiceData, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => fetchInvoice(invoiceId!),
    enabled: mode === "edit" && !!invoiceId,
  });

  useEffect(() => {
    const resetForm = reset as UseFormReset<InvoiceForm>;
    if (mode === "edit") {
      if (invoiceData?.success) {
        resetForm(invoiceData.data);
      }
    } else if (settingsData?.success) {
      const { businessProfile, defaultCurrency } = settingsData.data;
      resetForm({
        businessInfo: {
          name: businessProfile?.name ?? "",
          address: businessProfile?.address ?? "",
          email: businessProfile?.email ?? "",
          country: user?.country ?? "IN",
          logoUrl: businessProfile?.logoUrl ?? "",
        },
        clientInfo: { name: "", email: "", address: "" },
        currency: defaultCurrency ?? "INR",
        invoiceDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10),
        items: [{ name: "", description: "", quantity: 1, rate: 0 }],
        calculations: { taxRate: 0, discount: 0, taxType: "None", shipping: 0 },
        customization: {
          templateId: "modern",
          signatureMode: "none",
          signatureName: user?.fullName ?? "",
          signatureTitle: "Authorized Signatory",
          signatureDataUrl: "",
        },
        notes:
          "Thank you for your business. Please review the invoice details and complete payment by the due date.",
        paymentTerms: "Payment is due within 15 days of receipt.",
      });
    }
  }, [mode, invoiceData, settingsData, reset, user]);

  const { data: taxSuggestion, isLoading: isSuggestionLoading } = useQuery({
    queryKey: ["taxSuggestion", watchedCountry],
    queryFn: () => getTaxSuggestion(watchedCountry),
    enabled: !!watchedCountry && !isSuggestionDismissed,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour, as this data is static
    retry: false,
  });

  useEffect(() => {
    if (!watchedClientName || watchedClientName.length < 2) {
      setClientSuggestions([]);
      setShowClientSuggestions(false);
      return;
    }
    const handler = setTimeout(async () => {
      setIsClientSuggestionsLoading(true);
      const results = await getClientSuggestions(watchedClientName);
      if (results) {
        setClientSuggestions(results);
        setShowClientSuggestions(results.length > 0);
      }
      setIsClientSuggestionsLoading(false);
    }, 400);
    return () => clearTimeout(handler);
  }, [watchedClientName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        clientSuggestionsRef.current &&
        !clientSuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowClientSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (watchedSignatureMode === "type") {
      const svgUrl = generateTypedSignature(watchedSignatureName ?? "", watchedSignatureTitle);
      setValue("customization.signatureDataUrl", svgUrl, { shouldDirty: true });
    }
  }, [watchedSignatureMode, watchedSignatureName, watchedSignatureTitle, setValue]);

  const applyTaxSuggestion = () => {
    if (taxSuggestion) {
      setValue(
        "calculations.taxType",
        taxSuggestion.taxType as InvoiceForm["calculations"]["taxType"],
        { shouldValidate: true },
      );
      setValue("calculations.taxRate", taxSuggestion.rate, { shouldValidate: true });
      setIsSuggestionDismissed(true);
    }
  };

  const applyClientSuggestion = (suggestion: ClientSuggestion) => {
    setValue("clientInfo.name", suggestion.name, { shouldValidate: true });
    setValue("clientInfo.email", suggestion.email, { shouldValidate: true });
    setValue("clientInfo.address", suggestion.address, { shouldValidate: true });
    setValue("clientInfo.phone", suggestion.phone, { shouldValidate: true });
    setValue("clientInfo.gstNumber", suggestion.gstNumber, { shouldValidate: true });
    setShowClientSuggestions(false);
  };

  const dismissSuggestion = () => {
    setIsSuggestionDismissed(true);
  };

  const addPaymentMutation = useMutation({
    mutationFn: (data: Omit<PaymentRecord, "_id">) => addPayment(invoiceId!, data),
    onSuccess: () => {
      toast.success("Payment recorded successfully.");
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      setIsPaymentDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to record payment", { description: error.message });
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => deletePayment(invoiceId!, paymentId),
    onSuccess: () => {
      toast.success("Payment record deleted.");
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: (error) => {
      toast.error("Failed to delete payment record", {
        description: error.message,
      });
    },
  });

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("customization.signatureDataUrl", reader.result as string, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoiceId) return;
    setIsDownloading(true);
    try {
      await downloadInvoicePdf(invoiceId);
      toast.success("PDF download started.");
    } catch (error) {
      toast.error("Failed to download PDF.", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleApplyAiSuggestions = (suggestions: Partial<InvoiceForm>) => {
    // Use setValue for each top-level key in suggestions
    // to merge with existing form state without a full reset.
    if (suggestions.clientInfo) {
      setValue("clientInfo.name", suggestions.clientInfo.name, { shouldDirty: true });
    }
    if (suggestions.currency) {
      setValue("currency", suggestions.currency, { shouldDirty: true });
    }
    if (suggestions.items) {
      setValue("items", suggestions.items, { shouldDirty: true });
    }
    if (suggestions.calculations) {
      if (suggestions.calculations.taxRate !== undefined) {
        setValue("calculations.taxRate", suggestions.calculations.taxRate, { shouldDirty: true });
      }
      if (suggestions.calculations.taxType) {
        setValue("calculations.taxType", suggestions.calculations.taxType, { shouldDirty: true });
      }
    }
    if (suggestions.dueDate) {
      setValue("dueDate", suggestions.dueDate, { shouldDirty: true });
    }
    if (suggestions.notes) {
      setValue("notes", suggestions.notes, { shouldDirty: true });
    }
    if (suggestions.paymentTerms) {
      setValue("paymentTerms", suggestions.paymentTerms, { shouldDirty: true });
    }
    toast.success("AI suggestions applied!");
    setIsAiInvoiceDialogOpen(false);
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { invoiceData: InvoiceForm; status: "draft" | "published" }) => {
      const payload = { ...data.invoiceData, status: data.status };
      const apiPayload: Partial<InvoiceForm> = { ...payload };
      delete apiPayload._id;
      delete apiPayload.invoiceNumber;

      if (mode === "create") {
        return createInvoice(apiPayload);
      } else {
        return updateInvoice(invoiceId!, apiPayload);
      }
    },
    onSuccess: (data) => {
      toast.success(`Invoice ${data.status === "draft" ? "saved as draft" : "sent"}.`);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      if (mode === "create") {
        navigate({ to: "/invoices/$invoiceId", params: { invoiceId: data._id! } });
      } else {
        queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      }
    },
    onError: (error) => {
      toast.error("Failed to save invoice", {
        description: error.message,
      });
    },
  });

  const handleSave = (status: "draft" | "published") => {
    handleSubmit((data) => mutation.mutate({ invoiceData: data, status }))();
  };

  if (isLoadingSettings || (mode === "edit" && isLoadingInvoice)) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
      {/* Top Floating Glass Header Banner */}
      <header className="glass-card p-6 md:p-8 rounded-3xl border border-border/80 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Precision Invoice Builder
          </div>
          <h1 className="font-headline text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            {mode === "create" ? "Create New" : "Edit"}{" "}
            <span className="drawing-text italic">Invoice.</span>
          </h1>
          <p className="text-muted-foreground text-sm font-body">
            {mode === "create"
              ? "Draft line items, calculate taxes, and preview live 3D PDF output."
              : `Modifying invoice sequence ${invoiceId || ""}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {mode === "edit" && (
            <Button
              variant="outline"
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="rounded-full px-5 py-2.5 font-bold text-xs shadow-sm"
            >
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download PDF
            </Button>
          )}
          {mode === "create" && (
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsAiInvoiceDialogOpen(true)}
              className="rounded-full px-5 py-2.5 font-bold text-xs border-primary/30 text-primary hover:bg-primary/10 shadow-sm"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate with AI
            </Button>
          )}
          <Button
            variant="outline"
            type="button"
            onClick={() => handleSave("draft")}
            disabled={mutation.isPending}
            className="rounded-full px-5 py-2.5 font-bold text-xs shadow-sm"
          >
            {mutation.isPending && mutation.variables?.status === "draft" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Save Draft
          </Button>
          <Button
            type="button"
            onClick={() => handleSave("published")}
            disabled={mutation.isPending}
            className="rounded-full px-6 py-2.5 font-headline text-xs font-bold shadow-xl bg-primary text-white hover:scale-105 transition-transform btn-premium"
          >
            {mutation.isPending && mutation.variables?.status === "published" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {mode === "create" ? "Send Invoice" : "Save Changes"}
          </Button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          {/* Business and Client Details */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="glass-card p-6 rounded-3xl border border-border/80 shadow-2xl space-y-4 backdrop-blur-xl">
              <h3 className="font-headline font-bold text-xl text-foreground pb-2 border-b border-border">
                Your Details
              </h3>
              <div className="space-y-3">
                <Input {...register("businessInfo.name")} placeholder="Your Business Name" className="rounded-2xl text-sm" />
                <Textarea
                  {...register("businessInfo.address")}
                  placeholder="Your Business Address"
                  rows={2}
                  className="rounded-2xl text-sm"
                />
                <Input {...register("businessInfo.email")} placeholder="Your Email" type="email" className="rounded-2xl text-sm" />
                <Controller
                  name="businessInfo.country"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setIsSuggestionDismissed(false); // Re-enable suggestions on country change
                      }}
                      value={field.value}
                    >
                      <SelectTrigger className="rounded-2xl text-sm">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-border/80 shadow-2xl space-y-4 backdrop-blur-xl">
              <h3 className="font-headline font-bold text-xl text-foreground pb-2 border-b border-border">
                Client Details
              </h3>
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    {...register("clientInfo.name")}
                    placeholder="Client's Legal Name"
                    autoComplete="off"
                    className="rounded-2xl text-sm"
                  />
                  {showClientSuggestions && (
                    <div
                      ref={clientSuggestionsRef}
                      className="absolute z-10 mt-1 w-full rounded-2xl border border-border/80 bg-card p-2 shadow-2xl backdrop-blur-xl"
                    >
                      {isClientSuggestionsLoading ? (
                        <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" /> AI is searching...
                        </div>
                      ) : (
                        clientSuggestions.map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => applyClientSuggestion(s)}
                            className="block w-full rounded-xl p-2.5 text-left text-xs transition-colors hover:bg-primary/10"
                          >
                            <p className="font-bold text-foreground">{s.name}</p>
                            <p className="text-muted-foreground">{s.email}</p>
                          </button>
                        ))
                      )}
                      <div className="mt-1 flex items-center justify-end gap-1.5 border-t border-border/60 px-2 pt-1.5 text-[10px] font-bold text-primary">
                        <Sparkles className="h-3 w-3 text-primary" /> AI Client Autofill
                      </div>
                    </div>
                  )}
                </div>
                <Textarea
                  {...register("clientInfo.address")}
                  placeholder="Client's Billing Address"
                  rows={2}
                  className="rounded-2xl text-sm"
                />
                <Input
                  {...register("clientInfo.email")}
                  placeholder="Client's Email"
                  type="email"
                  className="rounded-2xl text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input {...register("clientInfo.phone")} placeholder="Phone" className="rounded-2xl text-sm" />
                  <Input {...register("clientInfo.gstNumber")} placeholder="GST/Tax ID" className="rounded-2xl text-sm font-mono" />
                </div>
              </div>
            </div>
          </div>

          {mode === "edit" && allFormData.payment && (
            <Card>
              <CardHeader>
                <CardTitle>Payments</CardTitle>
                <CardDescription>
                  Amount Paid: {currencySymbol}
                  {allFormData.payment.amountPaid.toFixed(2)} &bull; Amount Due: {currencySymbol}
                  {allFormData.payment.amountDue.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allFormData.payment.paymentRecords.length > 0 ? (
                  <div className="space-y-3">
                    {allFormData.payment.paymentRecords.map((p) => (
                      <div
                        key={p._id}
                        className="flex items-center justify-between rounded-lg border bg-background p-3"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">
                              {currencySymbol}
                              {p.amount.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(p.date).toLocaleDateString()} via{" "}
                              {p.method.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => p._id && deletePaymentMutation.mutate(p._id)}
                          disabled={deletePaymentMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No payments have been recorded for this invoice yet.
                  </p>
                )}
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsPaymentDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Signature Card */}
          <div className="glass-card p-6 rounded-3xl border border-border/80 shadow-2xl space-y-4 backdrop-blur-xl">
            <div className="pb-2 border-b border-border">
              <h3 className="font-headline font-bold text-xl text-foreground">Official Signature</h3>
              <p className="text-xs text-muted-foreground">Attach a digital signature or draw on canvas</p>
            </div>
            <div className="space-y-4 text-xs">
              <div>
                <Label htmlFor="signatureMode" className="font-bold text-xs">Signature Mode</Label>
                <Controller
                  name="customization.signatureMode"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="signatureMode" className="rounded-2xl text-xs mt-1">
                        <SelectValue placeholder="Select signature mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="draw">Draw Canvas</SelectItem>
                        <SelectItem value="type">Type Signature</SelectItem>
                        <SelectItem value="upload">Upload File</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {watchedSignatureMode === "draw" && (
                <div>
                  <Label className="font-bold text-xs">Draw Signature</Label>
                  <Controller
                    name="customization.signatureDataUrl"
                    control={control}
                    render={({ field }) => (
                      <SignaturePad value={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
              )}
              {watchedSignatureMode === "type" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="signatureName" className="font-bold text-xs">Full Name</Label>
                    <Input
                      {...register("customization.signatureName")}
                      id="signatureName"
                      placeholder="Your Name"
                      className="rounded-2xl text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signatureTitle" className="font-bold text-xs">Title</Label>
                    <Input
                      {...register("customization.signatureTitle")}
                      id="signatureTitle"
                      placeholder="Your Title"
                      className="rounded-2xl text-xs mt-1"
                    />
                  </div>
                </div>
              )}
              {watchedSignatureMode === "upload" && (
                <div>
                  <Label className="font-bold text-xs">Upload Signature Image</Label>
                  <div className="mt-1">
                    <Input
                      type="file"
                      onChange={handleSignatureUpload}
                      accept="image/png, image/jpeg, image/svg+xml"
                      className="rounded-2xl text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Line Items Card */}
          <div className="glass-card p-6 rounded-3xl border border-border/80 shadow-2xl space-y-4 backdrop-blur-xl">
            <div className="pb-2 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="font-headline font-bold text-xl text-foreground">Line Items &amp; Services</h3>
                <p className="text-xs text-muted-foreground">Add products, rates, quantities, and AI descriptions</p>
              </div>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 items-start gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm"
                >
                  <div className="col-span-12 space-y-2 md:col-span-5">
                    <Input
                      {...register(`items.${index}.name`)}
                      id={`items.${index}.name`}
                      placeholder="Item Title (e.g. Website UX Audit)"
                      className="rounded-xl text-xs font-bold"
                    />
                    <div className="relative">
                      <Textarea
                        {...register(`items.${index}.description`)}
                        id={`items.${index}.description`}
                        placeholder="Detailed service description..."
                        rows={2}
                        className="resize-none pr-9 rounded-xl text-xs"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openDescriptionGenerator(index)}
                        title="Generate description with AI"
                        className="absolute right-1 top-1 h-7 w-7 text-primary hover:bg-primary/10 rounded-lg"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Label htmlFor={`items.${index}.quantity`} className="text-[10px] font-bold uppercase text-muted-foreground">Qty</Label>
                    <Input
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      id={`items.${index}.quantity`}
                      type="number"
                      min="0"
                      className="rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <Label htmlFor={`items.${index}.rate`} className="text-[10px] font-bold uppercase text-muted-foreground">Rate ($)</Label>
                    <Input
                      {...register(`items.${index}.rate`, { valueAsNumber: true })}
                      id={`items.${index}.rate`}
                      type="number"
                      min="0"
                      className="rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div className="col-span-12 flex items-center justify-between md:col-span-2 md:flex-col md:items-end pt-2 md:pt-0">
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block">Amount</span>
                      <p className="font-mono font-bold text-sm text-foreground">
                        {currencySymbol}
                        {(
                          (watchedItems?.[index]?.quantity || 0) *
                          (watchedItems?.[index]?.rate || 0)
                        ).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ name: "", description: "", quantity: 1, rate: 0 })}
                className="w-full rounded-full border-dashed border-border py-3 text-xs font-bold hover:bg-card transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4 text-primary" /> Add Line Item
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-8 lg:order-first">
          {/* Invoice Details & Dates Card */}
          <div className="glass-card p-6 rounded-3xl border border-border/80 shadow-2xl space-y-4 backdrop-blur-xl">
            <h3 className="font-headline font-bold text-xl text-foreground pb-2 border-b border-border">
              Invoice Dates &amp; Currency
            </h3>
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="invoiceDate" className="font-bold text-xs">Invoice Issue Date</Label>
                  <Input {...register("invoiceDate")} id="invoiceDate" type="date" className="rounded-2xl text-xs mt-1" />
                </div>
                <div>
                  <Label htmlFor="dueDate" className="font-bold text-xs">Payment Due Date</Label>
                  <Input {...register("dueDate")} id="dueDate" type="date" className="rounded-2xl text-xs mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="currency" className="font-bold text-xs">Invoice Currency</Label>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="currency" className="rounded-2xl text-xs mt-1">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.code} - {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="template" className="font-bold text-xs">Swiss Template Design</Label>
                <Controller
                  name="customization.templateId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="template" className="rounded-2xl text-xs mt-1">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <Card className="rounded-3xl border border-border/80 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold">Line Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", description: "", quantity: 1, rate: 0 })}
                className="rounded-full text-xs font-bold gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((fieldItem, index) => (
                <div key={fieldItem.id} className="p-4 rounded-2xl bg-surface/50 border border-border/60 space-y-3">
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-6 space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Item Name</Label>
                      <Input {...register(`items.${index}.name`)} placeholder="Item title..." className="rounded-xl text-xs" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Qty</Label>
                      <Input {...register(`items.${index}.quantity`, { valueAsNumber: true })} type="number" className="rounded-xl text-xs" />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Rate</Label>
                      <Input {...register(`items.${index}.rate`, { valueAsNumber: true })} type="number" className="rounded-xl text-xs" />
                    </div>
                    <div className="col-span-1 pt-4 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input {...register(`items.${index}.description`)} placeholder="Optional details..." className="rounded-xl text-xs flex-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAiDescription(index)}
                      className="text-xs text-primary font-bold gap-1"
                    >
                      <Sparkles className="h-3 w-3" /> AI
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Calculations (Tax, Discount, Shipping) Card */}
          <div className="glass-card p-6 rounded-3xl border border-border/80 shadow-2xl space-y-4 backdrop-blur-xl">
            <h3 className="font-headline font-bold text-xl text-foreground pb-2 border-b border-border">
              Tax, Discount &amp; Shipping
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <Label className="font-bold">Discount Amount ({currencySymbol})</Label>
                <Input {...register("calculations.discount", { valueAsNumber: true })} type="number" className="w-28 rounded-2xl text-right font-mono text-xs" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-bold">Shipping Charge ({currencySymbol})</Label>
                <Input {...register("calculations.shipping", { valueAsNumber: true })} type="number" className="w-28 rounded-2xl text-right font-mono text-xs" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-bold">Tax Type</Label>
                <Controller
                  name="calculations.taxType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-36 rounded-2xl text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taxTypes.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-bold">Tax Rate (%)</Label>
                <Input {...register("calculations.taxRate", { valueAsNumber: true })} type="number" className="w-28 rounded-2xl text-right font-mono text-xs" />
              </div>
              <div className="pt-3 border-t border-border flex justify-between font-headline font-extrabold text-lg text-foreground">
                <span>Grand Total</span>
                <span className="text-primary font-mono">{currencySymbol}{total.toFixed(2)}</span>
              </div>
            </div>
          </div>        </div>

        {/* Right Column: 3D Floating Canvas Preview */}
        <div className="lg:sticky lg:top-28 h-fit lg:max-h-[calc(100vh-8rem)] overflow-y-auto rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 shadow-2xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
              <span className="font-headline font-bold text-sm text-foreground">3D Live PDF Preview</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold">Swiss Render Engine</span>
          </div>

          <div className="relative rounded-2xl transition-all duration-500 hover:shadow-2xl overflow-hidden">
            {allFormData.businessInfo && (
              <InvoicePreview
                data={allFormData as InvoiceForm}
                templateId={watchedTemplate}
                currencySymbol={currencySymbol}
              />
            )}
          </div>
        </div>
      </div>

      <AiDescriptionDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, itemIndex: null })}
        onApply={handleApplyDescription}
        productName={currentItemName}
      />

      <AiInvoiceDialog
        isOpen={isAiInvoiceDialogOpen}
        onClose={() => setIsAiInvoiceDialogOpen(false)}
        onApply={handleApplyAiSuggestions}
      />

      {allFormData.payment && (
        <PaymentDialog
          isOpen={isPaymentDialogOpen}
          onClose={() => setIsPaymentDialogOpen(false)}
          onSubmit={(data) => addPaymentMutation.mutate(data)}
          isSubmitting={addPaymentMutation.isPending}
          maxAmount={allFormData.payment.amountDue}
        />
      )}
    </form>
  );
}
