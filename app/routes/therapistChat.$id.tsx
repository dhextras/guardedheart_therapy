import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { Form } from "@remix-run/react";
import { LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";

import { getPendingUserById } from "~/db/utils";
import { showToast } from "~/utils/notifications";
import { generateMeta } from "~/utils/generateMeta";
import { requireTherapistSession } from "~/session.server";
import { initializeSocket, sendMessageToChat } from "~/utils/socket";
import { useLoaderData } from "@remix-run/react";
import { PendingUser } from "~/types/db.types";

export const meta: MetaFunction = generateMeta("Chat");

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.id, "id must be provided");
  const therapist = await requireTherapistSession(request);
  const user = await getPendingUserById(params.id);

  if (user === null) {
    return redirect("/");
  }
  return user;
};

export default function ChatRoute() {
  let socket: boolean | undefined | null;
  const user = useLoaderData<PendingUser>();
  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    showToast("Not yet implemented....");
    if (!socket) {
      socket = initializeSocket(user.id);
      sendMessageToChat(user.id, {
        name: "CONNECTION",
        message: "INITIALIZE_CHAT",
      });
    }
  }, [user.id]);

  const handleSendMessage = () => {
    const sendmessage = sendMessageToChat(user.id, {
      name: "Therapist",
      message: inputMessage,
    });
    console.log(sendmessage);
  };

  return (
    <div>
      <h1>Chat Page</h1>
      <input
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}
