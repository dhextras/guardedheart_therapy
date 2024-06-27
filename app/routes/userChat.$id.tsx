import invariant from "tiny-invariant";
import { useState, useEffect } from "react";
import { redirect, json } from "@remix-run/node";
import { useLoaderData, Form, useNavigate, useFetcher } from "@remix-run/react";

import { generateMeta } from "~/utils/generateMeta";
import ChatInterface from "~/components/ChatInterface";
import { handleError, showToast } from "~/utils/notifications";
import { preventUserAccessForTherapists } from "~/session.server";
import {
  getActiveConversationById,
  getPendingUserById,
  removePendingUser,
} from "~/db/utils";
import {
  initializeSocket,
  sendMessageToChat,
  listenForMessages,
  disconnectSocket,
} from "~/utils/socket";

import type { messageType } from "~/types/socket.types";
import type {
  LoaderFunctionArgs,
  MetaFunction,
  ActionFunctionArgs,
} from "@remix-run/node";

export const meta: MetaFunction = generateMeta("Chat");

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.id, "id must be provided");

  let activeConversation = null;
  await preventUserAccessForTherapists(request);
  const user = await getPendingUserById(params.id);

  if (user === null) {
    activeConversation = await getActiveConversationById(params.id);
    if (activeConversation === null) {
      return redirect("/");
    }
  }

  const data = {
    user_id: params.id,
    user_name: user?.name || activeConversation?.user_name,
    user_message: user?.initial_message || activeConversation?.user_message,
  };

  return json(data);
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.id, "id must be provided");

  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "remove_pending_user") {
    await removePendingUser(params.id);
    return json({ success: true });
  }

  disconnectSocket(params.id);
  await removePendingUser(params.id);
  return redirect("/");
};

export default function UserChatPage() {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  let socketInitialized: boolean = false;

  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Array<messageType>>([]);
  const { user_id, user_name, user_message } = useLoaderData<{
    user_id: string;
    user_name: string;
    user_message: string;
  }>();

  useEffect(() => {
    if (socketInitialized) {
      listenForMessages(async (message) => {
        if (
          !isConnected &&
          message?.name === "CONNECTION" &&
          message?.message === "INITIALIZE_CHAT"
        ) {
          setIsConnected(true);
          showToast("Therapist joined");

          fetcher.submit({ action: "remove_pending_user" }, { method: "post" });
        } else if (
          message?.name === "CONNECTION" &&
          message?.message === "THERAPIST_LEAVE_CHAT"
        ) {
          showToast("Therapist left");
          disconnectSocket(user_id);
        } else {
          if (message) {
            setMessages((prev) => [
              ...prev,
              { name: message.name, message: message.message },
            ]);
          }
        }
      });
    } else {
      socketInitialized = initializeSocket(user_id);
    }
  }, [user_id, socketInitialized, isConnected, fetcher]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const success = sendMessageToChat(user_id, {
        name: user_name,
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
    sendMessageToChat(user_id, {
      name: "CONNECTION",
      message: "USER_LEAVE_CHAT",
    });
    disconnectSocket(user_id);
    navigate("/");
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
        <>
          <h1>Welcome {user_name}</h1>
          <p>Your initial message: {user_message}</p>
          <p>Please wait for a therapist to pick you up...</p>
          <Form method="post" style={{ marginTop: "20px" }}>
            <button type="submit">Leave</button>
          </Form>
        </>
      )}
    </div>
  );
}
