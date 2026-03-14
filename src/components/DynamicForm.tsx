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
  onSubmitSuccess?: () => void;
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

      onSubmitSuccess?.();
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
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50 focus:ring-violet-500/20 transition-all duration-300"
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
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50 focus:ring-violet-500/20 transition-all duration-300 resize-none"
          />
        );

      case "radio":
        return (
          <RadioGroup
            data-testid={`radio-group-${field.id}`}
            value={(answers[field.id] as string) || ""}
            onValueChange={(value) => updateAnswer(field.id, value)}
          >
            <div className="space-y-2">
              {field.options?.map((option, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all duration-200 cursor-pointer"
                >
                  <RadioGroupItem
                    data-testid={`radio-${field.id}-${idx}`}
                    value={option}
                    id={`${field.id}-${idx}`}
                    className="border-white/30 text-violet-400"
                  />
                  <Label
                    htmlFor={`${field.id}-${idx}`}
                    className="text-white/80 cursor-pointer flex-1"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case "checkbox":
        return (
          <div data-testid={`checkbox-group-${field.id}`} className="space-y-2">
            {field.options?.map((option, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all duration-200 cursor-pointer"
              >
                <Checkbox
                  data-testid={`checkbox-${field.id}-${idx}`}
                  id={`${field.id}-${idx}`}
                  checked={
                    ((answers[field.id] as string[]) || []).includes(option)
                  }
                  onCheckedChange={() => toggleCheckbox(field.id, option)}
                  className="border-white/30 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                />
                <Label
                  htmlFor={`${field.id}-${idx}`}
                  className="text-white/80 cursor-pointer flex-1"
                >
                  {option}
                </Label>
              </div>
            ))}
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
              className="bg-white/5 border-white/10 text-white focus:border-violet-500/50 focus:ring-violet-500/20"
            >
              <SelectValue placeholder={field.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/10">
              {field.options?.map((option, idx) => (
                <SelectItem
                  data-testid={`select-option-${field.id}-${idx}`}
                  key={idx}
                  value={option}
                  className="text-white hover:bg-white/10"
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
    <form onSubmit={handleSubmit} data-testid="dynamic-form" className="space-y-6">
      {fields.map((field, index) => (
        <Card
          key={field.id}
          data-testid={`form-field-${field.id}`}
          className="bg-white/[0.03] border-white/10 backdrop-blur-sm hover:border-violet-500/20 transition-all duration-300"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <CardContent className="pt-6">
            <Label
              htmlFor={field.id}
              className="text-white/90 text-sm font-medium mb-3 block"
            >
              {field.label}
              {field.required && (
                <span className="text-rose-400 ml-1">*</span>
              )}
            </Label>
            {renderField(field)}
          </CardContent>
        </Card>
      ))}

      {error && (
        <div
          data-testid="form-error"
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm"
        >
          {error}
        </div>
      )}

      <Button
        type="submit"
        data-testid="submit-form-button"
        disabled={submitting}
        className="w-full h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
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
          "Submit"
        )}
      </Button>
    </form>
  );
}
