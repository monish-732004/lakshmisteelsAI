"use client";

import React from "react";
import { Download, FileSpreadsheet, FileText, Table } from "lucide-react";
import { api } from "../utils/api";

interface ReportDownloaderProps {
  fileId: string;
}

export default function ReportDownloader({ fileId }: ReportDownloaderProps) {
  const handleDownload = (format: "excel" | "csv" | "pdf") => {
    // Open a new tab or trigger browser download directly via endpoint url link
    const url = api.getExportUrl(fileId, format);
    window.open(url, "_blank");
  };

  const exporters = [
    {
      format: "csv" as const,
      title: "Cleaned CSV",
      desc: "Download row items as a standard comma-separated text file.",
      icon: <Table className="h-5 w-5" />,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "hover:border-blue-500/30"
    },
    {
      format: "excel" as const,
      title: "Cleaned Excel Workbook",
      desc: "Download formatted spreadsheet sheet with fitted columns.",
      icon: <FileSpreadsheet className="h-5 w-5" />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "hover:border-emerald-500/30"
    },
    {
      format: "pdf" as const,
      title: "Executive PDF Summary",
      desc: "Download styled summary report including KPIs and AI-generated insights.",
      icon: <FileText className="h-5 w-5" />,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "hover:border-rose-500/30"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground">Export Data & Business Reports</h3>
        <p className="text-sm text-muted">Generate and download cleaned tables or AI-generated reports instantly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exporters.map((exp, idx) => (
          <div
            key={idx}
            onClick={() => handleDownload(exp.format)}
            className={`glass-card p-5 cursor-pointer flex flex-col justify-between border border-card-border transition-all duration-200 group ${exp.border}`}
          >
            <div className="space-y-3">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${exp.bg} ${exp.color} group-hover:scale-105 transition-transform duration-300`}>
                {exp.icon}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  {exp.title}
                </h4>
                <p className="text-xs text-muted leading-relaxed">{exp.desc}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-card-border/30 flex items-center gap-1.5 text-xs text-primary font-semibold">
              <Download className="h-3.5 w-3.5" />
              <span>Download File</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
