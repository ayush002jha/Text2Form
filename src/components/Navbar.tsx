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
    <header className="relative z-50 flex items-center justify-between px-6 lg:px-12 py-6 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
      <Link href="/" className="flex items-center gap-3 group">
        <svg width="180" height="40" viewBox="0 0 320 72" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
          <defs>
            <linearGradient id="t2fGradientNavbar" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#7C3AED"/>
              <stop offset="100%" stop-color="#A855F7"/>
            </linearGradient>
          </defs>
          <g transform="translate(8,8)">
            <rect width="56" height="56" rx="16" fill="url(#t2fGradientNavbar)"/>
            <rect x="14" y="18" width="26" height="4" rx="2" fill="white"/>
            <rect x="14" y="28" width="20" height="4" rx="2" fill="white" opacity="0.9"/>
            <rect x="14" y="38" width="16" height="4" rx="2" fill="white" opacity="0.8"/>
            <circle cx="40" cy="20" r="4" fill="white"/>
          </g>
          <text x="80" y="45" font-family="Inter, system-ui, sans-serif" font-size="32" font-weight="600" fill="#E5E7EB">Text</text>
          <text x="150" y="45" font-family="Inter, system-ui, sans-serif" font-size="32" font-weight="700" fill="#A855F7">2</text>
          <text x="170" y="45" font-family="Inter, system-ui, sans-serif" font-size="32" font-weight="600" fill="#E5E7EB">Form</text>
        </svg>
      </Link>
      
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10 hidden sm:flex"
              onClick={() => router.push('/dashboard')}
              data-testid="my-forms-btn"
            >
              My Forms
            </Button>
            <div className="flex items-center gap-3 pl-0 sm:pl-4 sm:border-l border-white/10 text-white/80">
              {user.user_metadata?.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-8 h-8 rounded-full border border-white/20" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center border border-white/20 text-sm font-medium">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="text-sm font-medium hidden md:block">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-2 hover:bg-rose-500/20 text-white/50 hover:text-rose-400 transition-colors ml-1" 
                onClick={handleSignOut}
                title="Sign Out"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
            onClick={handleLogin}
            data-testid="login-btn"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Login
          </Button>
        )}
      </div>
    </header>
  );
}
