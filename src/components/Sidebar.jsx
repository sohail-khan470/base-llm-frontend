import { X, User, LogOut, Settings } from "lucide-react"; // lucide-react icons
import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuthStore } from "../store/auth-store";
import { useParams } from "react-router-dom";
import { useOrganizationStore } from "../store/organization-store";
export default function Sidebar({ isOpen, onClose, onSelectConversation }) {
  const [showProfile, setShowProfile] = useState(false);
  const { chats, fetchOrganizationChats } = useOrganizationStore();
  const { user, logout } = useAuthStore();

  const organizationId = user?.organization?.id;
  console.log(organizationId);
  const { id } = useParams();

  useEffect(() => {
    fetchOrganizationChats(organizationId);
  }, [user?.organization?.id]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
    }
  };

  return (
    <>
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

        {/* User info section */}
        <div className="mb-6 p-3 bg-white/10 rounded-xl border border-white/20">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user?.email}</p>
              <p className="text-gray-400 text-sm capitalize">{user?.role}</p>
            </div>
          </div>

          <div className="flex space-x-2">
            {/*
            <button
              onClick={() => setShowProfile(true)}
              className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 hover:text-white transition-colors duration-200"
            >
               <Settings className="w-4 h-4" />
              <span className="text-sm">Profile</span> 
            </button> */}
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 hover:text-red-200 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>

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

        {/* Organization info */}
        {user?.organization && (
          <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
              Organization
            </p>
            <p className="text-white text-sm font-medium truncate">
              {user.organization.name}
            </p>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
    </>
  );
}
