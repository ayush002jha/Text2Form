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
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-5
          flex flex-col items-center justify-center gap-2 text-center
          transition-all duration-200
          ${isDragActive
            ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10"
            : uploadedFiles.length >= maxFiles
              ? "border-white/5 bg-white/[0.01] opacity-50 cursor-not-allowed"
              : "border-white/10 bg-white/[0.02] hover:border-violet-500/40 hover:bg-white/[0.04]"
          }
        `}
      >
        <input {...getInputProps()} />

        {/* Upload icon */}
        <div className={`p-2.5 rounded-xl border border-white/5 transition-colors
          ${isDragActive ? "bg-violet-500/20" : "bg-white/5"}`}>
          <svg className={`w-5 h-5 transition-colors ${isDragActive ? "text-violet-400" : "text-white/40"}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>

        <div>
          <p className="text-sm font-medium text-white/60">
            {isDragActive ? "Drop to add context" : "Upload context files"}
          </p>
          <p className="text-xs text-white/30 mt-0.5">
            PDF, Word, TXT, or Images · Max {maxFiles} files
          </p>
        </div>
      </div>

      {/* Attached files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map(({ file, id }) => {
            const type = getFileType(file.type);
            const cfg = FILE_TYPE_CONFIG[type];
            return (
              <div key={id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 group">
                <div className={`shrink-0 w-8 h-8 rounded-lg ${cfg.bgColor} flex items-center justify-center`}>
                  <span className={`text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm text-white/70 truncate">{file.name}</p>
                  <p className="text-[11px] text-white/30">{formatBytes(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(id)}
                  className="shrink-0 p-1 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
