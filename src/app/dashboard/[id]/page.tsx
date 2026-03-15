"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FormField, FormRecord, SubmissionRecord } from "@/lib/types";
import SubmissionsTable from "@/components/SubmissionsTable";
import AnalyticsChart from "@/components/AnalyticsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function DashboardPage() {
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<FormRecord | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Get current user session
      const { data: { user } } = await supabase.auth.getUser();
      
      // First fetch form details
      const { data: formRes, error: formError } = await supabase
        .from("forms")
        .select("*")
        .eq("id", formId)
        .single();
        
      if (formError || !formRes) {
        setLoading(false);
        return;
      }
      
      const formRecord = formRes as FormRecord;
      setForm(formRecord);

      // Check access: If form is owned by someone, current user must be that someone
      if (formRecord.user_id && (!user || formRecord.user_id !== user.id)) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      // Try fetching submissions - RLS will also double-protect this
      const { data: subsRes } = await supabase
        .from("submissions")
        .select("*")
        .eq("form_id", formId)
        .order("submitted_at", { ascending: false });

      if (subsRes) {
        setSubmissions(subsRes as SubmissionRecord[]);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [formId, supabase]);

  const chartData = useMemo(() => {
    if (!form || submissions.length === 0) return [];

    const fields = form.schema as unknown as FormField[];
    // Find the first radio/select/checkbox field for chart
    const chartField = fields.find((f) =>
      ["radio", "select", "checkbox"].includes(f.type)
    );

    if (!chartField) return [];

    const counts: Record<string, number> = {};
    chartField.options?.forEach((opt) => (counts[opt] = 0));

    submissions.forEach((sub) => {
      const answer = sub.answers[chartField.id];
      if (Array.isArray(answer)) {
        answer.forEach((a) => {
          counts[a] = (counts[a] || 0) + 1;
        });
      } else if (typeof answer === "string" && answer) {
        counts[answer] = (counts[answer] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [form, submissions]);

  const chartFieldLabel = useMemo(() => {
    if (!form) return "";
    const fields = form.schema as unknown as FormField[];
    const chartField = fields.find((f) =>
      ["radio", "select", "checkbox"].includes(f.type)
    );
    return chartField?.label || "";
  }, [form]);

  const copyFormLink = async () => {
    const link = `${window.location.origin}/f/${formId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen relative p-6 lg:p-12">
        <div className="relative z-10 max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 bg-muted/20 border-4 border-border rounded-none shadow-[4px_4px_0_var(--border)] mb-4" />
          <Skeleton className="h-6 w-96 bg-muted/20 border-4 border-border rounded-none shadow-[2px_2px_0_var(--border)] mb-12" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 bg-muted/20 border-4 border-border rounded-none shadow-[8px_8px_0_var(--border)]" />
            ))}
          </div>
          <Skeleton className="h-96 bg-muted/20 border-4 border-border rounded-none shadow-[12px_12px_0_var(--border)] mb-12" />
        </div>
      </main>
    );
  }

  if (accessDenied || !form) {
    return (
      <main className="min-h-screen relative flex items-center justify-center">
        <div className="relative z-10 text-center px-6">
          <div className="w-20 h-20 mx-auto mb-8 bg-destructive border-4 border-border shadow-[8px_8px_0_var(--border)] flex items-center justify-center">
            <svg className="w-10 h-10 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 
            data-testid="access-denied-heading"
            className="font-pixel text-4xl uppercase tracking-widest text-foreground font-bold mb-4">{!form ? 'Form Not Found' : 'Access Denied'}</h2>
          <p className="font-sans font-medium text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            {!form ? 'This form may have been deleted.' : 'Only the creator of this form can view its dashboard and submissions.'}
          </p>
          <Link
            href="/"
            className="inline-block bg-primary text-primary-foreground border-4 border-border shadow-retro px-8 py-3 font-pixel text-xl uppercase tracking-wider hover:shadow-retro-hover active:shadow-retro-active transition-all"
          >
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  const fields = form.schema as unknown as FormField[];

  return (
    <main className="min-h-screen relative">

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 pb-20 mt-8">
        {/* Title section */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-12 gap-6 border-b-4 border-border pb-6">
          <div>
            <h1
              data-testid="dashboard-title"
              className="text-4xl lg:text-5xl font-pixel font-bold text-foreground mb-3 uppercase drop-shadow-[2px_2px_0_var(--color-border)] tracking-widest line-clamp-1"
            >
              {form.title}
            </h1>
            <p className="text-muted-foreground font-sans font-medium line-clamp-2 max-w-2xl">{form.description}</p>
          </div>
          <div className="flex gap-4 shrink-0 flex-wrap lg:flex-nowrap justify-end">
            <Link
              href={`/dashboard/${formId}/edit`}
              className="inline-flex items-center gap-2 bg-muted/10 text-muted-foreground border-4 border-border shadow-retro hover:bg-muted/30 hover:shadow-retro-hover active:shadow-retro-active px-6 py-3 font-pixel text-xl uppercase transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Form
            </Link>
            <button
              data-testid="copy-link-button"
              onClick={copyFormLink}
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground border-4 border-border shadow-retro hover:shadow-retro-hover active:shadow-retro-active px-6 py-3 font-pixel text-xl uppercase transition-all"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Share form
                </>
              )}
            </button>
            <Link
              href={`/f/${formId}`}
              data-testid="share-form-btn"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground border-4 border-border shadow-retro hover:shadow-retro-hover active:shadow-retro-active px-6 py-3 font-pixel text-xl uppercase transition-all"
            >
              View live
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card
            data-testid="stat-total-responses"
            className="bg-card border-4 border-border shadow-[4px_4px_0px_var(--border)] rounded-none p-0 overflow-hidden"
          >
            <CardHeader className="bg-primary border-b-4 border-border p-4">
              <CardTitle className="text-primary-foreground font-pixel text-xl uppercase tracking-widest text-center">
                Total Responses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center bg-card flex flex-col items-center justify-center h-[120px]">
              <div className="font-pixel text-6xl text-foreground drop-shadow-[2px_2px_0_var(--color-border)] leading-none">
                {submissions.length}
              </div>
            </CardContent>
          </Card>

          <Card
            data-testid="stat-total-fields"
            className="bg-card border-4 border-border shadow-[4px_4px_0px_var(--border)] rounded-none p-0 overflow-hidden"
          >
            <CardHeader className="bg-secondary border-b-4 border-border p-4">
              <CardTitle className="text-secondary-foreground font-pixel text-xl uppercase tracking-widest text-center">
                Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center bg-card">
              <div className="font-pixel text-6xl text-foreground drop-shadow-[2px_2px_0_var(--color-border)]">
                {fields.length}
              </div>
            </CardContent>
          </Card>

          {form.is_quiz && (
            <Card
              className="bg-card border-4 border-border shadow-[4px_4px_0px_var(--border)] rounded-none p-0 overflow-hidden"
            >
              <CardHeader className="bg-destructive border-b-4 border-border p-4">
                <CardTitle className="text-background font-pixel text-xl uppercase tracking-widest text-center flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center bg-card flex flex-col items-center justify-center h-[120px]">
                <div className="font-pixel text-6xl text-destructive drop-shadow-[2px_2px_0_var(--color-border)] leading-none">
                  {submissions.length > 0 
                    ? Math.round(submissions.reduce((acc, sub) => acc + (sub.score || 0), 0) / submissions.length)
                    : "-"
                  }
                  <span className="text-2xl text-muted-foreground ml-1">/{fields.filter(f => f.correctAnswer).length}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {!form.is_quiz && (
            <Card
              data-testid="stat-completion-rate"
              className="bg-card border-4 border-border shadow-[4px_4px_0px_var(--border)] rounded-none p-0 overflow-hidden"
            >
              <CardHeader className="bg-accent border-b-4 border-border p-4">
                <CardTitle className="text-accent-foreground font-pixel text-xl uppercase tracking-widest text-center">
                  Components
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-card flex flex-wrap gap-2 justify-center content-center h-[120px]">
                  {[...new Set(fields.map((f) => f.type))].map((type) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className="font-pixel text-sm uppercase bg-background border-2 border-border text-foreground px-3 py-1 shadow-sm rounded-none tracking-widest"
                    >
                      {type}
                    </Badge>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Analytics chart */}
        {chartData.length > 0 && (
          <Card className="bg-card border-4 border-border shadow-[8px_8px_0px_var(--border)] rounded-none mb-12 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b-4 border-border p-6">
              <CardTitle className="text-foreground font-pixel text-2xl uppercase tracking-widest">
                Response Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-card">
              <AnalyticsChart data={chartData} title={chartFieldLabel} />
            </CardContent>
          </Card>
        )}

        <Separator className="bg-border h-1 mb-12 border-dashed border-t-4 bg-transparent" />

        {/* Submissions table */}
        <div>
          <h2
            data-testid="submissions-heading"
            className="text-3xl font-pixel font-bold text-foreground mb-6 uppercase tracking-widest flex items-center"
          >
            All Submissions
            <span className="text-muted-foreground text-2xl font-normal ml-4">
              ({submissions.length})
            </span>
          </h2>
          <SubmissionsTable submissions={submissions} fields={fields} isQuiz={form.is_quiz} />
        </div>
      </div>
    </main>
  );
}
