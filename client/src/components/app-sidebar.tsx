import { Building2, FileText, Home, LayoutDashboard, PlusCircle, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
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

export function AppSidebar() {
  const [location] = useLocation();
  const { data: companies } = useCompanies();
  const { toggleSidebar, isMobile } = useSidebar();

  const handleNavClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border/50">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-sidebar-primary-foreground tracking-tight" onClick={handleNavClick}>
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
                <SidebarMenuButton asChild isActive={location === "/"}>
                  <Link href="/" onClick={handleNavClick}>
                    <Home className="w-4 h-4" />
                    <span>Início</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/dashboard/list"}>
                  <Link href="/dashboard/list" onClick={handleNavClick}>
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
    </Sidebar>
  );
}
