"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FormField, FormRecord } from "@/lib/types";
import DynamicForm from "@/components/DynamicForm";
import { Skeleton } from "@/components/ui/skeleton";
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
        <div className="relative z-10 text-center px-6" data-testid="success-state">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-bounce">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-white/40 mb-8">
            Your response has been recorded successfully.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/dashboard/${formId}`}
              data-testid="view-results-link"
              className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-violet-500/30 text-white/70 hover:text-white px-6 py-2.5 rounded-xl text-sm transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Results
            </Link>
            <Link
              href="/"
              data-testid="create-new-link"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/25 transition-all duration-300"
            >
              Create New Form
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
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
