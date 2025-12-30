"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBiometricStore } from "@/store/biometric-store";
import { toast } from "sonner";

export function FileUpload() {
  const { loadFromCSV, logs, clearData } = useBiometricStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          loadFromCSV(content);
          toast.success(`Loaded ${file.name} successfully`);
        };
        reader.onerror = () => {
          toast.error("Failed to read file");
        };
        reader.readAsText(file);
      }
    },
    [loadFromCSV]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  if (logs.length > 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <FileText className="h-8 w-8 text-green-500" />
        <div className="flex-1">
          <p className="font-medium">Data Loaded</p>
          <p className="text-sm text-[var(--muted-foreground)]">
            {logs.length.toLocaleString()} records parsed
          </p>
        </div>
        <button
          onClick={() => {
            clearData();
            toast.info("Data cleared");
          }}
          className="rounded-md p-2 hover:bg-[var(--muted)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "cursor-pointer rounded-lg border-2 border-dashed border-[var(--border)] p-8 text-center transition-colors hover:border-[var(--primary)] hover:bg-[var(--muted)]/50",
        isDragActive && "border-[var(--primary)] bg-[var(--muted)]/50"
      )}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-[var(--muted-foreground)]" />
      <p className="mt-4 text-lg font-medium">
        {isDragActive ? "Drop the CSV file here" : "Upload Biometric Log CSV"}
      </p>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Drag & drop or click to select a file
      </p>
    </div>
  );
}
