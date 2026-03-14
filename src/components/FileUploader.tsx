"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface UploadedFile {
  file: File;
  id: string;
}

interface FileUploaderProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
}

type FileType = "pdf" | "word" | "text" | "image" | "unknown";

const FILE_TYPE_CONFIG: Record<FileType, { label: string; color: string; bgColor: string }> = {
  pdf:     { label: "PDF",   color: "text-rose-400",    bgColor: "bg-rose-500/10"   },
  word:    { label: "DOCX",  color: "text-blue-400",    bgColor: "bg-blue-500/10"   },
  text:    { label: "TXT",   color: "text-emerald-400", bgColor: "bg-emerald-500/10"},
  image:   { label: "IMG",   color: "text-fuchsia-400", bgColor: "bg-fuchsia-500/10"},
  unknown: { label: "FILE",  color: "text-white/40",    bgColor: "bg-white/5"       },
};

function getFileType(mimeType: string): FileType {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "word";
  if (mimeType === "text/plain") return "text";
  if (mimeType.startsWith("image/")) return "image";
  return "unknown";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUploader({ onFilesChange, maxFiles = 5 }: FileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newEntries = acceptedFiles.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
    }));
    const updated = [...uploadedFiles, ...newEntries].slice(0, maxFiles);
    setUploadedFiles(updated);
    onFilesChange(updated.map((e) => e.file));
  }, [uploadedFiles, maxFiles, onFilesChange]);

  const removeFile = (id: string) => {
    const updated = uploadedFiles.filter((e) => e.id !== id);
    setUploadedFiles(updated);
    onFilesChange(updated.map((e) => e.file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: maxFiles - uploadedFiles.length,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    disabled: uploadedFiles.length >= maxFiles,
  });

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          relative cursor-pointer border-4 p-4
          flex flex-col items-center justify-center gap-2 text-center
          transition-all duration-200
          ${isDragActive
            ? "border-secondary bg-secondary/10 shadow-retro-active"
            : uploadedFiles.length >= maxFiles
              ? "border-muted bg-muted/10 opacity-50 cursor-not-allowed shadow-none"
              : "border-border bg-card hover:shadow-retro shadow-[2px_2px_0px_var(--border)]"
          }
        `}
      >
        <input {...getInputProps()} />

        {/* Upload icon */}
        <div className={`p-2 border-4 border-border transition-colors
          ${isDragActive ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3}
              d="M4 16v2h16v-2M12 14V4m0 0L8 8m4-4l4 4" />
          </svg>
        </div>

        <div>
          <p className="font-pixel text-xl text-foreground uppercase tracking-widest">
            {isDragActive ? "Drop It!" : "Upload Files"}
          </p>
          <p className="text-xs font-bold text-muted-foreground mt-1 uppercase">
            PDF, Word, TXT, IMG · Max {maxFiles}
          </p>
        </div>
      </div>

      {/* Attached files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          {uploadedFiles.map(({ file, id }) => {
            const type = getFileType(file.type);
            const cfg = FILE_TYPE_CONFIG[type];
            return (
              <div key={id}
                className="flex items-center gap-4 px-4 py-3 bg-card border-4 border-border shadow-[2px_2px_0px_var(--border)] group">
                <div className={`shrink-0 w-12 h-12 border-4 border-border ${cfg.bgColor} flex items-center justify-center`}>
                  <span className={`font-pixel text-lg ${cfg.color}`}>{cfg.label}</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-foreground truncate uppercase">{file.name}</p>
                  <p className="font-pixel text-lg text-muted-foreground uppercase tracking-wider">{formatBytes(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(id);
                  }}
                  className="shrink-0 p-2 bg-destructive border-4 border-border text-background hover:scale-105 active:scale-95 transition-transform"
                  title="Remove"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
