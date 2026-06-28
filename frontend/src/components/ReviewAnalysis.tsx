"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, HelpCircle, Download, CheckCircle, AlertTriangle, Info, TrendingUp, Cpu, Database, Award, ShieldAlert, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "../utils/api";
import { useTranslation } from "../utils/LanguageContext";

interface ReviewAnalysisProps {
  fileId: string;
}

export default function ReviewAnalysis({ fileId }: ReviewAnalysisProps) {
  const { t } = useTranslation();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStats, setExpandedStats] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAnalysis();
  }, [fileId]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const data = await api.getAnalysis(fileId);
      setAnalysis(data);
    } catch (err) {
      console.error("Failed to load analysis details", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatExpand = (col: string) => {
    setExpandedStats(prev => ({ ...prev, [col]: !prev[col] }));
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
        <Cpu className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted">{t("loader.compiling")}</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="py-20 text-center text-danger">
        <AlertTriangle className="h-8 w-8 mx-auto" />
        <p className="text-sm font-semibold mt-2">Failed to load dataset analysis.</p>
      </div>
    );
  }

  const { overview, quality, stats, trend_analysis, kpis, predictions, executive_summary } = analysis;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Top Banner Exporters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 glass-card mb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t("review.title")}</h2>
          <p className="text-xs font-semibold text-foreground/80 mt-1">{t("review.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`${api.getExportUrl(fileId, "excel")}?version_num=0`}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-card-border/60 hover:bg-slate-500/5 text-xs text-muted hover:text-foreground transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t("review.btn.origExcel")}</span>
          </a>
          <a
            href={`${api.getExportUrl(fileId, "excel")}?version_num=1`}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/10 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t("review.btn.cleanExcel")}</span>
          </a>
          <a
            href={`${api.getExportUrl(fileId, "csv")}?version_num=1`}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t("review.btn.cleanCsv")}</span>
          </a>
          <a
            href={api.getExportUrl(fileId, "pdf")}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-danger/25 text-danger bg-danger/5 hover:bg-danger/10 text-xs font-semibold transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t("review.btn.pdf")}</span>
          </a>
        </div>
      </div>

      {/* Domain KPI Detection Row */}
      {Object.keys(kpis).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(kpis).map(([kpiName, kpiValue]: any, idx) => (
            <div key={kpiName} className="glass-card p-4 flex flex-col justify-between space-y-1.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-10 w-10 bg-primary/5 rounded-bl-full pointer-events-none" />
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block truncate">{kpiName}</span>
              <span className="text-lg md:text-xl font-extrabold text-foreground tracking-tight">{kpiValue}</span>
            </div>
          ))}
        </div>
      )}

      {/* Executive Summary Card */}
      <div className="glass-card p-6 border-accent/15 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-36 w-36 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2 text-accent font-bold text-sm uppercase tracking-wider mb-3">
          <Sparkles className="h-4.5 w-4.5 animate-pulse fill-current" />
          <span>{t("review.summaryTitle")}</span>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-foreground leading-relaxed font-medium font-sans">
            {executive_summary.text}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-card-border/30">
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block">{t("review.oppTitle")}</span>
              <ul className="text-xs text-muted space-y-1.5">
                {executive_summary.opportunities.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider block">{t("review.risksTitle")}</span>
              <ul className="text-xs text-muted space-y-1.5">
                {executive_summary.risks.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Overview and Data Quality */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dataset Overview */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase">
            <Database className="h-4.5 w-4.5" />
            <span>{t("review.indicatorTitle")}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-500/5 border border-card-border/30">
              <span className="text-[10px] text-muted block uppercase font-bold">{t("review.indicator.rows")}</span>
              <span className="text-xl font-extrabold text-foreground">{overview.total_rows.toLocaleString()}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-500/5 border border-card-border/30">
              <span className="text-[10px] text-muted block uppercase font-bold">{t("review.indicator.cols")}</span>
              <span className="text-xl font-extrabold text-foreground">{overview.total_columns}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-500/5 border border-card-border/30">
              <span className="text-[10px] text-muted block uppercase font-bold">{t("review.indicator.size")}</span>
              <span className="text-xl font-extrabold text-foreground">{overview.file_size_kb} KB</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-500/5 border border-card-border/30">
              <span className="text-[10px] text-muted block uppercase font-bold">{t("review.indicator.dateRange")}</span>
              <span className="text-xs font-bold text-foreground truncate block pt-1">
                {overview.date_range || t("review.indicator.noDate")}
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-foreground">{t("review.metricsTitle")}</span>
            <div className="max-h-36 overflow-y-auto border border-card-border/40 rounded-xl scrollbar-thin p-2 space-y-1 bg-card-bg/20">
              {Object.entries(overview.data_types).map(([colName, colType]: any) => (
                <div key={colName} className="flex items-center justify-between text-xs py-1 px-2 hover:bg-slate-500/5 rounded">
                  <span className="font-semibold text-foreground truncate max-w-[70%]">{colName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    colType === "numeric" ? "bg-blue-500/10 text-blue-500" :
                    colType === "datetime" ? "bg-amber-500/10 text-amber-500" :
                    colType === "boolean" ? "bg-emerald-500/10 text-emerald-500" :
                    "bg-slate-500/10 text-muted"
                  }`}>
                    {colType}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Quality Report & Auto Cleaning Summary */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-sm uppercase">
                <ShieldAlert className="h-4.5 w-4.5" />
                <span>{t("review.qualityTitle")}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/5 border border-card-border/40">
                <span className="text-[10px] text-muted font-bold">SCORE</span>
                <span className={`text-xs font-bold ${
                  quality.score >= 85 ? "text-emerald-500" :
                  quality.score >= 60 ? "text-amber-500" : "text-danger"
                }`}>{quality.score}/100</span>
              </div>
            </div>

            {/* Quality Score Bar */}
            <div className="w-full bg-slate-500/10 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  quality.score >= 85 ? "bg-emerald-500" :
                  quality.score >= 60 ? "bg-amber-500" : "bg-danger"
                }`}
                style={{ width: `${quality.score}%` }}
              />
            </div>

            {/* Anomaly issues breakdown */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded bg-slate-500/5 text-center">
                <span className="text-[9px] text-muted block uppercase">{t("review.quality.outliers")}</span>
                <span className="text-sm font-bold text-foreground">{quality.issues.outliers}</span>
              </div>
              <div className="p-2 rounded bg-slate-500/5 text-center">
                <span className="text-[9px] text-muted block uppercase">{t("review.quality.nulls")}</span>
                <span className="text-sm font-bold text-foreground">{quality.issues.missing_values}</span>
              </div>
              <div className="p-2 rounded bg-slate-500/5 text-center">
                <span className="text-[9px] text-muted block uppercase">{t("review.quality.dups")}</span>
                <span className="text-sm font-bold text-foreground">{quality.issues.duplicate_records}</span>
              </div>
            </div>
          </div>

          {/* Auto Cleaning Summary Checklist */}
          <div className="pt-3 border-t border-card-border/30 space-y-2">
            <span className="text-xs font-bold text-foreground block">{t("review.clean.autoTitle")}</span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin">
              {quality.cleaning_summary.length > 0 ? (
                quality.cleaning_summary.map((log: string, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted py-0.5">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="truncate">{log}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted italic flex items-center gap-1.5">
                  <Info className="h-4 w-4" />
                  <span>{t("review.clean.empty")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Statistical Analysis Tab */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase">
          <BarChart3 className="h-4.5 w-4.5" />
          <span>{t("review.stats.descriptive")}</span>
        </div>
        <div className="overflow-x-auto border border-card-border/40 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-500/5 border-b border-card-border/50 text-muted">
                <th className="p-3">{t("review.stats.colVar")}</th>
                <th className="p-3 text-right">{t("review.stats.mean")}</th>
                <th className="p-3 text-right">{t("review.stats.median")}</th>
                <th className="p-3 text-right">{t("review.stats.mode")}</th>
                <th className="p-3 text-right">{t("review.stats.variance")}</th>
                <th className="p-3 text-right">{t("review.stats.stdDev")}</th>
                <th className="p-3 text-right">{t("review.stats.min")}</th>
                <th className="p-3 text-right">{t("review.stats.max")}</th>
                <th className="p-3 text-right">{t("review.stats.skewness")}</th>
                <th className="p-3 text-right">{t("review.stats.kurtosis")}</th>
                <th className="p-3 text-center">{t("review.stats.percentiles")}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.columns).map(([colName, colStat]: any) => {
                const isExpanded = expandedStats[colName];
                return (
                  <React.Fragment key={colName}>
                    <tr className="border-b border-card-border/30 hover:bg-slate-500/5">
                      <td className="p-3 font-bold text-foreground">{colName}</td>
                      <td className="p-3 text-right">{colStat.mean?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right">{colStat.median?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right">{colStat.mode !== null ? colStat.mode : "N/A"}</td>
                      <td className="p-3 text-right">{colStat.variance?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right">{colStat.std_dev?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right">{colStat.min?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right">{colStat.max?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right">{colStat.skewness?.toFixed(2)}</td>
                      <td className="p-3 text-right">{colStat.kurtosis?.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleStatExpand(colName)}
                          className="p-1 rounded bg-primary/10 hover:bg-primary/20 text-primary cursor-pointer transition"
                        >
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-500/5">
                        <td colSpan={11} className="p-4 border-b border-card-border/30">
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="p-2.5 rounded bg-card-bg border border-card-border/50">
                              <span className="text-[10px] text-muted uppercase block font-bold">{t("review.stats.p25")}</span>
                              <span className="text-sm font-extrabold text-foreground">
                                {colStat.percentiles["25%"]?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="p-2.5 rounded bg-card-bg border border-card-border/50">
                              <span className="text-[10px] text-muted uppercase block font-bold">{t("review.stats.p50")}</span>
                              <span className="text-sm font-extrabold text-foreground">
                                {colStat.percentiles["50%"]?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="p-2.5 rounded bg-card-bg border border-card-border/50">
                              <span className="text-[10px] text-muted uppercase block font-bold">{t("review.stats.p75")}</span>
                              <span className="text-sm font-extrabold text-foreground">
                                {colStat.percentiles["75%"]?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="p-2.5 rounded bg-card-bg border border-card-border/50">
                              <span className="text-[10px] text-muted uppercase block font-bold">{t("review.stats.p90")}</span>
                              <span className="text-sm font-extrabold text-foreground">
                                {colStat.percentiles["90%"]?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {Object.keys(stats.columns).length === 0 && (
                <tr>
                  <td colSpan={11} className="p-6 text-center text-muted italic">
                    {t("review.stats.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Correlation Grid & Feature Importance Row */}
      {stats.correlation_matrix.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Correlation matrix heat grid */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase">
              <BarChart3 className="h-4.5 w-4.5" />
              <span>{t("review.corr.title")}</span>
            </div>
            <div className="p-2 border border-card-border/30 rounded-xl overflow-x-auto">
              <div className="min-w-[320px] grid gap-1">
                {(() => {
                  const uniqueX = Array.from(new Set(stats.correlation_matrix.map((c: any) => c.x))) as string[];
                  return (
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${uniqueX.length + 1}, minmax(0, 1fr))` }} className="text-center font-bold text-[9px]">
                      <div className="text-left font-semibold text-muted max-w-20 truncate border-b border-card-border/20 pb-1" />
                      {uniqueX.map(header => (
                        <div key={header} className="truncate max-w-16 mx-auto text-muted border-b border-card-border/20 pb-1" title={header}>
                          {header}
                        </div>
                      ))}
                      {uniqueX.map(row => (
                        <React.Fragment key={row}>
                          <div className="text-left font-semibold text-foreground truncate max-w-20 self-center py-1.5" title={row}>
                            {row}
                          </div>
                          {uniqueX.map(col => {
                            const valObj = stats.correlation_matrix.find((c: any) => c.x === row && c.y === col);
                            const val = valObj ? valObj.value : 0.0;
                            const colorClass = val === null ? "bg-slate-500/10 text-muted" :
                              val >= 0.7 ? "bg-indigo-600/90 text-white" :
                              val >= 0.4 ? "bg-indigo-500/60 text-foreground" :
                              val >= 0.1 ? "bg-indigo-500/20 text-foreground" :
                              val <= -0.7 ? "bg-rose-600/90 text-white" :
                              val <= -0.4 ? "bg-rose-500/60 text-foreground" :
                              val <= -0.1 ? "bg-rose-500/20 text-foreground" :
                              "bg-slate-500/5 text-muted";
                            return (
                              <div
                                key={col}
                                className={`h-8 w-full flex items-center justify-center rounded font-semibold text-[10px] transition-all cursor-default ${colorClass}`}
                                title={`Corr(${row}, ${col}) = ${val?.toFixed(3) || "N/A"}`}
                              >
                                {val !== null ? val.toFixed(2) : "0"}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Feature Importance Indicators */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase">
              <Cpu className="h-4.5 w-4.5" />
              <span>{t("review.feat.title")}</span>
            </div>
            <div className="space-y-4">
              {Object.keys(stats.feature_importance).length > 0 ? (
                Object.entries(stats.feature_importance).map(([featName, featWeight]: any) => (
                  <div key={featName} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-foreground">{featName}</span>
                      <span className="text-muted font-bold">{t("review.feat.weight", { weight: (featWeight * 100).toFixed(1) })}</span>
                    </div>
                    <div className="w-full bg-slate-500/10 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${featWeight * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted italic py-10 text-center">
                  {t("review.feat.empty")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trend, Seasonality, Anomaly Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-10 w-10 bg-indigo-500/5 rounded-bl-full animate-pulse" />
          <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase">
            <TrendingUp className="h-4.5 w-4.5" />
            <span>{t("review.trend.title")}</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            {trend_analysis.trend}
          </p>
        </div>

        <div className="glass-card p-5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-10 w-10 bg-amber-500/5 rounded-bl-full" />
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase">
            <Sparkles className="h-4.5 w-4.5" />
            <span>{t("review.season.title")}</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            {trend_analysis.seasonality}
          </p>
        </div>

        <div className="glass-card p-5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-10 w-10 bg-rose-500/5 rounded-bl-full" />
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase">
            <ShieldAlert className="h-4.5 w-4.5" />
            <span>{t("review.anomaly.title")}</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            {trend_analysis.anomaly}
          </p>
        </div>
      </div>

      {/* Predictions Forecast Table */}
      {predictions && Object.keys(predictions).length > 0 && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase">
            <Award className="h-4.5 w-4.5" />
            <span>{t("review.predict.title")}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-1 border border-card-border/30 rounded-xl p-4 bg-slate-500/5 h-44 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-muted uppercase font-bold block">{t("review.predict.target")}</span>
                <span className="text-sm font-bold text-foreground truncate block">{predictions.metric}</span>
              </div>
              
              <div className="h-20 w-full relative flex items-end">
                <svg viewBox="0 0 100 40" className="w-full h-full text-primary overflow-visible">
                  <path
                    d={`M 0 35 L 20 28 L 40 22 L 60 16 L 80 11 L 100 5`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M 0 32 L 20 23 L 40 15 L 60 8 L 80 2 L 100 0`}
                    fill="none"
                    stroke="rgba(139, 92, 246, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                  />
                  <path
                    d={`M 0 38 L 20 33 L 40 29 L 60 24 L 80 20 L 100 12`}
                    fill="none"
                    stroke="rgba(139, 92, 246, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                  />
                </svg>
              </div>

              <div className="flex justify-between text-[9px] text-muted font-semibold pt-1 border-t border-card-border/20">
                <span>{t("review.predict.start")}</span>
                <span>{t("review.predict.growth", { growth: predictions.growth_rate_pct?.toFixed(1) })}</span>
              </div>
            </div>

            <div className="lg:col-span-2 overflow-x-auto border border-card-border/40 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-500/5 border-b border-card-border/50 text-muted">
                    <th className="p-3">{t("review.predict.period")}</th>
                    <th className="p-3 text-right">{t("review.predict.point")}</th>
                    <th className="p-3 text-right">{t("review.predict.lower")}</th>
                    <th className="p-3 text-right">{t("review.predict.upper")}</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.forecast.map((pt: any, i: number) => (
                    <tr key={i} className="border-b border-card-border/30 hover:bg-slate-500/5">
                      <td className="p-3 font-semibold text-foreground">{pt.date}</td>
                      <td className="p-3 text-right text-primary font-bold">{pt.value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right text-muted">{pt.lower?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right text-muted">{pt.upper?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
