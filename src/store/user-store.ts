import { create } from "zustand";
import api from "../api/api";

export interface UserProfile {
  _id: string;
  email: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  preferences?: {
    theme?: "light" | "dark" | "system";
    language?: string;
    notifications?: {
      email: boolean;
      push: boolean;
      desktop: boolean;
    };
    chatSettings?: {
      autoSave: boolean;
      showTimestamps: boolean;
      fontSize: "small" | "medium" | "large";
    };
  };
  stats?: {
    totalChats: number;
    totalMessages: number;
    documentsUploaded: number;
    lastActiveAt: string;
  };
}

export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  language?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  chatSettings?: {
    autoSave: boolean;
    showTimestamps: boolean;
    fontSize: "small" | "medium" | "large";
  };
}

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  clearError: () => void;

  // Utility actions
  getPreference: <K extends keyof UserPreferences>(
    key: K
  ) => UserPreferences[K];
  setPreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: "system",
  language: "en",
  notifications: {
    email: true,
    push: true,
    desktop: false,
  },
  chatSettings: {
    autoSave: true,
    showTimestamps: true,
    fontSize: "medium",
  },
};

export const useUserStore = create<UserState>()((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get("/auth/me");
      const profile = response.data.user || response.data;

      // Merge with default preferences if not set
      const profileWithDefaults = {
        ...profile,
        preferences: {
          ...defaultPreferences,
          ...profile.preferences,
        },
      };

      set({
        profile: profileWithDefaults,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.error || "Failed to fetch profile",
        loading: false,
      });
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    try {
      set({ loading: true, error: null });
      const response = await api.put("/auth/profile", updates);
      const updatedProfile = response.data.user || response.data;

      set((state) => ({
        profile: state.profile
          ? { ...state.profile, ...updatedProfile }
          : updatedProfile,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.error || "Failed to update profile",
        loading: false,
      });
      throw err;
    }
  },

  updatePreferences: async (preferences: Partial<UserPreferences>) => {
    try {
      set({ error: null });
      const response = await api.put("/auth/preferences", { preferences });
      const updatedPreferences = response.data.preferences || preferences;

      set((state) => ({
        profile: state.profile
          ? {
              ...state.profile,
              preferences: {
                ...state.profile.preferences,
                ...updatedPreferences,
              },
            }
          : null,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.error || "Failed to update preferences",
      });
      throw err;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      set({ loading: true, error: null });
      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      set({ loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.error || "Failed to change password",
        loading: false,
      });
      throw err;
    }
  },

  deleteAccount: async (password: string) => {
    try {
      set({ loading: true, error: null });
      await api.delete("/auth/account", {
        data: { password },
      });

      // Clear all user data
      set({
        profile: null,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.error || "Failed to delete account",
        loading: false,
      });
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  // Utility functions
  getPreference: <K extends keyof UserPreferences>(key: K) => {
    const profile = get().profile;
    return profile?.preferences?.[key] || defaultPreferences[key];
  },

  setPreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    set((state) => ({
      profile: state.profile
        ? {
            ...state.profile,
            preferences: {
              ...state.profile.preferences,
              [key]: value,
            },
          }
        : null,
    }));
  },

  resetPreferences: () => {
    set((state) => ({
      profile: state.profile
        ? {
            ...state.profile,
            preferences: { ...defaultPreferences },
          }
        : null,
    }));
  },
}));
