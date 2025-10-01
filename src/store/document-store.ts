import { create } from "zustand";
import api from "../api/api";

export interface Document {
  _id: string;
  organizationId: string;
  uploadedBy: string;
  filename: string;
  docType: "pdf" | "txt" | "md" | "csv" | "excel";
  status: "active" | "deleted";
  chromaIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UploadProgress {
  filename: string;
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
  error?: string;
}

export interface UploadResponse {
  message: string;
  fileName: string;
  fileSize: number;
  chunksStored: number;
  qa?: any;
  document: Document;
}

interface DocumentState {
  documents: Document[];
  loading: boolean;
  error: string | null;
  uploadProgress: UploadProgress[];

  // Actions
  fetchDocuments: () => Promise<void>;
  uploadDocument: (
    file: File,
    onProgress?: (progress: number) => void
  ) => Promise<any>;
  deleteDocument: (docId: string) => Promise<void>;
  clearError: () => void;
  clearUploadProgress: (filename: string) => void;
  clearAllUploadProgress: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  loading: false,
  error: null,
  uploadProgress: [],

  fetchDocuments: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get("/ai/documents");
      set({
        documents: response.data.documents || [],
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.error || "Failed to fetch documents",
        loading: false,
      });
    }
  },

  uploadDocument: async (
    file: File,
    onProgress?: (progress: number) => void
  ) => {
    const filename = file.name;

    // Add upload progress tracking
    console.log("Starting upload for file:", filename);
    set((state) => ({
      uploadProgress: [
        ...state.uploadProgress.filter((p) => p.filename !== filename),
        { filename, progress: 0, status: "uploading" },
      ],
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("Sending file upload request:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        formDataEntries: Array.from(formData.entries()),
      });

      const response = await api.post("/ai/upload", formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );

            console.log("Upload progress for", filename, ":", progress + "%");
            // Update progress
            set((state) => ({
              uploadProgress: state.uploadProgress.map((p) =>
                p.filename === filename
                  ? {
                      ...p,
                      progress,
                      status: progress === 100 ? "processing" : "uploading",
                    }
                  : p
              ),
            }));

            if (onProgress) {
              onProgress(progress);
            }
          }
        },
      });

      // Mark as completed
      console.log("Marking upload as completed for file:", filename);
      set((state) => ({
        uploadProgress: state.uploadProgress.map((p) =>
          p.filename === filename
            ? { ...p, progress: 100, status: "completed" }
            : p
        ),
      }));

      // Refresh documents list
      await get().fetchDocuments();

      console.log("Upload response:", response);
      console.log("Upload response data:", response.data);
      return response;
    } catch (err: any) {
      console.error("Upload error:", err);
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        err.toString() ||
        "Upload failed";

      // Mark as error
      set((state) => ({
        uploadProgress: state.uploadProgress.map((p) =>
          p.filename === filename
            ? { ...p, status: "error", error: errorMessage }
            : p
        ),
        error: errorMessage,
      }));

      console.error(
        "Setting upload error state for file:",
        filename,
        "with error:",
        errorMessage
      );
      console.error("Full error object:", err);

      console.error("Throwing error for file:", filename);
      console.error("Final error object before throw:", err);
      throw err;
    }
  },

  deleteDocument: async (docId: string) => {
    try {
      set({ loading: true, error: null });
      await api.delete(`/ai/documents/${docId}`);

      // Remove from local state
      set((state) => ({
        documents: state.documents.filter((doc) => doc._id !== docId),
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.error || "Failed to delete document",
        loading: false,
      });
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearUploadProgress: (filename: string) => {
    set((state) => ({
      uploadProgress: state.uploadProgress.filter(
        (p) => p.filename !== filename
      ),
    }));
  },

  clearAllUploadProgress: () => {
    set({ uploadProgress: [] });
  },
}));
