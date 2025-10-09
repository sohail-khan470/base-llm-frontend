// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Changed to relative URL
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    console.log("API Request:", {
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: config.data,
      dataType:
        config.data instanceof FormData ? "FormData" : typeof config.data,
    });
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData - let browser set it automatically
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      console.log("Removed Content-Type header for FormData request");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to unwrap "data"
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    console.error("API Error:", {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(
      error.response?.data?.message || error.message || "Something went wrong"
    );
  }
);

export default api;
