import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleSelectConversation = (chatId) => {
    if (chatId === "new") {
      navigate("/");
    } else {
      navigate(`/chats/${chatId}`);
    }
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Menu button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-lg text-white hover:bg-gray-800"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu size={20} />
      </button>

      <div className="relative z-10 flex h-screen max-w-7xl mx-auto w-full p-2 sm:p-4 lg:p-8">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelectConversation={handleSelectConversation}
        />
        <div className="flex flex-col flex-1 ml-4">{children}</div>
      </div>
    </div>
  );
}
