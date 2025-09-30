import { create } from "zustand";
import api from "../api/api";

export interface ChatListItem {
  _id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  organizationId: string;
  messageCount?: number;
  lastMessage?: {
    content: string;
    timestamp: string;
    role: "user" | "assistant" | "system";
  };
}

interface ChatListState {
  chats: ChatListItem[];
  loading: boolean;
  error: string | null;
  currentChatId: string | null;

  // Actions
  fetchChats: () => Promise<void>;

  createChat: (title?: string) => Promise<ChatListItem>;
  updateChatTitle: (chatId: string, title: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  setCurrentChat: (chatId: string | null) => void;
  clearError: () => void;

  // Utility actions
  getChatById: (chatId: string) => ChatListItem | null;
  getRecentChats: (limit?: number) => ChatListItem[];
  searchChats: (query: string) => ChatListItem[];
  updateChatLastMessage: (
    chatId: string,
    message: {
      content: string;
      timestamp: string;
      role: "user" | "assistant" | "system";
    }
  ) => void;
}

export const useChatListStore = create<ChatListState>((set, get) => ({
  chats: [],
  loading: false,
  error: null,
  currentChatId: null,

  fetChatsByOrg: async (organizationId: string) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get("/");
    } catch (error) {}
  },

  fetchChats: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get("/ai/chats");
      const chats = Array.isArray(response.data) ? response.data : [];

      // Sort chats by updatedAt (most recent first)
      const sortedChats = chats.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      set({
        chats: sortedChats,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.error || "Failed to fetch chats",
        loading: false,
      });
    }
  },

  createChat: async (title?: string) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post("/chats", {
        title: title || "New Chat",
      });

      const newChat = response.data.data || response.data;

      // Add to the beginning of the list
      set((state) => ({
        chats: [newChat, ...state.chats],
        currentChatId: newChat._id,
        loading: false,
      }));

      return newChat;
    } catch (err: any) {
      set({
        error: err.response?.data?.error || "Failed to create chat",
        loading: false,
      });
      throw err;
    }
  },

  updateChatTitle: async (chatId: string, title: string) => {
    try {
      set({ error: null });
      await api.patch(`/chats/${chatId}/title`, { title });

      // Update local state
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat._id === chatId
            ? { ...chat, title, updatedAt: new Date().toISOString() }
            : chat
        ),
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.error || "Failed to update chat title",
      });
      throw err;
    }
  },

  deleteChat: async (chatId: string) => {
    try {
      set({ loading: true, error: null });
      await api.delete(`/chats/${chatId}`);

      // Remove from local state
      set((state) => ({
        chats: state.chats.filter((chat) => chat._id !== chatId),
        currentChatId:
          state.currentChatId === chatId ? null : state.currentChatId,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.error || "Failed to delete chat",
        loading: false,
      });
      throw err;
    }
  },

  setCurrentChat: (chatId: string | null) => {
    set({ currentChatId: chatId });
  },

  clearError: () => {
    set({ error: null });
  },

  // Utility functions
  getChatById: (chatId: string) => {
    return get().chats.find((chat) => chat._id === chatId) || null;
  },

  getRecentChats: (limit = 10) => {
    return get()
      .chats.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, limit);
  },

  searchChats: (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return get().chats.filter(
      (chat) =>
        chat.title?.toLowerCase().includes(lowercaseQuery) ||
        chat.lastMessage?.content.toLowerCase().includes(lowercaseQuery)
    );
  },

  updateChatLastMessage: (
    chatId: string,
    message: {
      content: string;
      timestamp: string;
      role: "user" | "assistant" | "system";
    }
  ) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat._id === chatId
          ? {
              ...chat,
              lastMessage: message,
              updatedAt: message.timestamp,
            }
          : chat
      ),
    }));
  },
}));
