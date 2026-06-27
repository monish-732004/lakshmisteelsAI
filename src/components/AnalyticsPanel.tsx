"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Calendar, Target, HelpCircle, Loader2, AlertCircle } from "lucide-react";
import ReactECharts from "echarts-for-react";
import { api } from "../utils/api";

interface AnalyticsPanelProps {
  fileId: string;
  currentVersion: number;
}

export default function AnalyticsPanel({ fileId, currentVersion }: AnalyticsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [targets, setTargets] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [dateColumn, setDateColumn] = useState<string | null>(null);
  
  const [periods, setPeriods] = useState<number>(12);
  const [forecastData, setForecastData] = useState<any>(null);

  useEffect(() => {
    fetchOptions();
  }, [fileId, currentVersion]);

  const fetchOptions = async () => {
    try {
      setOptionsLoading(true);
      setError(null);
      const data = await api.getForecastOptions(fileId);
      setTargets(data.target_columns);
      setSelectedTarget(data.suggested_target || "");
      setDateColumn(data.date_column);
      
      // Auto-trigger default forecast if target exists
      if (data.suggested_target) {
        runForecast(data.suggested_target, data.date_column, periods);
      }
    } catch (err) {
      console.error("Failed to load forecasting configurations", err);
      setError("No numerical targets detected in this sheet to forecast projections.");
    } finally {
      setOptionsLoading(false);
    }
  };

  const runForecast = async (target: string, dateCol: string | null, prds: number) => {
    if (!target) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getForecast(fileId, target, dateCol, prds);
      setForecastData(data);
    } catch (err: any) {
      console.error("Failed to compute forecast", err);
      setError(err.response?.data?.detail || "Prediction modeling failed. Please check the dataset values.");
    } finally {
      setLoading(false);
    }
  };

  const handleForecastClick = () => {
    runForecast(selectedTarget, dateColumn, periods);
  };

  // ECharts Option Builder
  const getChartOption = () => {
    if (!forecastData) return {};

    const historical = forecastData.historical || [];
    const forecast = forecastData.forecast || [];
    
    // Combine lists
    const dates = [
      ...historical.map((h: any) => h.date),
      ...forecast.map((f: any) => f.date)
    ];

    const historicalValues = [
      ...historical.map((h: any) => h.value),
      ...forecast.map(() => null)
    ];

    const forecastValues = [
      ...historical.map(() => null),
      // Connect first forecast point to last historical point
      historical.length > 0 ? historical[historical.length - 1].value : null,
      ...forecast.map((f: any) => f.value)
    ];

    // Adjust dates for forecast connect offset
    const forecastDates = [
      ...historical.map(() => null),
      historical.length > 0 ? historical[historical.length - 1].date : null,
      ...forecast.map((f: any) => f.date)
    ];

    const confidenceUpper = [
      ...historical.map(() => null),
      historical.length > 0 ? historical[historical.length - 1].value : null,
      ...forecast.map((f: any) => f.upper)
    ];

    const confidenceLower = [
      ...historical.map(() => null),
      historical.length > 0 ? historical[historical.length - 1].value : null,
      ...forecast.map((f: any) => f.lower)
    ];

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "line" }
      },
      legend: {
        data: ["Historical", "AI Forecast", "95% Confidence Band"],
        textStyle: { color: "var(--foreground)" }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dates,
        axisLine: { lineStyle: { color: "var(--card-border)" } },
        axisLabel: { color: "var(--muted)" }
      },
      yAxis: {
        type: "value",
        axisLine: { lineStyle: { color: "var(--card-border)" } },
        axisLabel: { color: "var(--muted)" },
        splitLine: { lineStyle: { color: "var(--card-border)" } }
      },
      series: [
        {
          name: "Historical",
          type: "line",
          data: historicalValues,
          symbolSize: 6,
          itemStyle: { color: "#4f46e5" },
          lineStyle: { width: 3 }
        },
        {
          name: "AI Forecast",
          type: "line",
          data: forecastValues,
          symbol: "circle",
          symbolSize: 6,
          itemStyle: { color: "#8b5cf6" },
          lineStyle: { width: 3, type: "dashed" }
        },
        // We render lower bound as transparent, and upper bound stacked with areaStyle
        {
          name: "95% Confidence Band",
          type: "line",
          data: confidenceLower,
          lineStyle: { opacity: 0 },
          symbol: "none",
          stack: "confidence"
        },
        {
          name: "95% Confidence Band",
          type: "line",
          data: confidenceUpper.map((val, idx) => {
            const lower = confidenceLower[idx];
            if (val === null || lower === null) return null;
            return val - lower; // Area style fills gap relative to stack
          }),
          lineStyle: { opacity: 0 },
          symbol: "none",
          stack: "confidence",
          areaStyle: {
            color: "rgba(139, 92, 246, 0.15)"
          }
        }
      ]
    };
  };

  const metrics = forecastData?.metrics || {};

  return (
    <div className="space-y-6">
      {/* Target select inputs */}
      <div className="glass-card p-5 grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted flex items-center gap-1.5 uppercase">
            <Target className="h-3.5 w-3.5" />
            <span>Target Column</span>
          </label>
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            disabled={loading || optionsLoading}
            className="w-full glass-input px-3 py-2 text-sm text-foreground select-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {optionsLoading ? (
              <option>Loading columns...</option>
            ) : targets.length === 0 ? (
              <option>No columns found</option>
            ) : (
              targets.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted flex items-center gap-1.5 uppercase">
            <Calendar className="h-3.5 w-3.5" />
            <span>Forecast Length (Periods)</span>
          </label>
          <select
            value={periods}
            onChange={(e) => setPeriods(Number(e.target.value))}
            disabled={loading}
            className="w-full glass-input px-3 py-2 text-sm text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value={3}>Next 3 Periods</option>
            <option value={6}>Next 6 Periods</option>
            <option value={12}>Next 12 Periods</option>
            <option value={24}>Next 24 Periods</option>
          </select>
        </div>

        <button
          onClick={handleForecastClick}
          disabled={loading || !selectedTarget}
          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium shadow-md shadow-primary/10 transition cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              <span>Model Fitting...</span>
            </>
          ) : (
            <>
              <TrendingUp className="h-4.5 w-4.5" />
              <span>Forecast Trend</span>
            </>
          )}
        </button>
      </div>

      {error ? (
        <div className="glass-card p-8 text-center text-rose-500 border border-rose-500/10 bg-rose-500/5 text-sm flex items-center justify-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : forecastData ? (
        <div className="space-y-6 animate-slide-up">
          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 space-y-1">
              <span className="text-xs font-bold text-muted uppercase">Trend Outlook</span>
              <p className={`text-lg font-bold ${metrics.trend === "Increasing" ? "text-success" : metrics.trend === "Decreasing" ? "text-danger" : "text-foreground"}`}>
                {metrics.trend}
              </p>
            </div>
            
            <div className="glass-card p-4 space-y-1">
              <span className="text-xs font-bold text-muted uppercase">Model Fit R²</span>
              <p className="text-lg font-bold text-foreground">
                {metrics.r2 !== undefined ? metrics.r2.toFixed(3) : "0.00"}
              </p>
            </div>

            <div className="glass-card p-4 space-y-1">
              <span className="text-xs font-bold text-muted uppercase">Mean Abs Error</span>
              <p className="text-lg font-bold text-foreground">
                {metrics.mae !== undefined ? metrics.mae.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0.00"}
              </p>
            </div>

            <div className="glass-card p-4 space-y-1">
              <span className="text-xs font-bold text-muted uppercase">Est. Growth Rate</span>
              <p className={`text-lg font-bold ${metrics.growth_rate_pct > 0 ? "text-success" : metrics.growth_rate_pct < 0 ? "text-danger" : "text-foreground"}`}>
                {metrics.growth_rate_pct !== undefined ? `${metrics.growth_rate_pct > 0 ? "+" : ""}${metrics.growth_rate_pct.toFixed(1)}%` : "0.0%"}
              </p>
            </div>
          </div>

          {/* Forecasting Line chart */}
          <div className="glass-card p-6">
            <h4 className="font-bold text-sm text-foreground mb-4">
              AI-Generated Forecast Curve with Error Bandwidth
            </h4>
            <div className="h-96 w-full">
              <ReactECharts option={getChartOption()} style={{ height: "100%", width: "100%" }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 text-center text-muted">
          Click &quot;Forecast Trend&quot; above to fit the predictive regression model.
        </div>
      )}
    </div>
  );
}
