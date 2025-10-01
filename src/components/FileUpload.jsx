import { Upload } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import { useDocumentStore } from "../store/document-store";
import { useState } from "react";

const FileUpload = ({ onUploadSuccess, onUploadError, isLoading }) => {
  const [file, setFile] = useState(null);
  const { uploadDocument, uploadProgress } = useDocumentStore();
  const fileUploadLoading = uploadProgress.some(
    (p) => p.status === "uploading"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || fileUploadLoading) return;

    console.log("FileUpload component - Starting upload for file:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    try {
      const result = await uploadDocument(file);
      console.log("Upload successful:", result);
      console.log("Result data:", result.data);
      onUploadSuccess && onUploadSuccess(result, file);
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error("Upload component error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
        stack: err.stack,
      });
      onUploadError && onUploadError(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-4">
      <div className="flex-1 relative">
        <input
          type="file"
          accept=".pdf,.txt,.docx,.csv,.xlsx,.xls,.md"
          className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 hover:bg-white/15 text-sm sm:text-base"
          onChange={(e) => {
            const selectedFile = e.target.files[0];
            if (selectedFile) {
              setFile(selectedFile);
            } else {
              setFile(null);
            }
          }}
          disabled={isLoading || fileUploadLoading}
        />
        <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
          <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </div>
      </div>
      <button
        type="submit"
        className="group bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 hover:from-green-700 hover:via-teal-700 hover:to-blue-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
        disabled={isLoading || fileUploadLoading}
      >
        {fileUploadLoading ? (
          <>
            <LoadingSpinner size="sm" className="border-white" />
            <span className="hidden md:inline text-sm sm:text-base">
              Uploading...
            </span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" />
            <span className="hidden md:inline font-medium text-sm sm:text-base">
              Upload
            </span>
          </>
        )}
      </button>
    </form>
  );
};

export default FileUpload;
