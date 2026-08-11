import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Users,
  LayoutDashboard,
  BarChart3,
  CreditCard,
  Settings,
  Shield,
  Sparkles,
  PlusCircle,
  Package,
  HelpCircle,
  Palette,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { fetchInvoices, type IInvoice } from "@/lib/api/invoice";
import { fetchClients, type ClientRecord } from "@/lib/api/client";
import { getCurrencySymbol } from "@/lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleTheme?: () => void;
  onOpenHelp?: () => void;
}

const templateCatalog = [
  { id: "modern", name: "Zurich Modern", category: "Tech & Startups" },
  { id: "stripe", name: "Stripe SaaS Minimal", category: "Tech & Startups" },
  { id: "linear", name: "Linear Dark Mono", category: "Tech & Startups" },
  { id: "minimal", name: "Basel Minimal", category: "Swiss Minimal" },
  { id: "apple", name: "Apple Cupertino Luxe", category: "Swiss Minimal" },
  { id: "nordic", name: "Nordic Frost Minimal", category: "Swiss Minimal" },
  { id: "professional", name: "Geneva Corporate", category: "Corporate Enterprise" },
  { id: "corporate", name: "Zurich Financial", category: "Corporate Enterprise" },
  { id: "elegant", name: "Swiss Deluxe Luxe", category: "Luxury Deluxe" },
  { id: "emerald", name: "Emerald Mint", category: "Luxury Deluxe" },
  { id: "cyber", name: "Obsidian Web3", category: "Web3 & Cyber" },
  { id: "brutalist", name: "Studio Neo-Brutalist", category: "Web3 & Cyber" },
];

export function CommandPalette({
  open,
  onOpenChange,
  onToggleTheme,
  onOpenHelp,
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const { data: invoicesData } = useQuery({
    queryKey: ["commandInvoices", searchQuery],
    queryFn: () => fetchInvoices({ search: searchQuery }),
    enabled: open && searchQuery.trim().length > 0,
    staleTime: 1000 * 5,
  });

  const { data: clientsData } = useQuery({
    queryKey: ["commandClients", searchQuery],
    queryFn: () => fetchClients({ search: searchQuery }),
    enabled: open && searchQuery.trim().length > 0,
    staleTime: 1000 * 5,
  });

  const matchingInvoices: IInvoice[] = Array.isArray(invoicesData?.data)
    ? invoicesData!.data
    : Array.isArray(invoicesData)
    ? (invoicesData as any)
    : [];

  const matchingClients: ClientRecord[] = Array.isArray((clientsData as any)?.data)
    ? (clientsData as any).data
    : Array.isArray(clientsData)
    ? (clientsData as any)
    : [];

  const matchingTemplates = searchQuery.trim()
    ? templateCatalog.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const runCommand = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        value={searchQuery}
        onValueChange={setSearchQuery}
        placeholder="Search invoices, clients, templates..."
      />
      <CommandList className="max-h-[420px] p-2 overflow-y-auto">
        <CommandEmpty className="py-8 text-center text-sm text-muted-foreground space-y-1">
          <p className="font-bold text-foreground">No matching records found</p>
          <p className="text-xs">Try searching by client name, invoice number, or template category.</p>
        </CommandEmpty>

        {matchingInvoices.length > 0 && (
          <CommandGroup heading="Matching Invoices">
            {matchingInvoices.slice(0, 4).map((inv) => (
              <CommandItem
                key={inv._id}
                value={`Invoice ${inv.invoiceNumber} ${inv.clientInfo?.name || ""}`}
                onSelect={() =>
                  runCommand(() =>
                    navigate({ to: "/invoices/$invoiceId", params: { invoiceId: inv._id } }),
                  )
                }
                className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-accent"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground flex items-center gap-2">
                      <span>{inv.invoiceNumber}</span>
                      <Badge variant="secondary" className="text-[10px] capitalize py-0 px-2">
                        {inv.paymentStatus || inv.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {inv.clientInfo?.name || "Unassigned Client"}
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono font-extrabold text-sm text-primary">
                  {getCurrencySymbol(inv.customization?.currency || "USD")}
                  {(inv.calculations?.total || 0).toLocaleString()}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {matchingClients.length > 0 && (
          <CommandGroup heading="Matching Clients">
            {matchingClients.slice(0, 4).map((client) => (
              <CommandItem
                key={client._id}
                value={`Client ${client.name} ${client.email} ${client.company || ""}`}
                onSelect={() => runCommand(() => navigate({ to: "/clients" }))}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-accent"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{client.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {client.email || client.company || "Client Profile"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-primary font-bold">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {matchingTemplates.length > 0 && (
          <CommandGroup heading="Invoice Templates">
            {matchingTemplates.slice(0, 4).map((tpl) => (
              <CommandItem
                key={tpl.id}
                value={`Template ${tpl.name} ${tpl.category}`}
                onSelect={() =>
                  runCommand(() =>
                    navigate({
                      to: "/invoices/new",
                      search: { template: tpl.id },
                    }),
                  )
                }
                className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-accent"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{tpl.name}</div>
                    <div className="text-xs text-muted-foreground">{tpl.category}</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold border-primary/40 text-primary">
                  Use Layout
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {(matchingInvoices.length > 0 || matchingClients.length > 0 || matchingTemplates.length > 0) && (
          <CommandSeparator className="my-1 border-t border-border/60" />
        )}

        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/invoices/new" }))}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-accent"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm">Create New Invoice</span>
            <CommandShortcut className="text-xs">⌘N</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/clients" }))}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-accent"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm">Add New Client</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/products" }))}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-accent"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm">Products & Services Catalog</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/ai" }))}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-accent"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm">AI Financial Assistant</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-1 border-t border-border/60" />

        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/dashboard" }))}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:bg-accent"
          >
            <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
            <span>Dashboard</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/invoices" }))}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:bg-accent"
          >
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span>Invoices & Drafts</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/clients" }))}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:bg-accent"
          >
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>Client Management</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/reports" }))}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:bg-accent"
          >
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span>Reports & Tax Analytics</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/billing" }))}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:bg-accent"
          >
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span>Billing & Subscription</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/settings" }))}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:bg-accent"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span>Settings & Preferences</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/admin" }))}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:bg-accent"
          >
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span>Admin Console</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-1 border-t border-border/60" />

        <CommandGroup heading="System & Help">
          {onToggleTheme && (
            <CommandItem
              onSelect={() => runCommand(onToggleTheme)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:bg-accent"
            >
              <Palette className="w-4 h-4 text-muted-foreground" />
              <span>Switch Theme (Light / Dark / Purple AI)</span>
              <CommandShortcut className="text-xs">⌘T</CommandShortcut>
            </CommandItem>
          )}

          {onOpenHelp && (
            <CommandItem
              onSelect={() => runCommand(onOpenHelp)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:bg-accent"
            >
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
              <span>Help Center & Support Docs</span>
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
