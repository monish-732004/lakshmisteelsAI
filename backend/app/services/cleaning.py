import re
import uuid
import numpy as np
import pandas as pd

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
PHONE_REGEX = re.compile(r"^(?:\+91|0)?[6-9]\d{9}$|^\+?1?\s*\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$")

def generate_rec_id() -> str:
    return str(uuid.uuid4())[:8]

def detect_cleaning_recommendations(df: pd.DataFrame) -> list:
    """
    Scans the DataFrame for standard quality issues and compiles
    a structured list of recommended fixes for user review.
    """
    recommendations = []
    total_rows = len(df)
    
    if total_rows == 0:
        return []

    # 1. Duplicate Rows (Global)
    dup_count = int(df.duplicated().sum())
    if dup_count > 0:
        recommendations.append({
            "id": f"global_duplicates_{generate_rec_id()}",
            "column": "Global",
            "issue_type": "duplicate_rows",
            "description": f"The dataset contains {dup_count} duplicate rows.",
            "recommended_fix": "Remove duplicate rows",
            "severity": "medium",
            "affected_count": dup_count,
            "default_enabled": True
        })

    for col in df.columns:
        series = df[col]
        null_count = int(series.isna().sum())
        non_null_series = series.dropna()
        
        # 2. Completely Null Columns
        if null_count == total_rows:
            recommendations.append({
                "id": f"null_column_{col}_{generate_rec_id()}",
                "column": col,
                "issue_type": "null_column",
                "description": f"Column '{col}' is completely empty.",
                "recommended_fix": "Drop column",
                "severity": "high",
                "affected_count": total_rows,
                "default_enabled": True
            })
            continue

        # 3. Partially Null Columns
        if null_count > 0:
            rec_fix = "Fill with Mean" if pd.api.types.is_numeric_dtype(series) else "Fill with Mode"
            recommendations.append({
                "id": f"missing_values_{col}_{generate_rec_id()}",
                "column": col,
                "issue_type": "missing_values",
                "description": f"Column '{col}' has {null_count} missing value(s) ({null_count/total_rows*100:.1f}%).",
                "recommended_fix": rec_fix,
                "severity": "medium",
                "affected_count": null_count,
                "default_enabled": True
            })

        # String-specific anomaly detection
        if pd.api.types.is_object_dtype(series) or series.dtype == "string":
            str_series = non_null_series.astype(str)
            
            # 4. Leading/Trailing Spaces or Multiple Spaces
            spaced_count = int(str_series.apply(lambda x: x != x.strip() or "  " in x).sum())
            if spaced_count > 0:
                recommendations.append({
                    "id": f"extra_spaces_{col}_{generate_rec_id()}",
                    "column": col,
                    "issue_type": "extra_spaces",
                    "description": f"Column '{col}' has {spaced_count} cells with extra spaces or tabs.",
                    "recommended_fix": "Trim spaces & clean spacing",
                    "severity": "low",
                    "affected_count": spaced_count,
                    "default_enabled": True
                })

            # 5. Currency Formats disguised as strings
            currency_match = str_series.apply(lambda x: bool(re.search(r"^\s*[\$\u20AC\u00A3\u20B9]\s*\d+|^[\d,]+\s*[\$\u20AC\u00A3\u20B9]", x)))
            currency_count = int(currency_match.sum())
            if currency_count > len(str_series) * 0.5:
                recommendations.append({
                    "id": f"currency_format_{col}_{generate_rec_id()}",
                    "column": col,
                    "issue_type": "currency_format",
                    "description": f"Column '{col}' looks like currency values stored as text.",
                    "recommended_fix": "Parse to numeric floats",
                    "severity": "medium",
                    "affected_count": currency_count,
                    "default_enabled": True
                })

            # 6. Capitalization inconsistency
            # Check if there is mixed uppercase, lowercase, and title case
            is_lower = str_series.apply(lambda x: x.islower()).all()
            is_upper = str_series.apply(lambda x: x.isupper()).all()
            is_title = str_series.apply(lambda x: x.istitle()).all()
            if len(str_series) > 5 and not (is_lower or is_upper or is_title):
                recommendations.append({
                    "id": f"capitalization_{col}_{generate_rec_id()}",
                    "column": col,
                    "issue_type": "capitalization",
                    "description": f"Column '{col}' has inconsistent capitalization formats.",
                    "recommended_fix": "Standardize to Title Case",
                    "severity": "low",
                    "affected_count": len(str_series),
                    "default_enabled": False
                })

            # 7. Invalid emails
            col_lower = col.lower()
            if "email" in col_lower or str_series.apply(lambda x: "@" in x).sum() > len(str_series) * 0.4:
                invalid_email_mask = str_series.apply(lambda x: not bool(EMAIL_REGEX.match(x.strip())))
                invalid_count = int(invalid_email_mask.sum())
                if invalid_count > 0:
                    recommendations.append({
                        "id": f"invalid_email_{col}_{generate_rec_id()}",
                        "column": col,
                        "issue_type": "invalid_emails",
                        "description": f"Column '{col}' contains {invalid_count} malformed email address(es).",
                        "recommended_fix": "Clear invalid emails",
                        "severity": "high",
                        "affected_count": invalid_count,
                        "default_enabled": True
                    })

            # 8. Invalid phone numbers
            if "phone" in col_lower or "tel" in col_lower:
                invalid_phone_mask = str_series.apply(lambda x: not bool(PHONE_REGEX.match(re.sub(r"\s+", "", x))))
                invalid_count = int(invalid_phone_mask.sum())
                if invalid_count > 0:
                    recommendations.append({
                        "id": f"invalid_phone_{col}_{generate_rec_id()}",
                        "column": col,
                        "issue_type": "invalid_phones",
                        "description": f"Column '{col}' contains {invalid_count} numbers not matching standard formats.",
                        "recommended_fix": "Standardize phone formatting",
                        "severity": "medium",
                        "affected_count": invalid_count,
                        "default_enabled": False
                    })

            # 9. Dates disguised as strings
            try:
                sample_parsed = pd.to_datetime(non_null_series.head(20), errors='coerce')
                if sample_parsed.notna().sum() > len(non_null_series.head(20)) * 0.7:
                    recommendations.append({
                        "id": f"date_format_{col}_{generate_rec_id()}",
                        "column": col,
                        "issue_type": "date_format",
                        "description": f"Column '{col}' contains date strings that should be formal timestamps.",
                        "recommended_fix": "Standardize date strings to YYYY-MM-DD",
                        "severity": "medium",
                        "affected_count": len(non_null_series),
                        "default_enabled": True
                    })
            except Exception:
                pass

        # Numeric-specific anomaly detection
        if pd.api.types.is_numeric_dtype(series):
            # 10. Negative values where impossible
            non_negative_keywords = ["price", "sales", "revenue", "quantity", "qty", "amount", "age", "cost", "inventory", "stock"]
            if any(kw in col.lower() for kw in non_negative_keywords):
                neg_count = int((non_null_series < 0).sum())
                if neg_count > 0:
                    recommendations.append({
                        "id": f"negative_values_{col}_{generate_rec_id()}",
                        "column": col,
                        "issue_type": "negative_values",
                        "description": f"Column '{col}' has {neg_count} negative value(s) in a strictly non-negative column.",
                        "recommended_fix": "Clip negative values to 0",
                        "severity": "high",
                        "affected_count": neg_count,
                        "default_enabled": True
                    })

            # 11. Outliers
            desc = non_null_series.describe()
            q1 = desc.get("25%")
            q3 = desc.get("75%")
            if q1 is not None and q3 is not None:
                iqr = q3 - q1
                if iqr > 0:
                    lower_bound = q1 - 1.5 * iqr
                    upper_bound = q3 + 1.5 * iqr
                    outliers = non_null_series[(non_null_series < lower_bound) | (non_null_series > upper_bound)]
                    outlier_count = len(outliers)
                    if outlier_count > 0:
                        recommendations.append({
                            "id": f"outliers_{col}_{generate_rec_id()}",
                            "column": col,
                            "issue_type": "outliers",
                            "description": f"Column '{col}' has {outlier_count} statistical outlier(s) beyond boundary bounds.",
                            "recommended_fix": "Clip outliers to boundaries",
                            "severity": "low",
                            "affected_count": outlier_count,
                            "default_enabled": False
                        })

    return recommendations

