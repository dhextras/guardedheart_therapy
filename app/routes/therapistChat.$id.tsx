import invariant from "tiny-invariant";
import { useState, useEffect } from "react";
import { redirect, json } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";

import { generateMeta } from "~/utils/generateMeta";
import ChatInterface from "~/components/ChatInterface";
import { requireTherapistSession } from "~/session.server";
import { handleError, showToast } from "~/utils/notifications";
import {
  createActiveConversation,
  deleteActiveConversation,
  getPendingUserById,
} from "~/db/utils";
import {
  initializeSocket,
  sendMessageToChat,
  listenForMessages,
  disconnectSocket,
} from "~/utils/socket";

import type { messageType } from "~/types/socket.types";
import type { PendingUser, Therapist } from "~/types/db.types";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = generateMeta("Chat");

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.id, "id must be provided");

  const therapist = await requireTherapistSession(request);
  const user = await getPendingUserById(params.id);

  if (user === null) {
    return redirect("/dashboard?error");
  }

  await createActiveConversation(
    user.user_id,
    therapist.id,
    user.name,
    user.initial_message
  );
  return json({ user, therapist });
};

export const action = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.id, "id must be provided");
  disconnectSocket(params.id);

  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "leave_chat") {
    await deleteActiveConversation(params.id);
    return json({ success: true });
  }

  return redirect("/dashboard");
};

export default function TherapistChatPage() {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  let socketInitialized: boolean = false;

  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Array<messageType>>([]);
  const { user, therapist } = useLoaderData<{
    user: PendingUser;
    therapist: Therapist;
  }>();

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
        } else if (
          message?.name === "CONNECTION" &&
          message?.message === "USER_LEAVE_CHAT"
        ) {
          showToast("User left");
          disconnectSocket(user.user_id);
          fetcher.submit({ action: "leave_chat" }, { method: "post" });
        }
      });

      setIsConnected(true);
    } else {
      socketInitialized = initializeSocket(user.user_id);
      const connectionIntilaized = sendMessageToChat(user.user_id, {
        name: "CONNECTION",
        message: "INITIALIZE_CHAT",
      });

      if (connectionIntilaized) {
        showToast("Successfully Connected to User");
      } else {
        handleError(
          "Unable to Access the socket when sending initialization message",
          "Failed to connect to chat"
        );
      }
    }
  }, [user.user_id, socketInitialized]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const success = sendMessageToChat(user.user_id, {
        name: therapist.name,
        message: inputMessage,
      });

      if (success) {
        setInputMessage("");
      } else {
        handleError(
          "Unable to Access the socket when sending message to chat",
          "Error sending. Please try again"
        );
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleLeave = () => {
    sendMessageToChat(user.user_id, {
      name: "CONNECTION",
      message: "THERAPIST_LEAVE_CHAT",
    });
    disconnectSocket(user.user_id);
    fetcher.submit({ action: "leave_chat" }, { method: "post" });
    navigate("/dashboard");
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {isConnected ? (
        <>
          <ChatInterface
            messages={messages}
            inputMessage={inputMessage}
            onLeave={handleLeave}
            onInputChange={handleInputChange}
            onSendMessage={handleSendMessage}
          />
        </>
      ) : (
        <>Loading... Please wait while we connect you to the user.</>
      )}
    </div>
  );
}
