// Import all stores
import { useAuthStore } from "./auth-store";
import { useChatStore } from "./chat-store";
import { useOrganizationStore } from "./organization-store";
import { useDocumentStore } from "./document-store";
import { useMessageStore } from "./message-store";
import { useUIStore } from "./ui-store";
import { useChatListStore } from "./chat-list-store";
import { useUserStore } from "./user-store";

// Export all stores
export { useAuthStore } from "./auth-store";
export type { User } from "./auth-store";

export { useChatStore } from "./chat-store";
export type { Message, Chat, Role } from "./chat-store";

export { useOrganizationStore } from "./organization-store";
export type { Organization } from "./organization-store";

export { useDocumentStore } from "./document-store";
export type { Document, UploadProgress } from "./document-store";

export { useMessageStore } from "./message-store";
export type { MessageRole } from "./message-store";

export { useUIStore } from "./ui-store";
export type { Theme, SidebarState, Toast, Modal } from "./ui-store";

export { useChatListStore } from "./chat-list-store";
export type { ChatListItem } from "./chat-list-store";

export { useUserStore } from "./user-store";
export type { UserProfile, UserPreferences } from "./user-store";

// Store combinations for common use cases
export const useAppStores = () => ({
  auth: useAuthStore(),
  chat: useChatStore(),
  chatList: useChatListStore(),
  messages: useMessageStore(),
  documents: useDocumentStore(),
  organization: useOrganizationStore(),
  user: useUserStore(),
  ui: useUIStore(),
});

// Utility function to reset all stores (useful for logout)
export const resetAllStores = () => {
  useAuthStore.getState().logout();
  useChatStore.getState().resetChat();
  useChatListStore.setState({ chats: [], currentChatId: null });
  useMessageStore.getState().clearMessages();
  useDocumentStore.setState({ documents: [], uploadProgress: [] });
  useOrganizationStore.getState().clearOrg();
  useUserStore.setState({ profile: null });
  useUIStore.getState().closeAllModals();
  useUIStore.getState().clearToasts();
};
