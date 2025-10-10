import { Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { markdownComponents } from "./Message";
import LoadingSpinner from "./LoadingSpinner";

const StreamingMessage = ({ currentResponse, isLoading }) => {
  return (
    <div className="flex gap-4 animate-fade-in">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 max-w-[90%] sm:max-w-[80%] break-words">
        <ReactMarkdown components={markdownComponents}>
          {currentResponse}
        </ReactMarkdown>
        {isLoading && <LoadingSpinner />}
      </div>
    </div>
  );
};

export default StreamingMessage;
