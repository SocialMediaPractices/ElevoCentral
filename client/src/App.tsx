import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";

// Simplified App component for debugging
function App() {
  console.log("App component rendering");
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    console.log("App mounted, setting isLoaded to true");
    setIsLoaded(true);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
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
            <div className="mt-4 flex flex-col space-y-2">
              <a 
                href="/login" 
                className="px-4 py-2 text-center bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go to Login
              </a>
              <a 
                href="/" 
                className="px-4 py-2 text-center bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={(e) => {
                  e.preventDefault();
                  alert("App is working!");
                  return false;
                }}
              >
                Test Alert
              </a>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;