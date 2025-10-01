import { Upload, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import { useDocumentStore } from "../store/document-store";
import { useState } from "react";

const FileUpload = ({ onUploadSuccess, onUploadError, isLoading }) => {
  const [file, setFile] = useState(null);
  const { uploadDocument, uploadProgress, clearUploadProgress } =
    useDocumentStore();
  const fileUploadLoading = uploadProgress.some(
    (p) => p.status === "uploading"
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case "uploading":
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      case "processing":
        return <FileText className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "uploading":
        return "Uploading...";
      case "processing":
        return "Processing...";
      case "completed":
        return "Completed";
      case "error":
        return "Failed";
      default:
        return "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

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
    <>
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

      {/* Upload Progress Indicators */}
      {uploadProgress.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadProgress.map((progress) => (
            <div
              key={progress.filename}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(progress.status)}
                  <span className="text-white text-sm font-medium truncate">
                    {progress.filename}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/70 text-xs">
                    {getStatusText(progress.status)}
                  </span>
                  <button
                    onClick={() => clearUploadProgress(progress.filename)}
                    className="text-white/50 hover:text-white/70 text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress.status === "error"
                      ? "bg-red-500"
                      : progress.status === "completed"
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${progress.progress}%` }}
                />
              </div>

              {/* Progress Text */}
              <div className="flex justify-between items-center mt-1">
                <span className="text-white/60 text-xs">
                  {progress.progress}%
                </span>
                {progress.error && (
                  <span className="text-red-400 text-xs truncate ml-2">
                    {progress.error}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default FileUpload;
