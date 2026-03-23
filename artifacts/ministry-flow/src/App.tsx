import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Inbox from "@/pages/inbox";
import DocumentList from "@/pages/documents/list";
import NewDocument from "@/pages/documents/new";
import DocumentDetail from "@/pages/documents/detail";
import AdminUsers from "@/pages/admin/users";
import AdminDepartments from "@/pages/admin/departments";
import AdminRoles from "@/pages/admin/roles";
import AdminWorkflow from "@/pages/admin/workflow";
import OutTray from "@/pages/out-tray";
import SearchFiles from "@/pages/search";
import Archive from "@/pages/archive";
import Profile from "@/pages/profile";
import AdminReports from "@/pages/admin/reports";
import AdminSettings from "@/pages/admin/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const [resource, config] = args;
  const token = localStorage.getItem("ministry_flow_token");
  if (token) {
    const newConfig = { ...config } as RequestInit;
    const headers = new Headers(newConfig.headers);
    headers.set("Authorization", `Bearer ${token}`);
    newConfig.headers = headers;
    return originalFetch(resource, newConfig);
  }
  return originalFetch(resource, config);
};

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/inbox" component={Inbox} />
      <Route path="/out-tray" component={OutTray} />
      <Route path="/search" component={SearchFiles} />
      <Route path="/archive" component={Archive} />
      <Route path="/profile" component={Profile} />
      <Route path="/documents" component={DocumentList} />
      <Route path="/documents/new" component={NewDocument} />
      <Route path="/documents/:id" component={DocumentDetail} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/roles" component={AdminRoles} />
      <Route path="/admin/workflow" component={AdminWorkflow} />
      <Route path="/admin/offices" component={AdminDepartments} />
      <Route path="/admin/reports" component={AdminReports} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
            <Toaster />
          </AuthProvider>
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
