"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, PieChart, LineChart, TrendingUp, IndianRupee, 
  AlertTriangle, Users, Box, Truck, ShieldCheck, Calendar, Info, ArrowUpRight
} from "lucide-react";
import ReactECharts from "echarts-for-react";
import { api } from "../utils/api";
import { useTranslation } from "../utils/LanguageContext";

interface DashboardGridProps {
  fileId: string;
  profile: any;
  previewData: any[];
}

type SubTab = "executive" | "sales" | "inventory" | "purchase" | "financial" | "forecasting";

// Client-side translation helper for dashboard static/dynamic texts
const translateText = (text: string, language: string): string => {
  if (language !== "ta" || !text) return text;

  const dictionary: Record<string, string> = {
    // Tab labels
    "Executive Dashboard": "நிர்வாக டாஷ்போர்டு",
    "Sales Analytics": "விற்பனை பகுப்பாய்வு",
    "Inventory Dashboard": "சரக்கு இருப்பு டாஷ்போர்டு",
    "Purchase Dashboard": "கொள்முதல் டாஷ்போர்டு",
    "Financial Dashboard": "நிதிநிலை டாஷ்போர்டு",
    "Forecasting Dashboard": "முன்னறிவிப்பு டாஷ்போர்டு",
    
    // Executive Overview KPIs
    "Today's Sales": "இன்றைய விற்பனை",
    "Expected daily business volume": "எதிர்பார்க்கப்படும் தினசரி வணிக மதிப்பு",
    "Monthly Sales": "மாதாந்திர விற்பனை",
    "Current billing cycle volume": "நடப்பு விற்பனை சுழற்சி மதிப்பு",
    "Gross Profit": "மொத்த லாபம்",
    "Revenue minus material costs": "வருவாய் கழித்தல் பொருள் செலவுகள்",
    "Inventory Value": "சரக்கு இருப்பு மதிப்பு",
    "Total asset value of stock on hand": "கைவசமுள்ள இருப்பின் மொத்த சொத்து மதிப்பு",
    "Outstanding Receivables": "வரவேண்டிய நிலுவைத் தொகைகள்",
    "Pending dues from customer accounts": "வாடிக்கையாளர் கணக்குகளிலிருந்து நிலுவையில் உள்ளவை",
    "Stock Alerts": "இருப்பு விழிப்பூட்டல்கள்",
    "items low": "பொருட்கள் குறைவாக உள்ளன",
    "Products below safety stock margins": "பாதுகாப்பு இருப்பு வரம்புகளுக்குக் கீழே உள்ள பொருட்கள்",
    "Small Business Health Summary": "சிறு வணிக சுகாதார சுருக்கம்",
    
    // Sales Tab
    "Sales Trends (Monthly billings)": "விற்பனைப் போக்குகள் (மாதாந்திர பில்லிங்)",
    "Product-wise Sales": "தயாரிப்பு வாரியான விற்பனை",
    "Regional Sales": "பிராந்திய வாரியான விற்பனை",
    "Top Customers & Order Value": "முக்கிய வாடிக்கையாளர்கள் & ஆர்டர் மதிப்பு",
    "Average Order Value (AOV)": "சராசரி ஆர்டர் மதிப்பு (AOV)",
    "Typical transaction amount per invoice": "ஒரு விலைப்பட்டியலுக்கான வழக்கமான பரிவர்த்தனை தொகை",
    
    // Inventory Tab
    "Current Stock Levels": "தற்போதைய இருப்பு நிலைகள்",
    "Stock Asset Value:": "சரக்கு இருப்பு சொத்து மதிப்பு:",
    "units": "அலகுகள்",
    "Reorder Suggestions": "மறுவரிசை பரிந்துரைகள்",
    "Recommended supplier:": "பரிந்துரைக்கப்பட்ட சப்ளையர்:",
    "Stock Turnovers (ABC Analysis)": "இருப்பு சுழற்சிகள் (ABC பகுப்பாய்வு)",
    "Fast/Slow-Moving Products": "வேகமான & மெதுவான இயக்க பொருட்கள்",
    "sold": "விற்பனை செய்யப்பட்டுள்ளது",
    "Dead Stock Alerts": "செயலற்ற இருப்பு விழிப்பூட்டல்கள்",
    "days idle": "நாட்களாக முடங்கியுள்ளது",
    "Fast-Moving": "வேகமாக நகர்வது",
    "Slow-Moving": "மெதுவாக நகர்வது",
    "Category A (High Value / Fast Moving)": "வகை A (உயர் மதிப்பு / வேகமான இயக்கம்)",
    "Category B (Medium Value / Moderate)": "வகை B (நடுத்தர மதிப்பு / மிதமான இயக்கம்)",
    "Category C (Low Value / Bulk)": "வகை C (குறைந்த மதிப்பு / மொத்த வடிவம்)",
    
    // Purchase Tab
    "Supplier-wise Purchases": "சப்ளையர் வாரியான கொள்முதல்",
    "Purchase Cost Trends (Monthly)": "கொள்முதல் செலவு போக்குகள் (மாதாந்திர)",
    "Supplier Quality & Delivery Performance": "சப்ளையர் தரம் & விநியோக செயல்திறன்",
    "On-time": "சரியான நேரத்தில்",
    "Rating:": "மதிப்பீடு:",
    "On-time:": "சரியான நேரத்தில்:",
    "Order Frequency Intervals": "கொள்முதல் அதிர்வெண் இடைவெளிகள்",
    "Weekly (Every Tuesday)": "வாரந்தோறும் (ஒவ்வொரு செவ்வாய்)",
    "Bi-weekly": "இரண்டு வாரங்களுக்கு ஒருமுறை",
    "Monthly Bulk": "மாதாந்திர மொத்த கொள்முதல்",
    "Weekly (Demand-based)": "வாரந்தோறும் (தேவைக்கேற்ப)",
    "Ad-hoc (Daily/Weekly)": "தற்காலிகமாக (தினசரி/வாரம்)",
    
    // Financial Tab
    "Cash Margin Rate": "ரொக்க லாப வரம்பு விகிதம்",
    "Average profitability margins on items sold": "விற்கப்பட்ட பொருட்களின் சராசரி லாப வரம்பு",
    "Pending Receivables": "வரவேண்டிய நிலுவைத் தொகைகள்",
    "Dues to collect from clients": "வாடிக்கையாளர்களிடமிருந்து வசூலிக்க வேண்டியவை",
    "Pending Payables": "செலுத்த வேண்டிய நிலுவைத் தொகைகள்",
    "Dues to settle with supplier ledgers": "சப்ளையர் கணக்குகளுக்கு செலுத்த வேண்டியவை",
    "Cash Inflow vs Outflow History": "ரொக்க வரவு மற்றும் செலவு வரலாறு",
    "Aging Receivables (Outstanding Dues)": "வரவேண்டிய கணக்குகள் கால வரம்பு",
    "days overdue": "நாட்கள் தாமதம்",
    "Aging Payables (Pending Payments)": "செலுத்த வேண்டிய கணக்குகள் கால வரம்பு",
    "days due": "நாட்கள் நிலுவை",
    "Cash In": "உள்வரும் ரொக்கம்",
    "Cash Out": "வெளியேறும் ரொக்கம்",
    
    // Forecasting Tab
    "Sales Forecast (Next 6 Months Projection)": "விற்பனை வருவாய் முன்னறிவிப்பு (அடுத்த 6 மாதங்கள்)",
    "Actual Sales": "உண்மையான விற்பனை",
    "Projected Sales": "திட்டமிடப்பட்ட விற்பனை",
    "Product Demand Predictions": "தயாரிப்பு தேவை கணிப்புகள்",
    "Supply Order Recommendations": "விநியோக ஆர்டர் பரிந்துரைகள்",
    "Suggested Product": "பரிந்துரைக்கப்படும் தயாரிப்பு",
    "Procurement Qty": "கொள்முதல் அளவு",
    "Target Delivery Date": "விநியோக தேதி",
    "Assign Supplier": "சப்ளையர் ஒதுக்கீடு",
    "High (+15%)": "அதிக தேவை (+15%)",
    "Stable (+3%)": "நிலையான தேவை (+3%)",
    
    // Ledger mappings / Standard Names
    "Voucher_No": "வவுச்சர் எண்",
    "Item_Name": "பொருள் பெயர்",
    "Quantity": "அளவு",
    "Rate": "விலை வீதம்",
    "Amount": "தொகை",
    "Date": "தேதி",
    "Customer A": "வாடிக்கையாளர் A",
    "TMT Rebars 12mm": "TMT கம்பிகள் 12மிமீ",
    "Cement OPC 53 Grade": "சிமெண்ட் OPC 53 கிரேடு",
    "MS Angles 50x50x5": "MS கோணங்கள் 50x50x5",
    "GI Wire 12 Gauge": "GI கம்பி 12 கேஜ்",
    "Binding Wire": "பைண்டிங் கம்பி",
    "Steel Plates 10mm": "ஸ்டீல் தட்டுகள் 10மிமீ",
    "Structural I-Beams": "கட்டமைப்பு ஐ-பீம்கள்",
    "Chennai Zone": "சென்னை மண்டலம்",
    "Coimbatore Branch": "கோவை கிளை",
    "Madurai Region": "மதுரை பகுதி",
    "Trichy District": "திருச்சி மாவட்டம்",
    "Salem Local": "சேலம் உள்ளூர்",
    "Tata Steel Ltd": "டாடா ஸ்டீல் லிமிடெட்",
    "JSW Steel Ltd": "ஜேஎஸ்டபிள்யூ ஸ்டீல் லிமிடெட்",
    "Steel Authority of India (SAIL)": "ஸ்டீல் அத்தாரிட்டி ஆஃப் இந்தியா (SAIL)",
    "UltraTech Cements Ltd": "அல்ட்ராடெக் சிமெண்ட்ஸ் லிமிடெட்",
    "Local Wholesale Suppliers": "உள்ளூர் மொத்த சப்ளையர்கள்"
  };

  // Check direct match
  if (dictionary[text]) return dictionary[text];

  // Perform partial translations
  let translated = text;
  Object.entries(dictionary).forEach(([enKey, taVal]) => {
    translated = translated.replace(new RegExp(enKey, "g"), taVal);
  });

  return translated;
};

