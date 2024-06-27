import type { ChatInterfaceProps } from "~/types/socket.types";

export default function ChatInterface({
  messages,
  inputMessage,
  onLeave,
  onInputChange,
  onSendMessage,
  otherPersonName,
}: ChatInterfaceProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center bg-gray-800 text-white px-4 py-2">
        <h2 className="text-lg font-semibold">{otherPersonName}</h2>
        <button
          onClick={onLeave}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md transition-colors duration-300"
        >
          End Chat
        </button>
      </div>
      <div className="max-h-[50vh] flex-grow overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 flex ${
              msg.name === otherPersonName ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg py-2 px-4 ${
                msg.name === otherPersonName
                  ? "bg-gray-200 text-gray-800"
                  : "bg-indigo-500 text-white"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center bg-gray-100 p-2">
        <input
          type="text"
          value={inputMessage}
          onChange={onInputChange}
          placeholder="Type your message..."
          className="flex-grow border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={onSendMessage}
          className="ml-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 flex items-center justify-center"
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
