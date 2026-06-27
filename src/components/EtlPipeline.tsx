"use client";

import React, { useState, useEffect, useRef } from "react";
import { Download, Layers, ShieldCheck, HardDrive, Play, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import { api } from "../utils/api";

interface EtlPipelineProps {
  fileId: string;
  onPipelineComplete?: () => void;
}

type StageName = "Extract" | "Transform" | "Validate" | "Load";
type StageStatus = "idle" | "running" | "completed";

interface EtlStage {
  name: StageName;
  label: string;
  icon: React.ReactNode;
  status: StageStatus;
  message: string;
  logs: string[];
}

export default function EtlPipeline({ fileId, onPipelineComplete }: EtlPipelineProps) {
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState<EtlStage[]>([
    { name: "Extract", label: "Extract Data", icon: <Download className="h-5 w-5" />, status: "idle", message: "Extract file structure and dimensions", logs: [] },
    { name: "Transform", label: "Transform Data", icon: <Layers className="h-5 w-5" />, status: "idle", message: "Coerce types, trim spaces, check metrics", logs: [] },
    { name: "Validate", label: "Validate Data", icon: <ShieldCheck className="h-5 w-5" />, status: "idle", message: "Run outlier and structural checks", logs: [] },
    { name: "Load", label: "Load Data", icon: <HardDrive className="h-5 w-5" />, status: "idle", message: "Save version snap, write cache database", logs: [] },
  ]);
  
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  const addLog = (log: string, prefix = "INFO") => {
    const timestamp = new Date().toISOString().split("T")[1].slice(0, 8);
    setTerminalLogs((prev) => [...prev, `[${timestamp}] [${prefix}] ${log}`]);
  };

  const executeEtl = async () => {
    setRunning(true);
    setTerminalLogs([]);
    addLog("Initializing ETL Execution pipeline for dataset...", "SYS");

    try {
      const etlResponse = await api.runEtl(fileId);
      
      // Step-by-step sequential animation of stages
      for (let i = 0; i < etlResponse.length; i++) {
        const resStage = etlResponse[i];
        
        // 1. Mark current stage as running
        setStages((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s))
        );
        addLog(`Started ETL Phase: ${resStage.stage}...`, "PIPELINE");
        
        // Simulate execution latency for visuals
        for (const logItem of resStage.logs) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          addLog(logItem, resStage.stage.toUpperCase());
        }
        
        // 2. Mark stage as completed
        setStages((prev) =>
          prev.map((s, idx) =>
            idx === i
              ? { ...s, status: "completed", message: resStage.message }
              : s
          )
        );
        addLog(`Successfully completed: ${resStage.stage}`, "SUCCESS");
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      addLog("ETL Pipeline Execution Finished. Dataset loaded successfully.", "SYS");
      setRunning(false);
      
      if (onPipelineComplete) {
        onPipelineComplete();
      }
    } catch (err: any) {
      addLog(`ETL Execution Failed: ${err.message || "Unknown error"}`, "ERROR");
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">Interactive ETL Pipeline</h3>
          <p className="text-sm text-muted">Extract raw data, normalize columns, validate rules, and index cache.</p>
        </div>
        <button
          onClick={executeEtl}
          disabled={running}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium shadow-md shadow-primary/10 transition cursor-pointer"
        >
          {running ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="h-4.5 w-4.5 fill-current" />
              <span>Trigger ETL Pipeline</span>
            </>
          )}
        </button>
      </div>

      {/* Visual Pipeline Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {stages.map((stage, idx) => {
          const isIdle = stage.status === "idle";
          const isRunning = stage.status === "running";
          const isCompleted = stage.status === "completed";

          return (
            <React.Fragment key={stage.name}>
              <div
                className={`glass-card p-5 relative flex flex-col items-center text-center transition-all duration-300 border ${
                  isRunning
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10 scale-105 animate-pulse-glow"
                    : isCompleted
                    ? "border-success bg-success/5"
                    : "border-card-border opacity-70"
                }`}
              >
                {/* Visual indicator dot */}
                <div
                  className={`absolute top-3 right-3 h-2.5 w-2.5 rounded-full ${
                    isRunning
                      ? "bg-primary animate-ping"
                      : isCompleted
                      ? "bg-success"
                      : "bg-slate-500/30"
                  }`}
                ></div>

                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center mb-3 ${
                    isRunning
                      ? "bg-primary/20 text-primary"
                      : isCompleted
                      ? "bg-success/20 text-success"
                      : "bg-slate-500/10 text-muted"
                  }`}
                >
                  {stage.icon}
                </div>

                <h4 className="font-bold text-sm text-foreground mb-1">{stage.label}</h4>
                <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">{stage.message}</p>
              </div>
              
              {/* Connector between nodes (desktop only) */}
              {idx < 3 && (
                <div className="hidden md:flex justify-center text-muted col-span-1 absolute">
                  {/* Visual helper, skipped for grid calculations */}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Terminal logs panel */}
      <div className="glass-card bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>ETL Execution Logs</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
          </div>
        </div>
        <div className="p-4 font-mono text-xs text-slate-300 space-y-1.5 h-48 overflow-y-auto select-text scrollbar-thin">
          {terminalLogs.length === 0 ? (
            <div className="text-slate-500 italic">Logs will appear here once pipeline execution starts...</div>
          ) : (
            terminalLogs.map((log, index) => {
              let colorClass = "text-slate-300";
              if (log.includes("[SUCCESS]")) colorClass = "text-emerald-400";
              if (log.includes("[ERROR]")) colorClass = "text-red-400 font-semibold";
              if (log.includes("[SYS]")) colorClass = "text-indigo-400";
              if (log.includes("[PIPELINE]")) colorClass = "text-amber-400";

              return (
                <div key={index} className={`${colorClass} leading-normal`}>
                  {log}
                </div>
              );
            })
          )}
          <div ref={terminalEndRef}></div>
        </div>
      </div>
    </div>
  );
}
