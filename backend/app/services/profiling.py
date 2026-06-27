import math
import numpy as np
import pandas as pd

def clean_value(val):
    """
    Cleans a pandas/numpy value to be JSON-serializable by converting NaNs to None
    and numpy types to base Python types.
    """
    if pd.isna(val) or (isinstance(val, float) and math.isnan(val)):
        return None
    if isinstance(val, (np.integer, np.floating)):
        return val.item()
    if isinstance(val, pd.Timestamp):
        return val.isoformat()
    return val

def profile_dataframe(df: pd.DataFrame) -> dict:
    """
    Analyzes a DataFrame and returns profiling statistics:
    - Shape, duplicate counts, missing values
    - Quality score
    - Columns schema, unique counts, outliers
    - Correlations & Distributions
    """
    total_rows = len(df)
    total_cols = len(df.columns)
    
    if total_rows == 0:
        return {
            "total_rows": 0,
            "total_columns": total_cols,
            "duplicate_rows": 0,
            "missing_cells": 0,
            "null_percentage": 0,
            "data_quality_score": 100,
            "total_outliers": 0,
            "columns": [],
            "correlation_matrix": []
        }

    # Duplicate rows count
    dup_rows = int(df.duplicated().sum())
    
    # Missing values
    total_cells = total_rows * total_cols
    total_missing = int(df.isna().sum().sum())
    null_percent = (total_missing / total_cells * 100) if total_cells > 0 else 0
    
    total_outliers = 0
    columns_info = []
    
    for col in df.columns:
        series = df[col]
        non_null_series = series.dropna()
        dtype = str(series.dtype)
        
        # Determine column domain type
        col_type = "text"
        if pd.api.types.is_bool_dtype(series):
            col_type = "boolean"
        elif pd.api.types.is_numeric_dtype(series):
            col_type = "numeric"
        elif pd.api.types.is_datetime64_any_dtype(series):
            col_type = "datetime"
        else:
            # Check if strings are actually date-like
            try:
                sample = series.dropna().head(20)
                if len(sample) > 0:
                    parsed = pd.to_datetime(sample, errors='coerce')
                    if parsed.notna().sum() > len(sample) * 0.7:
                        col_type = "datetime"
            except Exception:
                pass
            
            # Check if categorical (low cardinality strings/values)
            unique_count = series.nunique()
            if col_type != "datetime" and unique_count < 15 and unique_count > 0:
                col_type = "categorical"

        unique_vals = int(series.nunique())
        null_count = int(series.isna().sum())
        null_col_pct = (null_count / total_rows * 100) if total_rows > 0 else 0
        
        col_stats = {}
        outlier_count = 0
        dist_bins = []
        
        # Compute specific statistics
        if col_type == "numeric" and len(non_null_series) > 0:
            desc = non_null_series.describe()
            col_stats = {
                "mean": clean_value(desc.get("mean")),
                "std": clean_value(desc.get("std")),
                "min": clean_value(desc.get("min")),
                "p25": clean_value(desc.get("25%")),
                "median": clean_value(desc.get("50%")),
                "p75": clean_value(desc.get("75%")),
                "max": clean_value(desc.get("max")),
            }
            
            # Outlier detection (IQR Method)
            q1 = desc.get("25%")
            q3 = desc.get("75%")
            if q1 is not None and q3 is not None:
                iqr = q3 - q1
                if iqr > 0:
                    lower_bound = q1 - 1.5 * iqr
                    upper_bound = q3 + 1.5 * iqr
                    outliers = non_null_series[(non_null_series < lower_bound) | (non_null_series > upper_bound)]
                    outlier_count = len(outliers)
                    total_outliers += outlier_count
                
            # Compute histograms (max 10 bins)
            try:
                counts, edges = np.histogram(non_null_series, bins=min(10, unique_vals if unique_vals > 0 else 10))
                for i in range(len(counts)):
                    dist_bins.append({
                        "bin": f"{clean_value(edges[i]):.1f} to {clean_value(edges[i+1]):.1f}",
                        "count": int(counts[i])
                    })
            except Exception:
                pass
                
        elif len(non_null_series) > 0:
            # Text/Categorical stats
            top_vals = non_null_series.value_counts().head(5)
            col_stats = {
                "top_values": [{"value": clean_value(k), "count": int(v)} for k, v in top_vals.items()]
            }
            # Distribution bins for categorical variables
            if col_type == "categorical":
                for val, count in non_null_series.value_counts().head(10).items():
                    dist_bins.append({"bin": str(val), "count": int(count)})
                    
        columns_info.append({
            "name": str(col),
            "type": col_type,
            "pandas_dtype": dtype,
            "unique_count": unique_vals,
            "null_count": null_count,
            "null_percentage": null_col_pct,
            "outlier_count": outlier_count,
            "stats": col_stats,
            "distribution": dist_bins
        })
        
    # Calculate Data Quality Score (0-100)
    # Deductions based on missing values, duplicates, outliers, empty columns
    null_deduction = min(25, null_percent * 0.5)
    
    dup_pct = (dup_rows / total_rows * 100) if total_rows > 0 else 0
    dup_deduction = min(15, dup_pct * 0.5)
    
    outlier_pct = (total_outliers / total_cells * 100) if total_cells > 0 else 0
    outlier_deduction = min(10, outlier_pct * 1.5)
    
    empty_cols = sum(1 for c in columns_info if c["null_count"] == total_rows)
    empty_col_deduction = min(15, empty_cols * 5)
    
    quality_score = max(0, min(100, round(100 - (null_deduction + dup_deduction + outlier_deduction + empty_col_deduction))))
    
    # Calculate Correlation Matrix (only for numeric columns, limit to top 15 columns)
    corr_matrix = []
    numeric_cols = [c["name"] for c in columns_info if c["type"] == "numeric"][:15]
    if len(numeric_cols) >= 2:
        try:
            corr_df = df[numeric_cols].corr()
            for col_x in numeric_cols:
                for col_y in numeric_cols:
                    corr_matrix.append({
                        "x": col_x,
                        "y": col_y,
                        "value": clean_value(corr_df.loc[col_x, col_y])
                    })
        except Exception:
            pass
            
    return {
        "total_rows": total_rows,
        "total_columns": total_cols,
        "duplicate_rows": dup_rows,
        "missing_cells": total_missing,
        "null_percentage": null_percent,
        "data_quality_score": quality_score,
        "total_outliers": total_outliers,
        "columns": columns_info,
        "correlation_matrix": corr_matrix
    }
