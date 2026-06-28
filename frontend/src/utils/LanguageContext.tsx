"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ta";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ta: {
    // Brand / Layout
    "brand.title": "லக்ஷ்மி ஸ்டீல்ஸ் AI",
    "brand.subtitle": "தானியங்கி AI தரவு பகுப்பாய்வாளர் & வணிக நுண்ணறிவு",
    "header.closeDataset": "தரவுத்தொகுப்பை மூடு",
    
    // Ingestion Landing
    "landing.tag": "அறிவுசார் வணிக பகுப்பாய்வு இயந்திரம்",
    "landing.title": "அறிவுசார் AI வணிக நுண்ணறிவு தளம்",
    "landing.desc": "எந்தவொரு எக்செல் அல்லது சிஎஸ்வி விரிதாளையும் பதிவேற்றவும். சில நொடிகளில், எங்கள் கணினி கலங்களை சுத்தம் செய்து, காட்சி டாஷ்போர்டுகளை உருவாக்கி, புள்ளிவிவரங்களை தொகுத்து, ஒரு AI அரட்டை உதவியாளரை வழங்குகிறது.",
    "landing.uploadHeader": "உங்கள் மூல தரவுத்தொகுப்பை பதிவேற்றவும்",
    "landing.uploadSub": "உங்கள் எக்செல் (.xlsx, .xls) அல்லது சிஎஸ்வி கோப்புகளை இங்கே இழுத்து விடவும் அல்லது உங்கள் கணினியிலிருந்து கோப்புகளைத் தேட கிளிக் செய்யவும்.",
    "landing.uploadLimit": "50MB வரையிலான கோப்புகள் ஆதரிக்கப்படுகின்றன",
    "landing.recentHeader": "சமீபத்தில் பகுப்பாய்வு செய்யப்பட்ட தரவுத்தொகுப்பை ஏற்றவும்",
    
    // Capabilities
    "capabilities.title": "முழுமையான தானியங்கி திறன்கள்",
    "capabilities.clean.title": "தானியங்கி சுத்திகரிப்பு",
    "capabilities.clean.desc": "நகல் வரிசைகளை நீக்குகிறது, விடுபட்டவற்றை சராசரி/முறையைக் கொண்டு நிரப்புகிறது, தொலைபேசி/மின்னஞ்சல் வடிவமைப்பை சீராக்குகிறது, மற்றும் எண் அதிவிலகல்களை நீக்குகிறது.",
    "capabilities.profile.title": "புள்ளிவிவர விவரக்குறிப்பு",
    "capabilities.profile.desc": "அனைத்து மாறிகளின் சரிவுத்தன்மை, தட்டைத்தன்மை, முகடு, திட்ட விலக்கம் மற்றும் மாறுபாட்டு மதிப்புகளை உடனடியாக கணக்கிடுகிறது.",
    "capabilities.chat.title": "ஊடாடும் அரட்டை வழிகாட்டி",
    "capabilities.chat.desc": "விற்பனை போக்குகள், பிராந்திய முடிவுகள் அல்லது புள்ளிவிவர கணக்கீடுகள் பற்றி உங்கள் தரவுத்தொகுப்பு வழிகாட்டியிடம் நேரடியாகக் கேள்விகளைக் கேளுங்கள்.",
    
    // Sidebar File Meta
    "meta.loadedDb": "ஏற்றப்பட்ட தரவுத்தளம்",
    "meta.sheet": "தாள்: {sheet}",
    "meta.selectSheet": "செயலில் உள்ள தாளைத் தேர்ந்தெடுக்கவும்",
    "meta.kpiDomain": "முக்கிய செயல்திறன் டொமைன்",
    "meta.dataStatus": "தரவு நிலை",
    "meta.cleaned": "சுத்திகரிக்கப்பட்டது",
    "meta.original": "அசல்",
    
    // Navigation Tabs
    "tab.review": "1. பகுப்பாய்வை மதிப்பாய்வு செய்க",
    "tab.review.sub": "விவரக்குறிப்பு & முக்கிய செயல்திறன் அளவீடுகள்",
    "tab.visuals": "2. காட்சி டாஷ்போர்டு",
    "tab.visuals.sub": "ECharts வணிக ஒப்பீடுகள்",
    "tab.chat": "3. தரவுடன் உரையாடுங்கள்",
    "tab.chat.sub": "ஜெமினி உரையாடல் RAG",
    
    // Loading Screen
    "loader.title": "அறிவுசார் முகவர் பகுப்பாய்வு இயங்குகிறது",
    "loader.desc": "AI பகுப்பாய்வாளர் உங்கள் தரவு புத்தகத்தை செயலாக்கும் வரை காத்திருக்கவும்.",
    "loader.compiling": "தரவு பகுப்பாய்வு தற்காலிக சேமிப்பு குறிகாட்டிகளை தொகுக்கிறது...",
    "loader.step0": "தரவுத்தொகுப்பு பணிப்புத்தகத்தை பதிவேற்றுகிறது...",
    "loader.step1": "கோப்பு திட்டவடிவங்களை வாசிக்கிறது...",
    "loader.step2": "டொமைன் கட்டமைப்புகளைப் புரிந்துகொள்கிறது...",
    "loader.step3": "நகல் வரிசைகள் மற்றும் வெற்று மதிப்புகளை சுத்தம் செய்கிறது...",
    "loader.step4": "ஆழமான புள்ளிவிவர பகுப்பாய்வை இயக்குகிறது...",
    "loader.step5": "நிர்வாக AI நுண்ணறிவுகளை உருவாக்குகிறது...",
    "loader.step6": "ஊடாடும் வணிக நுண்ணறிவு டாஷ்போர்டுகளை உருவாக்குகிறது...",
    "loader.step7": "அரட்டை ரோபோ உதவி வழிகாட்டியைத் தயாரிப்பது...",
    
    // Review Analysis Workspace
    "review.title": "பகுப்பாய்வு மதிப்பாய்வு பணியிடம்",
    "review.subtitle": "தானியங்கியாக தயாரிக்கப்பட்ட விரிவான புள்ளிவிவர மற்றும் நுண்ணறிவு அறிக்கை",
    "review.btn.origExcel": "அசல் எக்செல்",
    "review.btn.cleanExcel": "சுத்திகரிக்கப்பட்ட எக்செல்",
    "review.btn.cleanCsv": "சுத்திகரிக்கப்பட்ட சிஎஸ்வி",
    "review.btn.pdf": "PDF அறிக்கை",
    "review.summaryTitle": "நிர்வாக சுருக்க அறிக்கை",
    "review.oppTitle": "முக்கிய வாய்ப்புகள் & நுண்ணறிவுகள்",
    "review.risksTitle": "சாத்தியமான அபாயங்கள் & கவனிக்க வேண்டியவை",
    
    "review.indicatorTitle": "தரவுத்தொகுப்பு கண்ணோட்ட குறிகாட்டிகள்",
    "review.indicator.rows": "மொத்த வரிசைகள்",
    "review.indicator.cols": "மொத்த நெடுவரிசைகள்",
    "review.indicator.size": "கோப்பு அளவு",
    "review.indicator.dateRange": "தேதி வரம்பு",
    "review.indicator.noDate": "தேதி வரம்பு இல்லை",
    
    "review.qualityTitle": "தரவு தர குறிகாட்டிகள்",
    "review.quality.nulls": "வெற்று மதிப்புகள்",
    "review.quality.dups": "நகல் பதிவுகள்",
    "review.quality.outliers": "அதிவிலகல் மதிப்புகள்",
    "review.quality.blank": "வெற்று கலங்கள்",
    "review.quality.invalid": "தவறான மதிப்புகள்",
    "review.quality.inconsistent": "சீரற்ற வடிவமைப்பு",
    "review.quality.incorrectType": "தவறான தரவு வகைகள்",
    
    // Descriptive Statistics
    "review.stats.descriptive": "விவரண புள்ளிவிவர பகுப்பாய்வு",
    "review.stats.colVar": "நெடுவரிசை மாறி",
    "review.stats.mean": "சராசரி",
    "review.stats.median": "மத்திய மதிப்பு",
    "review.stats.mode": "முகடு",
    "review.stats.variance": "மாறுபாடு",
    "review.stats.stdDev": "திட்ட விலக்கம்",
    "review.stats.min": "குறைந்தபட்சம்",
    "review.stats.max": "அதிகபட்சம்",
    "review.stats.skewness": "சரிவுத்தன்மை",
    "review.stats.kurtosis": "தட்டைத்தன்மை",
    "review.stats.percentiles": "சதமானங்கள்",
    "review.stats.p25": "25வது சதமானம்",
    "review.stats.p50": "50வது சதமானம் (IQR)",
    "review.stats.p75": "75வது சதமானம்",
    "review.stats.p90": "90வது சதமானம்",
    "review.stats.empty": "புள்ளிவிவர விளக்கத் தட்டுகளை உருவாக்க இந்தத் தரவுத்தொகுப்பில் எண் புலங்கள் எதுவும் இல்லை.",
    
    // Correlation & Importance
    "review.corr.title": "தொடர்பு மேட்ரிக்ஸ் கட்டம்",
    "review.feat.title": "அம்ச முக்கியத்துவ தரவரிசை",
    "review.feat.empty": "ஒப்பீட்டு அம்சத் தொடர்புத் தரவரிசைகளைக் கணக்கிட புள்ளிவிவர இலக்குகள் எதுவும் கண்டறியப்படவில்லை.",
    "review.feat.weight": "{weight}% முக்கியத்துவம்",
    
    // Trend & Seasonality
    "review.trend.title": "போக்கு அவுட்லுக்",
    "review.season.title": "பருவகால வடிவங்கள்",
    "review.anomaly.title": "முரண்பாடு விழிப்பூட்டல்கள்",
    
    // Predictive Analytics Forecast
    "review.predict.title": "கணிப்பு பகுப்பாய்வு (எதிர்கால முன்னறிவிப்பு)",
    "review.predict.target": "இலக்கு மாறி",
    "review.predict.start": "திட்டமிடல் தொடக்கம்",
    "review.predict.growth": "திட்டமிடப்பட்ட வளர்ச்சி: {growth}%",
    "review.predict.period": "எதிர்கால காலம்",
    "review.predict.point": "கணிக்கப்பட்ட புள்ளி",
    "review.predict.lower": "குறைந்த வரம்பு (95%)",
    "review.predict.upper": "உயர் வரம்பு (95%)",
    "review.clean.empty": "மூல தரவுத்தொகுப்பிற்கு தானியங்கி மாற்றங்கள் எதுவும் தேவையில்லை.",
    "review.clean.autoTitle": "தானியங்கி சுத்திகரிப்பு சுருக்கம்",
    
    "review.metricsTitle": "மாறி அளவீடுகள் & தரவு விவரக்குறிப்பு",
    "review.metrics.colName": "நெடுவரிசை பெயர்",
    "review.metrics.type": "வகை",
    "review.metrics.nullsRate": "வெற்று விகிதம்",
    "review.metrics.duplicates": "நகல்கள்",
    "review.metrics.outliers": "அதிவிலகல்கள்",
    "review.metrics.quality": "தர மதிப்பெண்",
    
    "review.outlierTitle": "அதிவிலகல் கண்டறிதல் & கணிப்பு முன்னறிவிப்புகள்",
    "review.outlier.target": "முன்னறிவிப்பு இலக்கு மாறி:",
    "review.outlier.date": "தேதி மாறி:",
    "review.outlier.noDateWarning": "தேதி மாறி கண்டறியப்படவில்லை. வரிசைமுறை குறியீட்டு அடிப்படையிலான முன்னறிவிப்பை இயக்குகிறது.",
    "review.outlier.period": "முன்னறிவிப்பு காலம்:",
    "review.outlier.runBtn": "முன்னறிவிப்பை இயக்குக",
    "review.outlier.running": "முன்னறிவிப்பு கணக்கிடப்படுகிறது...",
    "review.outlier.insights": "முன்னறிவிப்பு பகுப்பாய்வு நுண்ணறிவுகள்",
    "review.outlier.growth": "வளர்ச்சி விகிதம்",
    "review.outlier.direction": "போக்கு திசை",
    "review.outlier.r2": "கணிப்பு R² மதிப்பெண்",
    
    "review.checklistTitle": "செயல்பாட்டு சரிபார்ப்புப் பட்டியல்",
    "review.checklist.desc": "பயன்படுத்த மற்றும் தற்காலிக சேமிப்பில் உள்ள தரவுத்தள சொத்துகளை மீண்டும் உருவாக்க துப்புரவு பரிந்துரைகளைத் தேர்ந்தெடுக்கவும்:",
    "review.checklist.applyBtn": "துப்புரவு விதிகளைப் பயன்படுத்து",
    "review.checklist.applying": "விதிகளின்படி சுத்தம் செய்யப்படுகிறது...",
    
    "review.auditTitle": "தணிக்கை பதிவு & பதிப்பு வரலாறு",
    "review.audit.revertBtn": "கடைசி செயலை மாற்றியமை",
    "review.audit.reverting": "மாற்றியமைக்கப்படுகிறது...",
    
    // Dashboard / Visual Grid
    "dash.filters": "உள்ளூர் வடிகட்டி கட்டுப்பாடுகள்",
    "dash.filter.cat": "வகை வடிகட்டி ({col}):",
    "dash.filter.num": "எண் வடிகட்டி ({col}):",
    "dash.filter.range": "வரம்பு: {min} முதல் {max} வரை",
    "dash.filter.all": "அனைத்தும்",
    "dash.filter.threshold": "குறைந்தபட்ச வரம்பு தடை",
    "dash.kpi.records": "பகுப்பாய்வு செய்யப்பட்ட பதிவுகள்",
    "dash.kpi.records.sub": "வரிசை நிகழ்வுகள் சீராக்கப்பட்டன",
    "dash.kpi.total": "மொத்த {col}",
    "dash.kpi.total.sub": "வடிகட்டப்பட்ட கூட்டுத்தொகை மதிப்பெண்",
    "dash.kpi.sum": "{col}-இன் கூட்டுத்தொகை",
    "dash.kpi.sum.sub": "செயலில் உள்ள தொகுக்கப்பட்ட கூட்டுத்தொகை",
    "dash.kpi.outliers": "புள்ளிவிவர அதிவிலகல்கள்",
    "dash.kpi.outliers.sub": "எல்லைக்கு அப்பாற்பட்ட முரண்பாடுகள்",
    "dash.kpi.quality": "பகுப்பாய்வு தர மதிப்பீடு",
    "dash.kpi.quality.sub": "தரவு ஒருமைப்பாடு மதிப்பெண்",
    
    "dash.chart.distribution": "வகை பகிர்வு விநியோகம்",
    "dash.chart.distribution.desc": "ஒவ்வொரு '{col}' வகை பிரிவிலும் உள்ள வரிசைகளின் விநியோகப் முறிவு.",
    "dash.chart.comparison": "ஒட்டுமொத்த ஒப்பீடு",
    "dash.chart.comparison.desc": "{col1}-இன் ஒட்டுமொத்த கூட்டுத்தொகை {col2}-உடன் ஒப்பிடப்படுகிறது.",
    "dash.chart.correlation": "புள்ளிவிவர தொடர்பு மேட்ரிக்ஸ்",
    "dash.chart.correlation.desc": "பல எண் பண்புகளுக்கு இடையிலான நேரியல் சார்புநிலையை விவரிக்கும் வரைபடம்.",
    "dash.chart.importance": "இலக்கு மாறியின் முக்கியத்துவம்",
    "dash.insight.title": "பகுப்பாய்வு நுண்ணறிவு",
    "dash.insight.desc1": "தரவு குறிப்பிட்ட வகைகளில் அதிக செறிவைக் காட்டுகிறது. இவற்றை முக்கிய குறிகாட்டிகளாகப் பயன்படுத்தவும்.",
    "dash.insight.desc2": "பகிர்வு பகுப்பாய்வு அடர்த்தி அளவுருக்களைக் காட்டுகிறது. அதிக சதவீதங்களைக் கொண்ட தொகுதிகளுக்கு முக்கிய கவனம் தேவை.",
    "dash.insight.desc3": "அதிக நேர்மறை (ஊதா-நீலம்) குறியீடுகள் நேரடித் தொடர்புகளைக் காட்டுகின்றன. எதிர்மறை (சிவப்பு) குறியீடுகள் தலைகீழ் தொடர்புகளைக் காட்டுகின்றன.",
    
    
    // Chatbot
    "chat.title": "ஊடாடும் தரவுத்தொகுப்பு அரட்டை",
    "chat.subtitle": "ஜெமினி AI செமண்டிக் RAG மூலம் இயக்கப்படுகிறது",
    "chat.placeholder": "உங்கள் தரவைப் பற்றி எதையும் கேளுங்கள்...",
    "chat.analyzing": "தரவு கட்டமைப்புகளை பகுப்பாய்வு செய்கிறது...",
    "chat.welcome": "வணக்கம்! நான் **லக்ஷ்மி ஸ்டீல்ஸ் AI**, உங்கள் தரவு வழிகாட்டி. உங்கள் விரிதாளைப் பற்றிய கேள்விகளை கீழே கேட்கலாம்! நான் சராசரிகளைக் கணக்கிடலாம், நெடுவரிசைகளைப் பட்டியலிடலாம், அதிவிலகல்களைக் கண்டறியலாம் அல்லது பகுப்பாய்வுகளை உருவாக்கலாம்.",
    "chat.error": "மன்னிக்கவும், அந்த வினவலைச் செயலாக்குவதில் சிக்கல் ஏற்பட்டது. தயவுசெய்து இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
    "chat.prompt.summarize": "தரவுத்தொகுப்பைச் சுருக்கவும்",
    "chat.prompt.anomalies": "தரவில் உள்ள முரண்பாடுகளைக் கண்டறியவும்",
    "chat.prompt.averages": "புள்ளிவிவர சராசரிகளைக் காட்டவும்",
    "chat.prompt.columns": "என்ன நெடுவரிசைகள் உள்ளன?",

    // ETL Pipeline
    "etl.title": "Interactive ETL Pipeline",
    "etl.desc": "Extract raw data, normalize columns, validate rules, and index cache.",
    "etl.runBtn": "Trigger ETL Pipeline",
    "etl.running": "Running...",
    "etl.stage.Extract": "Extract Data",
    "etl.stage.Transform": "Transform Data",
    "etl.stage.Validate": "Validate Data",
    "etl.stage.Load": "Load Data",
    "etl.logs.header": "ETL Execution Logs",
    "etl.logs.empty": "Logs will appear here once pipeline execution starts...",

    // Footer
    "footer.text": "லக்ஷ்மி ஸ்டீல்ஸ் என்பது சிமெண்ட், டிஎம்டி கம்பிகள், கட்டமைப்பு எஃகு, ஓடுகள் மற்றும் கட்டுமானப் பொருட்களின் விரிவான வரம்பில் நம்பகமான சப்ளையர் ஆகும். பில்டர்கள், ஒப்பந்ததாரர்கள் மற்றும் வீட்டு உரிமையாளர்களுக்கு தரமான தயாரிப்புகள், போட்டி விலை நிர்ணயம் மற்றும் நம்பகமான சேவைக்கு உறுதிபூண்டுள்ளது."
  },
  en: {
    // Brand / Layout
    "brand.title": "Lakshmi Steels AI",
    "brand.subtitle": "Automated AI Data Analyst & BI",
    "header.closeDataset": "Close Dataset",
    
    // Ingestion Landing
    "landing.tag": "Cognitive Business Analytics Engine",
    "landing.title": "Intelligent AI Business Intelligence Platform",
    "landing.desc": "Upload any Excel or CSV spreadsheet. Within seconds, our system cleans the cells, builds visual Tableau-style dashboards, compiles descriptive statistics, and provisions an AI assistant co-pilot.",
    "landing.uploadHeader": "Upload your raw dataset",
    "landing.uploadSub": "Drag & drop your Excel (.xlsx, .xls) or CSV files here, or click to browse files from your computer.",
    "landing.uploadLimit": "Up to 50MB files supported",
    "landing.recentHeader": "Load a recently analyzed dataset",
    
    // Capabilities
    "capabilities.title": "End-to-End Automated Capabilities",
    "capabilities.clean.title": "Automatic Cleaning",
    "capabilities.clean.desc": "Removes row duplicates, fills missing items with standard mean/mode, normalizes phone/emails structure, and clips numerical outliers.",
    "capabilities.profile.title": "Descriptive Profiling",
    "capabilities.profile.desc": "Calculates skewness, kurtosis, mode, standard deviation, and variance values across all variables instantly.",
    "capabilities.chat.title": "Interactive Chat Co-pilot",
    "capabilities.chat.desc": "Pose questions directly to your dataset co-pilot about sales trends, regional outcomes, or statistics calculations.",
    
    // Sidebar File Meta
    "meta.loadedDb": "Loaded Database",
    "meta.sheet": "Sheet: {sheet}",
    "meta.selectSheet": "Select Active Worksheet",
    "meta.kpiDomain": "KPI Domain",
    "meta.dataStatus": "Data Status",
    "meta.cleaned": "Cleaned",
    "meta.original": "Original",
    
    // Navigation Tabs
    "tab.review": "1. Review Analysis",
    "tab.review.sub": "Descriptive & KPI profiling",
    "tab.visuals": "2. Visual Dashboard",
    "tab.visuals.sub": "ECharts BI comparisons",
    "tab.chat": "3. Chat With Data",
    "tab.chat.sub": "Gemini conversational RAG",
    
    // Loading Screen
    "loader.title": "Intelligent Agent Analysis Running",
    "loader.desc": "Please wait while the AI Analyst processes your data workbook.",
    "loader.compiling": "Compiling data analysis caching matrices...",
    "loader.step0": "Uploading dataset workbook...",
    "loader.step1": "Reading file schemas...",
    "loader.step2": "Understanding domain structures...",
    "loader.step3": "Cleaning duplicate rows and null values...",
    "loader.step4": "Running deep statistical analysis...",
    "loader.step5": "Generating executive AI insights...",
    "loader.step6": "Creating interactive BI dashboards...",
    "loader.step7": "Preparing chatbot co-pilot assistant...",
    
    // Review Analysis Workspace
    "review.title": "Review Analysis Workspace",
    "review.subtitle": "Comprehensive statistical & intelligence report prepared automatically",
    "review.btn.origExcel": "Original Excel",
    "review.btn.cleanExcel": "Cleaned Excel",
    "review.btn.cleanCsv": "Cleaned CSV",
    "review.btn.pdf": "PDF Report",
    "review.summaryTitle": "Executive Summary Report",
    "review.oppTitle": "Top Opportunities & Insights",
    "review.risksTitle": "Potential Risks & Attention Needed",
    
    "review.indicatorTitle": "Dataset Overview Indicators",
    "review.indicator.rows": "Total Rows",
    "review.indicator.cols": "Total Columns",
    "review.indicator.size": "File Size",
    "review.indicator.dateRange": "Date Range",
    "review.indicator.noDate": "No date range",
    
    "review.qualityTitle": "Data Quality Indicators",
    "review.quality.nulls": "Missing Values",
    "review.quality.dups": "Duplicate Records",
    "review.quality.outliers": "Outliers",
    "review.quality.blank": "Blank Cells",
    "review.quality.invalid": "Invalid Values",
    "review.quality.inconsistent": "Inconsistent Formatting",
    "review.quality.incorrectType": "Incorrect Data Types",
    
    // Descriptive Statistics
    "review.stats.descriptive": "Descriptive Statistical Analysis",
    "review.stats.colVar": "Column Variable",
    "review.stats.mean": "Mean",
    "review.stats.median": "Median",
    "review.stats.mode": "Mode",
    "review.stats.variance": "Variance",
    "review.stats.stdDev": "Std Dev",
    "review.stats.min": "Min",
    "review.stats.max": "Max",
    "review.stats.skewness": "Skewness",
    "review.stats.kurtosis": "Kurtosis",
    "review.stats.percentiles": "Percentiles",
    "review.stats.p25": "25th Percentile",
    "review.stats.p50": "50th Percentile (IQR)",
    "review.stats.p75": "75th Percentile",
    "review.stats.p90": "90th Percentile",
    "review.stats.empty": "No numeric fields are present in this dataset to generate statistical descriptive matrices.",
    
    // Correlation & Importance
    "review.corr.title": "Correlation Matrix Grid",
    "review.feat.title": "Feature Importance Rank",
    "review.feat.empty": "No statistical targets found to calculate relative feature correlation rankings.",
    "review.feat.weight": "{weight}% weight",
    
    // Trend & Seasonality
    "review.trend.title": "Trend Outlook",
    "review.season.title": "Seasonality Patterns",
    "review.anomaly.title": "Anomaly Alerts",
    
    // Predictive Analytics Forecast
    "review.predict.title": "Predictive Analytics (Future Forecast)",
    "review.predict.target": "Target Variable",
    "review.predict.start": "Start Projection",
    "review.predict.growth": "Projected Growth: {growth}%",
    "review.predict.period": "Future Period",
    "review.predict.point": "Predicted Point",
    "review.predict.lower": "Lower Bound (95%)",
    "review.predict.upper": "Upper Bound (95%)",
    "review.clean.empty": "The raw dataset required no automatic adjustments.",
    "review.clean.autoTitle": "Automatic Cleaning Summary",
    
    "review.metricsTitle": "Variable Metrics & Data Profiling",
    "review.metrics.colName": "Column Name",
    "review.metrics.type": "Type",
    "review.metrics.nullsRate": "Nulls Rate",
    "review.metrics.duplicates": "Duplicates",
    "review.metrics.outliers": "Outliers",
    "review.metrics.quality": "Quality Score",
    
    "review.outlierTitle": "Outlier Detection & Predictive Forecasts",
    "review.outlier.target": "Forecast target variable:",
    "review.outlier.date": "Date Variable:",
    "review.outlier.noDateWarning": "No date variable detected. Performing sequential forecasting index-based.",
    "review.outlier.period": "Forecast period:",
    "review.outlier.runBtn": "Perform Forecasting Run",
    "review.outlier.running": "Calculating forecast...",
    "review.outlier.insights": "Forecasting Analysis Insights",
    "review.outlier.growth": "Growth Rate",
    "review.outlier.direction": "Trend Direction",
    "review.outlier.r2": "Predictive R² Score",
    
    "review.checklistTitle": "Action Checklist",
    "review.checklist.desc": "Select cleaning recommendations to apply and rebuild cached database assets:",
    "review.checklist.applyBtn": "Apply Clean Up Rules",
    "review.checklist.applying": "Applying rules...",
    
    "review.auditTitle": "Audit Log & Version History",
    "review.audit.revertBtn": "Revert Last Action",
    "review.audit.reverting": "Reverting...",
    
    // Dashboard / Visual Grid
    "dash.filters": "Local Filter Controls",
    "dash.filter.cat": "Category Filter ({col}):",
    "dash.filter.num": "Numeric Filter ({col}):",
    "dash.filter.range": "Range: {min} to {max}",
    "dash.filter.all": "All",
    "dash.filter.threshold": "Minimum Threshold Constraint",
    "dash.kpi.records": "Analyzed Records",
    "dash.kpi.records.sub": "Row instances normalized",
    "dash.kpi.total": "Total {col}",
    "dash.kpi.total.sub": "Filtered summation score",
    "dash.kpi.sum": "Sum of {col}",
    "dash.kpi.sum.sub": "Active aggregated sum",
    "dash.kpi.outliers": "Statistical Outliers",
    "dash.kpi.outliers.sub": "Out-of-boundary anomalies",
    "dash.kpi.quality": "Analysis Quality Rating",
    "dash.kpi.quality.sub": "Data integrity score",
    
    "dash.chart.distribution": "Category Share Distribution",
    "dash.chart.distribution.desc": "Distribution breakdown of rows populated in each '{col}' category segment.",
    "dash.chart.comparison": "Aggregate comparison",
    "dash.chart.comparison.desc": "Aggregated sum totals of {col1} compared across {col2}.",
    "dash.chart.correlation": "Statistical Correlation Matrix",
    "dash.chart.correlation.desc": "Heatmap detailing linear dependence between multiple numerical attributes.",
    "dash.chart.importance": "Target Variable Feature Importance",
    "dash.insight.title": "Analytical Insight",
    "dash.insight.desc1": "Data indicates primary weight is concentrated in specific categories. Leverage these segments as primary indicators.",
    "dash.insight.desc2": "Share analysis highlights density parameters. Buckets with high percentages require primary focus check.",
    "dash.insight.desc3": "Highly positive (purple-blue) indices highlight direct correlations. Negative (red) indices highlight inverse relationships.",
    
    
    // Chatbot
    "chat.title": "Interactive Dataset Chat",
    "chat.subtitle": "Powered by Gemini AI Semantic RAG",
    "chat.placeholder": "Ask anything about your data...",
    "chat.analyzing": "Analyzing data structures...",
    "chat.welcome": "Hi! I'm **Lakshmi Steels AI**, your smart data co-pilot. Drop a question about your spreadsheet below! I can compute averages, list columns, find outliers, or generate narrative analyses.",
    "chat.error": "Sorry, I encountered an issue processing that query. Please verify connection and try again.",
    "chat.prompt.summarize": "Summarize this dataset",
    "chat.prompt.anomalies": "Find anomalies in this data",
    "chat.prompt.averages": "Show statistical averages",
    "chat.prompt.columns": "What columns are present?",

    // ETL Pipeline
    "etl.title": "Interactive ETL Pipeline",
    "etl.desc": "Extract raw data, normalize columns, validate rules, and index cache.",
    "etl.runBtn": "Trigger ETL Pipeline",
    "etl.running": "Running...",
    "etl.stage.Extract": "Extract Data",
    "etl.stage.Transform": "Transform Data",
    "etl.stage.Validate": "Validate Data",
    "etl.stage.Load": "Load Data",
    "etl.logs.header": "ETL Execution Logs",
    "etl.logs.empty": "Logs will appear here once pipeline execution starts...",

    // Footer
    "footer.text": "Lakshmi Steels is a trusted supplier of cement, TMT bars, structural steel, tiles, and a comprehensive range of construction materials. Committed to quality products, competitive pricing, and dependable service for builders, contractors, and homeowners."
  }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ta"); // Defaults to Tamil

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language | null;
    if (savedLang === "en" || savedLang === "ta") {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string, variables?: Record<string, string | number>): string => {
    let text = translations[language]?.[key] || translations["en"]?.[key] || key;
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
