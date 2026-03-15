"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const claimId = searchParams.get("claim_id");
  const supabase = createClient();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const validateEmail = (email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}${claimId ? `&claim_id=${claimId}` : ""}`,
          },
        });
        if (error) throw error;
        
        // If session is present immediately (auto-confirm enabled)
        if (data?.session) {
          if (claimId && data.user) {
            await supabase
              .from("forms")
              .update({ user_id: data.user.id })
              .eq("id", claimId)
              .is("user_id", null);
          }
        }
        
        toast.success("Account created successfully!");
        router.push(next);
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // If there's a claimId, attempt to claim it now
        if (claimId && data.user) {
          await supabase
            .from("forms")
            .update({ user_id: data.user.id })
            .eq("id", claimId)
            .is("user_id", null);
          
          toast.success("Login successful! Form claimed.");
        } else {
          toast.success("Login successful!");
        }
        
        router.push(next);
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error instanceof Error ? error.message : (error as any)?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const redirectTo = `${window.location.origin}/auth/callback?next=${next}${claimId ? `&claim_id=${claimId}` : ""}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center font-pixel text-lg uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8 group">
          <svg className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </Link>

        <Card className="border-4 border-border shadow-[12px_12px_0px_var(--border)] rounded-none bg-card">
          <CardHeader className="space-y-1 pb-6 border-b-4 border-border">
            <CardTitle className="font-pixel text-4xl uppercase tracking-[0.1em] text-center">
              {isSignUp ? "Create Account" : "Access Vault"}
            </CardTitle>
            <p className="text-center text-muted-foreground font-sans text-sm tracking-wide">
              {isSignUp ? "Initialize your neural profile" : "Verify your identity credentials"}
            </p>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-pixel text-lg uppercase tracking-widest">Email Address</Label>
                <Input
                  id="email"
                  data-testid="email-input"
                  type="email"
                  placeholder="user@network.net"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-4 border-border rounded-none bg-background focus-visible:ring-0 focus-visible:border-primary transition-colors font-sans"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-pixel text-lg uppercase tracking-widest">Password</Label>
                <Input
                  id="password"
                  data-testid="password-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 border-4 border-border rounded-none bg-background focus-visible:ring-0 focus-visible:border-primary transition-colors font-sans"
                />
              </div>
              <Button
                data-testid="email-auth-submit"
                type="submit"
                disabled={loading}
                className="w-full h-14 font-pixel text-xl uppercase tracking-widest bg-primary text-primary-foreground border-4 border-border shadow-retro hover:shadow-retro-hover active:shadow-retro-active transition-all rounded-none mt-2"
              >
                {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full border-t-4 border-border/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-4 font-pixel text-muted-foreground tracking-widest text-sm">Or compute with</span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-14 font-pixel text-xl uppercase tracking-widest bg-card border-4 border-border shadow-retro hover:shadow-retro-hover active:shadow-retro-active transition-all rounded-none flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-pixel text-lg uppercase tracking-widest text-secondary hover:text-secondary/80 underline underline-offset-8 decoration-4 transition-colors"
              >
                {isSignUp ? "Already have access? Sign In" : "Need credentials? Sign Up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-pixel text-4xl uppercase animate-pulse">Loading Identity Matrix...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
