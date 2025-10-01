import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Message from "../components/Message";
import StreamingMessage from "../components/StreamingMessage";
import ThinkingMessage from "../components/ThinkingMessage";
import ChatInput from "../components/ChatInput";
import FileUpload from "../components/FileUpload";
import StatusBar from "../components/StatusBar";
import EmptyState from "../components/EmptyState";
import BackgroundEffects from "../components/BackgroundEffects";
import LoadingSpinner from "../components/LoadingSpinner";
import "../App.css";
import api from "../api/api";
import { useDocumentStore } from "../store/document-store";

function Home() {
  const [prompt, setPrompt] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [collectionStatus, setCollectionStatus] = useState({
    count: 0,
    exists: false,
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [isNewChat, setIsNewChat] = useState(true);
  const typingTimeoutRef = useRef(null);

  const responseRef = useRef(null);
  const abortCtrlRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3008/api";

  const { uploadProgress } = useDocumentStore();
  const fileUploadLoading = uploadProgress.some(
    (p) => p.status === "uploading"
  );

  // Fetch collection status on mount
  useEffect(() => {
    fetchCollectionStatus();
  }, []);

  // Reset state when navigating to home
  useEffect(() => {
    if (location.pathname === "/") {
      setConversations([]);
      setCurrentResponse("");
      setIsNewChat(true);
    }
  }, [location.pathname]);

  const fetchCollectionStatus = async () => {
    try {
      const data = await api.get("/ai/collection-status");
      setCollectionStatus(data);
    } catch (err) {
      console.error("Error fetching collection status:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || chatLoading) return;

    setChatLoading(true);
    setCurrentResponse("");

    // Mark that we're no longer in "new chat" mode since user is sending a message
    if (isNewChat) {
      setIsNewChat(false);
    }

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

    const sseUrl = `${API_BASE}/ai/chat`;
    const body = JSON.stringify({
      prompt,
      useContext: true,
      createNewChat: isNewChat,
    });

    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(sseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body,
        signal: abortCtrlRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (aiResponse.trim()) {
            const aiMessage = {
              role: "assistant",
              content: aiResponse,
              timestamp: new Date(),
            };
            setConversations((prev) => [...prev, aiMessage]);
          }
          setCurrentResponse("");
          setChatLoading(false);
          abortCtrlRef.current = null;
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const payload = line.replace("data:", "").trim();

          if (payload === "[DONE]") {
            if (aiResponse.trim()) {
              const aiMessage = {
                role: "assistant",
                content: aiResponse,
                timestamp: new Date(),
              };
              setConversations((prev) => [...prev, aiMessage]);
            }
            setCurrentResponse("");
            setChatLoading(false);
            abortCtrlRef.current = null;
            return;
          }

          try {
            const data = JSON.parse(payload);
            if (data.token !== undefined) {
              aiResponse += data.token;
              setCurrentResponse(aiResponse);
            } else if (data.chatId) {
              // Handle chatId if needed
              console.log("Received chatId:", data.chatId);
            }
          } catch (err) {
            console.error("Failed to parse SSE payload:", payload, err);
          }
        }
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
        console.log("Adding error message to conversations");
        setConversations((prev) => [...prev, errorMessage]);
        setChatLoading(false);
      }
      abortCtrlRef.current = null;
    }

    setPrompt("");
  };

  const handleUploadSuccess = (result, file) => {
    console.log("Upload success:", result);
    console.log("Success result data:", result.data);
    fetchCollectionStatus();
    console.log(
      "Creating success message for file:",
      file.name,
      "with chunks:",
      result.data?.chunksStored || 0
    );
    console.log("Upload result structure:", result);
    console.log(
      "Chunks stored:",
      result?.chunksStored || result?.data?.chunksStored || 0
    );
    const successMessage = {
      role: "system",
      content: `File "${file.name}" uploaded successfully! ${
        result?.chunksStored || result?.data?.chunksStored || 0
      } chunks processed.`,
      timestamp: new Date(),
      isSystem: true,
    };
    setConversations((prev) => [...prev, successMessage]);
  };

  const handleUploadError = (err) => {
    console.error("File upload error:", err);
    console.error("Error details:", {
      message: err.message,
      response: err.response,
      status: err.response?.status,
      data: err.response?.data,
      stack: err.stack,
    });
    console.log("Creating error message for upload failure");
    const errorMessage = {
      role: "system",
      content: `Upload Error: ${
        err.response?.data?.error || err.message || err
      }`,
      timestamp: new Date(),
      isError: true,
    };
    setConversations((prev) => [...prev, errorMessage]);
  };

  const clearCollection = async () => {
    if (
      !window.confirm("Are you sure you want to clear all knowledge base data?")
    )
      return;

    try {
      await api.post("/ai/clear-collection");
      setCollectionStatus({ count: 0, exists: false });

      const successMessage = {
        role: "system",
        content: "Knowledge base cleared successfully.",
        timestamp: new Date(),
        isSystem: true,
      };
      setConversations((prev) => [...prev, successMessage]);
    } catch (err) {
      console.error("Error clearing collection:", err);
      const errorMessage = {
        role: "system",
        content: `Error clearing knowledge base: ${err}`,
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
    <>
      <BackgroundEffects isTyping={isTyping} isIdle={isIdle} />

      <Header
        collectionStatus={collectionStatus}
        onClearCollection={clearCollection}
      />
      <p className="text-gray-300 text-sm sm:text-base lg:text-lg text-center mb-6">
        Powered by AI • Real-time streaming responses • ChromaDB knowledge base
      </p>
      <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div
          ref={responseRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4"
        >
          {conversations.length === 0 && !chatLoading ? (
            <EmptyState />
          ) : (
            <>
              <div className="space-y-6">
                {conversations.map((message, index) => (
                  <Message key={index} message={message} />
                ))}
              </div>

              {chatLoading && currentResponse && (
                <StreamingMessage
                  currentResponse={currentResponse}
                  isLoading={chatLoading}
                />
              )}

              {chatLoading && !currentResponse && <ThinkingMessage />}
            </>
          )}
        </div>

        <div className="p-3 sm:p-4 lg:p-6 border-t border-white/10 bg-white/5">
          <ChatInput
            prompt={prompt}
            setPrompt={setPrompt}
            onSubmit={handleSubmit}
            isLoading={chatLoading}
            fileUploadLoading={fileUploadLoading}
          />

          <FileUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            isLoading={chatLoading}
          />

          <StatusBar
            chatLoading={chatLoading}
            fileUploadLoading={fileUploadLoading}
            collectionStatus={collectionStatus}
          />
        </div>
      </div>
      <div className="text-center mt-6">
        <p className="text-gray-400 text-sm">
          Press{" "}
          <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Enter</kbd> to
          send •
          <kbd className="px-2 py-1 bg-white/10 rounded text-xs ml-1">Esc</kbd>{" "}
          to clear
        </p>
      </div>
    </>
  );
}

export default Home;
