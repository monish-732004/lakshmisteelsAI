"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Moon, Sun, Layers, ArrowLeft, RefreshCw, LogOut, CheckCircle2, ChevronRight, BarChart2, Zap, Brain, Shield, TrendingUp, Cpu, Loader2, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Dropzone from "../components/Dropzone";
import ReviewAnalysis from "../components/ReviewAnalysis";
import DashboardGrid from "../components/DashboardGrid";
import AiChatbot from "../components/AiChatbot";

import { api } from "../utils/api";
import { useTranslation } from "../utils/LanguageContext";

type ActiveTab = "review" | "visuals" | "chat";

export default function Home() {
  const { language, setLanguage, t } = useTranslation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
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
    t("loader.step0"),
    t("loader.step1"),
    t("loader.step2"),
    t("loader.step3"),
    t("loader.step4"),
    t("loader.step5"),
    t("loader.step6"),
    t("loader.step7")
  ];

  const [showTranslatePrompt, setShowTranslatePrompt] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);

    const savedLang = localStorage.getItem("lang-prompt-decided");
    if (!savedLang) {
      const browserLang = navigator.language;
      if (browserLang.startsWith("en") || !browserLang.startsWith("ta")) {
        setShowTranslatePrompt(true);
      }
    }
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
    <div className="min-h-screen flex flex-col pt-15 transition-colors duration-300">
      {/* Floating Navbar */}
<header className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
  <div className="flex items-center rounded-full border border-yellow-500/15 bg-zinc-950/75 backdrop-blur-2xl px-6 py-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-all duration-300 hover:border-yellow-500/30 hover:shadow-[0_20px_70px_rgba(234,179,8,0.12)]">

    <button
      onClick={handleReset}
      className="flex items-center gap-3 group"
    >
      {/* Logo */}
      <div className="h-10 w-10 overflow-hidden rounded-full border border-yellow-500/25 bg-zinc-900 shadow-md transition-all duration-300 group-hover:scale-105">
        <img
          src="vercel.svg"
          alt="Lakshmi Steels"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Brand */}
      <div className="leading-tight">
        <h1 className="text-lg font-bold text-yellow-400 transition-colors duration-300 group-hover:text-yellow-300">
          Lakshmi Steels
        </h1>

        <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400">
          Construction Materials
        </p>
      </div>
    </button>

  </div>
