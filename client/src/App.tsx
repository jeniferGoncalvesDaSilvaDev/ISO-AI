import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Onboarding from "@/pages/onboarding";
import DashboardIndex from "@/pages/dashboard/index";
import CompanyDashboard from "@/pages/dashboard/company";
import { AppSidebar } from "@/components/app-sidebar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      
      {/* Dashboard Routes wrapped in Sidebar layout */}
      <Route path="/dashboard*">
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-background overflow-hidden">
            <AppSidebar />
            <div className="flex flex-col flex-1 w-full relative">
              <header className="h-16 flex items-center px-4 border-b border-border/40 bg-background/95 backdrop-blur z-10">
                <SidebarTrigger className="hover:bg-muted" />
              </header>
              <main className="flex-1 overflow-auto bg-muted/10">
                <Switch>
                  <Route path="/dashboard" component={DashboardIndex} />
                  <Route path="/dashboard/company/:id" component={CompanyDashboard} />
                  <Route component={NotFound} />
                </Switch>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
