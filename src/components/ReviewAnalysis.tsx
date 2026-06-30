"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, Download, CheckCircle, AlertTriangle, Info, TrendingUp, 
  Cpu, Database, ShieldAlert, Coins, PackageOpen, Users, 
  Calendar, CheckCircle2 
} from "lucide-react";
import { api } from "../utils/api";
import { useTranslation } from "../utils/LanguageContext";

interface ReviewAnalysisProps {
  fileId: string;
}

// Client-side translation helper for dynamic content
const translateToTamil = (text: string, language: string): string => {
  if (language !== "ta" || !text) return text;

  const dictionary: Record<string, string> = {
    // Basic structural phrases
    "This dataset records your business transactions. It contains": "இந்த தரவுத்தொகுப்பு உங்கள் வணிக பரிவர்த்தனைகளைப் பதிவு செய்கிறது. இதில் உள்ளது",
    "total entries": "மொத்த பதிவுகள்",
    "columns": "நெடுவரிசைகள்",
    "Based on the data, your best-selling product or category is": "தரவுகளின்படி, உங்களின் சிறந்த விற்பனையான தயாரிப்பு அல்லது வகை",
    "recorded": "பதிவு செய்யப்பட்டுள்ளது",
    "times": "முறைகள்",
    "Your most frequent customer is": "உங்களின் வழக்கமான வாடிக்கையாளர்",
    "with": "உடன்",
    "occurrences": "முறை நிகழ்வுகள்",
    "Estimated total business volume for": "மதிப்பிடப்பட்ட மொத்த வணிக மதிப்பு",
    "is approximately": "சுமார்",
    
    // Opportunities
    "Your sales appear uniform. Record more product descriptions and transaction prices to reveal trends.": "உங்கள் விற்பனை சீராகத் தோன்றுகிறது. போக்குகளை வெளிப்படுத்த மேலும் தயாரிப்பு விளக்கங்கள் மற்றும் பரிவர்த்தனை விலைகளைப் பதிவு செய்யவும்.",
    "Leverage high-correlation clusters to optimize operating channels.": "செயல்பாட்டு வழிகளை மேம்படுத்த அதிக தொடர்பு கொண்ட தொகுப்புகளைப் பயன்படுத்தவும்.",
    "Normalize seasonal variances by adjusting allocations.": "ஒதுக்கீடுகளை சரிசெய்வதன் மூலம் பருவகால மாறுபாடுகளை சீரமைக்கவும்.",
    "Establish alert protocols for statistical outliers.": "புள்ளிவிவர அதிவிலகல்களுக்கான எச்சரிக்கை நெறிமுறைகளை நிறுவவும்.",
    
    // Risks / Alerts
    "blank entries. Recommend auto-cleaning to fill them.": "வெற்று உள்ளீடுகள் உள்ளன. அவற்றை நிரப்ப தானியங்கி சுத்திகரிப்பை பரிந்துரைக்கிறோம்.",
    "Column": "நெடுவரிசை",
    "has": "கொண்டுள்ளது",
    
    // Fallbacks
    "The dataset displays a steady linear projection curve.": "தரவுத்தொகுப்பு நிலையான நேரியல் முன்கணிப்பு வளைவைக் காட்டுகிறது.",
    "No strong cyclical seasonality detected.": "வலுவான சுழற்சி பருவகால வடிவங்கள் எதுவும் கண்டறியப்படவில்லை.",
    "No significant outlier spikes detected.": "குறிப்பிடத்தக்க விலகல் ஸ்பைக்குகள் எதுவும் கண்டறியப்படவில்லை.",
    "Data indicates repeating seasonal patterns with high variances in specific time intervals.": "குறிப்பிட்ட நேர இடைவெளிகளில் அதிக மாறுபாடுகளுடன் மீண்டும் மீண்டும் வரும் பருவகால வடிவங்களை தரவு குறிக்கிறது.",
    "Detected": "கண்டறியப்பட்டது",
    "values sitting outside normal confidence ranges.": "மதிப்புகள் இயல்பான எல்லைகளுக்கு வெளியே அமைந்துள்ளன.",
    "growing": "வளர்ந்து வரும்",
    "declining": "சரிந்து வரும்",
    "stable": "நிலையான",
    "trend with a projected growth rate of": "போக்கைக் காட்டுகிறது, இதன் திட்டமிடப்பட்ட வளர்ச்சி விகிதம்",
    "over subsequent periods.": "அடுத்தடுத்த காலங்களில்.",
    
    // Tally Specific Columns / Values
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

  // 1. Check direct match
  if (dictionary[text]) return dictionary[text];

  // 2. Perform replacements
  let translated = text;
  Object.entries(dictionary).forEach(([enKey, taVal]) => {
    translated = translated.replace(new RegExp(enKey, "g"), taVal);
  });

  return translated;
};

export default function ReviewAnalysis({ fileId }: ReviewAnalysisProps) {
  const { t, language } = useTranslation();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const { quality, trend_analysis, kpis, executive_summary } = analysis;

  // Calculate clean plain-language metrics
  const missingValCount = (quality?.issues?.missing_values || 0) + (quality?.issues?.blank_cells || 0);
  const duplicateCount = quality?.issues?.duplicate_records || 0;

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
      {kpis && Object.keys(kpis).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(kpis).map(([kpiName, kpiValue]: any) => (
            <div key={kpiName} className="glass-card p-4 flex flex-col justify-between space-y-1.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-10 w-10 bg-primary/5 rounded-bl-full pointer-events-none" />
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block truncate">
                {translateToTamil(kpiName, language)}
              </span>
              <span className="text-lg md:text-xl font-extrabold text-foreground tracking-tight">{kpiValue}</span>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Executive Summary Card */}
      <div className="glass-card p-6 border-accent/15 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-36 w-36 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2 text-accent font-bold text-sm uppercase tracking-wider mb-4">
          <Sparkles className="h-4.5 w-4.5 animate-pulse fill-current" />
          <span>{language === "ta" ? "நிர்வாக சுருக்க ஆலோசனைக் குறிப்பு" : "Executive Summary Advisory"}</span>
        </div>
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-500/5 border border-card-border/30">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
              {language === "ta" ? "கடை ஆரோக்கியம் & ஆலோசனைக் குறிப்புகள்" : "Store Health & Advisory Notes"}
            </h3>
            <p className="text-sm text-foreground leading-relaxed font-sans font-semibold">
              {translateToTamil(executive_summary.text, language)}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-3">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider">
                <CheckCircle className="h-4 w-4" />
                <span>{language === "ta" ? "வளரக்கூடிய முக்கிய வாய்ப்புகள்" : "Opportunities to Grow"}</span>
              </div>
              <ul className="text-xs text-muted space-y-2">
                {executive_summary.opportunities.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span>{translateToTamil(item, language)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-3">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="h-4 w-4" />
                <span>{language === "ta" ? "செயல்பாட்டு அபாயங்கள் & சரிபார்ப்புகள்" : "Operational Risks & Checks"}</span>
              </div>
              <ul className="text-xs text-muted space-y-2">
                {executive_summary.risks.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <span>{translateToTamil(item, language)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Business Health Analysis (Plain language, non-technical checkups) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Financial health check */}
        <div className="glass-card p-5 space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Coins className="h-4.5 w-4.5 text-emerald-500" />
              <span>{language === "ta" ? "விற்பனை & ரொக்க லாப வரம்புகள்" : "Sales & Cash Margins"}</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {language === "ta" 
                ? "உங்கள் விற்பனைப் பதிவுகள் நேர்மறையான விலை நகர்வைக் காட்டுகின்றன. சராசரியாக, வாடிக்கையாளர்களின் கொள்முதல் உயர் மதிப்புடையது, இது நிலையான ஆர்டர் அளவைக் குறிக்கிறது. ரொக்க வரவை அதிகரிக்க, நல்ல லாப வரம்புகள் கொண்ட பொருட்களைக் கண்டறிந்து விற்பனை செய்யப் பரிந்துரைக்கிறோம்."
                : "Your sales records show positive pricing movement. On average, customer purchases are high-value backed, indicating consistent order sizes. To maximize cash-inflow, we recommend reviewing items with strong pricing margins and focusing marketing efforts there."
              }
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-500/5 border border-card-border/30 text-center">
            <span className="text-[9px] text-muted block uppercase font-bold">{language === "ta" ? "பரிந்துரைக்கப்பட்ட கவனம்" : "Suggested Focus"}</span>
            <span className="text-xs font-bold text-foreground">
              {language === "ta" ? "அதிக லாப வரம்பு பில்லிங் சுழற்சிகளை மேம்படுத்துதல்" : "Optimize High-Margin Billing Cycles"}
            </span>
          </div>
        </div>

        {/* Inventory Control health check */}
        <div className="glass-card p-5 space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs uppercase tracking-wider">
              <PackageOpen className="h-4.5 w-4.5 text-yellow-500" />
              <span>{language === "ta" ? "பங்கு கட்டுப்பாடு & சேமிப்பு" : "Stock Control & Storage"}</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {language === "ta"
                ? "தினசரி பணப்புழக்கத்தை நிர்வகிக்க சரக்கு இருப்பைக் கட்டுப்படுத்துவது மிகவும் அவசியம். விற்பனை இழப்பைத் தடுக்க வேகமாக விற்கும் பொருட்களை எப்போதும் கையிருப்பில் வைத்திருங்கள், மேலும் மூலதனம் முடங்குவதைத் தவிர்க்க மெதுவாக விற்கும் பொருட்களைக் கண்காணியுங்கள்."
                : "Managing inventory levels is vital for daily cash flow velocity. Keep critical fast-moving goods stocked at all times to prevent empty-shelf sales losses, and monitor items showing slow sales movement to avoid tying up your store's capital in dead stock."
              }
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-500/5 border border-card-border/30 text-center">
            <span className="text-[9px] text-muted block uppercase font-bold">{language === "ta" ? "பரிந்துரைக்கப்பட்ட கவனம்" : "Suggested Focus"}</span>
            <span className="text-xs font-bold text-foreground">
              {language === "ta" ? "குறைந்த இருப்பு விழிப்பூட்டல்களைத் தவறாமல் சரிபார்க்கவும்" : "Review Low Stock Alerts Regularly"}
            </span>
          </div>
        </div>

        {/* Trade/Loyalty relations health check */}
        <div className="glass-card p-5 space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Users className="h-4.5 w-4.5 text-indigo-500" />
              <span>{language === "ta" ? "வாடிக்கையாளர் வர்த்தகம் & உறவுகள்" : "Customer Trade & Relations"}</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {language === "ta"
                ? "உங்கள் விற்பனை அளவின் முக்கிய பகுதி வழக்கமான வாடிக்கையாளர்கள் மற்றும் ஒப்பந்தக்காரர்களைப் பொறுத்தது. இந்த உறவுகளைப் பேணுவது மிகவும் முக்கியம். உங்களின் சிறந்த வாடிக்கையாளர்களுக்கு சிறப்புத் தள்ளுபடிகள் அல்லது லாயல்டி விலைகளை வழங்கப் பரிந்துரைக்கிறோம்."
                : "A major share of store volumes depends on top trade accounts and regular contractors. Nurturing these core relationships is extremely important. We advise implementing loyalty discount brackets or volume tiers for your top-performing client ledgers."
              }
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-500/5 border border-card-border/30 text-center">
            <span className="text-[9px] text-muted block uppercase font-bold">{language === "ta" ? "பரிந்துரைக்கப்பட்ட கவனம்" : "Suggested Focus"}</span>
            <span className="text-xs font-bold text-foreground">
              {language === "ta" ? "சிறப்பு வாடிக்கையாளர் லாயல்டி விலைகளை அமைத்தல்" : "Setup VIP Loyalty Pricing Brackets"}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Outlook & Seasonality */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
        {/* Enhanced Trend Outlook */}
        <div className="glass-card p-6 space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              <span>{language === "ta" ? "எதிர்கால விற்பனைப் போக்கு அவுட்லுக்" : "Future Sales Trend Outlook"}</span>
            </div>
            <p className="text-xs text-foreground font-medium leading-relaxed bg-indigo-500/5 p-3.5 rounded-xl border border-indigo-500/10">
              {translateToTamil(trend_analysis.trend, language)}
            </p>
            <div className="space-y-2 pt-2">
              <h4 className="text-[10px] font-bold text-muted uppercase tracking-wider">
                {language === "ta" ? "செயல்படக்கூடிய போக்கு பரிந்துரைகள்:" : "Actionable Trend Recommendations:"}
              </h4>
              <ul className="text-xs text-muted space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold mt-0.5">•</span>
                  <span>
                    {language === "ta" 
                      ? "வளர்ச்சி காலத்தை முன்கூட்டியே கணக்கிட்டு கொள்முதல் அளவை சீரமைக்கவும்."
                      : "Align your raw procurement volumes to catch projected growth phases early."
                    }
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold mt-0.5">•</span>
                  <span>
                    {language === "ta"
                      ? "சந்தையின் விநியோக அளவைப் பொறுத்து விற்பனை விலைகளை மாற்றியமைக்கவும்."
                      : "Adjust sales pricing structures dynamically depending on market supply levels."
                    }
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Enhanced Seasonality Patterns */}
        <div className="glass-card p-6 space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Calendar className="h-5 w-5 text-amber-500" />
              <span>{language === "ta" ? "பருவகாலம் & வாங்குதல் சுழற்சிகள்" : "Seasonality & Buying Cycles"}</span>
            </div>
            <p className="text-xs text-foreground font-medium leading-relaxed bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/10">
              {translateToTamil(trend_analysis.seasonality, language)} {translateToTamil(trend_analysis.anomaly, language)}
            </p>
            <div className="space-y-2 pt-2">
              <h4 className="text-[10px] font-bold text-muted uppercase tracking-wider">
                {language === "ta" ? "செயல்படக்கூடிய பருவகால பரிந்துரைகள்:" : "Actionable Seasonality Recommendations:"}
              </h4>
              <ul className="text-xs text-muted space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span>
                    {language === "ta"
                      ? "விற்பனை குறைந்த காலங்களில் வணிகத்தை ஆதரிக்க, விற்பனை அதிகமுள்ள மாதங்களில் ரொக்க இருப்புக்களை உருவாக்குங்கள்."
                      : "Build cash reserves during high-demand months to support periods of lower demand."
                    }
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span>
                    {language === "ta"
                      ? "இருப்பு தேங்குவதைத் தவிர்க்க குறைந்த விற்பனை உள்ள காலங்களில் சிறப்பு விளம்பர தள்ளுபடிகளை அறிமுகப்படுத்துங்கள்."
                      : "Introduce off-season wholesale promotions to clear static inventory items."
                    }
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Record Health Check Card (Simple plain language, replacing raw Data Quality section) */}
      <div className="glass-card p-5 border-primary/10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">
                {language === "ta" ? "விரிதாள் தணிக்கை & தூய்மைச் சரிபார்ப்பு" : "Spreadsheet Audit & Cleanliness Check"}
              </h4>
              <p className="text-xs text-muted mt-0.5">
                {language === "ta"
                  ? `உங்கள் விரிதாள் சிறந்த நிலையில் உள்ளது. எங்கள் கணினி தானாகவே ${missingValCount} வெற்று உள்ளீடுகளைச் சரிசெய்து, ${duplicateCount} நகல் பதிவுகளை இணைத்துள்ளது.`
                  : `Your uploaded sheet is in great shape. Our system automatically repaired ${missingValCount} blank entries and merged ${duplicateCount} duplicate records.`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 shrink-0 self-start sm:self-center">
            <span className="text-[10px] font-bold text-muted uppercase">{language === "ta" ? "சுகாதார மதிப்பெண்" : "Health Score"}</span>
            <span className="text-sm font-black text-primary">{quality.score} / 100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
