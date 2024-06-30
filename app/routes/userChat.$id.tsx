import invariant from "tiny-invariant";
import { useState, useEffect } from "react";
import { redirect, json } from "@remix-run/node";
import {
  useLoaderData,
  useNavigate,
  useFetcher,
  useNavigation,
} from "@remix-run/react";

import { generateMeta } from "~/utils/generateMeta";
import ChatInterface from "~/components/ChatInterface";
import { handleError, showToast } from "~/utils/notifications";
import { preventUserAccessForTherapists } from "~/utils/session.server";
import {
  getActiveConversationById,
  getPendingUserById,
  getTotalActiveConversations,
  getTotalOnlineTherapist,
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

  const totalOnlineTherapists = await getTotalOnlineTherapist();
  const totalActiveConversation = await getTotalActiveConversations();

  const data = {
    user_id: params.id,
    user_name: user?.name || activeConversation?.user_name,
    user_message: user?.initial_message || activeConversation?.user_message,
    therapist_name: activeConversation?.therapist_name || "Therapist",
    online_therapists: totalOnlineTherapists,
    active_conversations: totalActiveConversation,
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

  return json({});
};

export default function UserChatPage() {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const navigation = useNavigation();

  const [isOnline, setIsOnline] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [messages, setMessages] = useState<Array<messageType>>([]);
  const {
    user_id,
    user_name,
    therapist_name,
    online_therapists,
    active_conversations,
  } = useLoaderData<{
    user_id: string;
    user_name: string;
    user_message: string;
    therapist_name: string;
    online_therapists: number;
    active_conversations: number;
  }>();

  useEffect(() => {
    if (socketInitialized) {
      listenForMessages(async (message) => {
        if (
          !isConnected &&
          message?.name === "CONNECTION" &&
          message?.message === "INITIALIZE_CHAT"
        ) {
          setIsOnline(true);
          setIsConnected(true);
          showToast("Therapist joined");

          fetcher.submit({ action: "remove_pending_user" }, { method: "post" });
        } else if (
          message?.name === "CONNECTION" &&
          message?.message === "THERAPIST_LEAVE_CHAT"
        ) {
          showToast("Therapist left");
          disconnectSocket(user_id);
          setIsOnline(false);
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
      setSocketInitialized(initializeSocket(user_id));
    }
  }, [socketInitialized]);

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

  const handleChatPageLeave = () => {
    sendMessageToChat(user_id, {
      name: "CONNECTION",
      message: "USER_LEAVE_CHAT",
    });
    disconnectSocket(user_id);
    navigate("/");
  };

  const handleWaitPageLeave = () => {
    fetcher.submit({ action: "remove_pending_user" }, { method: "post" });
    disconnectSocket(user_id);
    navigate("/");
  };

  return (
    <div className="w-full">
      {isConnected ? (
        <div className="rounded-lg shadow-md h-full">
          <ChatInterface
            messages={messages}
            inputMessage={inputMessage}
            onLeave={handleChatPageLeave}
            onInputChange={handleInputChange}
            onSendMessage={handleSendMessage}
            otherPersonName={therapist_name}
            isOnline={isOnline}
          />
        </div>
      ) : (
        <div className="max-w-md mx-auto flex flex-col max-h-secondary-div py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Hello there {user_name}!
            </h1>
          </div>

          <div className="bg-gray-100 rounded-md p-4 mb-4 w-full my-auto mb-auto">
            <p className="text-gray-600 text-center justify-center">
              Online Therapists: {online_therapists} | Active Conversations:
              {active_conversations}
            </p>
          </div>
          <div className="flex flex-col">
            <div className="flex justify-center items-center my-2">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"></div>
            </div>

            <p className="text-secondary mb-8 text-center">
              Please wait for a therapist to pick you up...
            </p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleWaitPageLeave}
                disabled={
                  navigation.state === "submitting" ||
                  navigation.state === "loading"
                }
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 disabled:opacity-50"
              >
                {navigation.state === "submitting" ||
                navigation.state === "loading"
                  ? "Leaving..."
                  : "Leave"}
              </button>{" "}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
