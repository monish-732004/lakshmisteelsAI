"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Undo2, CheckSquare, Square, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { api } from "../utils/api";

interface CleaningReviewProps {
  fileId: string;
  currentVersion: number;
  onCleaningSuccess: (versionNumber: number) => void;
}

interface AnomalyRule {
  id: string;
  column: string;
  issue_type: string;
  description: string;
  recommended_fix: string;
  severity: "high" | "medium" | "low";
  affected_count: number;
  default_enabled: boolean;
}

export default function CleaningReview({ fileId, currentVersion, onCleaningSuccess }: CleaningReviewProps) {
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState<AnomalyRule[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [fileId, currentVersion]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await api.getCleaningRules(fileId);
      setRules(data);
      // Pre-select rules where default_enabled is true
      setSelectedIds(data.filter((r: any) => r.default_enabled).map((r: any) => r.id));
    } catch (err) {
      console.error("Failed to load anomalies recommendations", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (selectedIds.length === rules.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(rules.map((r) => r.id));
    }
  };

  const handleApplyCleaning = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.applyCleaning(fileId, selectedIds);
      setAuditLogs(res.audit_logs);
      setMessage(res.message);
      onCleaningSuccess(res.version_number);
    } catch (err: any) {
      console.error("Failed to apply cleaning", err);
      setMessage("Error applying cleaning: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    if (currentVersion === 0) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.undoCleaning(fileId);
      setMessage(res.message);
      setAuditLogs([]);
      onCleaningSuccess(res.version_number);
    } catch (err: any) {
      console.error("Failed to revert cleaning step", err);
      setMessage("Error undoing step: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "high":
        return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      default:
        return "bg-sky-500/10 text-sky-500 border border-sky-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Undo */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">AI Automated Cleaning Review</h3>
          <p className="text-sm text-muted">Review quality anomalies detected below. Select which items to correct.</p>
        </div>
        
        {currentVersion > 0 && (
          <button
            onClick={handleUndo}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 border border-card-border hover:border-primary/50 text-foreground hover:text-primary rounded-xl text-xs font-semibold bg-card-bg transition cursor-pointer"
          >
            <Undo2 className="h-4 w-4" />
            <span>Revert Last Step (v{currentVersion} → v{currentVersion - 1})</span>
          </button>
        )}
      </div>

      {loading && rules.length === 0 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted text-sm font-medium">Scanning dataset columns for anomalies...</p>
        </div>
      ) : rules.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted">
          <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-success" />
          <p className="font-semibold text-foreground text-base">Perfect Data Quality!</p>
          <p className="text-sm">No formatting anomalies or statistical quality issues were found in this dataset.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Multi-select check bar */}
          <div className="glass-card px-4 py-3 flex items-center justify-between text-xs bg-slate-500/5">
            <button
              onClick={handleToggleAll}
              className="flex items-center gap-2 font-semibold text-foreground cursor-pointer"
            >
              {selectedIds.length === rules.length ? (
                <CheckSquare className="h-4.5 w-4.5 text-primary" />
              ) : (
                <Square className="h-4.5 w-4.5 text-muted" />
              )}
              <span>Select All Detected Anomalies ({rules.length})</span>
            </button>
            <span className="text-muted">
              {selectedIds.length} recommendation{selectedIds.length !== 1 && "s"} checked
            </span>
          </div>

          {/* Checklist rules card list */}
          <div className="space-y-3">
            {rules.map((rule) => {
              const isChecked = selectedIds.includes(rule.id);
              return (
                <div
                  key={rule.id}
                  onClick={() => handleToggleRule(rule.id)}
                  className={`glass-card p-4 flex items-start gap-3.5 border transition-all cursor-pointer ${
                    isChecked
                      ? "border-primary/20 bg-primary/2.5"
                      : "border-card-border hover:border-primary/20"
                  }`}
                >
                  <div className="pt-0.5 shrink-0 text-primary">
                    {isChecked ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5 text-muted" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground">
                        {rule.column === "Global" ? "Global Operations" : `Column: ${rule.column}`}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${getSeverityColor(rule.severity)}`}>
                        {rule.severity} severity
                      </span>
                      <span className="text-xs text-muted">
                        ({rule.affected_count.toLocaleString()} rows affected)
                      </span>
                    </div>

                    <p className="text-sm text-muted leading-relaxed">{rule.description}</p>

                    <div className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold bg-primary/5 px-2.5 py-1 rounded-lg">
                      <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                      <span>Recommendation Fix: {rule.recommended_fix}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Execution triggers */}
          <div className="flex justify-end pt-3">
            <button
              onClick={handleApplyCleaning}
              disabled={selectedIds.length === 0 || loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-semibold transition cursor-pointer shadow-md shadow-primary/10"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                  <span>Applying Corrections...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4.5 w-4.5 fill-current" />
                  <span>Apply {selectedIds.length} Selected Cleanings</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Audit logs / messages feedback */}
      {message && (
        <div className="glass-card p-5 border border-success/15 bg-success/2.5 space-y-3">
          <div className="flex items-center gap-2 text-success font-bold text-sm">
            <AlertCircle className="h-5 w-5" />
            <span>Cleaning Operation Summary</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{message}</p>
          {auditLogs.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-card-border/50">
              <span className="text-xs text-muted font-bold block">Execution Logs:</span>
              <ul className="list-disc list-inside text-xs text-muted space-y-1 pl-1 leading-normal">
                {auditLogs.map((log, index) => (
                  <li key={index}>{log}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
