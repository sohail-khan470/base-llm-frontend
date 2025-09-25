const StatusBar = ({ chatLoading, fileUploadLoading, collectionStatus }) => {
  return (
    <div className="flex items-center justify-between mt-3 sm:mt-4">
      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
        <div
          className={`w-2 h-2 rounded-full ${
            chatLoading || fileUploadLoading
              ? "bg-yellow-500 animate-pulse"
              : "bg-green-500"
          }`}
        ></div>
        <span>
          {chatLoading
            ? "Processing..."
            : fileUploadLoading
            ? "Uploading..."
            : "Ready to chat"}
        </span>
      </div>

      <div className="text-xs text-gray-500">
        {collectionStatus.exists ? (
          <span>Knowledge base: {collectionStatus.count} embeddings</span>
        ) : (
          <span>No knowledge base yet</span>
        )}
      </div>
    </div>
  );
};

export default StatusBar;
