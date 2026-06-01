import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Companies from "@/pages/companies";
import CompanyDetail from "@/pages/company-detail";
import CompanyForm from "@/pages/company-form";
import Assessments from "@/pages/assessments";
import AssessmentDetail from "@/pages/assessment-detail";
import AssessmentWorkflow from "@/pages/assessment-workflow";
import Sectors from "@/pages/sectors";
import SectorDetail from "@/pages/sector-detail";
import Risks from "@/pages/risks";
import Methodology from "@/pages/methodology";
import PreventionResources from "@/pages/prevention-resources";
import EmployerRisks from "@/pages/employer-risks";
import TutoprevPedagogie from "@/pages/tutoprev-pedagogie";
import TutoprevAccueil from "@/pages/tutoprev-accueil";
import Orders from "@/pages/orders";
import OrderForm from "@/pages/order-form";
import OrderDetail from "@/pages/order-detail";
import InvoiceDetail from "@/pages/invoice-detail";
import PresentationDUERP from "@/pages/presentation-duerp";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/admin-users";
import AdminResults from "@/pages/admin-results";
import AdminGeography from "@/pages/admin-geography";

function CommercialRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/companies" component={Companies} />
      <Route path="/companies/new" component={CompanyForm} />
      <Route path="/companies/:id/edit" component={CompanyForm} />
      <Route path="/companies/:id" component={CompanyDetail} />
      <Route path="/assessments" component={Assessments} />
      <Route path="/assessments/new/:companyId" component={AssessmentWorkflow} />
      <Route path="/assessments/:id/workflow" component={AssessmentWorkflow} />
      <Route path="/assessments/:id" component={AssessmentDetail} />
      <Route path="/sectors" component={Sectors} />
      <Route path="/sectors/:id" component={SectorDetail} />
      <Route path="/risks" component={Risks} />
      <Route path="/prevention" component={PreventionResources} />
      <Route path="/methodology" component={Methodology} />
      <Route path="/employer-risks" component={EmployerRisks} />
      <Route path="/tutoprev-pedagogie" component={TutoprevPedagogie} />
      <Route path="/tutoprev-accueil" component={TutoprevAccueil} />
      <Route path="/orders" component={Orders} />
      <Route path="/orders/new" component={OrderForm} />
      <Route path="/orders/new/:companyId" component={OrderForm} />
      <Route path="/orders/:id/edit" component={OrderForm} />
      <Route path="/orders/:id" component={OrderDetail} />
      <Route path="/invoices/:id" component={InvoiceDetail} />
      <Route path="/presentation" component={PresentationDUERP} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AdminRouter() {
  return (
    <Switch>
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/results" component={AdminResults} />
      <Route path="/admin/geography" component={AdminGeography} />
      <Route component={NotFound} />
    </Switch>
  );
}

function CommercialLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 flex items-center justify-between h-12 px-3 bg-background/80 backdrop-blur border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>
          <CommercialRouter />
        </main>
      </div>
    </SidebarProvider>
  );
}

function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 flex items-center justify-between h-12 px-3 bg-background/80 backdrop-blur border-b">
            <SidebarTrigger data-testid="button-admin-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>
          <AdminRouter />
        </main>
      </div>
    </SidebarProvider>
  );
}

function AuthenticatedApp() {
  const { isAdmin } = useAuth();
  const [location] = useLocation();

  if (isAdmin) {
    if (!location.startsWith("/admin")) {
      return <Redirect to="/admin" />;
    }
    return <AdminLayout />;
  }

  return <CommercialLayout />;
}

function App() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <AuthenticatedApp />;
}

function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <App />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default AppWrapper;
