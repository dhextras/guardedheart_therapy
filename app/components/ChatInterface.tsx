import React, { useRef, useEffect } from "react";
import type { ChatInterfaceProps } from "~/types/socket.types";

export default function ChatInterface({
  messages,
  inputMessage,
  onLeave,
  onInputChange,
  onSendMessage,
  otherPersonName,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="flex flex-col h-full rounded-lg bg-surface">
      <div className="flex justify-between items-center border-b border-custom px-4 py-2 rounded-t-lg">
        <h2 className="text-lg font-semibold">{otherPersonName}</h2>
        <button
          onClick={onLeave}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md transition-colors duration-300"
        >
          End
        </button>
      </div>
      <div className="flex-grow overflow-y-auto max-h-chat min-h-chat p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.name === otherPersonName ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`chat-bubbles rounded-lg py-2 px-4 text-white ${
                msg.name === otherPersonName
                  ? "bg-gray-700"
                  : "bg-base-no-hover"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center border-t border-custom p-2 rounded-b-lg">
        <input
          type="text"
          value={inputMessage}
          onChange={onInputChange}
          placeholder="Type your message..."
          className="flex-grow bg-background border border-custom rounded-md py-2 px-3 focus:outline-none focus:ring-2 text-black"
        />
        <button
          onClick={onSendMessage}
          className="ml-2 bg-base-no-hover text-white font-semibold py-2.5 px-4 rounded-md transition-colors duration-300 flex items-center hover:outline-none hover:ring-2 justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
