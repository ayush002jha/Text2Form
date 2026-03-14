"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      router.push(`/f/${data.formId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-fuchsia-600/15 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span data-testid="app-logo" className="text-white font-bold text-xl tracking-tight">
            Text2Form<span className="text-violet-400">.</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <Button
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => router.push('/dashboard')}
              data-testid="my-forms-btn"
            >
              My Forms
            </Button>
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

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 pb-32 lg:pt-24">
        {/* Badge */}
        <div
          data-testid="hero-badge"
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/60 text-sm">Powered by Gemini AI</span>
        </div>

        {/* Title */}
        <h1 className="text-center max-w-4xl mb-6">
          <span className="block text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
            Build Forms with
          </span>
          <span className="block text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent mt-2">
            AI Superpowers
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-white/40 text-lg lg:text-xl max-w-2xl text-center mb-12 leading-relaxed">
          Describe your form or quiz in plain English. Our AI builds it instantly
          — shareable, submittable, and analytics-ready.
        </p>

        {/* Form Generation Input */}
        <div className="w-full max-w-2xl">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/50 to-fuchsia-600/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/[0.05] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <Textarea
                data-testid="prompt-input"
                placeholder='Try: "Create a 5-question math quiz for grade 8" or "Build a customer feedback form for a restaurant"'
                value={prompt}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                rows={4}
                className="w-full bg-transparent border-0 text-white placeholder:text-white/20 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base leading-relaxed p-0"
              />

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-white/20 text-xs">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>AI-generated in seconds</span>
                </div>

                <Button
                  data-testid="generate-button"
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold px-8 h-10 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Generate Form
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div
              data-testid="generation-error"
              className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm"
            >
              {error}
            </div>
          )}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 max-w-4xl w-full">
          {[
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: "AI-Powered",
              desc: "Describe in plain English, get a professional form in seconds",
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              ),
              title: "Shareable Links",
              desc: "Every form gets a unique link anyone can fill out",
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: "Live Analytics",
              desc: "Track responses with real-time charts and data tables",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              data-testid={`feature-card-${idx}`}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-violet-500/20 hover:bg-white/[0.05] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4 group-hover:bg-violet-500/20 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/30 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
