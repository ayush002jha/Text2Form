"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import FileUploader from "@/components/FileUploader";
import { Loader2, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const canGenerate = prompt.trim().length > 0 || files.length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) {
      setError("Please provide a prompt or upload a file for context.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      let res: Response;

      if (files.length > 0) {
        // Use FormData when files are attached
        const fd = new FormData();
        fd.append("prompt", prompt.trim());
        files.forEach((f) => fd.append("files", f));
        res = await fetch("/api/generate", { method: "POST", body: fd });
      } else {
        // Fast JSON path when no files
        res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim() }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      router.push(`/dashboard/${data.formId}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-[calc(100vh-84px)] min-h-[600px] relative flex flex-col items-center justify-center py-12 px-6">

      {/* Testsprite Badge - Bottom right */}
      <a 
        href="https://www.testsprite.com/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-20 flex items-center gap-3 bg-card border-4 border-border shadow-retro px-4 py-2 hover:-translate-y-1 hover:shadow-retro-hover transition-all"
      >
        <span className="font-pixel text-sm md:text-base uppercase tracking-widest text-card-foreground font-semibold">Built with</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/testsprite.webp" alt="TestSprite" className="h-9 object-contain" />
      </a>

      {/* Hero Section */}
      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center justify-center -mt-12">
        
        {/* Title */}
        <h1 className="text-center w-full mb-3">
          <span className="inline-block font-pixel text-4xl md:text-6xl lg:text-7xl font-black text-foreground uppercase tracking-widest leading-[1.1] bg-primary shadow-[6px_6px_0_var(--border)] px-2 py-1 mb-2">
            Build Forms with
          </span>
          <span className="block font-pixel text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-widest leading-[1.1] text-primary drop-shadow-[5px_5px_0_var(--color-border)] mt-1">
            AI Superpowers
          </span>
        </h1>

        {/* Subtitle */}
        <p className="font-sans font-medium text-foreground/80 text-base max-w-2xl text-center mb-5 leading-relaxed border-y-4 border-dashed border-border/20 py-3">
          Describe your form or quiz in plain English. Our AI builds it instantly
          — shareable, submittable, and analytics-ready.
        </p>

        {/* Form Generation Input */}
        <div className="w-full max-w-3xl relative z-20">
          <div className="bg-card border-4 border-border shadow-[12px_12px_0px_var(--border)] p-5 z-20 relative transition-all">

            {/* Two-row layout */}
            <div className="flex flex-col gap-4">
              {/* Top Row: Prompt */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b-4 border-border/10">
                  <div className="w-3 h-3 bg-primary border-2 border-border" />
                  <h2 className="font-pixel text-xl uppercase text-foreground m-0 leading-none tracking-widest">Instructions</h2>
                </div>
                <Textarea
                  data-testid="prompt-input"
                  placeholder={
                    files.length > 0
                      ? 'e.g. "Create a quiz from this syllabus" or "Build an event registration form"'
                      : 'Try: "Create a 5-question math quiz for grade 8" or "Build a customer feedback form"'
                  }
                  value={prompt}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                  className="w-full min-h-[90px] h-[90px] bg-background border-4 border-border shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)] dark:shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)] text-foreground placeholder:text-muted-foreground resize-none focus-visible:ring-0 focus-visible:outline-none text-base p-3 font-sans rounded-none"
                />
              </div>

              {/* Bottom Row: File upload */}
              <div>
                <div className="flex items-center gap-2 mb-2 pb-2 border-b-4 border-border/10">
                  <div className="w-3 h-3 bg-secondary border-2 border-border" />
                  <h2 className="font-pixel text-xl uppercase text-foreground m-0 leading-none tracking-widest">Context Files</h2>
                  <span className="font-pixel text-xs text-muted-foreground ml-auto tracking-widest">(optional)</span>
                </div>
                <FileUploader onFilesChange={setFiles} />
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t-4 border-border border-dashed">
              <div className="flex items-center gap-3 text-muted-foreground font-pixel text-[16px] uppercase tracking-widest">
                <Zap className="w-5 h-5 text-accent" />
                <span>
                  {files.length > 0
                    ? `${files.length} file${files.length > 1 ? "s" : ""} attached`
                    : "AI-generated instantly"}
                </span>
              </div>

              <button
                data-testid="create-form-btn"
                className="h-16 w-full max-w-[240px] border-4 border-border bg-primary px-8 font-pixel text-2xl uppercase tracking-widest text-primary-foreground shadow-retro transition-all hover:shadow-retro-hover active:shadow-retro-active disabled:opacity-50"
                disabled={loading}
                onClick={handleGenerate}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>GENERATING...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>CREATE FORM</span>
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              data-testid="generation-error"
              className="mt-3 p-3 bg-destructive text-background border-4 border-border shadow-retro font-pixel text-lg uppercase tracking-wider relative z-20"
            >
              ⚠ {error}
            </div>
          )}
        </div>
        {/* Testing Helpers / Samples (Subtle) */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 font-pixel text-xs uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-muted-foreground transition-colors z-20 relative">
           <Link href="/f/18c55747-844d-45a9-92f5-c443103fe5ad" data-testid="sample-form-link" className="hover:underline">Open sample form</Link>
           <span className="opacity-20">|</span>
           <Link href="/f/1db2cfd6-7d4b-42b8-a407-68f1c14619d3" data-testid="quiz-form-link" className="hover:underline">Open Quiz Form</Link>
           <span className="opacity-20">|</span>
           <Link href="/f/this-form-does-not-exist" data-testid="invalid-form-link" className="hover:underline">Try invalid form link</Link>
           <span className="opacity-20">|</span>
           <Link href="/dashboard/18c55747-844d-45a9-92f5-c443103fe5ad" data-testid="unauthorized-analytics-link" className="hover:underline">Test Access Control</Link>
        </div>
      </div>
    </main>
  );
}