export default function DashboardGrid({ fileId, profile, previewData }: DashboardGridProps) {
  const { t, language } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("executive");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysis();
  }, [fileId]);

  const fetchAnalysis = async () => {
    try {
      setLoading(false);
      const data = await api.getAnalysis(fileId);
      setAnalysis(data);
    } catch (err) {
      console.error("Failed to load analysis for dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analysis) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 glass-card">
        <TrendingUp className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted">Building business dashboards...</p>
      </div>
    );
  }

  const dashData = analysis.business_dashboards || {};
  const exec = dashData.executive || {};
  const sales = dashData.sales || {};
  const inventory = dashData.inventory || {};
  const purchase = dashData.purchase || {};
  const financial = dashData.financial || {};
  const forecasting = dashData.forecasting || {};

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Get localized Executive Summary Paragraph
  const getExecSummaryTranslation = () => {
    if (language !== "ta") {
      return `Your monthly sales look stable at ${formatRupees(exec.monthly_sales)}. We detected ${exec.stock_alerts} stock alert items that require immediate replenishment from suppliers to avoid customer order delays. Outstanding receivables represent 15% of monthly billings; following up on overdue customer ledgers is recommended to preserve cash flow velocity.`;
    }
    return `உங்களின் மாதாந்திர விற்பனை ${formatRupees(exec.monthly_sales)} என்ற அளவில் நிலையாக உள்ளது. வாடிக்கையாளர் ஆர்டர் தாமதத்தைத் தவிர்க்க சப்ளையர்களிடமிருந்து உடனடி இருப்பு நிரப்பல் தேவைப்படும் ${exec.stock_alerts} இருப்பு விழிப்பூட்டல் பொருட்களைக் கண்டறிந்துள்ளோம். நிலுவையில் உள்ள வரவுகள் மாதாந்திர பில்லிங்கில் 15% ஆகும்; பணப்புழக்க வேகத்தைப் பேண காலதாமதமான வாடிக்கையாளர் கணக்குகளைப் பின்தொடர பரிந்துரைக்கப்படுகிறது.`;
  };

  // --- ECharts Visual Options ---
  
  // 1. Sales Trends
  const getSalesTrendOption = () => {
    const data = sales.trends || [];
    return {
      tooltip: { trigger: "axis" },
      grid: { left: "4%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "category",
        data: data.map((d: any) => d.date),
        axisLabel: { color: "var(--muted)" }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "var(--muted)" },
        splitLine: { lineStyle: { color: "rgba(148, 163, 184, 0.1)" } }
      },
      series: [
        {
          name: translateText("Sales", language),
          type: "line",
          data: data.map((d: any) => d.value),
          smooth: true,
          showSymbol: true,
          symbolSize: 8,
          lineStyle: { width: 3.5, color: "#eab308" },
          itemStyle: { color: "#eab308" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(234, 179, 8, 0.25)" },
                { offset: 1, color: "rgba(234, 179, 8, 0.0)" }
              ]
            }
          }
        }
      ]
    };
  };

  // 2. Product-wise sales
  const getProductSalesOption = () => {
    const data = sales.product_sales || [];
    return {
      tooltip: { trigger: "item" },
      series: [
        {
          name: translateText("Product Sales", language),
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 8 },
          label: { show: true, color: "var(--foreground)", formatter: "{b}: {d}%" },
          data: data.map((d: any) => ({ 
            name: translateText(d.product, language), 
            value: d.value 
          }))
        }
      ]
    };
  };

  // 3. Regional Sales
  const getRegionalSalesOption = () => {
    const data = sales.regional_sales || [];
    return {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "value",
        axisLabel: { color: "var(--muted)" },
        splitLine: { lineStyle: { color: "rgba(148, 163, 184, 0.1)" } }
      },
      yAxis: {
        type: "category",
        data: data.map((d: any) => translateText(d.region, language)),
        axisLabel: { color: "var(--muted)" }
      },
      series: [
        {
          name: translateText("Revenue", language),
          type: "bar",
          data: data.map((d: any) => d.value),
          itemStyle: { color: "#3b82f6", borderRadius: [0, 4, 4, 0] }
        }
      ]
    };
  };

  // 4. Supplier Purchases
  const getSupplierPurchasesOption = () => {
    const data = purchase.supplier_purchases || [];
    return {
      tooltip: { trigger: "item" },
      series: [
        {
          name: translateText("Purchases", language),
          type: "pie",
          radius: "55%",
          data: data.map((d: any) => ({ 
            name: translateText(d.supplier, language), 
            value: d.value 
          })),
          label: { color: "var(--foreground)" }
        }
      ]
    };
  };

  // 5. Purchase Cost Trends
  const getPurchaseTrendOption = () => {
    const data = purchase.purchase_cost_trends || [];
    return {
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: data.map((d: any) => d.date),
        axisLabel: { color: "var(--muted)" }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "var(--muted)" },
        splitLine: { lineStyle: { color: "rgba(148, 163, 184, 0.1)" } }
      },
      series: [
        {
          name: translateText("Cost", language),
          type: "bar",
          data: data.map((d: any) => d.value),
          itemStyle: { color: "#ec4899", borderRadius: [4, 4, 0, 0] }
        }
      ]
    };
  };

  // 6. Cash Flow History
  const getCashFlowOption = () => {
    const data = financial.cash_flow || [];
    return {
      tooltip: { trigger: "axis" },
      legend: { data: [translateText("Cash In", language), translateText("Cash Out", language)], textStyle: { color: "var(--foreground)" } },
      xAxis: {
        type: "category",
        data: data.map((d: any) => d.month),
        axisLabel: { color: "var(--muted)" }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "var(--muted)" },
        splitLine: { lineStyle: { color: "rgba(148, 163, 184, 0.1)" } }
      },
      series: [
        {
          name: translateText("Cash In", language),
          type: "line",
          data: data.map((d: any) => d.cash_in),
          smooth: true,
          lineStyle: { width: 3, color: "#10b981" },
          itemStyle: { color: "#10b981" }
        },
        {
          name: translateText("Cash Out", language),
          type: "line",
          data: data.map((d: any) => d.cash_out),
          smooth: true,
          lineStyle: { width: 3, color: "#ef4444" },
          itemStyle: { color: "#ef4444" }
        }
      ]
    };
  };

  // 7. Sales Forecast
  const getSalesForecastOption = () => {
    const hist = sales.trends || [];
    const fc = forecasting.sales_forecast || [];
    const categoriesList = [...hist.map((d: any) => d.date), ...fc.map((d: any) => d.date)];
    
    const histSeries = hist.map((d: any) => d.value);
    const fcSeries = [...hist.map(() => null), ...fc.map((d: any) => d.projected_value)];
    if (histSeries.length > 0) {
      fcSeries[histSeries.length - 1] = histSeries[histSeries.length - 1];
    }
    
    return {
      tooltip: { trigger: "axis" },
      legend: { data: [translateText("Actual Sales", language), translateText("Projected Sales", language)], textStyle: { color: "var(--foreground)" } },
      xAxis: {
        type: "category",
        data: categoriesList,
        axisLabel: { color: "var(--muted)" }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "var(--muted)" },
        splitLine: { lineStyle: { color: "rgba(148, 163, 184, 0.1)" } }
      },
      series: [
        {
          name: translateText("Actual Sales", language),
          type: "line",
          data: histSeries,
          lineStyle: { width: 3, color: "#3b82f6" },
          itemStyle: { color: "#3b82f6" }
        },
        {
          name: translateText("Projected Sales", language),
          type: "line",
          data: fcSeries,
          lineStyle: { width: 3, type: "dashed", color: "#eab308" },
          itemStyle: { color: "#eab308" }
        }
      ]
    };
  };

  return (
    <div className="space-y-6">
      {/* 6 Tab Controls */}
      <div className="glass-card p-2 flex flex-wrap gap-1.5 justify-between">
        {[
          { id: "executive", label: "Executive Dashboard", icon: <ShieldCheck className="h-4 w-4" /> },
          { id: "sales", label: "Sales Analytics", icon: <TrendingUp className="h-4 w-4" /> },
          { id: "inventory", label: "Inventory Dashboard", icon: <Box className="h-4 w-4" /> },
          { id: "purchase", label: "Purchase Dashboard", icon: <Truck className="h-4 w-4" /> },
          { id: "financial", label: "Financial Dashboard", icon: <IndianRupee className="h-4 w-4" /> },
          { id: "forecasting", label: "Forecasting Dashboard", icon: <Calendar className="h-4 w-4" /> }
        ].map((tab) => {
          const isSelected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SubTab)}
              className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-3 py-3.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                isSelected 
                  ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" 
                  : "bg-transparent hover:bg-slate-500/5 text-foreground"
              }`}
            >
              {tab.icon}
              <span>{translateText(tab.label, language)}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        {/* EXECUTIVE DASHBOARD */}
        {activeSubTab === "executive" && (
          <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="glass-card p-5 border border-yellow-500/10 hover:border-yellow-500/30 transition-all flex flex-col justify-between">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{translateText("Today's Sales", language)}</span>
                <h3 className="text-xl md:text-2xl font-black text-yellow-400 mt-2">{formatRupees(exec.today_sales)}</h3>
                <span className="text-[9px] text-muted mt-1 block">{translateText("Expected daily business volume", language)}</span>
              </div>
              <div className="glass-card p-5 border border-primary/10 hover:border-primary/30 transition-all flex flex-col justify-between">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{translateText("Monthly Sales", language)}</span>
                <h3 className="text-xl md:text-2xl font-black text-foreground mt-2">{formatRupees(exec.monthly_sales)}</h3>
                <span className="text-[9px] text-muted mt-1 block">{translateText("Current billing cycle volume", language)}</span>
              </div>
              <div className="glass-card p-5 border border-emerald-500/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{translateText("Gross Profit", language)}</span>
                <h3 className="text-xl md:text-2xl font-black text-emerald-500 mt-2">{formatRupees(exec.gross_profit)}</h3>
                <span className="text-[9px] text-muted mt-1 block">{translateText("Revenue minus material costs", language)}</span>
              </div>
              <div className="glass-card p-5 border border-blue-500/10 hover:border-blue-500/30 transition-all flex flex-col justify-between">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{translateText("Inventory Value", language)}</span>
                <h3 className="text-xl md:text-2xl font-black text-blue-400 mt-2">{formatRupees(exec.inventory_val)}</h3>
                <span className="text-[9px] text-muted mt-1 block">{translateText("Total asset value of stock on hand", language)}</span>
              </div>
              <div className="glass-card p-5 border border-rose-500/10 hover:border-rose-500/30 transition-all flex flex-col justify-between">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{translateText("Outstanding Receivables", language)}</span>
                <h3 className="text-xl md:text-2xl font-black text-rose-500 mt-2">{formatRupees(exec.outstanding_receivables)}</h3>
                <span className="text-[9px] text-muted mt-1 block">{translateText("Pending dues from customer accounts", language)}</span>
              </div>
              <div className={`glass-card p-5 border transition-all flex flex-col justify-between ${
                exec.stock_alerts > 0 ? "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40" : "border-card-border"
              }`}>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{translateText("Stock Alerts", language)}</span>
                <div className="flex items-center gap-2 mt-2">
                  {exec.stock_alerts > 0 && <AlertTriangle className="h-5 w-5 text-rose-500 animate-bounce" />}
                  <h3 className={`text-xl md:text-2xl font-black ${exec.stock_alerts > 0 ? "text-rose-500" : "text-foreground"}`}>
                    {exec.stock_alerts} {translateText("items low", language)}
                  </h3>
                </div>
                <span className="text-[9px] text-muted mt-1 block">{translateText("Products below safety stock margins", language)}</span>
              </div>
            </div>

            <div className="glass-card p-5 space-y-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Info className="h-4 w-4 text-yellow-500" />
                <span>{translateText("Small Business Health Summary", language)}</span>
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                {getExecSummaryTranslation()}
              </p>
            </div>
          </div>
        )}

        {/* SALES ANALYTICS */}
        {activeSubTab === "sales" && (
          <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-5 flex flex-col">
                <h4 className="font-bold text-sm text-foreground mb-4">{translateText("Sales Trends (Monthly billings)", language)}</h4>
                <div className="h-64">
                  <ReactECharts option={getSalesTrendOption()} style={{ height: "100%", width: "100%" }} />
                </div>
              </div>

              <div className="glass-card p-5 flex flex-col">
                <h4 className="font-bold text-sm text-foreground mb-4">{translateText("Product-wise Sales", language)}</h4>
                <div className="h-64">
                  <ReactECharts option={getProductSalesOption()} style={{ height: "100%", width: "100%" }} />
                </div>
              </div>

              <div className="glass-card p-5 flex flex-col">
                <h4 className="font-bold text-sm text-foreground mb-4">{translateText("Regional Sales", language)}</h4>
                <div className="h-64">
                  <ReactECharts option={getRegionalSalesOption()} style={{ height: "100%", width: "100%" }} />
                </div>
              </div>

              <div className="glass-card p-5 space-y-4">
                <h4 className="font-bold text-sm text-foreground">{translateText("Top Customers & Order Value", language)}</h4>
                <div className="space-y-3">
                  {sales.top_customers?.map((cust: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted w-5">#{idx+1}</span>
                        <span className="text-xs font-bold text-foreground">{translateText(cust.name, language)}</span>
                      </div>
                      <span className="text-xs font-black text-yellow-400">{formatRupees(cust.value)}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl border border-yellow-500/15 bg-yellow-500/5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-muted uppercase">{translateText("Average Order Value (AOV)", language)}</span>
                    <p className="text-xs text-muted">{translateText("Typical transaction amount per invoice", language)}</p>
                  </div>
                  <h3 className="text-lg font-black text-yellow-400">{formatRupees(sales.average_order_value)}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY DASHBOARD */}
        {activeSubTab === "inventory" && (
          <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Current stock status list */}
              <div className="glass-card p-5 md:col-span-2 space-y-4">
                <h4 className="font-bold text-sm text-foreground">{translateText("Current Stock Levels", language)}</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin pr-1">
                  {inventory.current_stock?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-850 hover:border-yellow-500/20 transition-all">
                      <div className="space-y-0.5">
                        <span className="text-xs font-extrabold text-foreground block">{translateText(item.item, language)}</span>
                        <span className="text-[10px] text-muted">
                          {translateText("Stock Asset Value:", language)} {formatRupees(item.value)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-yellow-400">{item.quantity} {translateText("units", language)}</span>
                        <div className="w-24 bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1 ml-auto">
                          <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${Math.min(100, item.quantity / 10)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions, Fast/Slow, Dead Stock */}
              <div className="space-y-5">
                <div className="glass-card p-5 border border-rose-500/10 space-y-3">
                  <h4 className="font-bold text-xs text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{translateText("Reorder Suggestions", language)}</span>
                  </h4>
                  <div className="space-y-2.5">
                    {inventory.reorder_suggestions?.map((sug: any, idx: number) => (
                      <div key={idx} className="text-xs p-2 rounded bg-rose-500/5 border border-rose-500/20 space-y-1">
                        <div className="flex justify-between">
                          <strong className="text-foreground">{translateText(sug.item, language)}</strong>
                          <span className="text-rose-400">{sug.current_stock} / {sug.reorder_level} {translateText("units", language)}</span>
                        </div>
                        <p className="text-[10px] text-muted">
                          {translateText("Recommended supplier:", language)} <strong>{translateText(sug.supplier, language)}</strong>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5 space-y-3.5">
                  <h4 className="font-bold text-xs text-foreground">{translateText("Stock Turnovers (ABC Analysis)", language)}</h4>
                  <div className="space-y-2.5">
                    {inventory.abc_analysis?.map((abc: any, idx: number) => (
                      <div key={idx} className="text-xs flex items-center justify-between">
                        <span className="text-muted">{translateText(abc.category, language)}</span>
                        <span className="font-bold text-foreground">{formatRupees(abc.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-foreground">{translateText("Fast/Slow-Moving Products", language)}</h4>
                <div className="space-y-2">
                  {inventory.fast_slow?.map((fs: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs py-1 border-b border-zinc-800">
                      <span className="text-muted">{translateText(fs.item, language)}</span>
                      <span className={`font-bold ${fs.status.includes("Fast") ? "text-emerald-500" : "text-amber-500"}`}>
                        {translateText(fs.status, language)} ({fs.sales_qty} {translateText("sold", language)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-foreground">{translateText("Dead Stock Alerts", language)}</h4>
                <div className="space-y-2">
                  {inventory.dead_stock?.map((ds: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs py-1 border-b border-zinc-800">
                      <span className="text-muted">{translateText(ds.item, language)}</span>
                      <span className="font-bold text-rose-500">
                        {formatRupees(ds.value)} ({ds.days_inactive} {translateText("days idle", language)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PURCHASE DASHBOARD */}
        {activeSubTab === "purchase" && (
          <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-5 flex flex-col">
                <h4 className="font-bold text-sm text-foreground mb-4">{translateText("Supplier-wise Purchases", language)}</h4>
                <div className="h-64">
                  <ReactECharts option={getSupplierPurchasesOption()} style={{ height: "100%", width: "100%" }} />
                </div>
              </div>

              <div className="glass-card p-5 flex flex-col">
                <h4 className="font-bold text-sm text-foreground mb-4">{translateText("Purchase Cost Trends (Monthly)", language)}</h4>
                <div className="h-64">
                  <ReactECharts option={getPurchaseTrendOption()} style={{ height: "100%", width: "100%" }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-5 space-y-4">
                <h4 className="font-bold text-sm text-foreground">{translateText("Supplier Quality & Delivery Performance", language)}</h4>
                <div className="space-y-3">
                  {purchase.supplier_performance?.map((supp: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                      <span className="text-xs font-bold text-foreground">{translateText(supp.supplier, language)}</span>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-amber-500 font-extrabold">{translateText("Rating:", language)} {supp.rating} / 5</span>
                        <span className="text-emerald-500 font-bold">{supp.on_time_delivery_pct}% {translateText("On-time", language)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-5 space-y-4">
                <h4 className="font-bold text-sm text-foreground">{translateText("Order Frequency Intervals", language)}</h4>
                <div className="space-y-3">
                  {purchase.purchase_frequency?.map((freq: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs py-2 border-b border-zinc-800">
                      <span className="text-muted">{translateText(freq.supplier, language)}</span>
                      <span className="font-bold text-foreground">{translateText(freq.frequency, language)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FINANCIAL DASHBOARD */}
        {activeSubTab === "financial" && (
          <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-5 text-center flex flex-col justify-between">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{translateText("Cash Margin Rate", language)}</span>
                <h3 className="text-3xl font-black text-emerald-500 mt-2">{financial.margin_pct}%</h3>
                <span className="text-[9px] text-muted block mt-1">{translateText("Average profitability margins on items sold", language)}</span>
              </div>
              <div className="glass-card p-5 text-center flex flex-col justify-between">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{translateText("Pending Receivables", language)}</span>
                <h3 className="text-3xl font-black text-rose-500 mt-2">{formatRupees(exec.outstanding_receivables)}</h3>
                <span className="text-[9px] text-muted block mt-1">{translateText("Dues to collect from clients", language)}</span>
              </div>
              <div className="glass-card p-5 text-center flex flex-col justify-between">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{translateText("Pending Payables", language)}</span>
                <h3 className="text-3xl font-black text-amber-500 mt-2">{formatRupees(exec.outstanding_payables)}</h3>
                <span className="text-[9px] text-muted block mt-1">{translateText("Dues to settle with supplier ledgers", language)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-5 flex flex-col">
                <h4 className="font-bold text-sm text-foreground mb-4">{translateText("Cash Inflow vs Outflow History", language)}</h4>
                <div className="h-64">
                  <ReactECharts option={getCashFlowOption()} style={{ height: "100%", width: "100%" }} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-card p-5 space-y-3.5">
                  <h4 className="font-bold text-xs text-rose-400">{translateText("Aging Receivables (Outstanding Dues)", language)}</h4>
                  <div className="space-y-2">
                    {financial.receivables?.map((rec: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs py-1 border-b border-zinc-800">
                        <span className="text-muted">{translateText(rec.customer, language)}</span>
                        <span className="font-bold text-rose-400">
                          {formatRupees(rec.amount)} ({rec.days_overdue} {translateText("days overdue", language)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5 space-y-3.5">
                  <h4 className="font-bold text-xs text-amber-400">{translateText("Aging Payables (Pending Payments)", language)}</h4>
                  <div className="space-y-2">
                    {financial.payables?.map((pay: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs py-1 border-b border-zinc-800">
                        <span className="text-muted">{translateText(pay.supplier, language)}</span>
                        <span className="font-bold text-amber-400">
                          {formatRupees(pay.amount)} ({pay.days_overdue} {translateText("days due", language)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FORECASTING DASHBOARD */}
        {activeSubTab === "forecasting" && (
          <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-5 flex flex-col">
                <h4 className="font-bold text-sm text-foreground mb-4">{translateText("Sales Forecast (Next 6 Months Projection)", language)}</h4>
                <div className="h-64">
                  <ReactECharts option={getSalesForecastOption()} style={{ height: "100%", width: "100%" }} />
                </div>
              </div>

              <div className="glass-card p-5 space-y-4">
                <h4 className="font-bold text-sm text-foreground">{translateText("Product Demand Predictions", language)}</h4>
                <div className="space-y-3">
                  {forecasting.demand_prediction?.map((dem: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-zinc-900 border border-zinc-850">
                      <span className="text-xs font-bold text-foreground">{translateText(dem.product, language)}</span>
                      <span className="text-xs font-extrabold text-yellow-400 bg-yellow-500/5 border border-yellow-500/10 px-2 py-0.5 rounded">
                        {translateText(dem.projected_demand, language)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card p-5 space-y-4">
              <h4 className="font-bold text-sm text-foreground">{translateText("Supply Order Recommendations", language)}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-muted">
                      <th className="py-2.5">{translateText("Suggested Product", language)}</th>
                      <th className="py-2.5 text-center">{translateText("Procurement Qty", language)}</th>
                      <th className="py-2.5 text-center">{translateText("Target Delivery Date", language)}</th>
                      <th className="py-2.5 text-right">{translateText("Assign Supplier", language)}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecasting.purchase_recommendations?.map((rec: any, idx: number) => (
                      <tr key={idx} className="border-b border-zinc-855 hover:bg-slate-500/5">
                        <td className="py-2.5 font-bold text-foreground">{translateText(rec.product, language)}</td>
                        <td className="py-2.5 text-center text-yellow-400 font-extrabold">{rec.quantity} {translateText("units", language)}</td>
                        <td className="py-2.5 text-center text-muted">{rec.recommended_date}</td>
                        <td className="py-2.5 text-right text-foreground">{translateText(rec.supplier, language)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
