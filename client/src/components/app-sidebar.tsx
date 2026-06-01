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
  Building2,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  Shield,
  Factory,
  BookOpen,
  Library,
  Gavel,
  GraduationCap,
  UserCheck,
  Receipt,
  Presentation,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Tableau de bord", url: "/", icon: LayoutDashboard },
  { title: "Entreprises", url: "/companies", icon: Building2 },
  { title: "Evaluations", url: "/assessments", icon: ClipboardCheck },
  { title: "Bons de commande", url: "/orders", icon: Receipt },
  { title: "Secteurs OIRA", url: "/sectors", icon: Factory },
  { title: "Familles de risques", url: "/risks", icon: AlertTriangle },
  { title: "Base de connaissances", url: "/prevention", icon: Library },
  { title: "TutoPrev' Pedagogie", url: "/tutoprev-pedagogie", icon: GraduationCap },
  { title: "TutoPrev' Accueil", url: "/tutoprev-accueil", icon: UserCheck },
  { title: "Methodologie DUERP", url: "/methodology", icon: BookOpen },
  { title: "Risques employeur", url: "/employer-risks", icon: Gavel },
  { title: "Presentation DUERP", url: "/presentation", icon: Presentation },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer" data-testid="link-home">
            <div className="w-10 h-10 rounded-lg bg-[hsl(0,72%,42%)] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-sidebar-foreground leading-tight">
                Satis Consulting
              </h1>
              <p className="text-[10px] text-sidebar-foreground/50 leading-tight mt-0.5">
                DUERP & Prevention
              </p>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase text-[10px] tracking-widest font-semibold">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url ||
                  (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-active={isActive}
                      className="data-[active=true]:bg-sidebar-accent"
                    >
                      <Link href={item.url} data-testid={`nav-${item.url.replace(/\//g, '') || 'home'}`}>
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

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase text-[10px] tracking-widest font-semibold">
            Ressources
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="https://www.inrs.fr/metiers/oira-outil-tpe.html" target="_blank" rel="noopener noreferrer" data-testid="link-oira">
                    <FileText className="w-4 h-4" />
                    <span>INRS / OiRA</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 border-t border-sidebar-border space-y-2">
        <div className="text-xs text-sidebar-foreground/60 text-center">
          <span className="font-medium">{user?.fullName || user?.username}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/60"
          onClick={() => logout.mutate()}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Deconnexion
        </Button>
        <p className="text-[9px] text-sidebar-foreground/30 text-center leading-tight">
          Conforme INRS ED 840 / OiRA
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
