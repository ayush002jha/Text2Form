"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
      }
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12 py-5 bg-background border-b-4 border-border shadow-sm">
      <Link href="/" className="flex items-center gap-2 group hover:scale-105 transition-transform">
        {/* Pixel Art Logo block */}
        <div className="w-10 h-10 bg-primary border-4 border-border shadow-retro flex flex-col items-center justify-center gap-1">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-border" />
            <div className="w-1.5 h-1.5 bg-border" />
            <div className="w-1.5 h-1.5 bg-border" />
          </div>
          <div className="flex gap-1 w-full px-1.5">
            <div className="flex-1 h-1.5 bg-background" />
          </div>
        </div>
        
        {/* Retro Header Text */}
        <div className="flex items-baseline ml-2">
          <span className="font-pixel text-4xl font-bold text-foreground uppercase pt-1 tracking-[0.1em]">Text<span className="text-secondary tracking-normal mx-1">-</span>2<span className="text-secondary tracking-normal mx-1">-</span>Form</span>
        </div>
      </Link>
      
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="font-pixel text-xl uppercase tracking-[0.05em] bg-card text-card-foreground border-4 border-border shadow-retro hover:shadow-retro-hover active:shadow-retro-active transition-all hidden sm:flex h-10 px-4 rounded-none"
              onClick={() => router.push('/dashboard')}
              data-testid="my-forms-btn"
            >
              My Forms
            </Button>
            <div className="flex items-center gap-3 pl-0 sm:pl-4 sm:border-l-4 border-border/20 text-foreground">
              {user.user_metadata?.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-10 h-10 rounded-none border-4 border-border shadow-retro" />
              ) : (
                <div className="w-10 h-10 bg-secondary border-4 border-border shadow-retro flex items-center justify-center text-secondary-foreground font-pixel text-xl uppercase">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <span className="text-sm font-bold font-sans uppercase hidden md:block">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                className="w-10 h-10 rounded-none bg-destructive border-4 border-border hover:bg-destructive/80 text-background shadow-retro hover:shadow-retro-hover active:shadow-retro-active transition-all ml-1" 
                onClick={handleSignOut}
                title="Sign Out"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </Button>
            </div>
          </div>
        ) : (
          <Button
            className="font-pixel text-xl uppercase tracking-[0.05em] px-6 py-5 bg-primary text-primary-foreground border-4 border-border shadow-retro hover:shadow-retro-hover active:shadow-retro-active transition-all rounded-none flex items-center gap-3"
            onClick={handleLogin}
            data-testid="login-btn"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            LOGIN
          </Button>
        )}
      </div>
    </header>
  );
}
