import { Send, MessageCircle } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const ChatInput = ({
  prompt,
  setPrompt,
  onSubmit,
  isLoading,
  fileUploadLoading,
}) => {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 sm:gap-4 mb-4">
      <div className="flex-1 relative">
        <input
          type="text"
          className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 pr-10 sm:pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 hover:bg-white/15 text-sm sm:text-base"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your message here..."
          disabled={isLoading || fileUploadLoading}
        />
        <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </div>
      </div>
      <button
        type="submit"
        className="group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
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
            <Send className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" />
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
