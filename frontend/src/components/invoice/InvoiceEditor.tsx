import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch, type UseFormReset } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { pushNotification } from "@/lib/notifications";

import { AiDescriptionDialog } from "@/components/AiDescriptionDialog";
import { AiInvoiceDialog } from "@/components/AiInvoiceDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Archive,
  Building2,
  Clock,
  CreditCard,
  Download,
  Image as ImageIcon,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Type,
  UserCheck,
  Users,
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
import { fetchClients } from "@/lib/api/client";
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
    phone?: string;
    gstNumber?: string;
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
    templateId: "modern" | "minimal" | "professional" | "corporate" | "elegant" | "cyber";
    signatureMode: "draw" | "type" | "upload";
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
  { id: "modern", name: "Zurich Modern (Pro)" },
  { id: "stripe", name: "Stripe SaaS Minimal (Pro)" },
  { id: "linear", name: "Linear Monospace (Pro)" },
  { id: "apple", name: "Apple Cupertino Luxe (Pro)" },
  { id: "nordic", name: "Nordic Frost Minimal (Pro)" },
  { id: "brutalist", name: "Studio Neo-Brutalist (Pro)" },
  { id: "emerald", name: "Emerald Luxe Executive (Pro)" },
  { id: "minimal", name: "Basel Minimal (Pro)" },
  { id: "professional", name: "Geneva Corporate (Pro)" },
  { id: "corporate", name: "St. Gallen Enterprise (Pro)" },
  { id: "elegant", name: "Lucerne Deluxe (Pro)" },
  { id: "cyber", name: "Matterhorn Cyber (Pro)" },
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
        items: [
          {
            name: "",
            description: "",
            quantity: 1,
            rate: 0,
          },
        ],
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
  const [clientSuggestions, setClientSuggestions] = useState<(ClientSuggestion & { isSaved?: boolean })[]>([]);
  const [isClientSuggestionsLoading, setIsClientSuggestionsLoading] = useState(false);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const clientSuggestionsRef = useRef<HTMLDivElement>(null);

  const { data: savedClientsData } = useQuery({
    queryKey: ["savedClientsList"],
    queryFn: async () => {
      try {
        const res = await fetchClients({ limit: 100 });
        if (res.success && res.data) {
          if (Array.isArray(res.data)) return res.data;
          if (Array.isArray((res.data as any).data)) return (res.data as any).data;
        }
        return [];
      } catch (err) {
        return [];
      }
    },
    staleTime: 1000 * 30,
  });
  const savedClients = savedClientsData || [];

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
  const watchedBusinessInfo = watch("businessInfo");
  const watchedClientInfo = watch("clientInfo");

  const isSameEmail =
    Boolean(watchedBusinessInfo?.email?.trim()) &&
    Boolean(watchedClientInfo?.email?.trim()) &&
    watchedBusinessInfo.email.trim().toLowerCase() === watchedClientInfo.email.trim().toLowerCase();

  const isSamePhone =
    Boolean(watchedBusinessInfo?.phone?.trim()) &&
    Boolean(watchedClientInfo?.phone?.trim()) &&
    (watchedBusinessInfo?.phone ?? "").trim().replace(/\s+/g, "") === (watchedClientInfo?.phone ?? "").trim().replace(/\s+/g, "");

  const isSameGst =
    Boolean(watchedBusinessInfo?.gstNumber?.trim()) &&
    Boolean(watchedClientInfo?.gstNumber?.trim()) &&
    (watchedBusinessInfo?.gstNumber ?? "").trim().toUpperCase() === (watchedClientInfo?.gstNumber ?? "").trim().toUpperCase();

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
          name: businessProfile?.name ?? user?.fullName ?? "",
          address: businessProfile?.address ?? "",
          email: businessProfile?.email ?? user?.email ?? "",
          country: user?.country ?? "IN",
          phone: (businessProfile as any)?.phone ?? user?.phone ?? "",
          gstNumber: (businessProfile as any)?.taxId ?? (businessProfile as any)?.gstNumber ?? "",
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
          signatureMode: "type",
          signatureName: user?.fullName ?? "",
          signatureTitle: "Authorized Signatory",
          signatureDataUrl: generateTypedSignature(user?.fullName ?? "", "Authorized Signatory"),
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
    const q = (watchedClientName || "").toLowerCase().trim();

    const matchedSaved: (ClientSuggestion & { isSaved?: boolean })[] = savedClients
      .filter((c: any) => {
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q))
        );
      })
      .map((c: any) => ({
        name: c.name,
        email: c.email || "",
        address: c.address || "",
        phone: c.phone || "",
        gstNumber: c.gstNumber || "",
        company: c.company || "",
        isSaved: true,
      }));

    if (!q) {
      setClientSuggestions(matchedSaved);
      return;
    }

    const handler = setTimeout(async () => {
      setIsClientSuggestionsLoading(true);
      const results = await getClientSuggestions(watchedClientName);
      const combined: (ClientSuggestion & { isSaved?: boolean })[] = [...matchedSaved];
      if (results && results.length > 0) {
        results.forEach((r) => {
          if (!combined.some((c) => c.name.toLowerCase() === r.name.toLowerCase())) {
            combined.push(r);
          }
        });
      }
      if (combined.length > 0) {
        setClientSuggestions(combined);
        setShowClientSuggestions(true);
      }
      setIsClientSuggestionsLoading(false);
    }, 300);

    return () => clearTimeout(handler);
  }, [watchedClientName, savedClients]);

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
    let targetId = invoiceId;
    setIsDownloading(true);

    try {
      if (!targetId) {
        const values = getValues();
        if (!values.clientInfo?.name || !values.clientInfo?.name.trim()) {
          toast.error("Please enter a Client Name before exporting PDF.");
          setIsDownloading(false);
          return;
        }

        const saved = await mutation.mutateAsync({ invoiceData: values, status: "published" });
        targetId = saved._id;
        toast.success("Invoice created successfully. Starting PDF download...");
      }

      if (!targetId) {
        setIsDownloading(false);
        return;
      }

      await downloadInvoicePdf(targetId);
      toast.success("PDF export completed successfully!");
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

  const clearFormDetails = () => {
    const resetForm = reset as UseFormReset<InvoiceForm>;
    const settingsObj = settingsData && settingsData.success ? settingsData.data : undefined;
    resetForm({
      businessInfo: {
        name: settingsObj?.businessProfile?.name ?? user?.fullName ?? "",
        address: settingsObj?.businessProfile?.address ?? "",
        email: settingsObj?.businessProfile?.email ?? user?.email ?? "",
        country: user?.country ?? "IN",
        phone: (settingsObj?.businessProfile as any)?.phone ?? user?.phone ?? "",
        gstNumber: (settingsObj?.businessProfile as any)?.taxId ?? (settingsObj?.businessProfile as any)?.gstNumber ?? "",
        logoUrl: settingsObj?.businessProfile?.logoUrl ?? "",
      },
      clientInfo: { name: "", email: "", address: "", phone: "", gstNumber: "" },
      currency: settingsObj?.defaultCurrency ?? "INR",
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10),
      items: [{ name: "", description: "", quantity: 1, rate: 0 }],
      calculations: { taxRate: 0, discount: 0, taxType: "None", shipping: 0 },
      customization: {
        templateId: "modern",
        signatureMode: "type",
        signatureName: user?.fullName ?? "",
        signatureTitle: "Authorized Signatory",
        signatureDataUrl: generateTypedSignature(user?.fullName ?? "", "Authorized Signatory"),
      },
      notes: "Thank you for your business. Please review the invoice details and complete payment by the due date.",
      paymentTerms: "Payment is due within 15 days of receipt.",
    });
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { invoiceData: InvoiceForm; status: "draft" | "published" | "archived" }) => {
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
      const statusLabel =
        data.status === "draft"
          ? "saved as draft"
          : data.status === "archived"
          ? "archived"
          : "published";
      toast.success(`Invoice ${statusLabel}. All details cleared.`);
      pushNotification({
        title: `Invoice ${data.status === "draft" ? "Draft Saved" : data.status === "archived" ? "Archived" : "Published"}`,
        message: `Invoice #${data.invoiceNumber || "INV"} ${statusLabel}`,
        type: "invoice",
      });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });

      clearFormDetails();

      if (mode === "create") {
        navigate({ to: "/invoices" });
      } else {
        queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      }
    },
    onError: (error: any) => {
      const fieldErrors = error?.fields
        ? Object.entries(error.fields)
          .map(([field, errs]) => `${field}: ${(errs as string[]).join(", ")}`)
          .join(" | ")
        : null;
      toast.error("Failed to save invoice", {
        description: fieldErrors || error?.message || "Validation failed",
      });
    },
  });

  const handleSave = (status: "draft" | "published" | "archived") => {
    if (isSameEmail) {
      toast.error("Validation Error", { description: "Client email cannot be identical to your business email." });
      return;
    }
    if (isSamePhone) {
      toast.error("Validation Error", { description: "Client phone number cannot be identical to your business phone number." });
      return;
    }
    if (isSameGst) {
      toast.error("Validation Error", { description: "Client GST/Tax number cannot be identical to your business GST/Tax number." });
      return;
    }
    handleSubmit(
      (data: any) => mutation.mutate({ invoiceData: data, status }),
      (errors) => {
        const fieldNames = Object.keys(errors).join(", ");
        toast.error("Form Validation Failed", {
          description: `Please check required or invalid fields: ${fieldNames || "Input error"}`,
        });
      }
    )();
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
          <Button
            variant="outline"
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="rounded-full px-5 py-2.5 font-bold text-xs shadow-sm border-primary/30 text-primary hover:bg-primary/10"
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download PDF
          </Button>
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
            className="rounded-full px-4 py-2.5 font-bold text-xs shadow-sm"
          >
            {mutation.isPending && mutation.variables?.status === "draft" ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Clock className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
            )}
            Save Draft
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => handleSave("archived")}
            disabled={mutation.isPending}
            className="rounded-full px-5 py-2.5 font-bold text-xs shadow-sm text-foreground hover:bg-muted"
          >
            {mutation.isPending && mutation.variables?.status === "archived" ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Archive className="mr-1.5 h-3.5 w-3.5 text-foreground" />
            )}
            Archive Invoice
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

      <div className="space-y-8 w-full">
        {/* Row 1: Your Details & Client Details (Equal Height & Size) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Your Details Card */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-border/80 shadow-2xl space-y-4 backdrop-blur-xl bg-card/70 h-full flex flex-col justify-between">
            <div>
              <h3 className="font-headline font-bold text-xl text-foreground pb-2 border-b border-border/60">
                Your Details
              </h3>
              <div className="space-y-3.5 mt-4">
                {/* Auto-fill from Account Settings Banner */}
                <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-foreground">Auto-fill from Account Settings</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (settingsData?.success) {
                        const { businessProfile } = settingsData.data;
                        setValue("businessInfo.name", businessProfile?.name || user?.fullName || "", { shouldValidate: true, shouldDirty: true });
                        setValue("businessInfo.email", businessProfile?.email || user?.email || "", { shouldValidate: true, shouldDirty: true });
                        setValue("businessInfo.address", businessProfile?.address || "", { shouldValidate: true, shouldDirty: true });
                        setValue("businessInfo.phone", (businessProfile as any)?.phone || user?.phone || "", { shouldValidate: true, shouldDirty: true });
                        setValue("businessInfo.gstNumber", (businessProfile as any)?.taxId || (businessProfile as any)?.gstNumber || "", { shouldValidate: true, shouldDirty: true });
                        setValue("businessInfo.country", user?.country || "IN", { shouldValidate: true, shouldDirty: true });
                        toast.success("Business details populated from Settings!");
                      } else if (user) {
                        setValue("businessInfo.name", user.fullName || "", { shouldValidate: true, shouldDirty: true });
                        setValue("businessInfo.email", user.email || "", { shouldValidate: true, shouldDirty: true });
                        toast.success("Business details populated from profile!");
                      }
                    }}
                    className="text-xs font-bold text-primary hover:underline shrink-0"
                  >
                    Auto-Fill
                  </button>
                </div>

                <div>
                  <Label className="text-xs font-bold text-muted-foreground mb-1 block">Business Name</Label>
                  <Input
                    {...register("businessInfo.name")}
                    placeholder="Your Business Name"
                    className="rounded-2xl text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-muted-foreground mb-1 block">Business Address</Label>
                  <Textarea
                    {...register("businessInfo.address")}
                    placeholder="Your Business Address"
                    rows={2}
                    className="rounded-2xl text-sm resize-none"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-muted-foreground mb-1 block">Email Address</Label>
                  <Input
                    {...register("businessInfo.email")}
                    placeholder="Your Email"
                    type="email"
                    className="rounded-2xl text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-muted-foreground mb-1 block">Country</Label>
                  <Controller
                    name="businessInfo.country"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setIsSuggestionDismissed(false);
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-bold text-muted-foreground mb-1 block">Phone</Label>
                    <PhoneInput {...register("businessInfo.phone")} />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-muted-foreground mb-1 block">GST/Tax ID</Label>
                    <Input
                      {...register("businessInfo.gstNumber")}
                      placeholder="22AAAAA0000A1Z5"
                      className="h-10 rounded-2xl text-sm font-mono px-3.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Client Details Card */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-border/80 shadow-2xl space-y-4 backdrop-blur-xl bg-card/70 h-full flex flex-col justify-between">
            <div>
              <h3 className="font-headline font-bold text-xl text-foreground pb-2 border-b border-border/60">
                Client Details
              </h3>
              <div className="space-y-3.5 mt-4">
                {/* Saved Client Selector Dropdown */}
                <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Select Saved Client
                    </Label>
                    <span className="text-[10px] font-mono text-muted-foreground font-normal">
                      {savedClients.length} saved
                    </span>
                  </div>

                  {savedClients.length > 0 ? (
                    <Select
                      onValueChange={(clientId) => {
                        const selected = savedClients.find((c: any) => c._id === clientId);
                        if (selected) {
                          setValue("clientInfo.name", selected.name, { shouldValidate: true, shouldDirty: true });
                          setValue("clientInfo.email", selected.email || "", { shouldValidate: true, shouldDirty: true });
                          setValue("clientInfo.address", selected.address || "", { shouldValidate: true, shouldDirty: true });
                          setValue("clientInfo.phone", selected.phone || "", { shouldValidate: true, shouldDirty: true });
                          setValue("clientInfo.gstNumber", selected.gstNumber || "", { shouldValidate: true, shouldDirty: true });
                          toast.success(`Populated details for ${selected.name}!`);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl border-primary/30 bg-background/90 text-sm font-semibold text-foreground shadow-sm hover:border-primary/60 transition-all">
                        <SelectValue placeholder="— Choose from Saved Clients —" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border bg-popover/95 backdrop-blur-xl max-h-60">
                        {savedClients.map((client: any) => (
                          <SelectItem key={client._id} value={client._id} className="rounded-xl cursor-pointer py-2">
                            <div className="flex items-center justify-between w-full gap-3">
                              <span className="font-bold text-foreground">{client.name}</span>
                              {client.email && <span className="text-xs text-muted-foreground truncate">({client.email})</span>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span>No saved clients in directory yet.</span>
                      <button
                        type="button"
                        onClick={() => navigate({ to: "/clients" })}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        + Add Client
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-xs font-bold text-muted-foreground mb-1 block">Client Legal Name</Label>
                  <div className="relative">
                    <Input
                      {...register("clientInfo.name")}
                      placeholder="Client's Legal Name"
                      autoComplete="off"
                      onFocus={() => {
                        if (savedClients.length > 0) {
                          const matchedSaved = savedClients.map((c: any) => ({
                            name: c.name,
                            email: c.email || "",
                            address: c.address || "",
                            phone: c.phone || "",
                            gstNumber: c.gstNumber || "",
                            company: c.company || "",
                            isSaved: true,
                          }));
                          setClientSuggestions(matchedSaved);
                          setShowClientSuggestions(true);
                        }
                      }}
                      className="rounded-2xl text-sm"
                    />
                    {showClientSuggestions && (
                      <div
                        ref={clientSuggestionsRef}
                        className="absolute top-full left-0 right-0 z-50 mt-1.5 rounded-2xl border border-border/80 bg-card/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-50 slide-in-from-top-2 duration-200"
                      >
                        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/60 mb-1">
                          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-primary" /> Smart Client Autofill
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowClientSuggestions(false)}
                            className="text-muted-foreground hover:text-foreground text-xs p-0.5 rounded-md"
                          >
                            ✕
                          </button>
                        </div>
                        {isClientSuggestionsLoading ? (
                          <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Finding matching entity details...
                          </div>
                        ) : (
                          <div className="space-y-1 max-h-56 overflow-y-auto">
                            {clientSuggestions.map((s, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  applyClientSuggestion(s);
                                  toast.success("Client details populated!");
                                }}
                                className="group flex w-full items-start gap-3 rounded-xl p-2.5 text-left text-xs transition-all hover:bg-primary/10 hover:border-primary/30 border border-transparent"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform mt-0.5">
                                  {s.isSaved ? <UserCheck className="h-4 w-4 text-primary" /> : <Building2 className="h-4 w-4" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="font-bold text-foreground truncate text-xs">{s.name}</p>
                                    {s.isSaved && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-primary/20 text-primary shrink-0">
                                        Saved Client
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground truncate">{s.email}</p>
                                  {s.address && (
                                    <p className="text-[10px] text-muted-foreground/80 truncate mt-0.5">{s.address}</p>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold text-muted-foreground mb-1 block">Billing Address</Label>
                  <Textarea
                    {...register("clientInfo.address")}
                    placeholder="Client's Billing Address"
                    rows={2}
                    className="rounded-2xl text-sm resize-none"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-muted-foreground mb-1 block">Client Email</Label>
                  <Input
                    {...register("clientInfo.email")}
                    placeholder="Client's Email"
                    type="email"
                    className={`rounded-2xl text-sm ${isSameEmail ? "border-destructive ring-2 ring-destructive/20" : ""}`}
                  />
                  {isSameEmail && (
                    <p className="text-[11px] text-destructive dark:text-rose-400 font-bold mt-1">
                      ⚠️ Client email must not be identical to your business email.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-bold text-muted-foreground mb-1 block">Phone</Label>
                    <PhoneInput {...register("clientInfo.phone")} />
                    {isSamePhone && (
                      <p className="text-[11px] text-destructive dark:text-rose-400 font-bold mt-1">
                        ⚠️ Client phone must not be identical to your business phone.
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-muted-foreground mb-1 block">GST/Tax ID</Label>
                    <Input
                      {...register("clientInfo.gstNumber")}
                      placeholder="22AAAAA0000A1Z5"
                      className={`h-10 rounded-2xl text-sm font-mono px-3.5 ${isSameGst ? "border-destructive ring-2 ring-destructive/20" : ""}`}
                    />
                    {isSameGst && (
                      <p className="text-[11px] text-destructive dark:text-rose-400 font-bold mt-1">
                        ⚠️ Client GST must not be identical to your business GST.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Invoice Dates & Currency & Official Signature (Equal Height & Size) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Invoice Dates & Currency Card */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-border/80 shadow-2xl space-y-4 backdrop-blur-xl bg-card/70 h-full flex flex-col justify-between">
            <div>
              <h3 className="font-headline font-bold text-xl text-foreground pb-2 border-b border-border/60">
                Invoice Dates &amp; Currency
              </h3>
              <div className="space-y-4 text-xs mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="invoiceDate" className="font-bold text-xs">
                      Invoice Issue Date
                    </Label>
                    <Input
                      {...register("invoiceDate")}
                      id="invoiceDate"
                      type="date"
                      className="rounded-2xl text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate" className="font-bold text-xs">
                      Payment Due Date
                    </Label>
                    <Input
                      {...register("dueDate")}
                      id="dueDate"
                      type="date"
                      className="rounded-2xl text-xs mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="currency" className="font-bold text-xs">
                    Invoice Currency
                  </Label>
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
                  <Label htmlFor="template" className="font-bold text-xs">
                    Swiss Template Design
                  </Label>
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
          </div>

          {/* Official Signature Card */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-border/80 shadow-2xl space-y-4 backdrop-blur-xl bg-card/70 h-full flex flex-col justify-between">
            <div>
              <div className="pb-2 border-b border-border/60">
                <h3 className="font-headline font-bold text-xl text-foreground">
                  Official Signature
                </h3>
                <p className="text-xs text-muted-foreground">
                  Attach a digital signature or draw on canvas
                </p>
              </div>
              <div className="space-y-4 text-xs mt-4">
                <div>
                  <Label htmlFor="signatureMode" className="font-bold text-xs">
                    Signature Mode
                  </Label>
                  <Controller
                    name="customization.signatureMode"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="signatureMode" className="rounded-2xl text-xs mt-1">
                          <SelectValue placeholder="Select signature mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="type">Type Signature</SelectItem>
                          <SelectItem value="draw">Draw Canvas</SelectItem>
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
                      <Label htmlFor="signatureName" className="font-bold text-xs">
                        Full Name
                      </Label>
                      <Input
                        {...register("customization.signatureName")}
                        id="signatureName"
                        placeholder="Your Name"
                        className="rounded-2xl text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signatureTitle" className="font-bold text-xs">
                        Title
                      </Label>
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
          </div>
        </div>

        {/* Row 3: Line Items & Tax/Discount/Shipping (Equal Height & Size) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Line Items Card */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-border/80 shadow-2xl space-y-4 backdrop-blur-xl bg-card/70 flex flex-col justify-between">
            <div>
              <div className="pb-2 border-b border-border/60 flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-bold text-xl text-foreground">
                    Line Items
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Add products, rates, quantities &amp; AI descriptions
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: "", description: "", quantity: 1, rate: 0 })}
                  className="rounded-full text-xs font-bold gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Item
                </Button>
              </div>

              {/* Scrollable Items List */}
              <div className="space-y-4 mt-4 max-h-[360px] overflow-y-auto pr-1">
                {fields.map((fieldItem, index) => (
                  <div
                    key={fieldItem.id}
                    className="p-4 rounded-2xl bg-surface/50 border border-border/60 space-y-3"
                  >
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-6 space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                          Item Name
                        </Label>
                        <Input
                          {...register(`items.${index}.name`)}
                          placeholder="Item title..."
                          className="rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                          Qty
                        </Label>
                        <Input
                          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                          type="number"
                          className="rounded-xl text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                          Rate ({currencySymbol})
                        </Label>
                        <Input
                          {...register(`items.${index}.rate`, { valueAsNumber: true })}
                          type="number"
                          className="rounded-xl text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-1 pt-4 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (fields.length === 1) {
                              setValue(`items.0.name`, "");
                              setValue(`items.0.description`, "");
                              setValue(`items.0.quantity`, 1);
                              setValue(`items.0.rate`, 0);
                            } else {
                              remove(index);
                            }
                          }}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Input
                        {...register(`items.${index}.description`)}
                        placeholder="Optional details..."
                        className="rounded-xl text-xs flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openDescriptionGenerator(index)}
                        className="text-xs text-primary font-bold gap-1 shrink-0"
                      >
                        <Sparkles className="h-3 w-3" /> AI
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tax, Discount & Shipping Card */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-border/80 shadow-2xl backdrop-blur-xl bg-card/70 flex flex-col justify-between">
            <div>
              <h3 className="font-headline font-bold text-xl text-foreground pb-2 border-b border-border/60">
                Tax, Discount &amp; Shipping
              </h3>
              <div className="space-y-3.5 text-xs mt-4">
                <div className="flex items-center justify-between">
                  <Label className="font-bold">Discount Amount ({currencySymbol})</Label>
                  <Input
                    {...register("calculations.discount", { valueAsNumber: true })}
                    type="number"
                    className="w-28 h-10 rounded-full text-right font-mono text-xs px-3.5"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-bold">Shipping Charge ({currencySymbol})</Label>
                  <Input
                    {...register("calculations.shipping", { valueAsNumber: true })}
                    type="number"
                    className="w-28 h-10 rounded-full text-right font-mono text-xs px-3.5"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-bold">Tax Type</Label>
                  <Controller
                    name="calculations.taxType"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-28 h-10 rounded-full text-xs px-3.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {taxTypes.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-bold">Tax Rate (%)</Label>
                  <Input
                    {...register("calculations.taxRate", { valueAsNumber: true })}
                    type="number"
                    className="w-28 h-10 rounded-full text-right font-mono text-xs px-3.5"
                  />
                </div>
              </div>
            </div>



            <div className="pt-4 border-t border-border/60 flex justify-between items-center font-headline font-extrabold text-xl text-foreground">
              <span>Grand Total</span>
              <span className="text-primary font-mono text-2xl font-black">
                {currencySymbol}
                {total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Row 4: 3D Live PDF Widescreen Preview */}
        <div className="glass-card rounded-3xl border border-border/80 p-6 md:p-8 shadow-2xl space-y-6 backdrop-blur-2xl bg-card/70 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary"></span>
              </span>
              <div>
                <h3 className="font-headline font-bold text-lg md:text-xl text-foreground tracking-tight">
                  3D Live PDF Widescreen Preview
                </h3>
                <p className="text-xs text-muted-foreground">
                  Interactive real-time Swiss standard vector rendering
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <Button
                variant="default"
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="rounded-full px-5 py-2 font-bold text-xs shadow-md bg-primary text-white hover:scale-105 transition-all"
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export PDF Document
              </Button>
              <span className="text-xs font-mono text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 font-bold hidden md:inline-block">
                Swiss Render Engine v2.4
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1.5 w-full shrink-0 select-none">
            <span className="text-xs font-bold text-muted-foreground shrink-0 mr-1">Design Preset:</span>
            {[
              { id: "modern", label: "Zurich Modern" },
              { id: "stripe", label: "Stripe SaaS Minimal" },
              { id: "linear", label: "Linear Monospace" },
              { id: "apple", label: "Apple Cupertino Luxe" },
              { id: "nordic", label: "Nordic Frost Minimal" },
              { id: "brutalist", label: "Studio Neo-Brutalist" },
              { id: "emerald", label: "Emerald Luxe Executive" },
              { id: "minimal", label: "Basel Minimal" },
              { id: "corporate", label: "Geneva Corporate" },
              { id: "professional", label: "St. Gallen Executive" },
              { id: "elegant", label: "Lucerne Deluxe" },
              { id: "cyber", label: "Matterhorn Cyber" },
            ].map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setValue("customization.templateId", tpl.id as any)}
                className={`px-4 py-2 rounded-full font-headline text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${watchedTemplate === tpl.id
                  ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                  : "bg-muted/70 text-muted-foreground hover:text-foreground border border-border/60 hover:bg-muted"
                  }`}
              >
                {tpl.label}
              </button>
            ))}
          </div>

          <div className="relative rounded-[2.5rem] bg-[#0b0f19] p-4 sm:p-6 border-4 border-slate-800 shadow-2xl overflow-hidden group">
            <div className="w-20 h-2 bg-slate-800/80 rounded-full mx-auto mb-3 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-900" />
            </div>

            <div className="relative rounded-2xl bg-slate-900/60 p-4 sm:p-8 flex justify-center items-start min-h-[480px] max-h-[620px] overflow-y-auto custom-scrollbar border border-slate-800">
              {allFormData.businessInfo && (
                <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden transition-transform duration-300">
                  <InvoicePreview
                    data={allFormData as InvoiceForm}
                    templateId={watchedTemplate}
                    currencySymbol={currencySymbol}
                  />
                </div>
              )}
            </div>
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
