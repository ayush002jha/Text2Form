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
      <main className="min-h-screen bg-[#0a0a0f] p-6 lg:p-12">
        <Skeleton className="h-10 w-64 bg-white/5 mb-4" />
        <Skeleton className="h-4 w-96 bg-white/5 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 bg-white/5 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 bg-white/5 rounded-xl" />
      </main>
    );
  }

  if (accessDenied || !form) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-rose-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{!form ? 'Form Not Found' : 'Access Denied'}</h2>
          <p className="text-white/60 mb-6 max-w-md">{!form ? 'This form may have been deleted.' : 'This dashboard is private. Only the creator of this form can view its submissions.'}</p>
          <div className="flex justify-center gap-4">
            <Link href="/" className="bg-white/5 border border-white/10 text-white px-6 py-2 rounded-xl text-sm transition-all hover:bg-white/10">Go Home</Link>
          </div>
        </div>
      </main>
    );
  }

  const fields = form.schema as unknown as FormField[];

  return (
    <main className="min-h-screen bg-[#0a0a0f] relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 pb-20">
        {/* Title section */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8 gap-4">
          <div>
            <h1
              data-testid="dashboard-title"
              className="text-3xl font-bold text-white mb-2"
            >
              {form.title}
            </h1>
            <p className="text-white/30 text-sm">{form.description}</p>
          </div>
          <div className="flex gap-3">
            <button
              data-testid="copy-link-button"
              onClick={copyFormLink}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:border-violet-500/30 text-white/60 hover:text-white px-4 py-2 rounded-xl text-sm transition-all duration-300"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share Link
                </>
              )}
            </button>
            <Link
              href={`/f/${formId}`}
              data-testid="view-form-link"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/25 transition-all duration-300"
            >
              View Form
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card
            data-testid="stat-total-responses"
            className="bg-white/[0.03] border-white/10 backdrop-blur-sm"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-white/40 text-xs font-medium uppercase tracking-wider">
                Total Responses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {submissions.length}
              </div>
            </CardContent>
          </Card>

          <Card
            data-testid="stat-total-fields"
            className="bg-white/[0.03] border-white/10 backdrop-blur-sm"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-white/40 text-xs font-medium uppercase tracking-wider">
                Form Fields
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {fields.length}
              </div>
            </CardContent>
          </Card>

          <Card
            data-testid="stat-completion-rate"
            className="bg-white/[0.03] border-white/10 backdrop-blur-sm"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-white/40 text-xs font-medium uppercase tracking-wider">
                Field Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {[...new Set(fields.map((f) => f.type))].map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="bg-violet-500/10 text-violet-300 border-violet-500/20 text-xs"
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics chart */}
        {chartData.length > 0 && (
          <Card className="bg-white/[0.03] border-white/10 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-white text-lg font-semibold">
                Response Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsChart data={chartData} title={chartFieldLabel} />
            </CardContent>
          </Card>
        )}

        <Separator className="bg-white/5 mb-8" />

        {/* Submissions table */}
        <div>
          <h2
            data-testid="submissions-heading"
            className="text-xl font-semibold text-white mb-4"
          >
            All Submissions
            <span className="text-white/30 text-sm font-normal ml-2">
              ({submissions.length})
            </span>
          </h2>
          <SubmissionsTable submissions={submissions} fields={fields} />
        </div>
      </div>
    </main>
  );
}
