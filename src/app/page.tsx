"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, LogIn, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticateEmail, authenticateDevice } from "@/lib/nakama-client"; // Assuming device auth for Steam for now

// Steam icon SVG
const SteamIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M0 11.98C0 5.941 4.405 1.09 10.224 0L10.4 2.66c-4.308.533-7.627 3.88-7.627 8.198 0 4.184 3.013 7.673 7.044 8.335L9.6 24c-5.94-.836-9.6-5.76-9.6-12.02zM12.76.35L12.637 0c-.004 0-.008.002-.012.002C6.48-.075 2.002 4.84 2.002 11.213c0 6.578 4.683 11.98 10.412 11.98 6.074 0 10.986-5.03 10.986-11.214C23.4 5.42 19.235.868 13.43.36l.175 2.735c3.59.467 6.215 3.33 6.215 6.988 0 3.91-3.172 7.09-7.088 7.09s-7.088-3.18-7.088-7.09c0-3.554 2.51-6.49 5.928-7.03L12.76.35z"/>
    <path d="M18.012 10.19c.56 0 1.014.455 1.014 1.015 0 .56-.455 1.015-1.015 1.015s-1.015-.456-1.015-1.015c0-.56.456-1.015 1.015-1.015zm-1.78-.507c.262-.454.063-.99-.392-1.25-.453-.264-1.01-.06-1.25.39-.26.455-.062 1.012.393 1.253.454.262.99.063 1.25-.392zm-1.25-2.165c.438-.312.54-.906.228-1.345-.31-.437-.905-.538-1.344-.227-.438.312-.54.906-.228 1.345.312.437.905.54 1.344.228zm-1.036-2.42c.55-.072.955-.587.883-1.136-.072-.55-.586-.955-1.135-.883-.55.07-.955.585-.883 1.135.07.55.585.955 1.135.883z"/>
  </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Using email for "System ID / Email" field
      await authenticateEmail(email, password, true); // true to create user if not exists
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSteamLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // For a real Steam login, you'd get a Steam auth token from the Steam client/SDK
      // and pass it to Nakama's authenticateSteam method.
      // For this example, we'll use device ID auth as a placeholder.
      // A unique device ID should be generated and stored consistently.
      let deviceId = localStorage.getItem("gamerhub_device_id");
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem("gamerhub_device_id", deviceId);
      }
      await authenticateDevice(deviceId, true, `SteamUser_${deviceId.substring(0,6)}`);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Steam login placeholder failed:", err);
      setError(err.message || "Steam login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-6">
            <Logo size={48} />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to GamerHub</CardTitle>
          <CardDescription>Sign in to access your gaming world.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">System ID / Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your ID or email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && email ? <LogIn className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
              Login with System ID
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleSteamLogin} disabled={isLoading}>
            {isLoading && !email ? <SteamIcon /> : <SteamIcon /> }
            <span className="ml-2">Login with Steam</span>
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
          <p className="text-muted-foreground">
            Don&apos;t have an account? <Link href="#" className="font-medium text-primary hover:underline">Sign up</Link>
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            By signing in, you agree to our Terms of Service.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
