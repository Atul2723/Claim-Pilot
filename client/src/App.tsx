import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/Sidebar";
import NotFound from "@/pages/not-found";

// Pages
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import MyExpenses from "@/pages/MyExpenses";
import SubmitClaim from "@/pages/SubmitClaim";
import Approvals from "@/pages/Approvals";
import Companies from "@/pages/Companies";
import Users from "@/pages/Users";
import Reports from "@/pages/Reports";

// Protected Layout
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 lg:pl-64 h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Not logged in -> Landing page
  if (!user) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={() => {
          // Redirect any other route to landing
          window.location.href = "/";
          return null;
        }} />
      </Switch>
    );
  }

  // Logged in -> App
  return (
    <AuthenticatedLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/my-expenses" component={MyExpenses} />
        <Route path="/submit" component={SubmitClaim} />
        <Route path="/approvals" component={Approvals} />
        <Route path="/reports" component={Reports} />
        <Route path="/companies" component={Companies} />
        <Route path="/users" component={Users} />
        <Route path="/ledger" component={Ledger} />
        <Route component={NotFound} />
      </Switch>
    </AuthenticatedLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
