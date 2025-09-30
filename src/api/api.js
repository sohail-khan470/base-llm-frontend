// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3008/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to unwrap "data"
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    return Promise.reject(
      error.response?.data?.message || error.message || "Something went wrong"
    );
  }
);

export default api;
