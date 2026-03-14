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
            className="font-pixel text-xl uppercase tracking-[0.05em] px-6 py-5 bg-primary text-primary-foreground border-4 border-border shadow-retro hover:shadow-retro-hover active:shadow-retro-active transition-all rounded-none"
            onClick={handleLogin}
            data-testid="login-btn"
          >
            LOGIN
          </Button>
        )}
      </div>
    </header>
  );
}
