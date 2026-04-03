import axios from "axios";

const RAW_API_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const API_BASE_URL = RAW_API_URL
  ? (RAW_API_URL.endsWith("/contact") ? RAW_API_URL : `${RAW_API_URL}/contact`)
  : "/api/contact";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const extractErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  return error.message || "Unable to submit your support request right now.";
};

export const submitContactMessage = async ({ name, email, role, issueType, message }) => {
  try {
    const res = await api.post("/", {
      name,
      email,
      role,
      issueType,
      message,
    });

    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export default {
  submitContactMessage,
};
