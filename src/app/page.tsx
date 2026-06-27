"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Moon, Sun, Layers, ArrowLeft, RefreshCw, LogOut, CheckCircle2, ChevronRight, BarChart2, Zap, Brain, Shield, TrendingUp, Cpu, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Dropzone from "../components/Dropzone";
import ReviewAnalysis from "../components/ReviewAnalysis";
import DashboardGrid from "../components/DashboardGrid";
import AiChatbot from "../components/AiChatbot";

import { api } from "../utils/api";

type ActiveTab = "review" | "visuals" | "chat";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [fileDetails, setFileDetails] = useState<any | null>(null);
  
  // Dashboard states
  const [activeTab, setActiveTab] = useState<ActiveTab>("review");
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [profile, setProfile] = useState<any>(null);
  const [currentVersion, setCurrentVersion] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // Automated Loading/Processing States
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processingSteps = [
    "Uploading dataset workbook...",
    "Reading file schemas...",
    "Understanding domain structures...",
    "Cleaning duplicate rows and null values...",
    "Running deep statistical analysis...",
    "Generating executive AI insights...",
    "Creating interactive BI dashboards...",
    "Preparing chatbot co-pilot assistant..."
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const startLoaderSimulation = (onFinish: () => void) => {
    setProcessing(true);
    setProcessingStep(0);
    setErrorMsg(null);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < processingSteps.length) {
        setProcessingStep(step);
      } else {
        clearInterval(interval);
        setProcessing(false);
        onFinish();
      }
    }, 750);
  };

  const handleUploadStart = () => {
    setProcessing(true);
    setProcessingStep(0);
    setErrorMsg(null);
  };

  const handleUploadSuccess = (details: any) => {
    // Upload complete, run the remaining understanding/cleaning phases simulation
    let step = 1;
    setProcessingStep(step);
    
    const interval = setInterval(() => {
      step += 1;
      if (step < processingSteps.length) {
        setProcessingStep(step);
      } else {
        clearInterval(interval);
        setProcessing(false);
        setFileDetails(details);
        setCurrentVersion(1);
        setActiveTab("review");
        loadFileData(details.file_id);
      }
    }, 700);
  };

  const handleUploadError = (err: string) => {
    setProcessing(false);
    setErrorMsg(err);
  };

  const loadFileData = async (fileId: string) => {
    try {
      setLoading(true);
      const preview = await api.getPreview(fileId);
      setPreviewData(preview.preview);
      setColumns(preview.columns);
      setTotalRows(preview.total_rows);

      const prof = await api.profileData(fileId);
      setProfile(prof);
    } catch (err) {
      console.error("Failed to load file assets", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSheetChange = async (sheetName: string) => {
    if (!fileDetails) return;
    
    // Switch active worksheet, triggering processing cycle
    setProcessing(true);
    setProcessingStep(2); // Begin at "understanding data" step
    setErrorMsg(null);

    try {
      const res = await api.selectSheet(fileDetails.file_id, sheetName);
      
      let step = 2;
      const interval = setInterval(() => {
        step += 1;
        if (step < processingSteps.length) {
          setProcessingStep(step);
        } else {
          clearInterval(interval);
          setProcessing(false);
          setFileDetails((prev: any) => ({
            ...prev,
            active_sheet: res.active_sheet,
            domain: res.domain,
          }));
          setCurrentVersion(1);
          setActiveTab("review");
          loadFileData(fileDetails.file_id);
        }
      }, 600);
    } catch (err) {
      console.error("Failed to change sheet", err);
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFileDetails(null);
    setPreviewData([]);
    setColumns([]);
    setTotalRows(0);
    setProfile(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Header bar */}
      <header className="sticky top-0 z-40 bg-yellow-400/95 backdrop-blur-md border-b border-yellow-500/50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleReset}>
          <div className="h-9 w-9 rounded-xl bg-black flex items-center justify-center text-yellow-400 font-bold shadow-md">
            L
          </div>
          <div>
            <h1 className="font-extrabold text-base text-black tracking-tight leading-none text-brand-title">Lakshmi Steels AI</h1>
            <span className="text-[10px] text-black/70 font-semibold block leading-none mt-1">Automated AI Data Analyst & BI</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl border border-black/10 flex items-center justify-center text-black/70 hover:text-black hover:bg-black/5 transition cursor-pointer"
          >
            {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>

          {fileDetails && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-danger/25 text-danger bg-danger/5 hover:bg-danger/10 text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Close Dataset</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {processing ? (
            /* --- AUTOMATED PROCESSING SCREEN --- */
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto w-full glass-card p-8 border border-primary/20 space-y-6 text-center animate-pulse"
            >
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h3 className="text-xl font-bold text-foreground">Intelligent Agent Analysis Running</h3>
                <p className="text-xs text-muted">Please wait while the AI Analyst processes your data workbook.</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-500/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${((processingStep + 1) / processingSteps.length) * 100}%` }}
                />
              </div>

              {/* Ingestion Steps Checklist */}
              <div className="text-left space-y-2 border border-card-border/40 p-4 rounded-2xl bg-card-bg/25">
                {processingSteps.map((stepDesc, idx) => {
                  const isDone = idx < processingStep;
                  const isActive = idx === processingStep;
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs transition-opacity duration-300">
                      <span className={`font-medium ${
                        isDone ? "text-muted line-through opacity-70" :
                        isActive ? "text-primary font-bold" : "text-muted/50"
                      }`}>
                        {stepDesc}
                      </span>
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-card-border/50 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : !fileDetails ? (
            /* --- INGESTION LANDING PAGE --- */
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-12 py-10"
            >
              <div className="text-center space-y-6 max-w-3xl mx-auto glass-card p-8 sm:p-12 mb-8">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-xs text-primary font-bold uppercase tracking-wider">
                  <Sparkles className="h-4 w-4 fill-current animate-pulse" />
                  <span>Cognitive Business Analytics Engine</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
                  Intelligent <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent drop-shadow-sm">AI Business Intelligence</span> Platform
                </h2>
                <p className="text-foreground font-medium text-sm md:text-base leading-relaxed">
                  Upload any Excel or CSV spreadsheet. Within seconds, our system cleans the cells, builds visual Tableau-style dashboards, compiles descriptive statistics, and provisions an AI assistant co-pilot.
                </p>
              </div>

              {errorMsg && (
                <div className="max-w-xl mx-auto p-4 rounded-xl border border-danger/25 bg-danger/5 text-danger text-sm text-center">
                  {errorMsg}
                </div>
              )}

              <Dropzone
                onUploadStart={handleUploadStart}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />

              <div className="space-y-4 pt-10">
                <h3 className="text-center text-xs font-bold text-muted uppercase tracking-widest">
                  End-to-End Automated Capabilities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="glass-card p-6 space-y-3 hover:border-primary/20 transition-all">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                      <Shield className="h-5.5 w-5.5" />
                    </div>
                    <h4 className="font-bold text-sm text-foreground">Automatic Cleaning</h4>
                    <p className="text-xs text-muted leading-relaxed">
                      Removes row duplicates, fills missing items with standard mean/mode, normalizes phone/emails structure, and clips numerical outliers.
                    </p>
                  </div>

                  <div className="glass-card p-6 space-y-3 hover:border-primary/20 transition-all">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                      <BarChart2 className="h-5.5 w-5.5" />
                    </div>
                    <h4 className="font-bold text-sm text-foreground">Descriptive Profiling</h4>
                    <p className="text-xs text-muted leading-relaxed">
                      Calculates skewness, kurtosis, mode, standard deviation, and variance values across all variables instantly.
                    </p>
                  </div>

                  <div className="glass-card p-6 space-y-3 hover:border-primary/20 transition-all">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <Brain className="h-5.5 w-5.5" />
                    </div>
                    <h4 className="font-bold text-sm text-foreground">Interactive Chat Co-pilot</h4>
                    <p className="text-xs text-muted leading-relaxed">
                      Pose questions directly to your dataset co-pilot about sales trends, regional outcomes, or statistics calculations.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* --- DUAL WORKSPACE LAYOUT (Left Sidebar tabs, Right Workspace Central pane) --- */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full items-start"
            >
              {/* Left Workspace Panel controls */}
              <div className="lg:col-span-1 space-y-5">
                {/* Active File metadata card */}
                <div className="glass-card p-4 space-y-3.5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Loaded Database</span>
                    <h3 className="font-bold text-sm text-foreground truncate">{fileDetails.filename}</h3>
                    <p className="text-xs text-muted">
                      Sheet: <span className="font-semibold text-foreground">{fileDetails.active_sheet}</span>
                    </p>
                  </div>

                  {fileDetails.sheets.length > 1 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-muted uppercase">Select Active Worksheet</span>
                      <select
                        value={fileDetails.active_sheet}
                        onChange={(e) => handleSheetChange(e.target.value)}
                        disabled={loading}
                        className="w-full glass-input px-2.5 py-1.5 text-xs text-foreground cursor-pointer animate-none"
                      >
                        {fileDetails.sheets.map((sheet: string) => (
                          <option key={sheet} value={sheet}>
                            {sheet}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="pt-2 border-t border-card-border/50 grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded bg-slate-500/5">
                      <span className="text-[9px] font-bold text-muted uppercase block">KPI Domain</span>
                      <span className="text-xs font-bold text-foreground truncate block">{fileDetails.domain}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-500/5">
                      <span className="text-[9px] font-bold text-muted uppercase block">Data Status</span>
                      <span className="text-xs font-bold text-emerald-500 block">Cleaned</span>
                    </div>
                  </div>
                </div>

                {/* 3 primary tabs navigation list */}
                <nav className="glass-card p-2 flex flex-col space-y-1">
                  {[
                    { id: "review", label: "1. Review Analysis", sub: "Descriptive & KPI profiling" },
                    { id: "visuals", label: "2. Visual Dashboard", sub: "ECharts BI comparisons" },
                    { id: "chat", label: "3. Chat With Data", sub: "Gemini conversational RAG" },
                  ].map((tab) => {
                    const isSelected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ActiveTab)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl flex flex-col transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary text-white font-medium shadow-md shadow-primary/10"
                            : "hover:bg-slate-500/5 text-foreground"
                        }`}
                      >
                        <span className="text-xs font-extrabold">{tab.label}</span>
                        <span className={`text-[9px] mt-0.5 ${isSelected ? "text-white/70" : "text-muted"}`}>
                          {tab.sub}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Central pane taking up 3/4 columns full-width */}
              <div className="lg:col-span-3 min-h-[500px]">
                {loading ? (
                  <div className="glass-card p-20 text-center flex flex-col items-center justify-center space-y-4">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-semibold text-muted">Compiling data analysis caching matrices...</p>
                  </div>
                ) : (
                  <>
                    {activeTab === "review" && (
                      <ReviewAnalysis fileId={fileDetails.file_id} />
                    )}
                    
                    {activeTab === "visuals" && profile && (
                      <DashboardGrid profile={profile} previewData={previewData} />
                    )}

                    {activeTab === "chat" && (
                      <div className="animate-slide-up">
                        <AiChatbot fileId={fileDetails.file_id} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
