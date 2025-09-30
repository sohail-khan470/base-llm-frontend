import { create } from "zustand";
import api from "../api/api";

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  _id?: string;
  chatId: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  isError?: boolean;
}

interface MessageState {
  messages: Message[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchMessagesByChat: (chatId: string) => Promise<void>;
  addMessage: (message: Omit<Message, "_id" | "timestamp">) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  clearMessages: () => void;
  clearError: () => void;

  // Utility actions
  getMessagesByChat: (chatId: string) => Message[];
  getLastMessage: (chatId: string) => Message | null;
  getMessageCount: (chatId: string) => number;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  loading: false,
  error: null,

  fetchMessagesByChat: async (chatId: string) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/ai/chats/${chatId}`);
      const fetchedMessages = response.data.messages || [];

      // Update messages for this chat, keeping messages from other chats
      set((state) => ({
        messages: [
          ...state.messages.filter((msg) => msg.chatId !== chatId),
          ...fetchedMessages,
        ],
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.error || "Failed to fetch messages",
        loading: false,
      });
    }
  },

  addMessage: (message: Omit<Message, "_id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      _id: `temp_${Date.now()}_${Math.random()}`, // Temporary ID
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  updateMessage: (messageId: string, updates: Partial<Message>) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === messageId ? { ...msg, ...updates } : msg
      ),
    }));
  },

  deleteMessage: (messageId: string) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg._id !== messageId),
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  clearError: () => {
    set({ error: null });
  },

  // Utility functions
  getMessagesByChat: (chatId: string) => {
    return get()
      .messages.filter((msg) => msg.chatId === chatId)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  },

  getLastMessage: (chatId: string) => {
    const chatMessages = get().getMessagesByChat(chatId);
    return chatMessages.length > 0
      ? chatMessages[chatMessages.length - 1]
      : null;
  },

  getMessageCount: (chatId: string) => {
    return get().messages.filter((msg) => msg.chatId === chatId).length;
  },
}));
