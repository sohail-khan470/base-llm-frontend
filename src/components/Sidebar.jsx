import { X } from "lucide-react"; // lucide-react icons
import { useEffect, useState } from "react";
import api from "../api/api";

export default function Sidebar({ isOpen, onClose, onSelectConversation }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await api.get("/ai/chats"); // axios returns { data }
        console.log(res);
        setChats(res); // use res.data
      } catch (err) {
        console.error(" Failed to fetch chats:", err);
      }
    }
    fetchChats();
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-900/95 backdrop-blur-lg border-r border-white/10 p-4 flex flex-col transform transition-transform duration-300 z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Close button */}
      <button
        className="self-end text-gray-400 hover:text-white mb-4"
        onClick={onClose}
      >
        <X size={24} />
      </button>

      <h2 className="text-white text-xl font-bold mb-4">Chats</h2>

      <ul className="space-y-2 flex-1 overflow-y-auto">
        {/* New chat button */}
        <li
          className="p-2 rounded-lg hover:bg-white/20 cursor-pointer text-gray-200"
          onClick={() => onSelectConversation("new")}
        >
          + New Chat
        </li>

        {/* Existing chats */}
        {chats.length > 0 ? (
          chats.map((chat) => (
            <li
              key={chat._id}
              className="p-2 rounded-lg hover:bg-white/20 cursor-pointer text-gray-200 truncate"
              onClick={() => onSelectConversation(chat._id)}
            >
              {chat.title || "Untitled Chat"}
            </li>
          ))
        ) : (
          <li className="p-2 text-gray-500 italic">No chats yet</li>
        )}
      </ul>
    </div>
  );
}
