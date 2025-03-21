import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Lock, LogIn, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, navigate] = useLocation();
  
  // Define the type for our user data
  interface UserData {
    user?: {
      id: number;
      username: string;
      fullName: string;
      role: string;
      profileImageUrl?: string | null;
    };
  }
  
  // Check if user is already logged in
  const { data: userData, isLoading: checkingAuth } = useQuery<UserData, Error, UserData, [string]>({
    queryKey: ['/api/auth/user'],
    queryFn: async ({ queryKey }) => {
      const response = await apiRequest({ url: '/api/auth/user', on401: 'returnNull' });
      return response as UserData;
    },
  });
  
  // If user is already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (userData?.user) {
      if (userData.user.role === "parent") {
        navigate("/parent-dashboard");
      } else {
        navigate("/");
      }
    }
  }, [userData, navigate]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include" // Important for cookie-based auth
      });
      
      const responseData = await response.json();
      
      if (response.ok && responseData.success) {
        // Invalidate any cached user data
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        
        toast({
          title: "Login successful",
          description: "You have been logged in successfully.",
        });
        
        // Redirect based on user role
        if (responseData.user.role === "parent") {
          navigate("/parent-dashboard");
        } else {
          navigate("/");
        }
      } else {
        setError(responseData.message || "Invalid username or password");
        toast({
          title: "Login failed",
          description: responseData.message || "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
      toast({
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // If checking auth status, show a loading spinner
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-2">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Elevo Learning</CardTitle>
          <CardDescription className="text-md">
            Secure access to the after-school management platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          placeholder="Enter your username" 
                          className="pl-10" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          type="password" 
                          placeholder="Enter your password" 
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" /> Login
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-500 p-2 border border-gray-200 rounded-lg bg-gray-50">
            <p className="font-medium text-gray-700 mb-1">For demo purposes:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-1 bg-blue-50 rounded">
                <span className="font-semibold">Parent:</span> parent1 / password
              </div>
              <div className="p-1 bg-green-50 rounded">
                <span className="font-semibold">Staff:</span> staff1 / password
              </div>
            </div>
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">
            Secure access to protect student, parent, and staff information
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}