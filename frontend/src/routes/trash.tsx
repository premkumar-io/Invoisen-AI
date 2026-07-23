import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RotateCcw, Trash2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
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
  const invoices: IInvoice[] = invoicesResponse?.data ?? [];

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

  const deleteMutation = useMutation({
    mutationFn: permanentDeleteInvoice,
    onSuccess: () => {
      toast.success("Invoice permanently deleted.");
      queryClient.invalidateQueries({ queryKey: ["invoices", { trash: true }] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: (err) => {
      toast.error("Failed to delete invoice", { description: err.message });
    },
  });

  const onDelete = async (invoiceId: string) => {
    if (!window.confirm("Delete this invoice permanently?")) return;
    deleteMutation.mutate(invoiceId);
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
              Trashed <span className="drawing-text italic">Invoices.</span>
            </h1>
            <p className="text-muted-foreground text-base">
              Deleted invoices stay in this vault before permanent removal.
            </p>
          </div>

          {isError ? (
            <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive font-bold">
              {error.message}
            </p>
          ) : null}

          <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading trashed invoices…</p>
            ) : !invoices.length ? (
              <p className="text-sm text-muted-foreground">No invoices in trash.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-180 text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
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
                                restoreMutation.isPending && restoreMutation.variables === invoice._id
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
                              {deleteMutation.isPending && deleteMutation.variables === invoice._id ? (
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

      <footer className="w-full bg-card border-t border-border mt-16">
        <div className="max-w-container-max mx-auto px-margin-desktop py-8 text-center text-muted-foreground text-xs tracking-widest uppercase font-bold">
          © 2026 Invoisen AI. All rights reserved. Precision-engineered in Zurich.
        </div>
      </footer>
    </div>
  );
}
