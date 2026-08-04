import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  X,
  Command,
  FileText,
  Users,
  Layers,
  PlusCircle,
  Package,
  Sparkles,
  LayoutDashboard,
  BarChart3,
  CreditCard,
  Settings,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fetchInvoices, type IInvoice } from "@/lib/api/invoice";
import { fetchClients, type ClientRecord } from "@/lib/api/client";
import { getCurrencySymbol } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface NavbarSearchDropdownProps {
  scrolled: boolean;
  bgClass: string;
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

export function NavbarSearchDropdown({ scrolled, bgClass }: NavbarSearchDropdownProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          if (next) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
          return next;
        });
      } else if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const { data: invoicesData } = useQuery({
    queryKey: ["navbarSearchInvoices", query],
    queryFn: () => fetchInvoices({ search: query }),
    enabled: isOpen && query.trim().length > 0,
    staleTime: 1000 * 5,
  });

  const { data: clientsData } = useQuery({
    queryKey: ["navbarSearchClients", query],
    queryFn: () => fetchClients({ search: query }),
    enabled: isOpen && query.trim().length > 0,
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

  const matchingTemplates = query.trim()
    ? templateCatalog.filter(
      (t) =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.category.toLowerCase().includes(query.toLowerCase()),
    )
    : [];

  const handleSelect = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Search Input Bar */}
      <div className="relative flex items-center w-full">
        <Search className="absolute left-3.5 w-4 h-4 text-primary shrink-0 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Search invoices, clients, and templates"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={scrolled ? "" : t("common.searchPlaceholder", "Search invoices...")}
          className={`w-full pl-9 pr-16 sm:pr-20 rounded-full border transition-all duration-300 outline-none text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none shadow-inner truncate ${scrolled ? "h-8.5 text-[11px]" : "h-10"
            } ${bgClass}`}
        />
        {query ? (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded-full hover:bg-muted/60"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="absolute right-3 inline-flex items-center gap-0.5 px-2 py-1 rounded-full bg-muted/80 text-foreground border border-border/80 shadow-xs pointer-events-none transition-all">
            <Command className="w-3.5 h-3.5 text-foreground/80" />
            <span className="text-[10px] text-muted-foreground font-extrabold font-mono px-0.5">+</span>
            <span className="font-headline font-black text-xs text-foreground tracking-tight">K</span>
          </kbd>
        )}
      </div>

      {/* Floating Dropdown Card Directly Below Search Bar */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-2xl border border-border/80 rounded-2xl shadow-2xl overflow-hidden z-50 p-3 max-h-[420px] overflow-y-auto space-y-3 text-left animate-in fade-in slide-in-from-top-2 duration-200">
          {/* 1. Dynamic Matching Invoices */}
          {query.trim() && matchingInvoices.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                Matching Invoices
              </div>
              {matchingInvoices.slice(0, 4).map((inv) => (
                <div
                  key={inv._id}
                  onClick={() =>
                    handleSelect(() =>
                      navigate({ to: "/invoices/$invoiceId", params: { invoiceId: inv._id } }),
                    )
                  }
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-foreground flex items-center gap-2">
                        <span>{inv.invoiceNumber}</span>
                        <Badge variant="secondary" className="text-[9px] capitalize py-0 px-1.5">
                          {inv.paymentStatus || inv.status}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {inv.clientInfo?.name || "Unassigned Client"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-xs text-primary">
                    {getCurrencySymbol(inv.customization?.currency || "USD")}
                    {(inv.calculations?.total || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. Dynamic Matching Clients */}
          {query.trim() && matchingClients.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                Matching Clients
              </div>
              {matchingClients.slice(0, 4).map((client) => (
                <div
                  key={client._id}
                  onClick={() => handleSelect(() => navigate({ to: "/clients" }))}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-foreground">{client.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {client.email || client.company || "Client Profile"}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-primary" />
                </div>
              ))}
            </div>
          )}

          {/* 3. Dynamic Matching Templates */}
          {query.trim() && matchingTemplates.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                Matching Templates
              </div>
              {matchingTemplates.slice(0, 4).map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() =>
                    handleSelect(() =>
                      navigate({ to: "/invoices/new", search: { template: tpl.id } }),
                    )
                  }
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-foreground">{tpl.name}</div>
                      <div className="text-[11px] text-muted-foreground">{tpl.category}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-bold text-primary border-primary/30">
                    Use Layout
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* 4. Quick Actions */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
              Quick Actions
            </div>
            <div
              onClick={() => handleSelect(() => navigate({ to: "/invoices/new" }))}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/80 cursor-pointer transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <PlusCircle className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-xs text-foreground">Create New Invoice</span>
            </div>

            <div
              onClick={() => handleSelect(() => navigate({ to: "/clients" }))}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/80 cursor-pointer transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-xs text-foreground">Add New Client</span>
            </div>

            <div
              onClick={() => handleSelect(() => navigate({ to: "/products" }))}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/80 cursor-pointer transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Package className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-xs text-foreground">Products &amp; Services Catalog</span>
            </div>

            <div
              onClick={() => handleSelect(() => navigate({ to: "/ai" }))}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/80 cursor-pointer transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-xs text-foreground">AI Financial Assistant</span>
            </div>
          </div>

          {/* 5. Quick Navigation */}
          <div className="pt-2 border-t border-border/60 space-y-1">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
              Navigation
            </div>
            <div
              onClick={() => handleSelect(() => navigate({ to: "/dashboard" }))}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/80 cursor-pointer text-xs text-foreground/80 hover:text-foreground"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Dashboard Workspace</span>
            </div>
            <div
              onClick={() => handleSelect(() => navigate({ to: "/invoices" }))}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/80 cursor-pointer text-xs text-foreground/80 hover:text-foreground"
            >
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Invoices &amp; Drafts Ledger</span>
            </div>
            <div
              onClick={() => handleSelect(() => navigate({ to: "/reports" }))}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/80 cursor-pointer text-xs text-foreground/80 hover:text-foreground"
            >
              <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Reports &amp; Financial Analytics</span>
            </div>
            <div
              onClick={() => handleSelect(() => navigate({ to: "/settings" }))}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/80 cursor-pointer text-xs text-foreground/80 hover:text-foreground"
            >
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Settings &amp; Workspace Preferences</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
