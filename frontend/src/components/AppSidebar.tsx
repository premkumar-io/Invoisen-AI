import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  LifeBuoy,
  Plus,
  Trash2,
  LogOut,
  Package,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";

const items = [
  { key: "nav.dashboard", defaultTitle: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { key: "nav.invoices", defaultTitle: "Invoices", url: "/invoices", icon: FileText },
  { key: "nav.clients", defaultTitle: "Clients", url: "/clients", icon: Users },
  { key: "nav.products", defaultTitle: "Catalog", url: "/products", icon: Package },
  { key: "nav.reports", defaultTitle: "Reports", url: "/reports", icon: BarChart3 },
  { key: "nav.trash", defaultTitle: "Trash", url: "/trash", icon: Trash2 },
];

const secondary = [
  { key: "nav.settings", defaultTitle: "Settings", url: "/settings", icon: Settings },
  { key: "nav.support", defaultTitle: "Support", url: "/support", icon: LifeBuoy },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) =>
    url === "/invoices" ? pathname.startsWith("/invoices") : pathname === url;
  const initials = user?.fullName?.charAt(0).toUpperCase() || "U";
  const planLabel = user?.plan
    ? `${user.plan[0]?.toUpperCase() ?? ""}${user.plan.slice(1)} Plan`
    : "Workspace";

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.error("Logout failed", error); // Optional: handle logout error
    } finally {
      await logout(); // This clears local storage
      await navigate({ to: "/login" });
    }
  };

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="p-4">
        <Logo subtitle={planLabel} to={user ? "/dashboard" : "/"} />
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <Button asChild className="mb-4 w-full justify-center gap-2 rounded-xl font-semibold">
              <Link to="/invoices/new">
                <Plus className="h-4 w-4" /> {t("nav.createNew", "Create New")}
              </Link>
            </Button>
            <SidebarMenu className="gap-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="rounded-xl py-5 font-medium transition-all duration-200 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-md data-[active=true]:shadow-primary/20"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{t(item.key, item.defaultTitle)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 p-4">
        <SidebarMenu className="gap-1">
          {secondary.map((item) => (
            <SidebarMenuItem key={item.key}>
              <SidebarMenuButton asChild className="rounded-xl font-medium text-muted-foreground">
                <Link to={item.url}>
                  <item.icon className="h-5 w-5" />
                  <span>{t(item.key, item.defaultTitle)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <Link
          to="/settings"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-md shadow-primary/10 transition-all duration-200 overflow-hidden shrink-0">
            {(() => {
              let localAvatar: string | null = null;
              if (typeof window !== "undefined" && user?._id) {
                try {
                  localAvatar = localStorage.getItem(`invoisen_user_avatar_${user._id}`);
                } catch {}
              }
              const displayAvatar = user?.avatar || localAvatar;
              return displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={user?.fullName || "Avatar"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                initials
              );
            })()}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-foreground">
              {user?.fullName ?? "My Profile"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email ?? "Open profile settings"}
            </p>
          </div>
        </Link>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center gap-2 rounded-xl font-semibold"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" /> {t("nav.logout", "Log out")}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
