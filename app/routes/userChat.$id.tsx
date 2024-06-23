import invariant from "tiny-invariant";
import { useLoaderData, Form } from "@remix-run/react";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";

import { generateMeta } from "~/utils/generateMeta";
import { preventUserAccessForTherapists } from "~/session.server";
import { getPendingUserById, removePendingUser } from "~/db/utils";

import type { PendingUser } from "~/types/db.types";
import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import {
  initializeSocket,
  listenForMessages,
  sendMessageToChat,
} from "~/utils/socket";
import { useEffect } from "react";

export const meta: MetaFunction = generateMeta("Chat");

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.id, "id must be provided");
  await preventUserAccessForTherapists(request);
  const user = await getPendingUserById(params.id);

  if (user === null) {
    return redirect("/");
  }

  return user;
};

export const action = async ({ params }: ActionFunctionArgs) => {
  invariant(params.id, "id must be provided");
  await removePendingUser(params.id);
  return redirect("/");
};

export default function Index() {
  let socket: boolean | undefined | null;
  let isConnected: boolean = false;
  const user = useLoaderData<PendingUser>();

  useEffect(() => {
    if (!socket) {
      socket = initializeSocket(user.id);
    }

    listenForMessages((message) => {
      if (
        !isConnected &&
        message?.name === "CONNECTION" &&
        message?.message === "INITIALIZE_CHAT"
      ) {
        console.log("Connected with therapist");
        isConnected = true;
      } else {
        console.log(message);
      }
    });
  }, [user.id]);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h1>Welcome {user.name}</h1>
      <p>Your initial message: {user.initial_message}</p>
      <p>Please wait for a therapist to pick you up...</p>
      <Form method="post">
        <button type="submit">Leave</button>
      </Form>
    </div>
  );
}
