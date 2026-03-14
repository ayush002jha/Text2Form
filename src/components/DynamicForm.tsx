"use client";

import React, { useState } from "react";
import { FormField } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DynamicFormProps {
  fields: FormField[];
  formId: string;
  onSubmitSuccess?: (data: any) => void;
}

export default function DynamicForm({
  fields,
  formId,
  onSubmitSuccess,
}: DynamicFormProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateAnswer = (fieldId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const toggleCheckbox = (fieldId: string, option: string) => {
    setAnswers((prev) => {
      const current = (prev[fieldId] as string[]) || [];
      if (current.includes(option)) {
        return { ...prev, [fieldId]: current.filter((o) => o !== option) };
      }
      return { ...prev, [fieldId]: [...current, option] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId, answers }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      const responseData = await res.json();
      onSubmitSuccess?.(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            data-testid={`input-${field.id}`}
            id={field.id}
            placeholder={field.placeholder || ""}
            value={(answers[field.id] as string) || ""}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            required={field.required}
            className="bg-background border-4 border-border text-foreground shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)] focus-visible:ring-0 focus-visible:outline-none p-4 rounded-none font-sans text-lg h-14"
          />
        );

      case "textarea":
        return (
          <Textarea
            data-testid={`textarea-${field.id}`}
            id={field.id}
            placeholder={field.placeholder || ""}
            value={(answers[field.id] as string) || ""}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            required={field.required}
            rows={4}
            className="bg-background border-4 border-border text-foreground shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)] focus-visible:ring-0 focus-visible:outline-none p-4 rounded-none font-sans text-lg resize-none min-h-[120px]"
          />
        );

      case "radio":
        return (
          <RadioGroup
            data-testid={`radio-group-${field.id}`}
            value={(answers[field.id] as string) || ""}
            onValueChange={(value) => updateAnswer(field.id, value)}
          >
            <div className="space-y-3">
              {field.options?.map((option, idx) => {
                const isSelected = (answers[field.id] as string) === option;
                return (
                  <Label
                    key={idx}
                    htmlFor={`${field.id}-${idx}`}
                    className={`flex items-center space-x-4 p-4 border-4 transition-all duration-200 cursor-pointer shadow-[4px_4px_0_var(--border)]
                      ${isSelected ? "bg-primary/20 border-primary" : "bg-card border-border hover:bg-muted/10"}`}
                  >
                    <RadioGroupItem
                      data-testid={`radio-${field.id}-${idx}`}
                      value={option}
                      id={`${field.id}-${idx}`}
                      className="border-4 border-border text-primary w-6 h-6 sr-only"
                    />
                    <div className={`w-6 h-6 shrink-0 border-4 border-border flex items-center justify-center bg-background
                        ${isSelected ? "bg-primary" : ""}`}>
                      {isSelected && <div className="w-2 h-2 bg-border" />}
                    </div>
                    <span className="text-foreground font-sans text-lg font-medium flex-1">
                      {option}
                    </span>
                  </Label>
                );
              })}
            </div>
          </RadioGroup>
        );

      case "checkbox":
        return (
          <div data-testid={`checkbox-group-${field.id}`} className="space-y-3">
            {field.options?.map((option, idx) => {
              const isChecked = ((answers[field.id] as string[]) || []).includes(option);
              return (
                <Label
                  key={idx}
                  htmlFor={`${field.id}-${idx}`}
                  className={`flex items-center space-x-4 p-4 border-4 transition-all duration-200 cursor-pointer shadow-[4px_4px_0_var(--border)]
                    ${isChecked ? "bg-secondary/20 border-secondary" : "bg-card border-border hover:bg-muted/10"}`}
                >
                  <Checkbox
                    data-testid={`checkbox-${field.id}-${idx}`}
                    id={`${field.id}-${idx}`}
                    checked={isChecked}
                    onCheckedChange={() => toggleCheckbox(field.id, option)}
                    className="border-4 border-border text-secondary w-6 h-6 sr-only"
                  />
                  <div className={`w-6 h-6 shrink-0 border-4 border-border flex items-center justify-center bg-background
                      ${isChecked ? "bg-secondary" : ""}`}>
                    {isChecked && (
                      <svg className="w-4 h-4 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-foreground font-sans text-lg font-medium flex-1">
                    {option}
                  </span>
                </Label>
              );
            })}
          </div>
        );

      case "select":
        return (
          <Select
            value={(answers[field.id] as string) || ""}
            onValueChange={(value) => { if (value) updateAnswer(field.id, value); }}
          >
            <SelectTrigger
              data-testid={`select-${field.id}`}
              className="bg-background border-4 border-border text-foreground shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)] focus:ring-0 focus:outline-none p-4 rounded-none font-sans text-lg h-14"
            >
              <SelectValue placeholder={field.placeholder || "Select an option..."} />
            </SelectTrigger>
            <SelectContent className="bg-card border-4 border-border rounded-none shadow-[4px_4px_0_var(--border)]">
              {field.options?.map((option, idx) => (
                <SelectItem
                  data-testid={`select-option-${field.id}-${idx}`}
                  key={idx}
                  value={option}
                  className="text-foreground font-sans text-lg focus:bg-primary/20 focus:text-foreground cursor-pointer"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="dynamic-form" className="space-y-10">
      {fields.map((field, index) => (
        <div
          key={field.id}
          data-testid={`form-field-${field.id}`}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <Label
            htmlFor={field.id}
            className="text-foreground font-pixel text-2xl uppercase tracking-widest mb-4 block border-b-4 border-border/10 pb-2"
          >
            {field.label}
            {field.required && (
              <span className="text-destructive ml-2 font-black">*</span>
            )}
          </Label>
          {renderField(field)}
        </div>
      ))}

      {error && (
        <div
          data-testid="form-error"
          className="p-4 bg-destructive border-4 border-border text-background font-pixel text-xl uppercase tracking-widest shadow-retro"
        >
          {error}
        </div>
      )}

      <Button
        type="submit"
        data-testid="submit-form-button"
        disabled={submitting}
        className="w-full h-16 bg-accent text-accent-foreground border-4 border-border font-pixel text-2xl uppercase tracking-widest shadow-[8px_8px_0px_var(--border)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_var(--border)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
      >
        {submitting ? (
          <span className="flex items-center gap-3">
            <svg
              className="animate-spin h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Submitting...
          </span>
        ) : (
          "Submit Form"
        )}
      </Button>
    </form>
  );
}
