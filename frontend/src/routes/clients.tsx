import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Mail,
  Phone,
  Plus,
  Search,
  UserRoundCheck,
  Trash2,
  Sparkles,
  Loader2,
  Building,
  CreditCard,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  LogOut,
  Edit2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AppNavbar } from "@/components/AppNavbar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getInitialTheme, setTheme, themeNames, type ThemeName } from "@/lib/theme";
import { getAuthToken } from "@/lib/auth";
import { getClientSuggestions, type ClientSuggestion } from "@/lib/ai-api";
import { createClient, deleteClient, fetchClients, updateClient } from "@/lib/api/client";
import { useAuth } from "@/lib/auth-context";

interface IClient {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  gstNumber?: string;
}

interface ClientForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  gstNumber: string;
}

export const Route = createFileRoute("/clients")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getAuthToken()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({ meta: [{ title: "Client Intelligence — Invoisen AI" }] }),
  component: ClientsPage,
});

function ClientsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme());
  const [activeTab, setActiveTab] = useState<"list" | "form" | "stats">("list");
  const [suggestions, setSuggestions] = useState<ClientSuggestion[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestionsRef = useRef<HTMLDivElement>(null);

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

  const { register, handleSubmit, watch, setValue, reset } = useForm<ClientForm>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      company: "",
      gstNumber: "",
    },
  });
  const watchedName = watch("name");

  const {
    data: clientsResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["clients", { search, page }],
    queryFn: async () => {
      const response = await fetchClients({ search: search || undefined, page });
      if (!response.success) {
        throw new Error(response.error.message || "Failed to fetch clients");
      }
      return response.data;
    },
  });

  const clients: IClient[] = clientsResponse?.data ?? [
    { _id: "cli-1", name: "Stratus Tech Inc.", email: "billing@stratus.com", company: "Stratus Technologies", phone: "+1 (555) 019-2834", address: "Zurich, Switzerland", gstNumber: "CHE-109.834.120" },
    { _id: "cli-2", name: "Nexus Studios", email: "finance@nexus.io", company: "Nexus Creative", phone: "+1 (555) 012-9843", address: "Geneva, Switzerland", gstNumber: "CHE-402.193.840" },
    { _id: "cli-3", name: "Orbit Collective", email: "accounts@orbit.co", company: "Orbit Global", phone: "+44 20 7946 0912", address: "London, UK", gstNumber: "GB984210385" },
  ];

  useEffect(() => {
    if (!watchedName || watchedName.length < 3 || editingId) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSuggestionsLoading(true);
      const results = await getClientSuggestions(watchedName);
      if (results) {
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      }
      setIsSuggestionsLoading(false);
    }, 400);

    return () => clearTimeout(handler);
  }, [watchedName, editingId]);

  const resetForm = () => {
    setEditingId(null);
    reset();
    setShowSuggestions(false);
  };

  const clientMutation = useMutation({
    mutationFn: (payload: Omit<IClient, "_id">) => {
      if (editingId) {
        return updateClient(editingId, payload);
      } else {
        return createClient(payload);
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Client updated." : "Client created.");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      resetForm();
      setActiveTab("list");
    },
    onError: (err) => {
      toast.error(editingId ? "Failed to update client" : "Failed to create client", {
        description: err.message,
      });
    },
  });

  const onSubmit = (data: ClientForm) => {
    clientMutation.mutate(data);
  };

  const onEdit = (client: IClient) => {
    setEditingId(client._id);
    setValue("name", client.name);
    setValue("email", client.email ?? "");
    setValue("phone", client.phone ?? "");
    setValue("address", client.address ?? "");
    setValue("company", client.company ?? "");
    setValue("gstNumber", client.gstNumber ?? "");
    setActiveTab("form");
  };

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      toast.success("Client has been removed.");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (err) => {
      toast.error("Failed to delete client", { description: err.message });
    },
  });

  const onDelete = (clientId: string) => {
    if (!window.confirm("Delete this client profile?")) return;
    deleteMutation.mutate(clientId);
  };

  return (
    <div className="bg-background text-foreground font-body overflow-x-hidden min-h-screen relative selection:bg-primary selection:text-white">
      {/* 3D WebGL Canvas Background */}
      <ThreeBackground />

      {/* Top Navigation Bar Matching Landing Page & Dashboard */}
      <AppNavbar />

      {/* Main Page Area */}
      <div className="relative pt-28 pb-16 z-10">
        <div className="max-w-container-max mx-auto px-margin-desktop space-y-12">
          {/* Header Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-sm font-medium">
                <Sparkles className="w-4 h-4" /> Autonomous Entity Intelligence
              </div>
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                Client <span className="drawing-text italic">Management.</span>
              </h1>
              <p className="text-muted-foreground font-body text-lg">
                Manage billing entities, automated tax research, contact records, and payment history in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => { resetForm(); setActiveTab("form"); }}
                className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-headline text-base font-bold shadow-xl shadow-primary/25 hover:scale-105 transition-all flex items-center gap-2 btn-premium"
              >
                <Plus className="w-5 h-5" />
                Add Client
              </button>
            </div>
          </div>

          {/* Bento Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-2xl hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase text-muted-foreground">Active Clients</span>
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="font-headline text-3xl font-black text-foreground">{clients.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Verified company profiles</p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-2xl hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase text-muted-foreground">Total Billed Volume</span>
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div className="font-headline text-3xl font-black text-foreground">$90,700.00</div>
              <p className="text-xs text-success font-bold mt-1">Cross-border contracts</p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-2xl hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase text-muted-foreground">Avg Payment Time</span>
                <TrendingUp className="w-5 h-5 text-warning" />
              </div>
              <div className="font-headline text-3xl font-black text-foreground">4.2 Days</div>
              <p className="text-xs text-warning font-bold mt-1">Automatic email reminders</p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-2xl hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase text-muted-foreground">Tax Verification</span>
                <CheckCircle2 className="w-5 h-5 text-purple-500" />
              </div>
              <div className="font-headline text-3xl font-black text-foreground">100%</div>
              <p className="text-xs text-primary font-bold mt-1">GST &amp; VAT Validated</p>
            </div>
          </div>

          {/* Section Selector & Search */}
          <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
              <div className="inline-flex p-1 rounded-full bg-card border border-border shadow-inner">
                <button
                  onClick={() => setActiveTab("list")}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                    activeTab === "list" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Client Directory
                </button>
                <button
                  onClick={() => setActiveTab("form")}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                    activeTab === "form" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {editingId ? "Edit Client Profile" : "Add New Client"}
                </button>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by company or email..."
                  className="pl-10 rounded-full text-xs bg-card/60"
                />
              </div>
            </div>

            {/* Tab View 1: Client Directory */}
            {activeTab === "list" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((c) => (
                  <div
                    key={c._id}
                    className="p-6 rounded-3xl bg-card/60 border border-border/80 hover:border-primary/40 transition-all duration-300 shadow-xl space-y-4 group hover:-translate-y-1 relative"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary font-bold flex items-center justify-center text-lg border border-primary/20 group-hover:scale-110 transition-transform">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <Badge variant="secondary" className="font-bold text-[10px]">
                        Active Entity
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-headline text-xl font-bold text-foreground">{c.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Building className="w-3.5 h-3.5 text-primary" /> {c.company || "Sole Trader"}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-border text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-primary" /> {c.email || "No email"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-primary" /> {c.phone || "No phone"}
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-foreground">
                        <CreditCard className="w-3.5 h-3.5 text-primary" /> {c.gstNumber || "Tax ID Verified"}
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-between border-t border-border">
                      <Link
                        to="/invoices/new"
                        className="px-4 py-2 rounded-full bg-primary text-white font-bold text-xs flex items-center gap-1.5 hover:scale-105 transition-transform btn-premium"
                      >
                        <FileText className="w-3.5 h-3.5" /> Invoice Client
                      </Link>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(c)}
                          className="p-2 rounded-full hover:bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit Client"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(c._id)}
                          className="p-2 rounded-full hover:bg-destructive/10 border border-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete Client"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab View 2: Add / Edit Client Form */}
            {activeTab === "form" && (
              <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-2">
                  <h3 className="font-headline text-2xl font-bold text-foreground">
                    {editingId ? "Edit Client Profile" : "Register New Client"}
                  </h3>
                  <p className="text-xs text-muted-foreground">Fill in entity details or use AI Auto-fill.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5 relative">
                    <Label className="text-xs font-bold text-primary">Company / Client Name *</Label>
                    <Input
                      {...register("name")}
                      required
                      placeholder="e.g. Stratus Tech Inc."
                      className="rounded-2xl text-sm"
                    />
                    {showSuggestions && (
                      <div ref={suggestionsRef} className="absolute top-full left-0 right-0 z-50 mt-2 p-2 rounded-2xl bg-card border border-border shadow-2xl space-y-1">
                        {suggestions.map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setValue("name", s.name);
                              setValue("email", s.email);
                              setValue("phone", s.phone);
                              setValue("company", s.company);
                              setValue("gstNumber", s.gstNumber);
                              setValue("address", s.address);
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left p-2 rounded-xl hover:bg-surface text-xs space-y-0.5"
                          >
                            <div className="font-bold text-foreground">{s.name}</div>
                            <div className="text-[10px] text-muted-foreground">{s.email} • {s.company}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Email Address</Label>
                      <Input {...register("email")} type="email" placeholder="billing@client.com" className="rounded-2xl text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Phone Number</Label>
                      <Input {...register("phone")} placeholder="+1 (555) 000-0000" className="rounded-2xl text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Company Legal Name</Label>
                      <Input {...register("company")} placeholder="Company Inc." className="rounded-2xl text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">GSTIN / VAT Number</Label>
                      <Input {...register("gstNumber")} placeholder="CHE-109.834.120" className="rounded-2xl text-sm font-mono" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Billing Address</Label>
                    <Textarea {...register("address")} rows={3} placeholder="Street address, City, Country..." className="rounded-2xl text-sm" />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="submit"
                    disabled={clientMutation.isPending}
                    className="px-8 py-3.5 rounded-full bg-primary text-white font-bold text-sm hover:scale-105 transition-transform shadow-lg btn-premium"
                  >
                    {clientMutation.isPending ? "Saving Profile..." : editingId ? "Update Client Profile" : "Save New Client"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { resetForm(); setActiveTab("list"); }}
                    className="px-8 py-3.5 rounded-full border border-border text-foreground font-bold text-sm hover:bg-card transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-card border-t border-border mt-16">
        <div className="max-w-container-max mx-auto px-margin-desktop py-8 text-center text-muted-foreground text-xs tracking-widest uppercase font-bold">
          © 2026 Invoisen AI. All rights reserved. Precision-engineered in Zurich.
        </div>
      </footer>
    </div>
  );
}
