import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

// Simplified App component for debugging
function App() {
  console.log("App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-8 max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Debugging Page</div>
            <p className="mt-2 text-slate-500">
              This is a simplified version of the app to diagnose rendering issues.
            </p>
            <div className="mt-4">
              <a 
                href="/login" 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go to Login
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