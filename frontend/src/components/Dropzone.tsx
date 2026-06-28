"use client";

import React, { useState, useEffect, useRef } from "react";
import { UploadCloud, FileSpreadsheet, History, Database, ArrowRight } from "lucide-react";
import { api } from "../utils/api";

interface DropzoneProps {
  onUploadStart: () => void;
  onUploadSuccess: (fileDetails: any) => void;
  onUploadError: (err: string) => void;
}

export default function Dropzone({ onUploadStart, onUploadSuccess, onUploadError }: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRecentFiles();
  }, []);

  const fetchRecentFiles = async () => {
    try {
      const files = await api.getRecentFiles();
      setRecentFiles(files);
    } catch (err) {
      console.error("Failed to fetch recent files", err);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    onUploadStart();
    try {
      const res = await api.uploadFile(file);
      onUploadSuccess(res);
    } catch (err: any) {
      if (err.message === "Network Error") {
        onUploadError("Network Error: Could not connect to the backend server. Please check if the API is running and CORS allows the request.");
      } else {
        onUploadError(err.response?.data?.detail || "Failed to upload file. Make sure file format and size are correct.");
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleRecentSelect = async (f: any) => {
    onUploadStart();
    try {
      const preview = await api.getPreview(f.id);
      onUploadSuccess({
        file_id: f.id,
        filename: f.filename,
        size: f.size,
        domain: f.domain,
        sheets: f.sheets,
        active_sheet: f.active_sheet,
      });
    } catch (err) {
      onUploadError("Unable to retrieve file cache. Please re-upload.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-slide-up">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative glass-card border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[360px] ${
          isDragActive
            ? "border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/5"
            : "border-card-border hover:border-primary/50 hover:bg-card-bg/80"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300">
            <UploadCloud className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Upload your raw dataset</h3>
            <p className="text-muted max-w-md mx-auto text-sm leading-relaxed">
              Drag & drop your Excel (.xlsx, .xls) or CSV files here, or click to browse files from your computer.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 text-xs text-primary font-medium">
            <Database className="h-3.5 w-3.5" />
            Up to 50MB files supported
          </div>
        </div>
      </div>

      {/* Recent Uploads Section */}
      {recentFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted font-medium text-sm">
            <History className="h-4 w-4" />
            <span>Load a recently analyzed dataset</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentFiles.slice(0, 4).map((f) => (
              <div
                key={f.id}
                onClick={() => handleRecentSelect(f)}
                className="glass-card p-4 hover:border-primary/30 cursor-pointer flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="h-5.5 w-5.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                      {f.filename}
                    </p>
                    <p className="text-xs text-muted">
                      {formatSize(f.size)} • {f.domain}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
