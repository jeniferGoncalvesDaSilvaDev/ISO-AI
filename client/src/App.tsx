import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Onboarding from "@/pages/onboarding";
import AuthPage from "@/pages/auth";
import DashboardIndex from "@/pages/dashboard/index";
import CompanyDashboard from "@/pages/dashboard/company";
import { AppSidebar } from "@/components/app-sidebar";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 w-full relative">
          <header className="h-16 flex items-center px-4 border-b border-border/40 bg-background/95 backdrop-blur z-10">
            <SidebarTrigger className="hover:bg-muted" />
          </header>
          <main className="flex-1 overflow-auto bg-muted/10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const userId = localStorage.getItem("userId");
  if (!userId) return <Redirect to="/auth" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/onboarding">
        {() => {
          if (!localStorage.getItem("userId")) return <Redirect to="/auth" />;
          return (
            <DashboardLayout>
              <Onboarding />
            </DashboardLayout>
          );
        }}
      </Route>

      <Route path="/dashboard">
        {() => {
          if (!localStorage.getItem("userId")) return <Redirect to="/auth" />;
          return (
            <DashboardLayout>
              <DashboardIndex />
            </DashboardLayout>
          );
        }}
      </Route>

      <Route path="/dashboard/company/:id">
        {() => {
          if (!localStorage.getItem("userId")) return <Redirect to="/auth" />;
          return (
            <DashboardLayout>
              <CompanyDashboard />
            </DashboardLayout>
          );
        }}
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
