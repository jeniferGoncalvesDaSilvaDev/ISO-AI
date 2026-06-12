import { Switch, Route, Redirect } from "wouter";
import { Component, ReactNode } from "react";
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

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("React Error Boundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <div className="max-w-md text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Algo deu errado</h2>
            <p className="text-muted-foreground text-sm">{this.state.message}</p>
            <button
              onClick={() => { this.setState({ hasError: false, message: "" }); window.location.reload(); }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function DashboardLayout({ children }: { children: ReactNode }) {
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
