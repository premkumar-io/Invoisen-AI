import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RotateCcw, Trash2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { AppFooter } from "@/components/AppFooter";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { getAuthToken } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import {
  fetchInvoices,
  permanentDeleteInvoice,
  restoreInvoice,
  type IInvoice,
} from "@/lib/api/invoice";

export const Route = createFileRoute("/trash")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getAuthToken()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({ meta: [{ title: "Trash & Archived Invoices — Invoisen AI" }] }),
  component: TrashPage,
});

function TrashPage() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const {
    data: invoicesResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["invoices", { trash: true }],
    queryFn: async () => {
      const response = await fetchInvoices({ trash: true });
      if (!response.success) {
        throw new Error(response.error!.message || "Failed to fetch trashed invoices");
      }
      return response.data;
    },
  });
  const invoices: IInvoice[] = Array.isArray(invoicesResponse)
    ? invoicesResponse
    : Array.isArray((invoicesResponse as any)?.data)
    ? (invoicesResponse as any).data
    : [];

  const restoreMutation = useMutation({
    mutationFn: restoreInvoice,
    onSuccess: () => {
      toast.success("Invoice has been restored.");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: (err) => {
      toast.error("Failed to restore invoice", { description: err.message });
    },
  });

  const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: permanentDeleteInvoice,
    onSuccess: () => {
      toast.success("Invoice permanently deleted.");
      queryClient.invalidateQueries({ queryKey: ["invoices", { trash: true }] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      setDeletingInvoiceId(null);
    },
    onError: (err) => {
      toast.error("Failed to delete invoice", { description: err.message });
      setDeletingInvoiceId(null);
    },
  });

  const onDelete = async (invoiceId: string) => {
    setDeletingInvoiceId(invoiceId);
  };

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white">
      <ThreeBackground />
      <AppNavbar />

      <div className="relative pt-28 pb-16 z-10">
        <div className="max-w-container-max mx-auto px-margin-desktop space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Soft Delete Archive
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
              {t("trash.title", "Trash & Deleted Items")}
            </h1>
            <p className="text-muted-foreground text-base">
              {t("trash.subtitle", "Recover accidentally deleted invoices or permanently erase items.")}
            </p>
          </div>

          {isError ? (
            <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive font-bold">
              {error.message}
            </p>
          ) : null}

          <div className="glass-card p-4 sm:p-6 lg:p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">{t("common.loading", "Loading...")}</p>
            ) : !invoices.length ? (
              <p className="text-sm text-muted-foreground">{t("trash.noItems", "Trash is currently empty.")}</p>
            ) : (
              <div className="responsive-table-scroll">
                <table className="w-full min-w-180 text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                      <th className="py-3 px-4">{t("invoices.invoiceNumber", "Invoice #")}</th>
                      <th className="py-3 px-4">{t("invoices.client", "Client")}</th>
                      <th className="py-3 px-4">{t("invoices.amount", "Amount")}</th>
                      <th className="py-3 px-4">{t("invoices.status", "Status")}</th>
                      <th className="py-3 px-4 text-right">{t("common.actions", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {invoices.map((invoice) => (
                      <tr key={invoice._id} className="hover:bg-card/60 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-primary">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="py-4 px-4 font-bold text-foreground">
                          {invoice.clientInfo?.name ?? "Unknown client"}
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-foreground">
                          {formatCurrency(
                            invoice.calculations.total,
                            invoice.customization?.currency ?? "USD",
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={invoice.paymentStatus ?? invoice.status} />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full text-xs font-bold"
                              onClick={() => restoreMutation.mutate(invoice._id)}
                              disabled={
                                restoreMutation.isPending &&
                                restoreMutation.variables === invoice._id
                              }
                            >
                              {restoreMutation.isPending &&
                              restoreMutation.variables === invoice._id ? (
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                              )}
                              Restore
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="rounded-full text-xs font-bold"
                              onClick={() => void onDelete(invoice._id)}
                              disabled={
                                deleteMutation.isPending && deleteMutation.variables === invoice._id
                              }
                            >
                              {deleteMutation.isPending &&
                              deleteMutation.variables === invoice._id ? (
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                              )}
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={Boolean(deletingInvoiceId)}
        onClose={() => setDeletingInvoiceId(null)}
        onConfirm={() => deletingInvoiceId && deleteMutation.mutate(deletingInvoiceId)}
        isDeleting={deleteMutation.isPending}
        title="Delete Invoice Permanently?"
        description="Are you sure you want to permanently delete this invoice? This action cannot be undone."
      />

      <AppFooter />
    </div>
  );
}
