// src/stores/useChatStore.ts
import { create } from "zustand";
import api from "../api/api";
import type { AxiosResponse } from "axios";

/* ---------- Types ---------- */

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
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  // add other fields as needed
}

interface ChatState {
  // state
  chat: Chat | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  chatLoading: boolean; // streaming in-progress flag
  currentResponse: string; // streaming partial text
  abortCtrl: AbortController | null;

  // actions
  fetchChat: (chatId: string) => Promise<void>;
  resetChat: () => void;
  addUserMessage: (content: string) => void;
  abortStreaming: () => void;
  streamResponse: (opts: { prompt: string; chatId: string }) => Promise<void>;
}

/* ---------- Config ---------- */

const API_BASE = "http://localhost:3008/api";

/* ---------- Store ---------- */

export const useChatStore = create<ChatState>((set, get) => ({
  chat: null,
  messages: [],
  loading: false,
  error: null,
  chatLoading: false,
  currentResponse: "",
  abortCtrl: null,

  /* Fetch chat (Axios) */
  fetchChat: async (chatId: string) => {
    set({ loading: true, error: null, chat: null, messages: [] });
    try {
      console.log("Frontend: Fetching chat with ID:", chatId);
      // strongly type axios response
      const res = (await api.get<{ chat: Chat; messages: Message[] }>(
        `/ai/chat/${chatId}`
      )) as any;

      console.log("Frontend: API response:", res);

      // Handle the response - the API returns { chat: {...}, messages: [...] }
      const chat = res.chat || null;
      const messages = res.messages || [];

      console.log("Frontend: Processed chat:", chat, "messages:", messages);

      set({
        chat,
        messages,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Frontend: Error fetching chat:", err);
      console.error("Frontend: Error response:", err.response);
      console.error("Frontend: Error status:", err.response?.status);
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        String(err);
      console.error("Frontend: Final error message:", message);
      set({
        error: message,
        loading: false,
        chat: null,
        messages: [],
      });
    }
  },

  /* Reset everything (also abort any active stream) */
  resetChat: () => {
    const ctrl = get().abortCtrl;
    if (ctrl) ctrl.abort();
    set({
      chat: null,
      messages: [],
      loading: false,
      error: null,
      chatLoading: false,
      currentResponse: "",
      abortCtrl: null,
    });
  },

  /* Add user message locally */
  addUserMessage: (content: string) => {
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, userMessage] }));
  },

  /* Abort active stream */
  abortStreaming: () => {
    const ctrl = get().abortCtrl;
    if (ctrl) {
      ctrl.abort();
      set({ abortCtrl: null, chatLoading: false, currentResponse: "" });
    }
  },

  /* Stream response via fetch + ReadableStream (SSE style) */
  streamResponse: async ({ prompt, chatId }) => {
    // abort previous
    const prev = get().abortCtrl;
    if (prev) prev.abort();

    const controller = new AbortController();
    set({ chatLoading: true, currentResponse: "", abortCtrl: controller });

    try {
      const token = localStorage.getItem("authToken") ?? "";
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          prompt,
          chatId,
          useContext: true,
          createNewChat: false,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("ReadableStream not available on response");

      const decoder = new TextDecoder();
      let buffer = "";
      let aiResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (aiResponse.trim()) {
            const assistantMsg: Message = {
              role: "assistant",
              content: aiResponse,
              timestamp: new Date().toISOString(),
            };
            set((state) => ({ messages: [...state.messages, assistantMsg] }));
          }
          set({ currentResponse: "", chatLoading: false, abortCtrl: null });
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.replace(/^data:/, "").trim();

          if (payload === "[DONE]") {
            if (aiResponse.trim()) {
              const assistantMsg: Message = {
                role: "assistant",
                content: aiResponse,
                timestamp: new Date().toISOString(),
              };
              set((state) => ({ messages: [...state.messages, assistantMsg] }));
            }
            set({ currentResponse: "", chatLoading: false, abortCtrl: null });
            return;
          }

          try {
            const parsed = JSON.parse(payload) as {
              token?: string;
              chatId?: string;
            };
            if (parsed.token !== undefined) {
              aiResponse += parsed.token;
              set({ currentResponse: aiResponse });
            } else if (parsed.chatId) {
              // optionally update chat id if server returns it
              set((state) => ({
                chat: {
                  ...(state.chat ?? ({} as Chat)),
                  _id: parsed.chatId,
                } as Chat,
              }));
            }
          } catch (e) {
            console.error("Failed to parse SSE payload:", payload, e);
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        // nothing — user cancelled
        set({ chatLoading: false, abortCtrl: null });
      } else {
        console.error("stream error:", err);
        const errorMsg: Message = {
          role: "assistant",
          content: "Sorry, I encountered an error processing your request.",
          timestamp: new Date().toISOString(),
          isError: true,
        };
        set((state) => ({
          messages: [...state.messages, errorMsg],
          chatLoading: false,
          abortCtrl: null,
        }));
      }
    }
  },
}));
