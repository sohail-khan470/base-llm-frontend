import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Message from "../components/Message";
import StreamingMessage from "../components/StreamingMessage";
import ThinkingMessage from "../components/ThinkingMessage";
import ChatInput from "../components/ChatInput";
import BackgroundEffects from "../components/BackgroundEffects";
import LoadingSpinner from "../components/LoadingSpinner";
import "../App.css";
import api from "../api/api";
import { useChatListStore } from "../store/chat-list-store";
import { useChatStore } from "../store/chat-store";
import { useMessageStore } from "../store/message-store";

export default function ChatDetail() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const responseRef = useRef(null);
  const abortCtrlRef = useRef(null);
  const API_BASE = `/api/ai/chat`;
  const { chatId } = useParams();
  // const { fetchMessagesByChat, loading, error } = useMessageStore();
  const { chat, fetchChat, messages, loading, error } = useChatStore();

  useEffect(() => {
    if (chatId) {
      fetchChat(chatId);
    }
    return;
  }, [chatId, fetchChat]);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [messages, currentResponse]);

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
    // Note: We'll let the backend handle message saving
    // setMessages((prev) => [...prev, userMessage]);

    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();
    }
    abortCtrlRef.current = new AbortController();

    const sseUrl = API_BASE;
    const body = JSON.stringify({
      prompt,
      chatId,
      useContext: true,
      createNewChat: false,
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
            // Messages will be updated when we refetch the chat
            // setMessages((prev) => [...prev, aiMessage]);
          }
          setCurrentResponse("");
          setChatLoading(false);
          abortCtrlRef.current = null;
          // Refetch chat to get updated messages
          fetchChat(chatId);
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
              // Messages will be updated when we refetch the chat
              // setMessages((prev) => [...prev, aiMessage]);
            }
            setCurrentResponse("");
            setChatLoading(false);
            abortCtrlRef.current = null;
            // Refetch chat to get updated messages
            fetchChat(chatId);
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
        // Handle error message display differently
        console.error("Chat error:", err);
        setChatLoading(false);
      }
      abortCtrlRef.current = null;
    }

    setPrompt("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <BackgroundEffects isTyping={false} isIdle={false} />

      <Header
        collectionStatus={{ count: 0, exists: false }}
        onClearCollection={() => {}}
      />

      <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-white text-xl font-bold">
            {chat?.title || "Chat Details"}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div
          ref={responseRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4"
        >
          {messages.length > 0 ? (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <Message key={message._id || index} message={message} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-8">
              <p>No messages in this chat yet.</p>
              {chat && <p className="text-sm mt-2">Chat ID: {chat._id}</p>}
            </div>
          )}

          {chatLoading && currentResponse && (
            <StreamingMessage
              currentResponse={currentResponse}
              isLoading={chatLoading}
            />
          )}

          {chatLoading && !currentResponse && <ThinkingMessage />}
        </div>

        <div className="p-3 sm:p-4 lg:p-6 border-t border-white/10 bg-white/5">
          <ChatInput
            prompt={prompt}
            setPrompt={setPrompt}
            onSubmit={handleSubmit}
            isLoading={chatLoading}
            fileUploadLoading={false}
          />
        </div>
      </div>
    </>
  );
}
