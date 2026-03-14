"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SubmissionRecord, FormField } from "@/lib/types";

interface SubmissionsTableProps {
  submissions: SubmissionRecord[];
  fields: FormField[];
  isQuiz?: boolean;
}

export default function SubmissionsTable({
  submissions,
  fields,
  isQuiz = false,
}: SubmissionsTableProps) {
  if (submissions.length === 0) {
    return (
      <div
        data-testid="no-submissions"
        className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card border-4 border-border shadow-retro"
      >
        <div className="w-16 h-16 mb-4 bg-secondary border-4 border-border shadow-retro flex items-center justify-center text-secondary-foreground">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeWidth={3}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="font-pixel text-2xl uppercase tracking-widest text-foreground mt-2">No submissions yet</p>
        <p className="font-sans font-medium mt-2">
          Share your form link to start collecting responses
        </p>
      </div>
    );
  }

  const formatAnswer = (answer: string | string[] | undefined) => {
    if (!answer) return <span className="text-muted-foreground">—</span>;
    if (Array.isArray(answer)) {
      return (
        <div className="flex flex-wrap gap-2">
          {answer.map((a, i) => (
            <Badge
              key={i}
              variant="outline"
              className="bg-background text-foreground border-2 border-border font-pixel text-sm uppercase px-2 py-0.5 rounded-none shadow-[2px_2px_0_var(--color-border)] tracking-widest"
            >
              {a}
            </Badge>
          ))}
        </div>
      );
    }
    return <span className="text-foreground font-sans font-medium">{answer}</span>;
  };

  return (
    <div
      data-testid="submissions-table"
      className="border-4 border-border bg-card shadow-[8px_8px_0_var(--border)] overflow-hidden"
    >
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="border-b-4 border-border hover:bg-transparent">
            <TableHead className="text-foreground font-pixel text-lg uppercase tracking-widest">#</TableHead>
            {isQuiz && (
              <TableHead className="text-foreground font-pixel text-lg uppercase tracking-widest">Score</TableHead>
            )}
            {fields.map((field) => (
              <TableHead key={field.id} className="text-foreground font-pixel text-lg uppercase tracking-widest">
                {field.label}
              </TableHead>
            ))}
            <TableHead className="text-foreground font-pixel text-lg uppercase tracking-widest text-right">
              Submitted
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((sub, index) => (
            <TableRow
              key={sub.id}
              data-testid={`submission-row-${index}`}
              className="border-b-2 border-border/20 hover:bg-muted/10 transition-colors"
            >
              <TableCell className="text-foreground font-pixel text-xl p-4">
                {index + 1}
              </TableCell>
              {isQuiz && (
                <TableCell className="text-destructive font-pixel text-2xl p-4 font-bold">
                  {sub.score !== null && sub.score !== undefined ? sub.score : '-'}
                  <span className="text-sm text-muted-foreground font-normal ml-1">/{fields.filter(f => f.correctAnswer).length}</span>
                </TableCell>
              )}
              {fields.map((field) => (
                <TableCell key={field.id} className="p-4 align-middle">
                  {formatAnswer(
                    sub.answers[field.id] as string | string[] | undefined
                  )}
                </TableCell>
              ))}
              <TableCell className="text-muted-foreground font-pixel text-sm uppercase tracking-wider text-right p-4">
                {new Date(sub.submitted_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
