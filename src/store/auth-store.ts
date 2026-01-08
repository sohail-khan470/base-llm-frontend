import { create } from "zustand";
import api from "../api/api";

export interface User {
  id: string;
  email: string;
  role?: string;
  organization?: {
    id: string;
    name: string;
    email: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    organizationId: string
  ) => Promise<void>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: localStorage.getItem("authToken") || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const res = (await api.post("/auth/login", {
        email,
        password,
      })) as any;
      localStorage.setItem("authToken", res.token);
      set({ user: res.user, token: res.token, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.error || "Login failed",
        loading: false,
      });
    }
  },

  signup: async (email, password, organizationId) => {
    try {
      set({ loading: true, error: null });
      await api.post("/auth/register", { email, password, organizationId });
      set({ loading: false });
      // Do not auto-login, just return success
    } catch (err: any) {
      set({
        error: err.response?.data?.error || "Signup failed",
        loading: false,
      });
    }
  },

  logout: () => {
    localStorage.removeItem("authToken");
    set({ user: null, token: null });
  },

  initializeAuth: async () => {
    const token = localStorage.getItem("authToken");
    console.log(token);
    if (!token) {
      set({ user: null, token: null });
      return;
    }

    try {
      set({ loading: true, error: null });
      const response = (await api.get("/auth/me")) as any;
      set({
        user: response.user,
        token,
        loading: false,
      });
    } catch (error: any) {
      console.error("Failed to restore user session:", error);
      // If token is invalid, clear it
      localStorage.removeItem("authToken");
      set({
        user: null,
        token: null,
        loading: false,
        error: "Session expired",
      });
    }
  },
}));
