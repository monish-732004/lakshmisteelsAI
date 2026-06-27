"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, PieChart, Activity, SlidersHorizontal, ArrowUpRight, DollarSign, Percent, TrendingUp, Hash, Info, FileSpreadsheet } from "lucide-react";
import ReactECharts from "echarts-for-react";

interface DashboardGridProps {
  profile: any; // Raw profile stats from backend
  previewData: any[]; // Preview rows to calculate local dynamic filters
}

export default function DashboardGrid({ profile, previewData }: DashboardGridProps) {
  const [filteredData, setFilteredData] = useState<any[]>([]);
  
  // Filter variables
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  const [numericCols, setNumericCols] = useState<string[]>([]);
  const [selectedNumCol, setSelectedNumCol] = useState<string>("");
  const [numMin, setNumMin] = useState<number>(0);
  const [numMax, setNumMax] = useState<number>(10000000);

  // Set filters range on load
  useEffect(() => {
    if (previewData && previewData.length > 0) {
      setFilteredData(previewData);
      
      const catCols = profile?.columns?.filter((c: any) => c.type === "categorical").map((c: any) => c.name) || [];
      const numCols = profile?.columns?.filter((c: any) => c.type === "numeric").map((c: any) => c.name) || [];
      
      setNumericCols(numCols);
      if (numCols.length > 0) {
        setSelectedNumCol(numCols[0]);
        // Set min/max boundaries from profile
        const targetProf = profile.columns.find((c: any) => c.name === numCols[0]);
        if (targetProf && targetProf.stats) {
          setNumMin(targetProf.stats.min || 0);
          setNumMax(targetProf.stats.max || 10000000);
        }
      }

      if (catCols.length > 0) {
        const targetCol = catCols[0];
        const uniqueVals = Array.from(new Set(previewData.map(r => r[targetCol]).filter(Boolean).map(String)));
        setCategories(uniqueVals);
      }
    }
  }, [previewData, profile]);

  // Handle dynamic filters
  useEffect(() => {
    if (!previewData || previewData.length === 0) return;
    
    let result = [...previewData];
    
    const catCols = profile?.columns?.filter((c: any) => c.type === "categorical").map((c: any) => c.name) || [];
    if (selectedCategory !== "All" && catCols.length > 0) {
      const targetCol = catCols[0];
      result = result.filter(r => String(r[targetCol]) === selectedCategory);
    }
    
    if (selectedNumCol) {
      result = result.filter(r => {
        const val = Number(r[selectedNumCol]);
        if (isNaN(val) || val === null) return true;
        return val >= numMin && val <= numMax;
      });
    }
    
    setFilteredData(result);
  }, [selectedCategory, selectedNumCol, numMin, numMax, previewData]);

  // KPI summaries
  const getKpis = () => {
    const kpisList = [];
    
    kpisList.push({
      label: "Analyzed Records",
      value: profile?.total_rows?.toLocaleString() || "0",
      icon: <Hash className="h-5 w-5" />,
      color: "text-primary border-primary/20 bg-primary/5",
      subText: "Row instances normalized"
    });

    const columnsNames = profile?.columns?.map((c: any) => c.name.toLowerCase()) || [];
    const revenueIdx = columnsNames.findIndex((name: string) => name.includes("revenue") || name.includes("sales") || name.includes("amount") || name.includes("price"));
    const profitIdx = columnsNames.findIndex((name: string) => name.includes("profit") || name.includes("margin"));

    if (revenueIdx !== -1) {
      const colName = profile.columns[revenueIdx].name;
      const totalRev = filteredData.reduce((acc, curr) => acc + (Number(curr[colName]) || 0), 0);
      kpisList.push({
        label: `Total ${colName}`,
        value: `$${totalRev.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        icon: <DollarSign className="h-5 w-5" />,
        color: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5",
        subText: "Filtered summation score"
      });
    } else {
      const numericCol = profile?.columns?.find((c: any) => c.type === "numeric");
      if (numericCol) {
        const totalSum = filteredData.reduce((acc, curr) => acc + (Number(curr[numericCol.name]) || 0), 0);
        kpisList.push({
          label: `Sum of ${numericCol.name}`,
          value: totalSum.toLocaleString(undefined, { maximumFractionDigits: 2 }),
          icon: <Activity className="h-5 w-5" />,
          color: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5",
          subText: "Active aggregated sum"
        });
      }
    }

    if (profitIdx !== -1) {
      const colName = profile.columns[profitIdx].name;
      const totalProfit = filteredData.reduce((acc, curr) => acc + (Number(curr[colName]) || 0), 0);
      kpisList.push({
        label: `Total ${colName}`,
        value: `$${totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        icon: <TrendingUp className="h-5 w-5" />,
        color: "text-indigo-500 border-indigo-500/20 bg-indigo-500/5",
        subText: "Operating index value"
      });
    } else {
      kpisList.push({
        label: "Statistical Outliers",
        value: profile?.total_outliers?.toString() || "0",
        icon: <Percent className="h-5 w-5" />,
        color: "text-rose-500 border-rose-500/20 bg-rose-500/5",
        subText: "Out-of-boundary anomalies"
      });
    }

    kpisList.push({
      label: "Analysis Quality Rating",
      value: `${profile?.data_quality_score || 100}%`,
      icon: <ArrowUpRight className="h-5 w-5" />,
      color: "text-amber-500 border-amber-500/20 bg-amber-500/5",
      subText: "Data integrity score"
    });

    return kpisList;
  };

  // ECharts Options with Interactive Toolboxes (Zoom, Download, Magic type lines)
  const getBarChartOption = () => {
    const catCols = profile?.columns?.filter((c: any) => c.type === "categorical").map((c: any) => c.name) || [];
    const numCols = profile?.columns?.filter((c: any) => c.type === "numeric").map((c: any) => c.name) || [];
    
    if (catCols.length === 0 || numCols.length === 0 || filteredData.length === 0) return {};

    const catCol = catCols[0];
    const numCol = numCols[0];

    const grouped: { [key: string]: number } = {};
    filteredData.forEach(r => {
      const catVal = String(r[catCol] || "Unknown");
      const numVal = Number(r[numCol] || 0);
      grouped[catVal] = (grouped[catVal] || 0) + numVal;
    });

    return {
      tooltip: { trigger: "axis" },
      toolbox: {
        show: true,
        feature: {
          dataZoom: { yAxisIndex: "none" },
          dataView: { readOnly: true },
          magicType: { type: ["line", "bar"] },
          restore: {},
          saveAsImage: {}
        },
        iconStyle: { borderColor: "gray" }
      },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "category",
        data: Object.keys(grouped),
        axisLabel: { color: "var(--muted)", interval: 0, rotate: 20 }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "var(--muted)" },
        splitLine: { lineStyle: { color: "rgba(148, 163, 184, 0.15)" } }
      },
      series: [
        {
          name: numCol,
          type: "bar",
          data: Object.values(grouped),
          itemStyle: {
            color: "rgba(79, 70, 229, 0.85)",
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    };
  };

  const getDoughnutChartOption = () => {
    const catCols = profile?.columns?.filter((c: any) => c.type === "categorical").map((c: any) => c.name) || [];
    if (catCols.length === 0 || filteredData.length === 0) return {};

    const catCol = catCols[0];
    const counts: { [key: string]: number } = {};
    filteredData.forEach(r => {
      const val = String(r[catCol] || "Unknown");
      counts[val] = (counts[val] || 0) + 1;
    });

    const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

    return {
      tooltip: { trigger: "item" },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {}
        },
        iconStyle: { borderColor: "gray" }
      },
      legend: {
        orient: "horizontal",
        bottom: "0%",
        textStyle: { color: "var(--foreground)", fontSize: 10 }
      },
      series: [
        {
          name: "Distribution",
          type: "pie",
          radius: ["35%", "65%"],
          center: ["50%", "45%"],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 1.5
          },
          label: { show: false },
          data
        }
      ]
    };
  };

  const getCorrelationChartOption = () => {
    const correlationMatrix = profile?.correlation_matrix || [];
    if (correlationMatrix.length === 0) return {};

    const cols = Array.from(new Set(correlationMatrix.map((item: any) => item.x)));
    const data = correlationMatrix.map((item: any) => {
      const xIdx = cols.indexOf(item.x);
      const yIdx = cols.indexOf(item.y);
      return [xIdx, yIdx, item.value !== null ? parseFloat(item.value.toFixed(2)) : 0];
    });

    return {
      tooltip: { position: "top" },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {}
        },
        iconStyle: { borderColor: "gray" }
      },
      grid: { height: "70%", top: "10%" },
      xAxis: {
        type: "category",
        data: cols,
        splitArea: { show: true },
        axisLabel: { color: "var(--muted)", rotate: 20 }
      },
      yAxis: {
        type: "category",
        data: cols,
        splitArea: { show: true },
        axisLabel: { color: "var(--muted)" }
      },
      visualMap: {
        min: -1,
        max: 1,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "0%",
        inRange: {
          color: ["#ef4444", "#f8fafc", "#4f46e5"] // negative Red, neutral White, positive Indigo
        }
      },
      series: [
        {
          name: "Correlation Coefficient",
          type: "heatmap",
          data,
          label: { show: true },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.3)"
            }
          }
        }
      ]
    };
  };

  const kpis = getKpis();

  // Dynamic Insight Explanations
  const catCol = profile?.columns?.find((c: any) => c.type === "categorical")?.name || "Group";
  const numCol = profile?.columns?.find((c: any) => c.type === "numeric")?.name || "Metric";

  return (
    <div className="space-y-6">
      {/* Interactive Filters header panel */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>Interactive BI Dashboard Filter Panel</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {categories.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted block">Filter Category ({catCol})</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs text-foreground cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {numericCols.length > 0 && (
            <>
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-muted block">Active Numeric Filter</span>
                <select
                  value={selectedNumCol}
                  onChange={(e) => {
                    setSelectedNumCol(e.target.value);
                    const targetProf = profile.columns.find((c: any) => c.name === e.target.value);
                    if (targetProf && targetProf.stats) {
                      setNumMin(targetProf.stats.min || 0);
                      setNumMax(targetProf.stats.max || 10000000);
                    }
                  }}
                  className="w-full glass-input px-3 py-2 text-xs text-foreground cursor-pointer"
                >
                  {numericCols.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-muted block">Minimum Threshold Constraint</span>
                <input
                  type="number"
                  value={numMin}
                  onChange={(e) => setNumMin(Number(e.target.value))}
                  className="w-full glass-input px-3 py-1.5 text-xs focus:outline-none"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* BI KPI Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div key={index} className={`glass-card p-5 flex items-center gap-4 border border-card-border/30 animate-slide-up ${kpi.color}`}>
            <div className="h-10 w-10 rounded-xl bg-card-bg border border-card-border/40 flex items-center justify-center shrink-0">
              {kpi.icon}
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">
                {kpi.label}
              </span>
              <p className="text-lg font-extrabold text-foreground leading-tight">
                {kpi.value}
              </p>
              <span className="text-[9px] text-muted block leading-none">{kpi.subText}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Visualizations Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart Widget */}
        {profile?.columns?.some((c: any) => c.type === "categorical") && (
          <div className="glass-card p-6 flex flex-col justify-between min-h-[420px] animate-slide-up">
            <div className="space-y-1 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-primary animate-pulse" />
                <h4 className="font-bold text-sm text-foreground">Aggregate comparison by {catCol}</h4>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                Aggregated sum totals of {numCol} compared across categorical classifications.
              </p>
            </div>
            <div className="flex-1 w-full h-64">
              <ReactECharts option={getBarChartOption()} style={{ height: "100%", width: "100%" }} />
            </div>
            <div className="mt-4 pt-3 border-t border-card-border/20 flex items-start gap-2 bg-slate-500/5 p-3 rounded-xl">
              <Info className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-foreground uppercase block">Analytical Insight</span>
                <span className="text-[11px] text-muted leading-relaxed">
                  Data indicates primary weight is concentrated in specific categories. Leverage these segments as primary indicators.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Doughnut distribution widget */}
        {profile?.columns?.some((c: any) => c.type === "categorical") && (
          <div className="glass-card p-6 flex flex-col justify-between min-h-[420px] animate-slide-up">
            <div className="space-y-1 mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="h-4.5 w-4.5 text-accent" />
                <h4 className="font-bold text-sm text-foreground">Category Share Distribution</h4>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                Distribution breakdown of rows populated in each '{catCol}' category segment.
              </p>
            </div>
            <div className="flex-1 w-full h-64">
              <ReactECharts option={getDoughnutChartOption()} style={{ height: "100%", width: "100%" }} />
            </div>
            <div className="mt-4 pt-3 border-t border-card-border/20 flex items-start gap-2 bg-slate-500/5 p-3 rounded-xl">
              <Info className="h-4.5 w-4.5 text-accent shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-foreground uppercase block">Analytical Insight</span>
                <span className="text-[11px] text-muted leading-relaxed">
                  Share analysis highlights density parameters. Buckets with high percentages require primary focus check.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Correlation Heatmap matrix widget */}
        {profile?.correlation_matrix?.length > 0 && (
          <div className="glass-card p-6 flex flex-col justify-between min-h-[440px] md:col-span-2 animate-slide-up">
            <div className="space-y-1 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-amber-500" />
                <h4 className="font-bold text-sm text-foreground">Statistical Correlation Matrix</h4>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                Heatmap detailing linear dependence between multiple numerical attributes. Positive scores show directional co-movement.
              </p>
            </div>
            <div className="flex-1 w-full h-72">
              <ReactECharts option={getCorrelationChartOption()} style={{ height: "100%", width: "100%" }} />
            </div>
            <div className="mt-4 pt-3 border-t border-card-border/20 flex items-start gap-2 bg-slate-500/5 p-3 rounded-xl">
              <Info className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-foreground uppercase block">Correlation Matrix Insight</span>
                <span className="text-[11px] text-muted leading-relaxed">
                  Highly positive (purple-blue) indices highlight direct correlations. Negative (red) indices highlight inverse relationships.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
