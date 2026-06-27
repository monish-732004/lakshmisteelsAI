# Lakshmi Steels AI - No-Code Data Cleaning & BI Dashboard

Lakshmi Steels AI is an enterprise-grade automated data cleaning, visual ETL pipeline, dynamic charts dashboarding, predictive forecasting, and conversational chat co-pilot platform.

---

## Getting Started

Follow these simple steps to run both backend and frontend applications locally on your machine.

### Prerequisites
Make sure you have Node.js (v18+) and Python (v3.10+) installed.

---

### Step 1: Run the Backend (FastAPI)
1. Open a terminal and navigate to the `backend/` directory.
2. Run the startup script:
   ```cmd
   run.bat
   ```
   *Alternatively, run:*
   ```bash
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
3. The server will start on `http://127.0.0.1:8000`. You can test it by opening `http://127.0.0.1:8000/api/health` in your browser.

> **Optional AI Features:**
> To unlock natural language dataset summaries and chatbot answers, set your Google Gemini API Key in the environment:
> ```cmd
> set GEMINI_API_KEY=your-gemini-api-key
> ```
> If no API key is set, the application automatically falls back to statistical-rule summaries and standard helper chatbot patterns so the app remains fully functional.

---

### Step 2: Run the Frontend (Next.js)
1. Open another terminal and navigate to the `frontend/` directory.
2. Run the startup script:
   ```cmd
   run.bat
   ```
   *Alternatively, run:*
   ```bash
   npm run dev
   ```
3. The Next.js dashboard will start on `http://localhost:3000`.

---

## Features Walkthrough
1. **Landing & Ingestion:** Drag and drop any Excel (.xlsx, .xls) or CSV file.
2. **Visual ETL Pipeline:** Click the trigger button and watch the pipeline Extract, Transform, Validate, and Load data with a live-scrolling terminal log.
3. **AI Cleaning Reviews:** Inspect discovered duplicates, null inputs, outlier values, or capitalization issues. Choose recommended fixes and apply them. Revert at any point with version control.
4. **Statistical Dashboard:** View automatically generated summaries (Total Rows, columns counts, duplicate rates, quality scores) and ECharts visualization widgets. Modify interactive filter controls to update charts instantly.
5. **Predictive Forecasting:** Fit predictive regression models on numerical variables with visual 95% confidence bounds.
6. **Data Chatbot:** Ask conversational questions directly about outliers, averages, summaries, or anomalies.
7. **Polished Exporters:** Download cleaned datasets back to CSV, Excel, or print styled summary PDF reports.
