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
}

export default function SubmissionsTable({
  submissions,
  fields,
}: SubmissionsTableProps) {
  if (submissions.length === 0) {
    return (
      <div
        data-testid="no-submissions"
        className="flex flex-col items-center justify-center py-16 text-white/40"
      >
        <svg
          className="w-16 h-16 mb-4 opacity-30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-sm">No submissions yet</p>
        <p className="text-xs mt-1 text-white/20">
          Share your form link to start collecting responses
        </p>
      </div>
    );
  }

  const formatAnswer = (answer: string | string[] | undefined) => {
    if (!answer) return <span className="text-white/20">—</span>;
    if (Array.isArray(answer)) {
      return (
        <div className="flex flex-wrap gap-1">
          {answer.map((a, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="bg-violet-500/10 text-violet-300 border-violet-500/20 text-xs"
            >
              {a}
            </Badge>
          ))}
        </div>
      );
    }
    return <span className="text-white/70 text-sm">{answer}</span>;
  };

  return (
    <div
      data-testid="submissions-table"
      className="rounded-xl border border-white/10 overflow-hidden"
    >
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="text-white/50 font-medium">#</TableHead>
            {fields.map((field) => (
              <TableHead key={field.id} className="text-white/50 font-medium">
                {field.label}
              </TableHead>
            ))}
            <TableHead className="text-white/50 font-medium">
              Submitted
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((sub, index) => (
            <TableRow
              key={sub.id}
              data-testid={`submission-row-${index}`}
              className="border-white/5 hover:bg-white/[0.02]"
            >
              <TableCell className="text-white/30 text-sm">
                {index + 1}
              </TableCell>
              {fields.map((field) => (
                <TableCell key={field.id}>
                  {formatAnswer(
                    sub.answers[field.id] as string | string[] | undefined
                  )}
                </TableCell>
              ))}
              <TableCell className="text-white/30 text-xs">
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
