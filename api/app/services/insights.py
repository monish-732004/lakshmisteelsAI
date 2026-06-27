import os
import json
import re
import pandas as pd
import google.generativeai as genai
from app.config import settings

# Initialize Gemini if key exists
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

def detect_dataset_domain(columns: list) -> str:
    """
    Auto-detects the business domain of a dataset based on column labels.
    """
    domain_keywords = {
        "Sales": ["sales", "revenue", "orders", "customer", "product", "price", "store", "transaction", "sold"],
        "Finance": ["income", "expense", "profit", "assets", "balance", "tax", "portfolio", "cash", "credit", "revenue"],
        "Healthcare": ["patient", "doctor", "diagnosis", "disease", "treatment", "clinic", "hospital", "blood", "medical", "patient_id"],
        "Sports": ["team", "player", "score", "game", "match", "points", "goal", "coach", "league"],
        "HR": ["employee", "salary", "department", "hire", "attrition", "performance", "job", "manager", "staff"],
        "Education": ["student", "grade", "score", "class", "course", "teacher", "school", "exam", "gpa", "tuition"],
        "Marketing": ["campaign", "clicks", "impressions", "leads", "ctr", "ad", "spent", "roi", "visitor", "marketing"],
        "Manufacturing": ["machine", "production", "yield", "defect", "sensor", "factory", "parts", "assembly", "parts_id"]
    }
    
    scores = {d: 0 for d in domain_keywords}
    for col in columns:
        col_lower = str(col).lower()
        for domain, keywords in domain_keywords.items():
            for kw in keywords:
                if kw in col_lower:
                    scores[domain] += 2
                    
    best_domain = max(scores, key=scores.get)
    if scores[best_domain] > 0:
        return best_domain
    return "General"

def generate_dataset_insights(profile: dict, domain: str) -> dict:
    """
    Generates natural language executive summary, insights, and recommendations.
    Uses Gemini API if configured, otherwise falls back to statistical summaries.
    """
    if settings.GEMINI_API_KEY:
        try:
            # Prepare compact profile for LLM
            compact_columns = []
            for col in profile["columns"]:
                compact_columns.append({
                    "name": col["name"],
                    "type": col["type"],
                    "null_count": col["null_count"],
                    "outliers": col["outlier_count"],
                    "stats": {k: v for k, v in col["stats"].items() if k != "top_values"}
                })
                
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            prompt = f"""You are a professional business intelligence and data analysis expert.
Analyze this dataset profile snapshot and generate a highly professional SaaS-style executive report.

Dataset Profile Metadata:
- Domain: {domain}
- Total Rows: {profile['total_rows']}
- Total Columns: {profile['total_columns']}
- Data Quality Score: {profile['data_quality_score']}/100
- Columns details: {json.dumps(compact_columns[:25])}
- Correlation Matrix top items: {json.dumps(profile['correlation_matrix'][:15])}

Format the response strictly as a JSON object with these keys (do not include any markdown fences or extra text, just raw JSON):
{{
  "executive_summary": "A concise paragraph summary of the dataset scope, size, health, and main focus.",
  "key_insights": [
    "Insight 1 (Include numbers, percentage changes or correlations if visible)",
    "Insight 2...",
    "Insight 3..."
  ],
  "anomalies": [
    "Anomaly 1 (Mention outliers, nulls, or duplicate problems)",
    "Anomaly 2..."
  ]
}}
"""
            response = model.generate_content(prompt)
            text = response.text.strip()
            
            # Clean up potential markdown code fences
            if text.startswith("```"):
                text = re.sub(r"^```(?:json)?\n", "", text)
                text = re.sub(r"\n```$", "", text)
            
            return json.loads(text.strip())
        except Exception as e:
            # Fallback on Gemini error
            pass

    # --- RULE-BASED FALLBACK GENERATOR ---
    total_rows = profile["total_rows"]
    total_columns = profile["total_columns"]
    quality = profile["data_quality_score"]
    
    summary = f"This dataset contains {total_rows} records across {total_columns} columns, structured under the '{domain}' domain taxonomy. It scores {quality}/100 on overall data quality, with duplicate rows accounting for {profile['duplicate_rows']} records."
    
    key_insights = []
    anomalies = []
    
    # Generate insights from numeric statistics
    numeric_cols = [c for c in profile["columns"] if c["type"] == "numeric"]
    if numeric_cols:
        for col in numeric_cols[:3]:
            stats = col["stats"]
            if "mean" in stats and stats["mean"] is not None:
                key_insights.append(f"Column '{col['name']}' has an average value of {stats['mean']:.2f}, ranging from {stats['min']:.2f} to {stats['max']:.2f}.")
    
    # Generate insights from categorical/text statistics
    cat_cols = [c for c in profile["columns"] if c["type"] == "categorical"]
    if cat_cols:
        for col in cat_cols[:2]:
            top_vals = col["stats"].get("top_values", [])
            if top_vals:
                top_str = ", ".join([f"'{v['value']}' ({v['count']} times)" for v in top_vals[:2]])
                key_insights.append(f"For categorical field '{col['name']}', the most frequent entries are {top_str}.")
                
    if not key_insights:
        key_insights.append("Historical distributions look uniform. Clean outliers or adjust formatting to identify clear trends.")
        
    # Generate anomaly notes
    if profile["duplicate_rows"] > 0:
        anomalies.append(f"Detected {profile['duplicate_rows']} duplicate rows. Consider invoking the duplicate elimination cleaning rule.")
    
    for col in profile["columns"]:
        if col["null_count"] > 0:
            anomalies.append(f"Column '{col['name']}' contains {col['null_count']} missing fields ({col['null_percentage']:.1f}%). Recommend filling or dropping.")
        if col["outlier_count"] > 0:
            anomalies.append(f"Column '{col['name']}' has {col['outlier_count']} outliers that lie outside standard statistical boundaries.")

    if not anomalies:
        anomalies.append("No critical missing values or formatting anomalies detected. The dataset structure looks clean.")

    return {
        "executive_summary": summary,
        "key_insights": key_insights,
        "anomalies": anomalies
    }

