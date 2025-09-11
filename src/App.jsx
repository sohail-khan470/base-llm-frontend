import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Bot,
  Sparkles,
  MessageCircle,
  Upload,
  Database,
  Trash2,
} from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [collectionStatus, setCollectionStatus] = useState({
    count: 0,
    exists: false,
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const typingTimeoutRef = useRef(null);

  const responseRef = useRef(null);
  const abortCtrlRef = useRef(null);

  // Handle idle timeout for space effect
  useEffect(() => {
    const handleActivity = () => {
      setIsTyping(true);
      setIsIdle(false);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setIsIdle(true);
      }, 10000);
    };

    window.addEventListener("keydown", handleActivity);
    window.addEventListener("mousemove", handleActivity);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setIsIdle(true);
    }, 10000);

    return () => {
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("mousemove", handleActivity);
      clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // Fetch collection status on component mount
  useEffect(() => {
    fetchCollectionStatus();
  }, []);

  const fetchCollectionStatus = async () => {
    try {
      const response = await fetch(
        "http://localhost:3008/api/ai/collection-status"
      );
      if (response.ok) {
        const data = await response.json();
        setCollectionStatus(data);
      }
    } catch (err) {
      console.error("Error fetching collection status:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || chatLoading) return;

    setChatLoading(true);
    setCurrentResponse("");

    const userMessage = {
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };
    setConversations((prev) => [...prev, userMessage]);

    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();
    }

    abortCtrlRef.current = new AbortController();

    const sseUrl = "http://localhost:3008/api/ai/chat";
    const body = JSON.stringify({
      prompt,
      useContext: true,
    });

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
      let aiResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          const aiMessage = {
            role: "assistant",
            content: aiResponse,
            timestamp: new Date(),
          };
          setConversations((prev) => [...prev, aiMessage]);
          setCurrentResponse("");
          setChatLoading(false);
          abortCtrlRef.current = null;
          break;
        }

        const chunk = decoder.decode(value);
        aiResponse += chunk;
        setCurrentResponse(aiResponse);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Stream error:", err);
        const errorMessage = {
          role: "assistant",
          content: "Sorry, I encountered an error processing your request.",
          timestamp: new Date(),
          isError: true,
        };
        setConversations((prev) => [...prev, errorMessage]);
        setChatLoading(false);
      }
      abortCtrlRef.current = null;
    }

    setPrompt("");
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file || fileUploadLoading) return;

    setFileUploadLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:3008/api/ai/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Upload failed with status ${response.status}`
        );
      }

      const result = await response.json();
      fetchCollectionStatus();

      const successMessage = {
        role: "system",
        content: `File "${file.name}" uploaded successfully! ${result.chunksStored} chunks processed.`,
        timestamp: new Date(),
        isSystem: true,
      };
      setConversations((prev) => [...prev, successMessage]);
      setFile(null);

      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error("File upload error:", err);
      const errorMessage = {
        role: "system",
        content: `Error: ${err.message}`,
        timestamp: new Date(),
        isError: true,
      };
      setConversations((prev) => [...prev, errorMessage]);
    } finally {
      setFileUploadLoading(false);
    }
  };

  const clearCollection = async () => {
    if (
      !window.confirm("Are you sure you want to clear all knowledge base data?")
    )
      return;

    try {
      const response = await fetch(
        "http://localhost:3008/api/ai/clear-collection",
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setCollectionStatus({ count: 0, exists: false });
        const successMessage = {
          role: "system",
          content: "Knowledge base cleared successfully.",
          timestamp: new Date(),
          isSystem: true,
        };
        setConversations((prev) => [...prev, successMessage]);
      }
    } catch (err) {
      console.error("Error clearing collection:", err);
      const errorMessage = {
        role: "system",
        content: `Error clearing knowledge base: ${err.message}`,
        timestamp: new Date(),
        isError: true,
      };
      setConversations((prev) => [...prev, errorMessage]);
    }
  };

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [conversations, currentResponse]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div
        className={`background-layer ${
          isTyping ? "bg-black" : isIdle ? "space-background" : "bg-black"
        }`}
      >
        {isIdle && (
          <>
            {[...Array(30)].map((_, i) => (
              <div key={`star-${i}`} className="star"></div>
            ))}
            {[...Array(10)].map((_, i) => (
              <div key={`planet-${i}`} className="planet"></div>
            ))}
          </>
        )}
      </div>
      <div className="relative z-10 flex flex-col h-screen max-w-7xl mx-auto w-full p-2 sm:p-4 lg:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <Bot className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-blue-400" />
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ollama Chat
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {collectionStatus.exists && (
              <button
                onClick={clearCollection}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors"
                title="Clear knowledge base"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            )}
          </div>
        </div>

        <p className="text-gray-300 text-sm sm:text-base lg:text-lg text-center mb-6">
          Powered by AI • Real-time streaming responses • ChromaDB knowledge
          base
        </p>

        <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div
            ref={responseRef}
            className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4"
          >
            {conversations.length === 0 && !chatLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-400 mb-4 opacity-50" />
                <p className="text-gray-400 text-xl mb-2">
                  Welcome to Ollama Chat
                </p>
                <p className="text-gray-500 max-w-md">
                  Start a conversation, ask questions based on your knowledge
                  base, or upload files to expand it.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {conversations.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-4 animate-fade-in ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {message.role === "user" ? (
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-white" />
                          </div>
                        ) : message.isSystem ? (
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center">
                            <Database className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Bot className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div
                        className={`flex-1 backdrop-blur-sm border rounded-2xl p-4 max-w-[80%] ${
                          message.role === "user"
                            ? "bg-blue-500/10 border-blue-500/20 ml-auto"
                            : message.isSystem
                            ? "bg-gray-500/10 border-gray-500/20"
                            : message.isError
                            ? "bg-red-500/10 border-red-500/20"
                            : "bg-white/5 border-white/10"
                        }`}
                      >
                        {message.role === "user" ? (
                          <p className="text-gray-100">{message.content}</p>
                        ) : message.isSystem || message.isError ? (
                          <p className="text-gray-300">{message.content}</p>
                        ) : (
                          <ReactMarkdown
                            components={{
                              p: ({ node, ...props }) => (
                                <p
                                  className="mb-3 text-gray-100 leading-relaxed text-sm sm:text-base"
                                  {...props}
                                />
                              ),
                              code: ({
                                inline,
                                children,
                                className,
                                ...props
                              }) => {
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
                            {message.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {chatLoading && currentResponse && (
                  <div className="flex gap-4 animate-fade-in">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
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
                        {currentResponse}
                      </ReactMarkdown>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-300"></div>
                      </div>
                    </div>
                  </div>
                )}

                {chatLoading && !currentResponse && (
                  <div className="flex items-center gap-3">
                    <LoadingSpinner size="sm" className="border-blue-400" />
                    <span className="text-gray-300">AI is thinking...</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-3 sm:p-4 lg:p-6 border-t border-white/10 bg-white/5">
            <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-4 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 pr-10 sm:pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 hover:bg-white/15 text-sm sm:text-base"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type your message here..."
                  disabled={chatLoading || fileUploadLoading}
                />
                <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
              </div>
              <button
                type="submit"
                className="group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                disabled={chatLoading || fileUploadLoading || !prompt.trim()}
              >
                {chatLoading ? (
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

            <form onSubmit={handleFileUpload} className="flex gap-2 sm:gap-4">
              <div className="flex-1 relative">
                <input
                  type="file"
                  accept=".pdf,.txt,.docx,.csv,.xlsx,.xls,.md"
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 hover:bg-white/15 text-sm sm:text-base"
                  onChange={(e) => {
                    const selectedFile = e.target.files[0];
                    console.log("File selected:", selectedFile);
                    if (selectedFile) {
                      // REMOVE the frontend validation - let backend handle it
                      setFile(selectedFile);
                    } else {
                      setFile(null);
                    }
                  }}
                  disabled={chatLoading || fileUploadLoading}
                />
                <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
              </div>
              <button
                type="submit"
                className="group bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 hover:from-green-700 hover:via-teal-700 hover:to-blue-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                disabled={chatLoading || fileUploadLoading || !file}
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
                  <span>
                    Knowledge base: {collectionStatus.count} embeddings
                  </span>
                ) : (
                  <span>No knowledge base yet</span>
                )}
              </div>
            </div>
          </div>
        </div>

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
    </div>
  );
}

export default App;
