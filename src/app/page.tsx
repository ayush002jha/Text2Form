"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import FileUploader from "@/components/FileUploader";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const canGenerate = prompt.trim().length > 0 || files.length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
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
    <main className="h-[calc(100vh-84px)] min-h-[700px] bg-background relative overflow-y-auto flex flex-col items-center justify-center py-12">
      {/* Grid overlay */}
      <div
        className="absolute inset-[0] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--color-border) 2px, transparent 2px), linear-gradient(90deg, var(--color-border) 2px, transparent 2px)`,
          backgroundSize: "64px 64px",
          opacity: 0.08
        }}
      />

      {/* Testsprite Badge - Bottom right */}
      <a 
        href="https://www.testsprite.com/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute bottom-6 right-6 z-20 flex items-center gap-3 bg-card border-4 border-border shadow-retro px-4 py-2 hover:-translate-y-1 hover:shadow-retro-hover transition-all"
      >
        <span className="font-pixel text-sm md:text-base uppercase tracking-widest text-card-foreground font-semibold">Built with</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/testsprite.webp" alt="TestSprite" className="h-9 object-contain" />
      </a>

      {/* Hero Section */}
      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center justify-center -mt-12">
        
        {/* Title */}
        <h1 className="text-center w-full mb-3">
          <span className="block font-pixel text-4xl md:text-6xl lg:text-7xl font-black text-foreground uppercase tracking-widest leading-[1.1] drop-shadow-[5px_5px_0_var(--color-border)]">
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
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>
                  {files.length > 0
                    ? `${files.length} file${files.length > 1 ? "s" : ""} attached`
                    : "AI-generated instantly"}
                </span>
              </div>

              <Button
                data-testid="generate-button"
                onClick={handleGenerate}
                disabled={loading || !canGenerate}
                className="font-pixel text-xl h-12 px-6 bg-accent text-accent-foreground border-4 border-border shadow-retro hover:shadow-retro-hover active:shadow-retro-active transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {files.length > 0 ? "Analyzing..." : "Building..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Generate
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                )}
              </Button>
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
      </div>
    </main>
  );
}
