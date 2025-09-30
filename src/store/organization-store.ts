import { create } from "zustand";
import api from "../api/api";

export interface Organization {
  _id: string;
  name: string;
  email: string;
}
export type Role = "user" | "assistant" | "system";

export interface Message {
  _id?: string;
  role: Role;
  content: string;
  timestamp: string; // ISO string for simplicity
  isError?: boolean;
}

export interface Chat {
  _id: string;
  organizationId: string;
  userId: string;
  title?: string;
  messages: Message[];
  createdAt?: string;
  updatedAt?: string;
}

interface OrganizationState {
  chats: Chat[];
  organization: Organization | null; // one org
  organizations: Organization[]; // all orgs
  loading: boolean;
  error: string | null;

  registerOrg: (name: string, email: string) => Promise<void>;
  fetchOrganizationChats: (id: string) => Promise<void>;
  fetchOrganizationById: (id: string) => Promise<void>;
  fetchOneOrg: (email: string) => Promise<void>;
  fetchAllOrgs: () => Promise<void>;
  clearOrg: () => void;
}

export const useOrganizationStore = create<OrganizationState>()((set) => ({
  chats: [],
  organization: null,
  organizations: [],
  loading: false,
  error: null,

  fetchOrganizationChats: async (orgId) => {
    if (!orgId) {
      console.warn("No organization ID provided");
      set({ chats: [], loading: false });
      return;
    }

    try {
      set({ loading: true, error: null });
      console.log("Fetching chats for organization:", orgId);
      const res = await api.get(`/ai/organizations/${orgId}/chats`);
      console.log(res, "RRRRRRRRRR");
      // The API returns the array directly in res.data
      const chats = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      console.log("Processed chats:", chats);
      set({ chats, loading: false });
    } catch (error: any) {
      console.error("Error fetching organization chats:", error);
      set({
        error: error.response?.data?.error || "Failed to fetch chats",
        loading: false,
        chats: [],
      });
    }
  },

  registerOrg: async (name, email) => {
    try {
      set({ loading: true, error: null });
      const res = await api.post("/ai/organizations/register", {
        name,
        email,
      });
      set({ organization: res.data.organization, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.error || "Registration failed",
        loading: false,
      });
    }
  },

  fetchAllOrgs: async () => {
    try {
      set({ loading: true, error: null });
      const orgs = (await api.get("/ai/organizations")) as any;
      console.log(orgs);
      set({ organizations: [...orgs], loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.error || "Fetching organizations failed",
        loading: false,
      });
    }
  },

  fetchOrganizationById: async (id) => {
    try {
      set({ loading: true, error: null });
      const org = (await api.get("/ai/organizations")) as any;
      console.log(org);
      set({ organization: org, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Error ",
        loading: false,
      });
    }
  },

  fetchOneOrg: async (email) => {
    try {
      set({ loading: true, error: null });
      const res = await api.get(`/ai/organizations/${email}`);
      set({ organization: res.data.organization, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.error || "Fetching organization failed",
        loading: false,
      });
    }
  },

  clearOrg: () => {
    set({ organization: null, organizations: [] });
  },
}));
