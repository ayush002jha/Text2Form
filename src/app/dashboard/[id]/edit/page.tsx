"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FormField, FormRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";

export default function EditFormPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [form, setForm] = useState<FormRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchForm = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("id", formId)
        .single();

      if (error || !data || data.user_id !== user.id) {
        toast.error("Form not found or access denied");
        router.push("/dashboard");
        return;
      }

      setForm({
        ...data,
        is_quiz: data.is_quiz || false
      } as FormRecord);
      
      setLoading(false);
    };

    fetchForm();
  }, [formId, router, supabase]);

  if (loading || !form) {
    return (
      <main className="min-h-screen bg-background relative p-6 lg:p-12 flex items-center justify-center">
        {/* Grid overlay */}
        <div
          className="absolute inset-[0] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(var(--color-border) 2px, transparent 2px), linear-gradient(90deg, var(--color-border) 2px, transparent 2px)`,
            backgroundSize: "64px 64px",
            opacity: 0.08
          }}
        />
        <div className="relative z-10 text-xl font-pixel uppercase tracking-widest animate-pulse">
          Loading Editor...
        </div>
      </main>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/forms/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: form.id,
          title: form.title,
          description: form.description,
          schema: form.schema,
          is_quiz: form.is_quiz,
        }),
      });

      if (!res.ok) throw new Error("Failed to save form");
      
      toast.success("Form saved successfully");
      router.push(`/dashboard/${form.id}`);
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newSchema = [...form.schema];
    newSchema[index] = { ...newSchema[index], ...updates };
    setForm({ ...form, schema: newSchema });
  };

  const deleteField = (index: number) => {
    const newSchema = form.schema.filter((_, i) => i !== index);
    setForm({ ...form, schema: newSchema });
  };

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: "text",
      label: "New Question",
      required: false,
    };
    setForm({ ...form, schema: [...form.schema, newField] });
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === form.schema.length - 1)
    ) return;

    const newSchema = [...form.schema];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newSchema[index], newSchema[swapIndex]] = [newSchema[swapIndex], newSchema[index]];
    setForm({ ...form, schema: newSchema });
  };

  return (
    <main className="min-h-screen bg-background relative p-6 lg:p-12 pb-32">
      {/* Grid overlay */}
      <div
        className="absolute inset-[0] pointer-events-none fixed"
        style={{
          backgroundImage: `linear-gradient(var(--color-border) 2px, transparent 2px), linear-gradient(90deg, var(--color-border) 2px, transparent 2px)`,
          backgroundSize: "64px 64px",
          opacity: 0.08
        }}
      />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link href={`/dashboard/${form.id}`} className="text-muted-foreground font-pixel uppercase hover:text-foreground transition-colors mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl lg:text-5xl font-black font-pixel uppercase tracking-widest text-foreground drop-shadow-[4px_4px_0_var(--color-border)]">
              Form Editor
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, is_quiz: !form.is_quiz })}
              className={`inline-flex items-center gap-3 border-4 border-border font-pixel text-xl uppercase px-6 py-2 transition-all
                ${form.is_quiz
                  ? "bg-secondary text-secondary-foreground shadow-[4px_4px_0_var(--border)] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_var(--border)]"
                  : "bg-card text-foreground shadow-[4px_4px_0_var(--border)] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_var(--border)]"
                }`}
            >
              <span className={`w-4 h-4 border-2 border-current flex items-center justify-center shrink-0 ${form.is_quiz ? "bg-secondary-foreground/20" : ""}`}>
                {form.is_quiz && <span className="w-2 h-2 bg-current block" />}
              </span>
              Quiz Mode
            </button>
            
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground border-4 border-border shadow-[4px_4px_0_var(--border)] hover:translate-y-px hover:translate-x-px hover:shadow-[2px_2px_0_var(--border)] font-pixel text-xl uppercase px-8"
            >
              {saving ? "Saving..." : "Save Form"}
            </Button>
          </div>
        </div>

        <div className="bg-card border-4 border-border shadow-[8px_8px_0_var(--border)] p-8 mb-12">
          <div className="space-y-6">
            <div>
              <Label className="font-pixel text-xl uppercase mb-2 block text-foreground">Form Title</Label>
              <Input 
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-background border-4 border-border font-sans text-xl h-14 rounded-none shadow-[inset_4px_4px_0_rgba(0,0,0,0.05)] focus-visible:ring-0"
              />
            </div>
            <div>
              <Label className="font-pixel text-lg uppercase mb-2 block text-muted-foreground">Description</Label>
              <Textarea 
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-background border-4 border-border font-sans text-lg min-h-[100px] rounded-none shadow-[inset_4px_4px_0_rgba(0,0,0,0.05)] focus-visible:ring-0 resize-y"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {form.schema.map((field, index) => (
            <div key={field.id} className="bg-card border-4 border-border shadow-[8px_8px_0_var(--border)] p-6 relative group">
              {/* Field Controls (Top Right) */}
              <div className="absolute -top-4 -right-4 flex items-center bg-background border-4 border-border shadow-retro p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button onClick={() => moveField(index, 'up')} disabled={index === 0} className="p-2 hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                </button>
                <div className="w-1 h-6 bg-border mx-1" />
                <button onClick={() => moveField(index, 'down')} disabled={index === form.schema.length - 1} className="p-2 hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="w-1 h-6 bg-border mx-1" />
                <button onClick={() => deleteField(index)} className="p-2 hover:bg-destructive hover:text-destructive-foreground text-destructive">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 flex flex-col gap-4">
                  <div>
                    <Label className="font-pixel uppercase text-muted-foreground text-sm mb-1 block">Question Label</Label>
                    <Input 
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      className="bg-background border-4 border-border rounded-none font-sans font-bold text-lg h-12 focus-visible:ring-0"
                    />
                  </div>
                  <div>
                    <Label className="font-pixel uppercase text-muted-foreground text-sm mb-1 block">Placeholder (Optional)</Label>
                    <Input 
                      value={field.placeholder || ""}
                      onChange={(e) => updateField(index, { placeholder: e.target.value })}
                      className="bg-background border-2 border-border/50 rounded-none font-sans h-10 focus-visible:ring-0 text-sm"
                    />
                  </div>
                </div>

                <div className="md:col-span-4 flex flex-col gap-4">
                  <div>
                    <Label className="font-pixel uppercase text-muted-foreground text-sm mb-1 block">Type</Label>
                    <Select 
                      value={field.type} 
                      onValueChange={(val: any) => updateField(index, { type: val })}
                    >
                      <SelectTrigger className="bg-background border-4 border-border rounded-none h-12 focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-4 border-border rounded-none bg-card">
                        <SelectItem value="text">Text Input</SelectItem>
                        <SelectItem value="textarea">Paragraph</SelectItem>
                        <SelectItem value="radio">Multiple Choice</SelectItem>
                        <SelectItem value="checkbox">Checkboxes</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-2">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox 
                        checked={field.required}
                        onCheckedChange={(c) => updateField(index, { required: !!c })}
                        className="rounded-none border-2 border-foreground w-5 h-5"
                      />
                      <span className="font-sans font-medium">Required Field</span>
                    </Label>
                  </div>
                </div>
              </div>

              {/* Options & Correct Answer Config */}
              {(field.type === "radio" || field.type === "checkbox" || field.type === "select") && (
                <div className="mt-6 pt-6 border-t-4 border-dashed border-border/20">
                  <Label className="font-pixel uppercase text-foreground text-lg mb-3 block">Options</Label>
                  <div className="space-y-3 mb-4">
                    {(field.options || []).map((opt, optIndex) => (
                      <div key={optIndex} className="flex gap-2">
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...(field.options || [])];
                            newOpts[optIndex] = e.target.value;
                            updateField(index, { options: newOpts });
                          }}
                          className="bg-background border-2 border-border rounded-none focus-visible:ring-0 h-10"
                        />
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            const newOpts = field.options!.filter((_, i) => i !== optIndex);
                            updateField(index, { options: newOpts });
                          }}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-none"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newOpts = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                        updateField(index, { options: newOpts });
                      }}
                      className="border-4 border-border border-dashed font-pixel uppercase w-full bg-transparent hover:bg-muted/30 hover:border-solid rounded-none h-12"
                    >
                      + Add Option
                    </Button>
                  </div>

                  {/* Quiz Configuration */}
                  {form.is_quiz && (
                    <div className="bg-secondary/10 border-4 border-secondary p-4 mt-6">
                      <Label className="font-pixel text-secondary uppercase text-lg mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Correct Answer(s)
                      </Label>
                      
                      {field.type === "checkbox" ? (
                        <div className="space-y-2">
                           <p className="text-sm font-sans text-muted-foreground mb-3">Select all correct options for this multiple-select question.</p>
                           {(field.options || []).map((opt) => (
                             <Label key={opt} className="flex items-center gap-3 p-2 bg-background border-2 border-border/50 cursor-pointer hover:bg-muted/50">
                               <Checkbox 
                                 checked={Array.isArray(field.correctAnswer) ? field.correctAnswer.includes(opt) : field.correctAnswer === opt}
                                 onCheckedChange={(c) => {
                                   const current = Array.isArray(field.correctAnswer) ? [...field.correctAnswer] : (field.correctAnswer ? [field.correctAnswer as string] : []);
                                   if (c) {
                                     updateField(index, { correctAnswer: [...current, opt] });
                                   } else {
                                     updateField(index, { correctAnswer: current.filter(x => x !== opt) });
                                   }
                                 }}
                                 className="border-2 border-foreground w-5 h-5"
                               />
                               <span className="font-sans text-base">{opt}</span>
                             </Label>
                           ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                           <p className="text-sm font-sans text-muted-foreground mb-3">Select the single correct option.</p>
                           <Select 
                              value={(field.correctAnswer as string) || ""} 
                              onValueChange={(val: any) => updateField(index, { correctAnswer: val })}
                            >
                              <SelectTrigger className="bg-background border-4 border-border rounded-none h-12 focus:ring-0">
                                <SelectValue placeholder="Select correct answer..." />
                              </SelectTrigger>
                              <SelectContent className="border-4 border-border rounded-none bg-card">
                                {(field.options || []).map((opt) => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <Button
            onClick={addField}
            className="w-full h-20 bg-muted/10 border-4 border-border border-dashed text-muted-foreground hover:bg-muted/30 hover:text-foreground hover:border-solid font-pixel text-2xl uppercase tracking-widest transition-all rounded-none"
          >
            + Add New Question
          </Button>
        </div>
      </div>
    </main>
  );
}
