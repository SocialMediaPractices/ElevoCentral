import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Programs from "@/pages/Programs";
import Staff from "@/pages/Staff";
import Students from "@/pages/Students";
import Events from "@/pages/Events";
import Clubs from "@/pages/Clubs";
import Messages from "@/pages/Messages";
import Parents from "@/pages/Parents";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import Homework from "@/pages/Homework";
import ParentDashboard from "@/pages/ParentDashboard";
import Layout from "@/components/layout/Layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/programs" component={Programs} />
      <Route path="/staff" component={Staff} />
      <Route path="/students" component={Students} />
      <Route path="/events" component={Events} />
      <Route path="/clubs" component={Clubs} />
      <Route path="/messages" component={Messages} />
      <Route path="/parents" component={Parents} />
      <Route path="/settings" component={Settings} />
      <Route path="/help" component={Help} />
      <Route path="/homework" component={Homework} />
      <Route path="/parent-dashboard" component={ParentDashboard} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Router />
      </Layout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
