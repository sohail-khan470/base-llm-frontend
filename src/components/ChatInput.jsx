import { Send, MessageCircle } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const ChatInput = ({
  prompt,
  setPrompt,
  onSubmit,
  isLoading,
  fileUploadLoading,
}) => {
  const handleLocalSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading || fileUploadLoading) return;

    const currentPrompt = prompt;
    setPrompt("");

    onSubmit(e, currentPrompt);
  };

  return (
    <form onSubmit={handleLocalSubmit} className="flex gap-2 mb-4">
      <div className="flex-1 relative">
        <input
          type="text"
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your message here..."
          disabled={isLoading || fileUploadLoading}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <MessageCircle className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
        disabled={isLoading || fileUploadLoading || !prompt.trim()}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="border-white" />
            <span className="hidden md:inline text-sm sm:text-base">
              Sending...
            </span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5 transition-transform duration-150 group-hover:translate-x-1" />
            <span className="hidden md:inline font-medium text-sm sm:text-base">
              Send
            </span>
          </>
        )}
      </button>
    </form>
  );
};

export default ChatInput;
