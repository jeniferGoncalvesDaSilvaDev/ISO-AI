import { Building2, FileText, Home, LayoutDashboard, LogOut, PlusCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useCompanies } from "@/hooks/use-companies";
import { useQueryClient } from "@tanstack/react-query";

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { data: companies } = useCompanies();
  const { toggleSidebar, isMobile } = useSidebar();
  const queryClient = useQueryClient();

  const handleNavClick = () => {
    if (isMobile) toggleSidebar();
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    queryClient.clear();
    setLocation("/auth");
  };

  const userEmail = localStorage.getItem("userEmail") || "";

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border/50">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-sidebar-primary-foreground tracking-tight" onClick={handleNavClick}>
          <div className="bg-sidebar-primary p-1.5 rounded-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          ISO<span className="text-sidebar-primary">Genius</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase text-xs tracking-wider">Plataforma</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/dashboard"}>
                  <Link href="/dashboard" onClick={handleNavClick}>
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Painel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/onboarding"}>
                  <Link href="/onboarding" onClick={handleNavClick}>
                    <PlusCircle className="w-4 h-4" />
                    <span>Nova Empresa</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {companies && companies.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase text-xs tracking-wider">Suas Empresas</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {companies.map((company) => (
                  <SidebarMenuItem key={company.id}>
                    <SidebarMenuButton asChild isActive={location === `/dashboard/company/${company.id}`}>
                      <Link href={`/dashboard/company/${company.id}`} onClick={handleNavClick}>
                        <FileText className="w-4 h-4" />
                        <span className="truncate">{company.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer w-full">
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