def answer_dataset_query(df: pd.DataFrame, profile: dict, chat_history: list, user_query: str) -> str:
    """
    Performs local RAG / context-guided conversation based on the dataset structure.
    """
    if settings.GEMINI_API_KEY:
        try:
            # Create a string representation of the history
            history_lines = []
            for msg in chat_history[-6:]:
                role_label = "User" if msg["role"] == "user" else "Assistant"
                history_lines.append(f"{role_label}: {msg['content']}")
            history_str = "\n".join(history_lines)
            
            # Format a small sample of the dataframe
            sample_df = df.head(5)
            sample_json = sample_df.to_json(orient="records", indent=2)
            
            # Listing column headers and types
            col_list = [f"{c['name']} (Type: {c['type']}, Nulls: {c['null_count']})" for c in profile["columns"]]
            
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            prompt = f"""You are Lakshmi Steels AI, a professional interactive business analyst chatbot.
Your role is to answer user queries about their uploaded dataset. Use the statistics and sample data below.

Dataset Overview:
- Size: {profile['total_rows']} rows, {profile['total_columns']} columns.
- Columns: {", ".join(col_list)}
- Duplicate Rows: {profile['duplicate_rows']}
- Data Quality: {profile['data_quality_score']}/100

First 5 Rows Sample:
{sample_json}

Chat History:
{history_str}

User Question: {user_query}

Guidelines:
1. Provide concise, professional, data-driven answers.
2. If the user asks for calculations (like sums, averages, or counts), do your best to estimate or use the column stats provided.
3. Be clear and formatting-friendly (use lists, bold text where helpful).
4. If you cannot answer based on the summary and sample, politely tell the user and outline what extra information is needed.
"""
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            # Failover to rule-based parser on API issue
            pass

    # --- RULE-BASED SIMPLE QUERY ROUTER ---
    query_lower = user_query.lower()
    
    # 1. Summary Queries
    if any(k in query_lower for k in ["summary", "summarize", "about", "overview"]):
        return f"This dataset has **{profile['total_rows']}** rows and **{profile['total_columns']}** columns. The average data quality score is **{profile['data_quality_score']}%**. The most populated columns are: " + ", ".join([f"`{c['name']}` ({c['type']})" for c in profile["columns"][:5]])
        
    # 2. Anomaly/Outlier Queries
    if any(k in query_lower for k in ["outlier", "anomaly", "anomalies", "bad", "errors"]):
        outliers_list = [f"`{c['name']}` ({c['outlier_count']} outliers)" for c in profile["columns"] if c["outlier_count"] > 0]
        if outliers_list:
            return "Here are the outliers detected: " + ", ".join(outliers_list) + ". You can clean them using the clipping action in the cleaning dashboard."
        return "No statistical outliers detected in this dataset. It looks clean!"

    # 3. Columns Queries
    if any(k in query_lower for k in ["column", "headers", "schema", "fields"]):
        cols = [f"- **{c['name']}** ({c['type']} - {c['pandas_dtype']})" for c in profile["columns"]]
        return "The dataset contains the following columns:\n" + "\n".join(cols)
        
    # 4. Average Queries
    if "average" in query_lower or "mean" in query_lower:
        averages = []
        for c in profile["columns"]:
            if c["type"] == "numeric" and "mean" in c["stats"] and c["stats"]["mean"] is not None:
                averages.append(f"- **{c['name']}**: {c['stats']['mean']:.2f}")
        if averages:
            return "Here are the averages calculated for numerical fields:\n" + "\n".join(averages)
        return "There are no numerical columns in this dataset to compute averages."

    # 5. Default generic message
    return f"I received your question: '{user_query}'. (To unlock full conversational AI over your dataset, configure a `GEMINI_API_KEY` in the environment variables). In the meantime, I can summarize data structures, column schemas, averages, or outlier counts!"
