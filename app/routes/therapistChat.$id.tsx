import { useEffect } from "react";
import invariant from "tiny-invariant";
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
  const user = useLoaderData<PendingUser>();

  useEffect(() => {
    showToast("Not yet implemented....");
    initializeSocket(user.id);

    const sendmessage = sendMessageToChat(user.id, {
      name: "Therapist",
      message: "Hello there, how are you today?",
    });

    console.log(sendmessage);
  }, [user.id]);

  return (
    <div>
      <h1>Chat Page</h1>
    </div>
  );
}
