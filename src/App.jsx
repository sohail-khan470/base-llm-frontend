import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { EventSourcePolyfill } from "event-source-polyfill";
import LoadingSpinner from "./LoadingSpinner";
import { Send, Bot, Sparkles, MessageCircle } from "lucide-react";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const responseRef = useRef(null);
  const abortCtrlRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse("");

    // Abort previous stream if exists
    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();
    }

    abortCtrlRef.current = new AbortController();

    const sseUrl = "http://localhost:3008/api/ai/chat";
    const body = JSON.stringify({ prompt });

    try {
      const response = await fetch(sseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: abortCtrlRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setLoading(false);
          abortCtrlRef.current = null;
          break;
        }
        setResponse((prev) => prev + decoder.decode(value));
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Stream error:", err);
        setLoading(false);
      }
      abortCtrlRef.current = null;
    }

    setPrompt("");
  };

  // Auto-scroll
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen max-w-7xl mx-auto w-full p-2 sm:p-4 lg:p-8">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="relative">
              <Bot className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-blue-400" />
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ollama Chat
            </h1>
          </div>
          <p className="text-gray-300 text-sm sm:text-base lg:text-lg">
            Powered by AI • Real-time streaming responses
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {/* Messages Area */}
          <div
            ref={responseRef}
            className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4"
          >
            {!response && !loading ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-400 mb-4 opacity-50" />
                <p className="text-gray-400 text-xl mb-2">
                  Welcome to Ollama Chat
                </p>
                <p className="text-gray-500">
                  Start a conversation by typing your message below
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* AI Response */}
                <div className="flex gap-4 animate-fade-in">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    {response ? (
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => (
                            <p
                              className="mb-3 text-gray-100 leading-relaxed text-sm sm:text-base"
                              {...props}
                            />
                          ),
                          code: ({ inline, children, className, ...props }) => {
                            const match = /language-(\w+)/.exec(
                              className || ""
                            );
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
                                            <span className="syntax-highlight">
                                              {line}
                                            </span>
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
                            <h1
                              className="text-xl sm:text-2xl font-bold text-white mb-4"
                              {...props}
                            />
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
                        }}
                      >
                        {response}
                      </ReactMarkdown>
                    ) : loading ? (
                      <div className="flex items-center gap-3">
                        <LoadingSpinner size="sm" className="border-blue-400" />
                        <span className="text-gray-300">AI is thinking...</span>
                      </div>
                    ) : null}
                    {loading && response && (
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-300"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 lg:p-6 border-t border-white/10 bg-white/5">
            <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 pr-10 sm:pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 hover:bg-white/15 text-sm sm:text-base"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type your message here..."
                  disabled={loading}
                />
                <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
              </div>
              <button
                type="submit"
                className="group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                disabled={loading || !prompt.trim()}
              >
                {loading ? (
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

            {/* Status indicator */}
            <div className="flex items-center justify-center mt-3 sm:mt-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                <div
                  className={`w-2 h-2 rounded-full ${
                    loading ? "bg-yellow-500 animate-pulse" : "bg-green-500"
                  }`}
                ></div>
                <span>{loading ? "AI is responding..." : "Ready to chat"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Press{" "}
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Enter</kbd>{" "}
            to send •
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs ml-1">
              Esc
            </kbd>{" "}
            to clear
          </p>
        </div>
      </div>

      {/* Floating particles animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-float {
          animation: float linear infinite;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }

        /* Syntax highlighting for code */
        .syntax-highlight {
          color: #e2e8f0;
        }

        /* Keywords */
        .syntax-highlight:has-text("def"),
        .syntax-highlight:has-text("function"),
        .syntax-highlight:has-text("const"),
        .syntax-highlight:has-text("let"),
        .syntax-highlight:has-text("var"),
        .syntax-highlight:has-text("class"),
        .syntax-highlight:has-text("import"),
        .syntax-highlight:has-text("export"),
        .syntax-highlight:has-text("return"),
        .syntax-highlight:has-text("if"),
        .syntax-highlight:has-text("else"),
        .syntax-highlight:has-text("for"),
        .syntax-highlight:has-text("while") {
          color: #c084fc;
        }

        /* Better responsive design */
        @media (max-width: 640px) {
          .chat-container {
            margin: 0.5rem;
            border-radius: 1rem;
          }
        }

        @media (min-width: 1024px) {
          .chat-container {
            min-height: 80vh;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
