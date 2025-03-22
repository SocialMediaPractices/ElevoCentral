import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import { Route, Switch } from "wouter";

// Simplified App component for debugging
function App() {
  console.log("App component rendering - DEBUG VERSION");
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());
  
  useEffect(() => {
    console.log("App mounted, setting isLoaded to true");
    setIsLoaded(true);
    
    // Create a timer to see if the component is alive
    const interval = setInterval(() => {
      console.log("Timer tick at", new Date().toISOString());
      setCurrentTime(new Date().toISOString());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/">
          <div className="p-8 max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="p-8">
                <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Debugging Page</div>
                <p className="mt-2 text-slate-500">
                  This is a simplified version of the app to diagnose rendering issues.
                </p>
                <p className="mt-2 text-green-500 font-bold">
                  Component loaded state: {isLoaded ? "LOADED" : "LOADING"}
                </p>
                <p className="mt-2 text-blue-500">
                  Current time: {currentTime}
                </p>
                <div className="mt-4 flex flex-col space-y-2">
                  <a 
                    href="/login" 
                    className="px-4 py-2 text-center bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Go to Login
                  </a>
                  <button 
                    className="px-4 py-2 text-center bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    onClick={() => {
                      alert("App is working! Current time: " + new Date().toISOString());
                    }}
                  >
                    Test Alert
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Route>
        <Route path="/login">
          <div className="p-8 max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="p-8">
                <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Login Page</div>
                <p className="mt-2 text-slate-500">
                  This is a simplified login page.
                </p>
                <div className="mt-4 flex flex-col space-y-2">
                  <a 
                    href="/" 
                    className="px-4 py-2 text-center bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Back to Home
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Route>
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;