def apply_cleaning_recommendations(df: pd.DataFrame, recommendations: list, selected_ids: list) -> tuple:
    """
    Applies the checked/selected recommendations to the DataFrame.
    Returns: (cleaned_df, audit_logs)
    """
    cleaned_df = df.copy()
    audit_logs = []
    
    # Filter the list to only include chosen recommendations
    active_recs = [r for r in recommendations if r["id"] in selected_ids]
    
    # Run global operations first (like duplicates)
    for rec in active_recs:
        if rec["issue_type"] == "duplicate_rows" and rec["column"] == "Global":
            before_len = len(cleaned_df)
            cleaned_df = cleaned_df.drop_duplicates()
            after_len = len(cleaned_df)
            audit_logs.append(f"Global duplicate cleaning: Removed {before_len - after_len} duplicate rows.")

    # Run column-based operations
    for rec in active_recs:
        col = rec["column"]
        if col == "Global" or col not in cleaned_df.columns:
            continue
            
        issue = rec["issue_type"]
        series = cleaned_df[col]
        
        if issue == "null_column":
            cleaned_df = cleaned_df.drop(columns=[col])
            audit_logs.append(f"Column '{col}': Dropped completely empty column.")
            
        elif issue == "missing_values":
            if pd.api.types.is_numeric_dtype(series):
                mean_val = series.mean()
                if pd.isna(mean_val):
                    mean_val = 0
                cleaned_df[col] = series.fillna(mean_val)
                audit_logs.append(f"Column '{col}': Filled missing values with mean ({mean_val:.2f}).")
            else:
                mode_series = series.mode()
                mode_val = mode_series[0] if not mode_series.empty else "Missing"
                cleaned_df[col] = series.fillna(mode_val)
                audit_logs.append(f"Column '{col}': Filled missing values with mode ('{mode_val}').")
                
        elif issue == "extra_spaces":
            cleaned_df[col] = series.astype(str).str.strip().str.replace(r"\s+", " ", regex=True)
            audit_logs.append(f"Column '{col}': Stripped leading/trailing spaces and collapsed inline tabs/whitespaces.")
            
        elif issue == "currency_format":
            def clean_currency(x):
                if pd.isna(x): return x
                val_str = re.sub(r"[^\d\.\-]", "", str(x))
                try:
                    return float(val_str)
                except ValueError:
                    return np.nan
            cleaned_df[col] = series.apply(clean_currency)
            # Try to coerce column to numerical type
            cleaned_df[col] = pd.to_numeric(cleaned_df[col], errors='coerce')
            audit_logs.append(f"Column '{col}': Cleaned currency symbols/commas and parsed to numeric float.")
            
        elif issue == "capitalization":
            cleaned_df[col] = series.astype(str).str.title()
            audit_logs.append(f"Column '{col}': Standardized text values to Title Case.")
            
        elif issue == "invalid_emails":
            def clean_email(x):
                if pd.isna(x): return x
                val = str(x).strip()
                return val if bool(EMAIL_REGEX.match(val)) else np.nan
            cleaned_df[col] = series.apply(clean_email)
            audit_logs.append(f"Column '{col}': Cleared {rec['affected_count']} invalid email address strings.")
            
        elif issue == "invalid_phones":
            def clean_phone(x):
                if pd.isna(x): return x
                clean_num = re.sub(r"\D", "", str(x)) # keep digits only
                if len(clean_num) == 10:
                    return f"+91 {clean_num[:5]}-{clean_num[5:]}"
                elif len(clean_num) == 12 and clean_num.startswith("91"):
                    return f"+91 {clean_num[2:7]}-{clean_num[7:]}"
                elif len(clean_num) == 11 and clean_num.startswith("1"):
                    return f"+1 ({clean_num[1:4]}) {clean_num[4:7]}-{clean_num[7:]}"
                return str(x).strip() # return cleaned string if not matching standard formats
            cleaned_df[col] = series.apply(clean_phone)
            audit_logs.append(f"Column '{col}': Standardized telephone number syntax formats.")
            
        elif issue == "date_format":
            cleaned_df[col] = pd.to_datetime(series, errors='coerce')
            # Standardize output column as string formatted dates (or keep as Timestamp)
            # We will keep as Timestamp for pandas or format as standard ISO format
            audit_logs.append(f"Column '{col}': Coerced text date values into formal YYYY-MM-DD datetime format.")
            
        elif issue == "negative_values":
            cleaned_df[col] = series.clip(lower=0)
            audit_logs.append(f"Column '{col}': Clipped {rec['affected_count']} negative values to 0.")
            
        elif issue == "outliers":
            non_null = series.dropna()
            if len(non_null) > 0:
                q1 = non_null.quantile(0.25)
                q3 = non_null.quantile(0.75)
                iqr = q3 - q1
                lower_bound = q1 - 1.5 * iqr
                upper_bound = q3 + 1.5 * iqr
                cleaned_df[col] = series.clip(lower=lower_bound, upper=upper_bound)
                audit_logs.append(f"Column '{col}': Clipped outliers to boundaries [{lower_bound:.2f}, {upper_bound:.2f}].")

    return cleaned_df, audit_logs