</header>

      {/* Top Right Actions Menu */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        {fileDetails && (
          <button
            onClick={handleReset}
            className="group flex items-center gap-2 px-4 py-2 rounded-full border border-rose-500/20 bg-zinc-950/70 backdrop-blur-xl text-sm font-semibold text-rose-400 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105 hover:bg-rose-500/10 hover:border-rose-400/50 hover:text-rose-300 hover:shadow-[0_15px_40px_rgba(244,63,94,0.25)] active:scale-95 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("header.closeDataset")}</span>
          </button>
        )}

        <div className="relative">
          <button 
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="h-10 w-10 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white shadow-xl cursor-pointer hover:bg-zinc-900 transition-colors"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          
          <AnimatePresence>
            {langMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-48 rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl z-50 flex flex-col space-y-2"
              >
                <div className="text-[10px] font-bold text-zinc-500 uppercase px-2 pt-2 tracking-wider">Settings</div>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
                >
                  <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </button>
                
                <div className="h-px bg-zinc-800 my-1 mx-2" />
                
                <div className="text-[10px] font-bold text-zinc-500 uppercase px-2 pt-1 tracking-wider">Language</div>
                <button
                  onClick={() => {
                    setLanguage("ta");
                    setLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    language === "ta" ? "bg-yellow-500/10 text-yellow-500" : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  தமிழ்
                </button>
                <button
                  onClick={() => {
                    setLanguage("en");
                    setLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    language === "en" ? "bg-yellow-500/10 text-yellow-500" : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  English
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
                <h3 className="text-xl font-bold text-foreground">{t("loader.title")}</h3>
                <p className="text-xs text-muted">{t("loader.desc")}</p>
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
                  <span>{t("landing.tag")}</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
                  {t("landing.title")}
                </h2>
                <p className="text-foreground font-medium text-sm md:text-base leading-relaxed">
                  {t("landing.desc")}
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
                  {t("capabilities.title")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="glass-card p-6 space-y-3 hover:border-primary/20 transition-all">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                      <Shield className="h-5.5 w-5.5" />
                    </div>
                    <h4 className="font-bold text-sm text-foreground">{t("capabilities.clean.title")}</h4>
                    <p className="text-xs text-muted leading-relaxed">
                      {t("capabilities.clean.desc")}
                    </p>
                  </div>

                  <div className="glass-card p-6 space-y-3 hover:border-primary/20 transition-all">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                      <BarChart2 className="h-5.5 w-5.5" />
                    </div>
                    <h4 className="font-bold text-sm text-foreground">{t("capabilities.profile.title")}</h4>
                    <p className="text-xs text-muted leading-relaxed">
                      {t("capabilities.profile.desc")}
                    </p>
                  </div>

                  <div className="glass-card p-6 space-y-3 hover:border-primary/20 transition-all">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <Brain className="h-5.5 w-5.5" />
                    </div>
                    <h4 className="font-bold text-sm text-foreground">{t("capabilities.chat.title")}</h4>
                    <p className="text-xs text-muted leading-relaxed">
                      {t("capabilities.chat.desc")}
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
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{t("meta.loadedDb")}</span>
                    <h3 className="font-bold text-sm text-foreground truncate">{fileDetails.filename}</h3>
                    <p className="text-xs text-muted">
                      {t("meta.sheet", { sheet: fileDetails.active_sheet })}
                    </p>
                  </div>

                  {fileDetails.sheets.length > 1 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-muted uppercase">{t("meta.selectSheet")}</span>
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
                      <span className="text-[9px] font-bold text-muted uppercase block">{t("meta.kpiDomain")}</span>
                      <span className="text-xs font-bold text-foreground truncate block">{fileDetails.domain}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-500/5">
                      <span className="text-[9px] font-bold text-muted uppercase block">{t("meta.dataStatus")}</span>
                      <span className="text-xs font-bold text-emerald-500 block">{t("meta.cleaned")}</span>
                    </div>
                  </div>
                </div>

                {/* 3 primary tabs navigation list */}
                <nav className="glass-card p-2 flex flex-col space-y-1">
                  {[
                    { id: "review", label: t("tab.review"), sub: t("tab.review.sub") },
                    { id: "visuals", label: t("tab.visuals"), sub: t("tab.visuals.sub") },
                    { id: "chat", label: t("tab.chat"), sub: t("tab.chat.sub") },
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
              <div className="lg:col-span-3 min-h-125">
                {loading ? (
                  <div className="glass-card p-20 text-center flex flex-col items-center justify-center space-y-4">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-semibold text-muted">{t("loader.compiling")}</p>
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

      {/* Overall Footer */}
<footer className="w-full mt-24 border-t border-zinc-800 bg-zinc-950/95">
  <div className="max-w-7xl mx-auto px-6 py-16">

    {/* Logo & Brand */}
    <div className="flex flex-col items-center text-center">

      <div className="h-16 w-16 rounded-2xl overflow-hidden border border-yellow-500/20 bg-zinc-900 shadow-xl transition-all duration-300 hover:scale-105 hover:border-yellow-500/40">
        <img
          src="/vercel.svg"
          alt="Lakshmi Steels"
          className="h-full w-full object-cover"
        />
      </div>

      <h2 className="mt-5 text-3xl font-black tracking-wide text-yellow-400">
        {t("brand.title")}
      </h2>

      <p className="mt-2 text-sm uppercase tracking-[0.35em] text-zinc-400">
        Premium Construction Materials
      </p>

    </div>

    {/* Description */}
    <div className="mt-10 max-w-4xl mx-auto text-center">
      <p className="text-lg leading-9 text-zinc-300">
        {t("footer.text")}
      </p>
    </div>

    {/* Divider */}
    <div className="my-12 h-px w-full bg-linear-to-r from-transparent via-zinc-700 to-transparent" />

    {/* Footer Links / Highlights */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">

      <div>
        <h4 className="text-white font-bold text-lg mb-3">
          Products
        </h4>

        <p className="text-zinc-400 leading-8">
          Cement<br />
          TMT Bars<br />
          Steel Products<br />
          Tiles & Sanitary Ware
        </p>
      </div>

      <div>
        <h4 className="text-white font-bold text-lg mb-3">
          Our Commitment
        </h4>

        <p className="text-zinc-400 leading-8">
          Quality Products<br />
          Trusted Brands<br />
          Competitive Pricing<br />
          Reliable Service
        </p>
      </div>

      <div>
        <h4 className="text-white font-bold text-lg mb-3">
          Serving
        </h4>

        <p className="text-zinc-400 leading-8">
          Builders<br />
          Contractors<br />
          Engineers<br />
          Homeowners
        </p>
      </div>

    </div>

    {/* Bottom */}
    <div className="mt-14 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-zinc-800 pt-8">

      <p className="text-sm text-zinc-500">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-zinc-300">
          {t("brand.title")}
        </span>
        . All Rights Reserved.
      </p>

      <p className="text-sm font-medium tracking-wide text-yellow-400">
        Building Strength • Delivering Trust
      </p>

    </div>

  </div>
</footer>
      {/* Browser translation request prompt popup modal */}
      <AnimatePresence>
        {showTranslatePrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTranslatePrompt(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl z-10 space-y-6"
            >
              {/* Amber highlight glow */}
              <div className="absolute -top-24 -left-24 h-48 w-48 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-0 overflow-hidden shadow-md">
                  <img src="/vercel.svg" alt="Logo" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-yellow-400 leading-tight">Language / மொழியைத் தேர்ந்தெடுக்கவும்</h3>
                  <span className="text-[10px] text-zinc-400 font-semibold block leading-none mt-1">Translate Interface</span>
                </div>
              </div>

              <div className="space-y-2 text-zinc-300 text-xs leading-relaxed">
                <p>
                  We detected your browser language is English. Would you like to switch the interface to English?
                </p>
                <p className="text-zinc-400 font-semibold">
                  உங்கள் உலாவி மொழி ஆங்கிலமாக உள்ளதை நாங்கள் கவனிக்கிறோம். லக்ஷ்மி ஸ்டீல்ஸ் இணையதளத்தை ஆங்கிலத்திற்கு மாற்ற விரும்புகிறீர்களா?
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLanguage("en");
                    localStorage.setItem("lang-prompt-decided", "en");
                    setShowTranslatePrompt(false);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-md transition duration-150 cursor-pointer text-center"
                >
                  English / Switch to English
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage("ta");
                    localStorage.setItem("lang-prompt-decided", "ta");
                    setShowTranslatePrompt(false);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-bold text-xs transition duration-150 cursor-pointer text-center"
                >
                  தமிழ் / Keep Tamil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

