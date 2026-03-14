"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FormField, FormRecord } from "@/lib/types";
import DynamicForm from "@/components/DynamicForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FormPage() {
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<FormRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
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
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-full max-w-2xl px-6 space-y-4">
          <Skeleton className="h-8 w-3/4 bg-white/5" />
          <Skeleton className="h-4 w-1/2 bg-white/5" />
          <div className="space-y-4 mt-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error || !form) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-rose-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p data-testid="form-error" className="text-white/60 mb-6">{error || "Form not found"}</p>
          <Link
            href="/"
            data-testid="back-home-link"
            className="text-violet-400 hover:text-violet-300 text-sm underline underline-offset-4"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[128px]" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-lg" data-testid="success-state">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-bounce">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-white/40 mb-8">
            Your response has been recorded successfully.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            {form.user_id ? (
              <p className="text-sm text-white/60 mb-6">
                This form belongs to a registered user. You can view the results on your dashboard if you are the owner.
              </p>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-white/60">
                   <span className="text-violet-400 font-semibold">Guest Form:</span> Sign in with Google to save this form to your account and manage it later. 
                </p>
                <p className="text-xs text-white/30 italic">
                  Otherwise, make sure to save this page link manually to see responses later!
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-6">
              {form.user_id ? (
                <Link
                  href="/dashboard"
                  className="w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-violet-500/20"
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
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in to Save this Form
                </Button>
              )}
              
              <div className="flex gap-3">
                <Link
                  href={`/dashboard/${formId}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-violet-500/30 text-white/70 hover:text-white px-4 py-2.5 rounded-xl text-sm transition-all duration-300"
                >
                  View Live Results
                </Link>
                <Link
                  href="/"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-violet-500/30 text-white/70 hover:text-white px-4 py-2.5 rounded-xl text-sm transition-all duration-300"
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
    <main className="min-h-screen bg-[#0a0a0f] relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[128px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-fuchsia-600/8 rounded-full blur-[128px]" />
      </div>

      {/* Form Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12 pb-20">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-white/40 hover:text-white/80 transition-colors mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 data-testid="form-title" className="text-3xl lg:text-4xl font-bold text-white mb-3">
            {form.title}
          </h1>
          {form.description && (
            <p data-testid="form-description" className="text-white/40 leading-relaxed">
              {form.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-4 text-white/20 text-xs">
            <span>{(form.schema as unknown as FormField[]).length} questions</span>
            <span>·</span>
            <span>
              Created{" "}
              {new Date(form.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <DynamicForm
          fields={form.schema as unknown as FormField[]}
          formId={form.id}
          onSubmitSuccess={() => setSubmitted(true)}
        />
      </div>
    </main>
  );
}
