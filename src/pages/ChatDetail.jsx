import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Message from "../components/Message";
import BackgroundEffects from "../components/BackgroundEffects";
import LoadingSpinner from "../components/LoadingSpinner";
import "../App.css";
import api from "../api/api";

export default function ChatDetail() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchChat() {
      try {
        console.log("Fetching chat with ID:", chatId);
        const data = await api.get(`/ai/chats/${chatId}`);
        console.log("Chat data received:", data);
        setChat(data.chat);
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to fetch chat:", err);
        setError(`Failed to load chat: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    }
    if (chatId) {
      fetchChat();
    }
  }, [chatId]);

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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <BackgroundEffects isTyping={false} isIdle={false} />

      <div className="relative z-10 flex h-screen max-w-7xl mx-auto w-full p-2 sm:p-4 lg:p-8">
        <div className="flex flex-col flex-1">
          <Header
            collectionStatus={{ count: 0, exists: false }}
            onClearCollection={() => {}}
          />

          <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <button
                onClick={() => navigate("/")}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-2"
              >
                ← Back to Chats
              </button>
              <h2 className="text-white text-xl font-bold">
                {chat?.title || "Chat Details"}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {messages.length} message{messages.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
