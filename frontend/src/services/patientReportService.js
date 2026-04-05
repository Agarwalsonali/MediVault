import axios from "axios";
import { getToken } from "./authService.js";

const RAW_API_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const API_BASE_URL = RAW_API_URL || "/api";
const PATIENT_REPORTS_URL = `${API_BASE_URL}/patient/reports`;

const authHeaders = (contentType = "application/json") => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": contentType,
});

export const uploadPatientReport = async ({ reportName, reportType, reportDate, notes, file }) => {
  const formData = new FormData();
  formData.append("reportName", reportName?.trim() || "");
  if (reportType) formData.append("reportType", reportType);
  if (reportDate) formData.append("reportDate", reportDate);
  if (notes) formData.append("notes", notes?.trim());
  formData.append("file", file);

  try {
    const res = await axios.post(`${PATIENT_REPORTS_URL}/upload`, formData, {
      headers: authHeaders("multipart/form-data"),
    });
    return res.data.report;
  } catch (error) {
    throw error.response?.data || { message: "Failed to upload report" };
  }
};

export const getMyPatientReports = async () => {
  try {
    const res = await axios.get(PATIENT_REPORTS_URL, {
      headers: authHeaders(),
    });
    return res.data.reports || [];
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch reports" };
  }
};

export const deleteMyPatientReport = async (reportId) => {
  try {
    const res = await axios.delete(`${PATIENT_REPORTS_URL}/${reportId}`, {
      headers: authHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete report" };
  }
};
