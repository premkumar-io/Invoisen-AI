import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Package,
  Plus,
  Search,
  Tag,
  DollarSign,
  Star,
  Edit2,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AppNavbar } from "@/components/AppNavbar";
import { ThreeBackground } from "@/components/ThreeBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
});

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: "Development" | "Design" | "Consulting" | "Retainer" | "Software";
  price: number;
  unit: "hour" | "project" | "month" | "item";
  taxRate: number;
  favorite?: boolean;
}

const initialProducts: ProductItem[] = [
  {
    id: "prod-1",
    sku: "DEV-AI-SYS",
    name: "Autonomous AI Architecture Design",
    description: "Custom neural network pipeline setup, vector embeddings & API integration.",
    category: "Development",
    price: 3500.0,
    unit: "project",
    taxRate: 8.1,
    favorite: true,
  },
  {
    id: "prod-2",
    sku: "DES-SWISS-UI",
    name: "Swiss-Style Design System & UI Tokens",
    description: "Full Figma component library, design tokens, micro-interactions & style guide.",
    category: "Design",
    price: 1750.0,
    unit: "project",
    taxRate: 8.1,
    favorite: true,
  },
  {
    id: "prod-3",
    sku: "CONS-SAAS-HOURLY",
    name: "Senior SaaS Architecture Consulting",
    description:
      "1-on-1 strategic technical advisory on scalability, database optimization & security.",
    category: "Consulting",
    price: 250.0,
    unit: "hour",
    taxRate: 7.7,
    favorite: false,
  },
  {
    id: "prod-4",
    sku: "RET-MONTHLY-OPS",
    name: "Monthly AI Maintenance & Ops Retainer",
    description: "24/7 uptime monitoring, vector model retuning, and priority hotfix support.",
    category: "Retainer",
    price: 4900.0,
    unit: "month",
    taxRate: 8.1,
    favorite: true,
  },
];

function ProductsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductItem["category"]>("Development");
  const [price, setPrice] = useState("250");
  const [unit, setUnit] = useState<ProductItem["unit"]>("project");
  const [taxRate, setTaxRate] = useState("8.1");

  const categories = ["All", "Development", "Design", "Consulting", "Retainer", "Software"];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProd: ProductItem = {
      id: `prod-${Date.now()}`,
      sku: sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      description,
      category,
      price: parseFloat(price) || 0,
      unit,
      taxRate: parseFloat(taxRate) || 0,
      favorite: false,
    };

    setProducts([newProd, ...products]);
    setIsAddOpen(false);
    // Reset form
    setName("");
    setSku("");
    setDescription("");
  };

  return (
    <div className="bg-background text-foreground font-body min-h-screen relative selection:bg-primary selection:text-white flex flex-col justify-between">
      <ThreeBackground />
      <AppNavbar />

      <main className="relative pt-28 pb-16 z-10 max-w-container-max mx-auto px-margin-desktop w-full space-y-8 flex-1">
        {/* Top Header Banner */}
        <div className="glass-card p-8 rounded-3xl border border-border/80 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Reusable Billing Catalog
            </div>
            <h1 className="font-headline text-3xl md:text-5xl font-black text-foreground tracking-tight">
              {t("products.title", "Catalog & Services")}
            </h1>
            <p className="text-muted-foreground font-body text-sm md:text-base mt-2 max-w-xl">
              {t("products.subtitle", "Maintain reusable products, services, and default pricing items to populate invoices with 1-click.")}
            </p>
          </div>

          <Button
            onClick={() => setIsAddOpen(true)}
            id="add-product-btn"
            data-testid="add-product-btn"
            className="rounded-2xl px-6 py-6 font-headline font-extrabold text-sm bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white shadow-xl shadow-primary/25 hover:scale-105 transition-all btn-premium cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("products.addProduct", "Add Item")}
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-card p-5 rounded-2xl border border-border/70 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Catalog Items
            </span>
            <div className="font-headline text-2xl font-black text-foreground">
              {products.length}
            </div>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-border/70 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Favorites Presets
            </span>
            <div className="font-headline text-2xl font-black text-primary">
              {products.filter((p) => p.favorite).length}
            </div>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-border/70 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Average Rate
            </span>
            <div className="font-headline text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ${(products.reduce((acc, p) => acc + p.price, 0) / (products.length || 1)).toFixed(2)}
            </div>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-border/70 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Default Tax Rate
            </span>
            <div className="font-headline text-2xl font-black text-purple-600 dark:text-purple-400">
              8.1%
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="product-search-input"
              data-testid="product-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("products.search", "Search catalog items...")}
              className="pl-10 rounded-2xl border-border/80 bg-card/60 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-card/80 text-muted-foreground hover:text-foreground border border-border/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((item) => (
            <div
              key={item.id}
              className="glass-card p-6 rounded-3xl border border-border/80 shadow-xl space-y-4 hover:border-primary/50 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1 min-w-0">
                    <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-0.5 rounded-md bg-muted/80">
                      {item.sku}
                    </span>
                    <h3 className="font-headline font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className={`p-1.5 rounded-full transition-all ${
                      item.favorite
                        ? "text-amber-500 bg-amber-500/10"
                        : "text-muted-foreground hover:text-amber-500 hover:bg-muted"
                    }`}
                    title="Toggle Favorite"
                  >
                    <Star className={`w-4 h-4 ${item.favorite ? "fill-amber-500" : ""}`} />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Rate per {item.unit}
                  </span>
                  <div className="font-headline text-xl font-extrabold text-foreground">
                    ${item.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate({
                        to: "/invoices/new",
                      })
                    }
                    className="rounded-xl text-xs font-bold text-primary border-primary/30 hover:bg-primary/10"
                  >
                    Use in Invoice
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>

                  <button
                    onClick={() => deleteProduct(item.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete Preset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Product Modal */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-md p-6 rounded-3xl border border-border/80 shadow-2xl backdrop-blur-2xl">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="font-headline text-xl font-bold text-foreground">
                Add Catalog Preset Item
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Save a product or service preset for 1-click reuse across all invoices.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddProduct} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Item Name
                </label>
                <Input
                  id="product-name-input"
                  data-testid="product-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AI Architecture Sprint"
                  required
                  className="rounded-xl border-border/80 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    SKU Code
                  </label>
                  <Input
                    id="product-sku-input"
                    data-testid="product-sku-input"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. DEV-AI-01"
                    className="rounded-xl border-border/80 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Price ($)
                  </label>
                  <Input
                    id="product-price-input"
                    data-testid="product-price-input"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="250"
                    required
                    className="rounded-xl border-border/80 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Billing Unit
                  </label>
                  <Select value={unit} onValueChange={(val) => setUnit(val as ProductItem["unit"])}>
                    <SelectTrigger className="w-full rounded-xl border border-border/80 bg-card/60 px-3 py-2 text-xs font-semibold text-foreground h-9 shadow-sm">
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl">
                      <SelectItem value="project" className="text-xs font-semibold py-2 cursor-pointer">per project</SelectItem>
                      <SelectItem value="hour" className="text-xs font-semibold py-2 cursor-pointer">per hour</SelectItem>
                      <SelectItem value="month" className="text-xs font-semibold py-2 cursor-pointer">per month</SelectItem>
                      <SelectItem value="item" className="text-xs font-semibold py-2 cursor-pointer">per item</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Swiss Tax Rate (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    placeholder="8.1"
                    className="rounded-xl border-border/80 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Description
                </label>
                <textarea
                  id="product-desc-input"
                  data-testid="product-desc-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed breakdown for Swiss invoice line item..."
                  rows={3}
                  className="w-full rounded-xl border border-border/80 bg-card/60 p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>

              <Button
                type="submit"
                id="product-save-btn"
                data-testid="product-save-btn"
                className="w-full rounded-xl font-headline font-bold text-xs bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/20"
              >
                Save Catalog Item
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
