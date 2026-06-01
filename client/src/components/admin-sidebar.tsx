import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  MapPin,
  Shield,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const adminMenuItems = [
  { title: "Tableau de bord", url: "/admin", icon: LayoutDashboard },
  { title: "Commerciaux", url: "/admin/users", icon: Users },
  { title: "Resultats par commercial", url: "/admin/results", icon: BarChart3 },
  { title: "Repartition geographique", url: "/admin/geography", icon: MapPin },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/admin">
          <div className="flex items-center gap-3 cursor-pointer" data-testid="link-admin-home">
            <div className="w-10 h-10 rounded-lg bg-[hsl(220,60%,30%)] flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-sidebar-foreground leading-tight">
                Administration
              </h1>
              <p className="text-[10px] text-sidebar-foreground/50 leading-tight mt-0.5">
                Satis Consulting
              </p>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase text-[10px] tracking-widest font-semibold">
            Gestion
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => {
                const isActive = location === item.url ||
                  (item.url !== "/admin" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-active={isActive}
                      className="data-[active=true]:bg-sidebar-accent"
                    >
                      <Link href={item.url} data-testid={`nav-admin-${item.url.replace(/\/admin\/?/, '') || 'home'}`}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 border-t border-sidebar-border space-y-2">
        <div className="text-xs text-sidebar-foreground/60 text-center">
          <span className="font-medium">{user?.fullName}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/60"
          onClick={() => logout.mutate()}
          data-testid="button-admin-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Deconnexion
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
