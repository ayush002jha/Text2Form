"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FormField, FormRecord } from "@/lib/types";
import DynamicForm from "@/components/DynamicForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function FormPage() {
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<FormRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchForm = async () => {
      const { data, error: fetchError } = await supabase
        .from("forms")
        .select("*")
        .eq("id", formId)
        .single();

      if (fetchError || !data) {
        setError("Form not found. It may have been deleted or the link is invalid.");
        setLoading(false);
        return;
      }

      setForm(data as FormRecord);
      setLoading(false);
    };

    fetchForm();
  }, [formId, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background relative flex flex-col items-center pt-24">
        {/* Grid overlay */}
        <div
          className="absolute inset-[0] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(var(--color-border) 2px, transparent 2px), linear-gradient(90deg, var(--color-border) 2px, transparent 2px)`,
            backgroundSize: "64px 64px",
            opacity: 0.08
          }}
        />
        <div className="relative z-10 w-full max-w-3xl px-6">
          <div className="mb-10 text-center flex flex-col items-center">
            <Skeleton className="h-6 w-32 bg-muted/20 border-4 border-border rounded-none mb-6" />
            <Skeleton className="h-12 w-3/4 bg-muted/20 border-4 border-border shadow-[4px_4px_0_var(--border)] rounded-none mb-4" />
            <Skeleton className="h-6 w-1/2 bg-muted/20 border-4 border-border rounded-none" />
            <Skeleton className="h-8 w-48 bg-muted/20 border-4 border-border shadow-retro rounded-none mt-6" />
          </div>
          <div className="bg-card border-4 border-border shadow-[12px_12px_0_var(--border)] p-6 md:p-10 space-y-10">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-8 w-1/2 bg-muted/20 border-4 border-border rounded-none mb-4 shadow-[2px_2px_0_var(--border)]" />
                <Skeleton className="h-14 w-full bg-muted/20 border-4 border-border rounded-none shadow-[inset_4px_4px_0_rgba(0,0,0,0.1)]" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error || !form) {
    return (
      <main className="min-h-screen bg-background relative flex items-center justify-center">
        {/* Grid overlay */}
        <div
          className="absolute inset-[0] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(var(--color-border) 2px, transparent 2px), linear-gradient(90deg, var(--color-border) 2px, transparent 2px)`,
            backgroundSize: "64px 64px",
            opacity: 0.08
          }}
        />
        <div className="relative z-10 text-center px-6">
          <div className="w-16 h-16 mx-auto mb-6 bg-destructive border-4 border-border shadow-retro flex items-center justify-center">
            <svg className="w-8 h-8 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p data-testid="form-error" className="font-pixel text-2xl uppercase tracking-widest text-foreground mb-6">{error || "Form not found"}</p>
          <Link
            href="/"
            data-testid="back-home-link"
            className="inline-block bg-primary text-primary-foreground border-4 border-border shadow-retro px-6 py-2 font-pixel text-xl uppercase tracking-wider hover:shadow-retro-hover active:shadow-retro-active transition-all"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-background relative flex items-center justify-center overflow-hidden">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(var(--color-border) 2px, transparent 2px), linear-gradient(90deg, var(--color-border) 2px, transparent 2px)`,
            backgroundSize: "64px 64px",
            opacity: 0.08
          }}
        />
        <div className="relative z-10 text-center px-6 max-w-lg w-full" data-testid="success-state">
          <div className="w-20 h-20 mx-auto mb-8 bg-accent border-4 border-border shadow-[4px_4px_0_var(--border)] flex items-center justify-center animate-bounce">
            <svg className="w-10 h-10 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-pixel text-4xl lg:text-5xl font-black text-foreground uppercase tracking-widest leading-[1.1] drop-shadow-[3px_3px_0_var(--color-border)] mb-4">Thank You!</h2>
          <p className="font-sans font-medium text-muted-foreground text-lg mb-8">
            Your response has been recorded successfully.
          </p>

          <div className="bg-card border-4 border-border shadow-[8px_8px_0px_var(--border)] p-8 mb-8">
            {form.user_id ? (
              <p className="font-sans font-medium text-foreground mb-8 text-lg border-y-4 border-dashed border-border/20 py-4">
                This form belongs to a registered user. You can view the results on your dashboard if you are the owner.
              </p>
            ) : (
              <div className="space-y-4 mb-8 border-y-4 border-dashed border-border/20 py-4">
                <p className="font-sans font-medium text-foreground">
                   <span className="font-pixel text-xl uppercase tracking-widest text-primary mr-2">Guest Form:</span> Sign in with Google to save this form to your account and manage it later. 
                </p>
                <p className="font-pixel text-sm uppercase text-muted-foreground tracking-widest">
                  Otherwise, save this page link manually!
                </p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {form.user_id ? (
                <Link
                  href="/dashboard"
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground border-4 border-border shadow-retro hover:shadow-retro-hover active:shadow-retro-active px-6 py-4 font-pixel text-xl uppercase tracking-wider transition-all"
                >
                  Go to My Forms
                </Link>
              ) : (
                <Button
                  onClick={() => {
                    supabase.auth.signInWithOAuth({
                      provider: "google",
                      options: {
                        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard&claim_id=${formId}`
                      }
                    });
                  }}
                  className="w-full h-16 inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground border-4 border-border shadow-retro hover:shadow-retro-hover active:shadow-retro-active px-6 py-4 font-pixel text-xl uppercase tracking-wider transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in to Save
                </Button>
              )}
              
              <div className="flex gap-4">
                <Link
                  href={`/dashboard/${formId}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground border-4 border-border shadow-[2px_2px_0_var(--border)] hover:translate-y-px hover:translate-x-px hover:shadow-[1px_1px_0_var(--border)] px-4 py-3 font-pixel text-lg uppercase transition-all"
                >
                  Live Results
                </Link>
                <Link
                  href="/"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-card text-foreground border-4 border-border shadow-[2px_2px_0_var(--border)] hover:translate-y-px hover:translate-x-px hover:shadow-[1px_1px_0_var(--border)] px-4 py-3 font-pixel text-lg uppercase transition-all"
                >
                  Create Another
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background relative">
      {/* Grid overlay */}
      <div
        className="absolute inset-[0] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--color-border) 2px, transparent 2px), linear-gradient(90deg, var(--color-border) 2px, transparent 2px)`,
          backgroundSize: "64px 64px",
          opacity: 0.08
        }}
      />

      {/* Form Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12 pb-24">
        <div className="mb-10 text-center">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="inline-flex items-center font-pixel text-lg uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors border-4 border-transparent hover:border-border hover:bg-card px-4 py-2">
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </Link>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="inline-flex items-center font-pixel text-lg uppercase tracking-widest bg-primary text-primary-foreground border-4 border-border shadow-[4px_4px_0_var(--border)] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_var(--border)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all px-4 py-2"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={4} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Share Link
                </>
              )}
            </button>
          </div>
          
          <h1 data-testid="form-title" className="text-4xl lg:text-5xl font-black font-pixel uppercase tracking-widest text-foreground drop-shadow-[4px_4px_0_var(--color-border)] mb-4">
            {form.title}
          </h1>
          {form.description && (
            <p data-testid="form-description" className="text-muted-foreground font-sans font-medium leading-relaxed max-w-2xl mx-auto border-y-4 border-dashed border-border/20 py-4">
              {form.description}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-6 text-foreground font-pixel text-lg uppercase tracking-widest">
            <span className="bg-secondary text-secondary-foreground border-4 border-border px-3 py-1 shadow-retro">{(form.schema as unknown as FormField[]).length} Questions</span>
            <span>
              {new Date(form.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="bg-card border-4 border-border shadow-[12px_12px_0px_var(--border)] p-6 md:p-10 mb-8 relative">
          <DynamicForm
            fields={form.schema as unknown as FormField[]}
            formId={form.id}
            onSubmitSuccess={() => setSubmitted(true)}
          />
        </div>
      </div>
    </main>
  );
}
