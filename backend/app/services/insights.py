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
            
            prompt = f"""You are an expert business assistant for a store owner (Lakshmi Steels).
Analyze this dataset profile snapshot and generate a simple, easy-to-understand layman's report for the owner explaining how the data affects their business.
The owner wants to know:
1. What sells the most (top selling product or category).
2. Who is the biggest customer (most frequent buyer).
3. How much profit or revenue they are making (use the Rupees symbol '₹' instead of '$').
4. Plain-language business opportunities and risks, specifically detailing how the findings (like data quality issues, duplicates, anomalies, or sales trends) affect their daily operations, inventory, and profitability.

Do NOT use complex statistical jargon (like "standard deviation", "kurtosis", "regression", or "correlation matrix"). Translate technical terms to everyday retail terms (e.g., instead of "positive correlation between X and Y", say "when sales of X go up, sales of Y also tend to go up; this means you should stock them together").

Dataset Profile Metadata:
- Domain: {domain}
- Total Rows: {profile['total_rows']}
- Total Columns: {profile['total_columns']}
- Data Quality Score: {profile['data_quality_score']}/100
- Columns details: {json.dumps(compact_columns[:25])}
- Correlation Matrix top items: {json.dumps(profile['correlation_matrix'][:15])}

Format the response strictly as a JSON object with these keys (do not include any markdown fences or extra text, just raw JSON):
{{
  "executive_summary": "A friendly layman's summary of the business operations, total rows, and overall performance, noting what sells most and who is the biggest customer.",
  "key_insights": [
    "Insight 1: simple sales observation or trend...",
    "Insight 2...",
    "Insight 3..."
  ],
  "anomalies": [
    "Problem 1: simple description of missing or incorrect data...",
    "Problem 2..."
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

    # --- RULE-BASED FALLBACK GENERATOR (LAYMAN TERMS & RUPEES) ---
    total_rows = profile["total_rows"]
    total_columns = profile["total_columns"]
    quality = profile["data_quality_score"]
    
    top_product = "N/A"
    top_product_count = 0
    top_customer = "N/A"
    top_customer_count = 0
    total_sales = 0.0
    sales_col_name = ""
    avg_sale_val = 0.0

    for col in profile.get("columns", []):
        cname = col["name"].lower()
        top_vals = col["stats"].get("top_values", [])
        
        # Identify Product / Category
        if "product" in cname or "category" in cname or "item" in cname:
            if top_vals and top_product == "N/A":
                top_product = top_vals[0]["value"]
                top_product_count = top_vals[0]["count"]
                
        # Identify Customer
        if "customer" in cname or "email" in cname or "buyer" in cname or "phone" in cname:
            if top_vals and top_customer == "N/A":
                top_customer = top_vals[0]["value"]
                top_customer_count = top_vals[0]["count"]

        # Identify Sales / Revenue / Amount
        if "revenue" in cname or "sales" in cname or "price" in cname or "profit" in cname or "amount" in cname:
            mean_val = col["stats"].get("mean")
            if mean_val is not None:
                sales_col_name = col["name"]
                avg_sale_val = mean_val
                total_sales = mean_val * total_rows

    # Generate summary string in layman language
    summary = f"This dataset records your business transactions. It contains **{total_rows} total entries** with **{total_columns} columns**."
    if top_product != "N/A":
        summary += f" Based on the data, your best-selling product or category is **'{top_product}'** (recorded {top_product_count} times)."
    if top_customer != "N/A":
        summary += f" Your most frequent customer is **'{top_customer}'** (with {top_customer_count} occurrences)."
    if total_sales > 0:
        summary += f" Estimated total business volume for '{sales_col_name}' is approximately **₹{total_sales:,.2f}**."

    # Insights list in layman language
    key_insights = []
    if top_product != "N/A":
        key_insights.append(f"Top-selling product is '{top_product}' ({top_product_count} sales). Keep stock level high for this item.")
    if top_customer != "N/A":
        key_insights.append(f"Most frequent client is '{top_customer}' ({top_customer_count} transactions). Consider offering them a loyalty reward.")
    if total_sales > 0:
        key_insights.append(f"Average transaction amount for '{sales_col_name}' is ₹{avg_sale_val:,.2f}.")

    if not key_insights:
        key_insights.append("Your sales appear uniform. Record more product descriptions and transaction prices to reveal trends.")

    # Anomalies in layman language
    anomalies = []
    if profile["duplicate_rows"] > 0:
        anomalies.append(f"Found {profile['duplicate_rows']} duplicate transaction entries. Run the auto-clean pipeline to merge them.")
    
    for col in profile.get("columns", []):
        null_count = col.get("null_count", 0)
        outlier_count = col.get("outlier_count", 0)
        if null_count > 0:
            anomalies.append(f"Column '{col['name']}' has {null_count} blank entries. Recommend auto-cleaning to fill them.")
        if outlier_count > 0:
            anomalies.append(f"Column '{col['name']}' has {outlier_count} unusually high or low values (outliers). Check these for entry mistakes.")

    if not anomalies:
        anomalies.append("All transactions are cleanly formatted. No missing fields detected.")

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
Your role is to answer user queries about their uploaded dataset, translating findings into layman-friendly business explanations. Use the statistics and sample data below.

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
5. Always use Rupees symbol '₹' instead of '$' for all currency values in your replies. Explain data insights in plain, layman terms, focusing on how it affects the user's business operations and profitability.
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
