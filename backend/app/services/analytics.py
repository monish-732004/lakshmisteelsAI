import math
import numpy as np
import pandas as pd

def clean_value(val):
    if pd.isna(val) or (isinstance(val, float) and math.isnan(val)):
        return 0.0
    if isinstance(val, (np.integer, np.floating)):
        return val.item()
    return val

def find_date_column(df: pd.DataFrame) -> str:
    """Finds the first column that can be treated as a date series."""
    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            return col
    # Look for string columns that parse as dates
    for col in df.columns:
        if pd.api.types.is_object_dtype(df[col]) or df[col].dtype == "string":
            try:
                non_null = df[col].dropna().head(10)
                if len(non_null) > 0:
                    parsed = pd.to_datetime(non_null, errors='coerce')
                    if parsed.notna().sum() > len(non_null) * 0.7:
                        return col
            except Exception:
                pass
    return None

def find_target_columns(df: pd.DataFrame) -> list:
    """Finds numeric columns suitable for forecasting."""
    targets = []
    keywords = ["sales", "revenue", "demand", "inventory", "stock", "profit", "churn", "attrition", "performance", "qty", "quantity", "price", "amount"]
    
    # Priority 1: Numeric columns matching domain keywords
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            if any(kw in col.lower() for kw in keywords):
                targets.append(col)
                
    # Priority 2: Any other numeric columns (excluding columns that look like IDs/Codes)
    if not targets:
        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                col_lower = col.lower()
                if not any(x in col_lower for x in ["id", "zip", "code", "year", "month", "day", "phone"]):
                    targets.append(col)
                    
    return targets

def forecast_target(df: pd.DataFrame, target_col: str, date_col: str = None, periods: int = 12) -> dict:
    """
    Performs time-series forecasting or index-based trend forecasting.
    Returns:
    - target_column: name
    - historical: list of {date, value}
    - forecast: list of {date, value, lower, upper}
    - metrics: {r2, trend_slope, growth_rate_pct, mae}
    """
    if target_col not in df.columns:
        return {"error": f"Target column '{target_col}' not found."}
        
    df_clean = df[[target_col]].copy()
    
    # Handle Date Series
    has_dates = False
    if date_col and date_col in df.columns:
        try:
            df_clean[date_col] = pd.to_datetime(df[date_col], errors='coerce')
            df_clean = df_clean.dropna(subset=[date_col])
            has_dates = True
        except Exception:
            pass
            
    if not has_dates:
        # Check if we can find a date column
        detected_date = find_date_column(df)
        if detected_date:
            try:
                df_clean[detected_date] = pd.to_datetime(df[detected_date], errors='coerce')
                df_clean = df_clean.dropna(subset=[detected_date])
                date_col = detected_date
                has_dates = True
            except Exception:
                pass

    df_clean = df_clean.dropna(subset=[target_col])
    if len(df_clean) < 5:
        return {"error": "Insufficient data points for forecasting (minimum 5 rows required)."}

    if has_dates:
        # Group and aggregate by dynamic frequency:
        # Daily: if date range < 60 days
        # Weekly: if range 60 - 365 days
        # Monthly: if range > 365 days
        date_min = df_clean[date_col].min()
        date_max = df_clean[date_col].max()
        days_span = (date_max - date_min).days
        
        if days_span < 60:
            freq = "D"
            date_format = "%Y-%m-%d"
        elif days_span <= 365:
            freq = "W"
            date_format = "%Y-%m-%d"
        else:
            freq = "MS"  # Month Start
            date_format = "%Y-%m"
            
        # Group and sort
        ts_df = df_clean.groupby(pd.Grouper(key=date_col, freq=freq))[target_col].sum().reset_index()
        ts_df = ts_df.sort_values(by=date_col).reset_index(drop=True)
    else:
        # Index-based aggregation (for non-dated data)
        # We group by index or group every N rows if the dataset is huge,
        # but for simple index forecasting we just use the sorted rows.
        ts_df = pd.DataFrame({
            "index": range(1, len(df_clean) + 1),
            target_col: df_clean[target_col].values
        })
        date_col = "index"
        freq = None

    # Length check after aggregation
    n_points = len(ts_df)
    if n_points < 3:
        # If aggregated points are too few, fall back to row-by-row
        ts_df = pd.DataFrame({
            "index": range(1, len(df_clean) + 1),
            target_col: df_clean[target_col].values
        })
        date_col = "index"
        freq = None
        n_points = len(ts_df)

    # Prepare historical data response
    historical_data = []
    for idx, row in ts_df.iterrows():
        if freq:
            date_str = row[date_col].strftime(date_format)
        else:
            date_str = f"Period {int(row[date_col])}"
        historical_data.append({
            "date": date_str,
            "value": clean_value(row[target_col])
        })

    # Fit quadratic model to capture trends and slight curves using numpy
    degree = min(2, max(1, n_points - 2))
    X = np.arange(n_points)
    y = ts_df[target_col].values
    
    coeffs = np.polyfit(X, y, degree)
    
    # Calculate R2 & Mean Absolute Error (MAE) on training data
    y_pred = np.polyval(coeffs, X)
    residuals = y - y_pred
    mae = float(np.mean(np.abs(residuals)))
    std_residuals = float(np.std(residuals))
    if std_residuals == 0:
        std_residuals = float(y.mean() * 0.05) if y.mean() != 0 else 1.0
        
    ss_res = np.sum(residuals**2)
    ss_tot = np.sum((y - np.mean(y))**2)
    r2 = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0.0

    # Forecast future points
    forecast_data = []
    future_X = np.arange(n_points, n_points + periods)
    future_preds = np.polyval(coeffs, future_X)

    # Compute trend metrics
    growth_rate_pct = 0.0
    if len(y_pred) > 1 and y_pred[0] != 0:
        growth_rate_pct = float(((y_pred[-1] - y_pred[0]) / abs(y_pred[0])) * 100)

    for i in range(periods):
        future_idx = n_points + i
        # Calculate standard error bounds (expanding uncertainty in future)
        # Standard error scales up slightly as we project further
        se_multiplier = 1.96 * (1.0 + 0.1 * i)
        lower_bound = clean_value(max(0, future_preds[i] - se_multiplier * std_residuals))
        upper_bound = clean_value(future_preds[i] + se_multiplier * std_residuals)
        
        if freq:
            future_date = ts_df[date_col].iloc[-1] + (i + 1) * pd.tseries.frequencies.to_offset(freq)
            date_str = future_date.strftime(date_format)
        else:
            date_str = f"Period {future_idx + 1}"
            
        forecast_data.append({
            "date": date_str,
            "value": clean_value(future_preds[i]),
            "lower": lower_bound,
            "upper": upper_bound
        })

    # Overall trend evaluation
    # coeffs are ordered [highest_degree, ..., linear, constant]
    trend_slope = float(coeffs[-2]) if len(coeffs) >= 2 else 0.0
    trend_desc = "Increasing" if trend_slope > 0 else "Decreasing" if trend_slope < 0 else "Flat"

    return {
        "target_column": target_col,
        "historical": historical_data,
        "forecast": forecast_data,
        "metrics": {
            "r2": max(0.0, r2),
            "mae": mae,
            "trend": trend_desc,
            "growth_rate_pct": growth_rate_pct,
            "std_error": std_residuals
        }
    }
