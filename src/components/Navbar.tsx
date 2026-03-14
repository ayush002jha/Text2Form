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
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-all duration-300">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span data-testid="app-logo" className="text-white font-bold text-xl tracking-tight group-hover:text-white/90 transition-colors">
          Text2Form<span className="text-violet-400">.</span>
        </span>
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
