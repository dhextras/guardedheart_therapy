import type { ChatInterfaceProps } from "~/types/socket.types";

export default function ChatInterface({
  messages,
  inputMessage,
  onLeave,
  onInputChange,
  onSendMessage,
}: ChatInterfaceProps) {
  return (
    <>
      <button onClick={onLeave}>x</button>
      <div
        style={{
          height: "300px",
          overflowY: "scroll",
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "10px",
          width: "80%",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.name}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div style={{ width: "80%", display: "flex" }}>
        <input
          type="text"
          value={inputMessage}
          onChange={onInputChange}
          placeholder="Type your message..."
          style={{ flexGrow: 1, marginRight: "10px" }}
        />
        <button onClick={onSendMessage}>Send</button>
      </div>
    </>
  );
}
