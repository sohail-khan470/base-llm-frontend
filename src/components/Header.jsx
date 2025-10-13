import { Bot, Sparkles, Trash2, Menu } from "lucide-react";

const Header = ({ collectionStatus, onClearCollection, onMenuClick }) => {
  return (
    <div className="relative flex items-center justify-center mb-4 sm:mb-6 lg:mb-8">
      {/* Left Section */}
      <div className="absolute left-4 flex items-center gap-2 sm:gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
        )}
        <div className="relative">
          <Bot className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-blue-400" />
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
        </div>
      </div>

      {/* Center Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-center">
        Nova Chat
      </h1>

      {/* Right Section */}
      <div className="absolute right-4 flex items-center gap-2">
        {collectionStatus.exists && (
          <button
            onClick={onClearCollection}
            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors"
            title="Clear knowledge base"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
