// TODO: Gotta clean up the active conversation later. add handler for leave operation connection and leave_chat something like that.

import invariant from "tiny-invariant";
import { useState, useEffect } from "react";
import { useLoaderData, Form } from "@remix-run/react";
import {
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
  json,
} from "@remix-run/node";

import { getPendingUserById } from "~/db/utils";
import { showToast } from "~/utils/notifications";
import { generateMeta } from "~/utils/generateMeta";
import { requireTherapistSession } from "~/session.server";
import {
  initializeSocket,
  sendMessageToChat,
  listenForMessages,
  disconnectSocket,
} from "~/utils/socket";

import type { PendingUser, Therapist } from "~/types/db.types";
import { messageType } from "~/types/socket.types";
import ChatInterface from "~/components/ChatInterface";

export const meta: MetaFunction = generateMeta("Chat");

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.id, "id must be provided");
  const therapist = await requireTherapistSession(request);
  const user = await getPendingUserById(params.id);

  if (user === null) {
    return redirect("/");
  }

  // Make sure to create active conversations here maybe
  return json({ user, therapist });
};

export const action = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.id, "id must be provided");
  disconnectSocket(params.id);
  return redirect("/");
};

export default function TherapistChatPage() {
  let socketInitialized: boolean = false;
  const { user, therapist } = useLoaderData<{
    user: PendingUser;
    therapist: Therapist;
  }>();
  const [messages, setMessages] = useState<Array<messageType>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (socketInitialized) {
      listenForMessages((message) => {
        if (
          message &&
          message?.name !== "CONNECTION" &&
          message?.message !== "INITIALIZE_CHAT"
        ) {
          setMessages((prev) => [
            ...prev,
            { name: message.name, message: message.message },
          ]);
        }
      });

      setIsConnected(true);
    } else {
      socketInitialized = initializeSocket(user.id);
      const connectionIntilaized = sendMessageToChat(user.id, {
        name: "CONNECTION",
        message: "INITIALIZE_CHAT",
      });

      if (connectionIntilaized) {
        showToast("Successfully Conected");
      } else {
        showToast("Failed to connect to chat", "error");
      }
    }
  }, [user.id, socketInitialized]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const success = sendMessageToChat(user.id, {
        name: therapist.name,
        message: inputMessage,
      });

      if (success) {
        setInputMessage("");
      } else {
        showToast("Error sending. Please try again.");
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {isConnected && (
        <ChatInterface
          messages={messages}
          inputMessage={inputMessage}
          onInputChange={handleInputChange}
          onSendMessage={handleSendMessage}
        />
      )}
      <Form method="post" style={{ marginTop: "20px" }}>
        <button type="submit">End Chat</button>
      </Form>
    </div>
  );
}
