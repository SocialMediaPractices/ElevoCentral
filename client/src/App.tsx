import { Switch, Route, useLocation, Redirect } from "wouter";
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
import RosterImport from "@/pages/RosterImport";
import ParentDashboard from "@/pages/ParentDashboard";
import Login from "@/pages/Login";
import Layout from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";

// Define interface for the userData response
interface UserData {
  user?: {
    id: number;
    username: string;
    fullName: string;
    role: string;
    profileImageUrl?: string | null;
  };
}

// Protected route component
function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: any) {
  const [location, navigate] = useLocation();
  const { data: userData, isLoading } = useQuery<UserData, Error, UserData, [string]>({
    queryKey: ['/api/auth/user'],
    queryFn: async ({ queryKey }) => {
      return await apiRequest({ url: '/api/auth/user', on401: 'returnNull' });
    },
  });

  // While checking auth status, show a detailed loading spinner
  if (isLoading) {
    console.log("Auth check in progress...");
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-lg text-gray-600">Checking authentication status...</p>
        <p className="text-sm text-gray-400 mt-2">If this screen persists, please try refreshing the page.</p>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!userData?.user) {
    return <Redirect to="/login" />;
  }
  
  // If admin-only route but user is not admin
  if (adminOnly && userData.user.role !== 'admin') {
    return <Redirect to="/" />;
  }
  
  // User is authenticated, render the component
  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        {(params) => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/programs">
        {(params) => <ProtectedRoute component={Programs} />}
      </Route>
      <Route path="/staff">
        {(params) => <ProtectedRoute component={Staff} />}
      </Route>
      <Route path="/students">
        {(params) => <ProtectedRoute component={Students} />}
      </Route>
      <Route path="/events">
        {(params) => <ProtectedRoute component={Events} />}
      </Route>
      <Route path="/clubs">
        {(params) => <ProtectedRoute component={Clubs} />}
      </Route>
      <Route path="/messages">
        {(params) => <ProtectedRoute component={Messages} />}
      </Route>
      <Route path="/parents">
        {(params) => <ProtectedRoute component={Parents} />}
      </Route>
      <Route path="/settings">
        {(params) => <ProtectedRoute component={Settings} />}
      </Route>
      <Route path="/help">
        {(params) => <ProtectedRoute component={Help} />}
      </Route>
      <Route path="/homework">
        {(params) => <ProtectedRoute component={Homework} />}
      </Route>
      <Route path="/parent-dashboard">
        {(params) => <ProtectedRoute component={ParentDashboard} />}
      </Route>
      <Route path="/roster-import">
        {(params) => <ProtectedRoute component={RosterImport} adminOnly={false} />}
      </Route>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  // Paths that should not use the Layout component
  const noLayoutPaths = ["/login"];
  const shouldUseLayout = !noLayoutPaths.includes(location);

  return (
    <QueryClientProvider client={queryClient}>
      {shouldUseLayout ? (
        <Layout>
          <Router />
        </Layout>
      ) : (
        <Router />
      )}
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
