import { Bot } from "lucide-react";

const ThinkingMessage = () => {
  return (
    <div className="flex gap-4 animate-fade-in">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="flex-1 backdrop-blur-sm border rounded-2xl p-4 max-w-[80%] bg-white/5 border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-gray-300">AI is thinking</span>
          <div className="flex gap-1">
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThinkingMessage;
