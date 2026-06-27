import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export const api = {
  // Get health status
  getHealth: async () => {
    const res = await axios.get(`${API_BASE_URL}/health`);
    return res.data;
  },

  // Upload file
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Switch Excel active sheet
  selectSheet: async (fileId: string, sheetName: string) => {
    const formData = new FormData();
    formData.append("sheet_name", sheetName);
    const res = await axios.post(`${API_BASE_URL}/files/select-sheet/${fileId}`, formData);
    return res.data;
  },

  // Get recent uploads
  getRecentFiles: async () => {
    const res = await axios.get(`${API_BASE_URL}/files/recent`);
    return res.data;
  },

  // Get first 20 rows data preview
  getPreview: async (fileId: string) => {
    const res = await axios.get(`${API_BASE_URL}/preview/${fileId}`);
    return res.data;
  },

  // Profile dataframe statistics
  profileData: async (fileId: string) => {
    const res = await axios.post(`${API_BASE_URL}/profile/${fileId}`);
    return res.data;
  },

  // Get cleaning suggestions checklist
  getCleaningRules: async (fileId: string) => {
    const res = await axios.get(`${API_BASE_URL}/cleaning/rules/${fileId}`);
    return res.data;
  },

  // Apply chosen cleaning rules
  applyCleaning: async (fileId: string, selectedIds: string[]) => {
    const res = await axios.post(`${API_BASE_URL}/cleaning/apply/${fileId}`, {
      selected_ids: selectedIds,
    });
    return res.data;
  },

  // Revert last cleaning step
  undoCleaning: async (fileId: string) => {
    const res = await axios.post(`${API_BASE_URL}/cleaning/undo/${fileId}`);
    return res.data;
  },

  // Fetch cleaning history logs
  getCleaningHistory: async (fileId: string) => {
    const res = await axios.get(`${API_BASE_URL}/cleaning/history/${fileId}`);
    return res.data;
  },

  // Run visual ETL pipeline stages
  runEtl: async (fileId: string) => {
    const res = await axios.post(`${API_BASE_URL}/etl/run/${fileId}`);
    return res.data;
  },

  // Get forecasting configurations (targets list, date col)
  getForecastOptions: async (fileId: string) => {
    const res = await axios.get(`${API_BASE_URL}/forecast/options/${fileId}`);
    return res.data;
  },

  // Generate numeric forecasting
  getForecast: async (fileId: string, targetCol: string, dateCol: string | null, periods: number = 12) => {
    const res = await axios.post(`${API_BASE_URL}/forecast/${fileId}`, {
      target_column: targetCol,
      date_column: dateCol,
      periods,
    });
    return res.data;
  },

  // Submit chat query to RAG model
  sendChatMessage: async (fileId: string, message: string) => {
    const res = await axios.post(`${API_BASE_URL}/chat/${fileId}`, { message });
    return res.data;
  },

  // Get chat history list
  getChatHistory: async (fileId: string) => {
    const res = await axios.get(`${API_BASE_URL}/chat/history/${fileId}`);
    return res.data;
  },

  // Get downloads urls for PDF/Excel/CSV
  getExportUrl: (fileId: string, format: "excel" | "csv" | "pdf") => {
    return `${API_BASE_URL}/export/${fileId}/${format}`;
  },

  // Get comprehensive data analysis metrics
  getAnalysis: async (fileId: string) => {
    const res = await axios.get(`${API_BASE_URL}/analysis/${fileId}`);
    return res.data;
  },
};
