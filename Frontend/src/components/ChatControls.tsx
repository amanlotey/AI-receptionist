import React from "react";

interface ChatControlsProps {
  isConnected: boolean;
  startChat: () => void;
  endChat: () => void;
}

const ChatControls: React.FC<ChatControlsProps> = ({
  isConnected,
  startChat,
  endChat,
}) => (
  <>
    {!isConnected ? (
      <button
        onClick={startChat}
        className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Start Voice Chat
      </button>
    ) : (
      <button
        onClick={endChat}
        className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
      >
        End Chat
      </button>
    )}
  </>
);

export default ChatControls;
