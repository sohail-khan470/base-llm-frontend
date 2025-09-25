import { X } from "lucide-react"; // icon library you already have (lucide-react)
import { useEffect, useState } from "react";
import api from "../api/api";
export default function Sidebar({ isOpen, onClose, onSelectConversation }) {
  const [chats, setChats] = useState([]);

  console.log(chats);
  useEffect(() => {
    async function fetchChats() {
      const allChats = await api.get("/ai/chats");
      setChats(allChats);
      setChats(allChats);
    }
    fetchChats();
  }, []);

  return (
    <div
      className={`fixed md:static top-0 left-0 h-full w-64 bg-gray-900/95 backdrop-blur-lg border-r border-white/10 p-4 flex flex-col transform transition-transform duration-300 z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      {/* Close button (only visible on mobile) */}
      <button
        className="md:hidden self-end text-gray-400 hover:text-white mb-4"
        onClick={onClose}
      >
        <X size={24} />
      </button>

      <h2 className="text-white text-xl font-bold mb-4">Chats</h2>

      <ul className="space-y-2 flex-1 overflow-y-auto">
        <li
          className="p-2 rounded-lg hover:bg-white/20 cursor-pointer text-gray-200"
          onClick={() => onSelectConversation("new")}
        >
          + New Chat
        </li>
        <li
          className="p-2 rounded-lg hover:bg-white/20 cursor-pointer text-gray-200"
          onClick={() => onSelectConversation("history1")}
        >
          Conversation 1
        </li>
        <li
          className="p-2 rounded-lg hover:bg-white/20 cursor-pointer text-gray-200"
          onClick={() => onSelectConversation("history2")}
        >
          Conversation 2
        </li>
      </ul>
    </div>
  );
}
