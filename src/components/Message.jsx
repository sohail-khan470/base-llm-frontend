import { Bot, MessageCircle, Database } from "lucide-react";
import ReactMarkdown from "react-markdown";

const Message = ({ message }) => {
  const renderMessageContent = () => {
    if (message.role === "user") {
      return <p className="text-gray-100">{message.content}</p>;
    }

    if (message.isSystem || message.isError) {
      return <p className="text-gray-300">{message.content}</p>;
    }

    return (
      <ReactMarkdown components={markdownComponents}>
        {message.content}
      </ReactMarkdown>
    );
  };

  const getMessageIcon = () => {
    if (message.role === "user") {
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
      );
    }

    if (message.isSystem) {
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center">
          <Database className="w-6 h-6 text-white" />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <Bot className="w-6 h-6 text-white" />
      </div>
    );
  };

  const getMessageStyle = () => {
    if (message.role === "user") {
      return "bg-blue-500/10 border-blue-500/20 ml-auto";
    }

    if (message.isSystem) {
      return "bg-gray-500/10 border-gray-500/20";
    }

    if (message.isError) {
      return "bg-red-500/10 border-red-500/20";
    }

    return "bg-white/5 border-white/10";
  };

  return (
    <div
      className={`flex gap-4 animate-fade-in ${
        message.role === "user" ? "flex-row-reverse" : ""
      }`}
    >
      <div className="flex-shrink-0">{getMessageIcon()}</div>
      <div
        className={`flex-1 backdrop-blur-sm border rounded-2xl p-4 max-w-[80%] ${getMessageStyle()}`}
      >
        {renderMessageContent()}
      </div>
    </div>
  );
};

// Markdown components (extracted from original)
export const markdownComponents = {
  p: ({ node, ...props }) => (
    <p
      className="mb-3 text-gray-100 leading-relaxed text-sm sm:text-base"
      {...props}
    />
  ),
  code: ({ inline, children, className, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";
    if (!inline) {
      return (
        <div className="my-4 rounded-xl overflow-hidden border border-purple-500/30 shadow-xl">
          <div className="bg-purple-800/40 backdrop-blur-sm px-4 py-2 border-b border-purple-500/30 flex items-center justify-between">
            <span className="text-purple-200 text-xs font-medium uppercase tracking-wide">
              {language || "code"}
            </span>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/70"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400/70"></div>
              <div className="w-3 h-3 rounded-full bg-green-400/70"></div>
            </div>
          </div>
          <pre className="bg-slate-900/90 backdrop-blur-sm p-4 overflow-x-auto">
            <code
              className="text-gray-100 font-mono text-sm leading-relaxed block"
              {...props}
            >
              {String(children)
                .split("\n")
                .map((line, i) => (
                  <div key={i} className="flex">
                    <span className="text-gray-500 select-none mr-4 text-xs flex-shrink-0 w-8 text-right">
                      {i + 1}
                    </span>
                    <span className="syntax-highlight">{line}</span>
                  </div>
                ))}
            </code>
          </pre>
        </div>
      );
    }
    return (
      <code
        className="bg-purple-900/40 backdrop-blur-sm text-purple-200 px-2 py-1 rounded-md font-mono text-sm border border-purple-500/20"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ node, ...props }) => props.children,
  h1: ({ node, ...props }) => (
    <h1 className="text-xl sm:text-2xl font-bold text-white mb-4" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2
      className="text-lg sm:text-xl font-semibold text-white mb-3"
      {...props}
    />
  ),
  h3: ({ node, ...props }) => (
    <h3
      className="text-base sm:text-lg font-medium text-white mb-2"
      {...props}
    />
  ),
  ul: ({ node, ...props }) => (
    <ul
      className="list-disc list-inside mb-3 text-gray-100 space-y-1 text-sm sm:text-base"
      {...props}
    />
  ),
  ol: ({ node, ...props }) => (
    <ol
      className="list-decimal list-inside mb-3 text-gray-100 space-y-1 text-sm sm:text-base"
      {...props}
    />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="border-l-4 border-purple-500 pl-4 italic text-gray-300 my-3 text-sm sm:text-base"
      {...props}
    />
  ),
};

export default Message;
