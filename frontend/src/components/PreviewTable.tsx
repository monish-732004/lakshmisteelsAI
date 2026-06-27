"use client";

import React from "react";
import { Table as TableIcon, Info } from "lucide-react";

interface PreviewTableProps {
  columns: string[];
  previewData: any[];
  totalRows: number;
}

export default function PreviewTable({ columns, previewData, totalRows }: PreviewTableProps) {
  if (!columns || columns.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-muted">
        No preview columns available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <TableIcon className="h-5 w-5 text-primary" />
          <span>Raw Data Preview (showing first 20 rows)</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-xs text-muted">
          <Info className="h-3.5 w-3.5" />
          <span>Total records: {totalRows.toLocaleString()}</span>
        </div>
      </div>

      <div className="glass-card overflow-hidden border border-card-border">
        <div className="overflow-x-auto max-h-[480px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="sticky top-0 bg-background border-b border-card-border">
                <th className="py-3 px-4 font-bold text-muted w-12 text-center bg-background/90 backdrop-blur-md">
                  #
                </th>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="py-3 px-4 font-bold text-foreground bg-background/90 backdrop-blur-md border-r border-card-border last:border-r-0 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/50">
              {previewData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-8 text-center text-muted">
                    No records found in this sheet.
                  </td>
                </tr>
              ) : (
                previewData.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="hover:bg-primary/5 transition-colors duration-150"
                  >
                    <td className="py-2.5 px-4 font-medium text-muted text-center border-r border-card-border/30">
                      {rowIdx + 1}
                    </td>
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className="py-2.5 px-4 text-foreground border-r border-card-border/30 last:border-r-0 max-w-xs truncate"
                      >
                        {row[col] === null || row[col] === undefined ? (
                          <span className="italic text-muted/50 bg-slate-500/10 px-1 py-0.5 rounded text-[10px]">
                            null
                          </span>
                        ) : typeof row[col] === "boolean" ? (
                          row[col] ? "True" : "False"
                        ) : (
                          String(row[col])
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
