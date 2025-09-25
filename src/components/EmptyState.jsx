import { MessageCircle } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <MessageCircle className="w-16 h-16 text-gray-400 mb-4 opacity-50" />
      <p className="text-gray-400 text-xl mb-2">Welcome to Ollama Chat</p>
      <p className="text-gray-500 max-w-md">
        Start a conversation, ask questions based on your knowledge base, or
        upload files to expand it.
      </p>
    </div>
  );
};

export default EmptyState;
