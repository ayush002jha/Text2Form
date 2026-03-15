"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteFormButtonProps {
  formId: string;
  formTitle: string;
}

export default function DeleteFormButton({ formId, formTitle }: DeleteFormButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${formTitle}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/forms/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete form");
      }

      toast.success("Form deleted successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      data-testid="delete-form-trigger"
      onClick={handleDelete}
      disabled={isDeleting}
      className={`flex items-center justify-center bg-destructive text-destructive-foreground border-2 border-border shadow-[2px_2px_0_var(--border)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_var(--border)] active:translate-y-0 active:shadow-none py-2 transition-all group/btn ${
        isDeleting ? "opacity-50 cursor-not-allowed" : ""
      }`}
      title="Delete Form"
    >
      <svg
        className={`w-5 h-5 group-hover/btn:scale-110 transition-transform ${
          isDeleting ? "animate-spin" : ""
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {isDeleting ? (
          <path
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeWidth={3}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        ) : (
          <path
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeWidth={3}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        )}
      </svg>
    </button>
  );
}
