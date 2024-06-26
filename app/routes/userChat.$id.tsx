// TODO: Make sure to handle the pending user properly and also send message to remove the active conversations

import { useState, useEffect } from "react";
import { useLoaderData, Form } from "@remix-run/react";
import { LoaderFunctionArgs, redirect, json } from "@remix-run/node";
import invariant from "tiny-invariant";

import { showToast } from "~/utils/notifications";
import { generateMeta } from "~/utils/generateMeta";
import { preventUserAccessForTherapists } from "~/session.server";
import { getPendingUserById, removePendingUser } from "~/db/utils";
import {
  initializeSocket,
  sendMessageToChat,
  listenForMessages,
  disconnectSocket,
} from "~/utils/socket";

import type { PendingUser } from "~/types/db.types";
import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { messageType } from "~/types/socket.types";
import ChatInterface from "~/components/ChatInterface";

export const meta: MetaFunction = generateMeta("Chat");

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.id, "id must be provided");
  await preventUserAccessForTherapists(request);
  const user = await getPendingUserById(params.id);

  if (user === null) {
    return redirect("/");
  }

  return json({ user });
};

export const action = async ({ params }: ActionFunctionArgs) => {
  invariant(params.id, "id must be provided");
  disconnectSocket(params.id);
  await removePendingUser(params.id);
  return redirect("/");
};

export default function UserChatPage() {
  let socketInitialized: boolean = false;
  const { user } = useLoaderData<{
    user: PendingUser;
  }>();
  const [messages, setMessages] = useState<Array<messageType>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (socketInitialized) {
      listenForMessages((message) => {
        if (
          !isConnected &&
          message?.name === "CONNECTION" &&
          message?.message === "INITIALIZE_CHAT"
        ) {
          setIsConnected(true);
          showToast("Connected with therapist");
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
      socketInitialized = initializeSocket(user.id);
    }
  }, [user.id, socketInitialized, isConnected]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const success = sendMessageToChat(user.id, {
        name: user.name,
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
      {isConnected ? (
        <ChatInterface
          messages={messages}
          inputMessage={inputMessage}
          onInputChange={handleInputChange}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <>
          <h1>Welcome {user.name}</h1>
          <p>Your initial message: {user.initial_message}</p>
          <p>Please wait for a therapist to pick you up...</p>
        </>
      )}
      <Form method="post" style={{ marginTop: "20px" }}>
        <button type="submit">Leave Chat</button>
      </Form>
    </div>
  );
}
