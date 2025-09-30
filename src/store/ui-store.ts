import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";
export type SidebarState = "open" | "closed" | "collapsed";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  type: string;
  props?: Record<string, any>;
  onClose?: () => void;
}

interface UIState {
  // Theme
  theme: Theme;

  // Layout
  sidebarState: SidebarState;
  isMobile: boolean;

  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;

  // Toasts
  toasts: Toast[];

  // Modals
  modals: Modal[];

  // Chat UI
  chatInputFocused: boolean;
  isTyping: boolean;

  // File upload
  isDragOver: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  setSidebarState: (state: SidebarState) => void;
  setIsMobile: (isMobile: boolean) => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;

  // Toast actions
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Modal actions
  openModal: (modal: Omit<Modal, "id">) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  // Chat UI actions
  setChatInputFocused: (focused: boolean) => void;
  setIsTyping: (typing: boolean) => void;

  // File upload actions
  setIsDragOver: (dragOver: boolean) => void;

  // Utility actions
  toggleSidebar: () => void;
  getActiveModal: () => Modal | null;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: "system",
      sidebarState: "open",
      isMobile: false,
      globalLoading: false,
      loadingMessage: null,
      toasts: [],
      modals: [],
      chatInputFocused: false,
      isTyping: false,
      isDragOver: false,

      // Theme actions
      setTheme: (theme: Theme) => {
        set({ theme });
      },

      // Layout actions
      setSidebarState: (state: SidebarState) => {
        set({ sidebarState: state });
      },

      setIsMobile: (isMobile: boolean) => {
        set({ isMobile });
        // Auto-collapse sidebar on mobile
        if (isMobile && get().sidebarState === "open") {
          set({ sidebarState: "collapsed" });
        }
      },

      toggleSidebar: () => {
        const current = get().sidebarState;
        const isMobile = get().isMobile;

        if (isMobile) {
          set({ sidebarState: current === "closed" ? "open" : "closed" });
        } else {
          set({
            sidebarState: current === "open" ? "collapsed" : "open",
          });
        }
      },

      // Loading actions
      setGlobalLoading: (loading: boolean, message?: string) => {
        set({
          globalLoading: loading,
          loadingMessage: loading ? message || null : null,
        });
      },

      // Toast actions
      addToast: (toast: Omit<Toast, "id">) => {
        const id = `toast_${Date.now()}_${Math.random()}`;
        const newToast: Toast = {
          ...toast,
          id,
          duration: toast.duration || 5000,
        };

        set((state) => ({
          toasts: [...state.toasts, newToast],
        }));

        // Auto-remove toast after duration
        if (newToast.duration && newToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, newToast.duration);
        }

        return id;
      },

      removeToast: (id: string) => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      },

      clearToasts: () => {
        set({ toasts: [] });
      },

      // Modal actions
      openModal: (modal: Omit<Modal, "id">) => {
        const id = `modal_${Date.now()}_${Math.random()}`;
        const newModal: Modal = {
          ...modal,
          id,
        };

        set((state) => ({
          modals: [...state.modals, newModal],
        }));

        return id;
      },

      closeModal: (id: string) => {
        const modal = get().modals.find((m) => m.id === id);
        if (modal?.onClose) {
          modal.onClose();
        }

        set((state) => ({
          modals: state.modals.filter((modal) => modal.id !== id),
        }));
      },

      closeAllModals: () => {
        const modals = get().modals;
        modals.forEach((modal) => {
          if (modal.onClose) {
            modal.onClose();
          }
        });

        set({ modals: [] });
      },

      getActiveModal: () => {
        const modals = get().modals;
        return modals.length > 0 ? modals[modals.length - 1] : null;
      },

      // Chat UI actions
      setChatInputFocused: (focused: boolean) => {
        set({ chatInputFocused: focused });
      },

      setIsTyping: (typing: boolean) => {
        set({ isTyping: typing });
      },

      // File upload actions
      setIsDragOver: (dragOver: boolean) => {
        set({ isDragOver: dragOver });
      },
    }),
    {
      name: "ui-storage",
      // Only persist certain UI preferences
      partialize: (state) => ({
        theme: state.theme,
        sidebarState: state.sidebarState,
      }),
    }
  )
);
