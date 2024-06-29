import { useEffect } from "react";
import {
  Form,
  json,
  redirect,
  useActionData,
  useNavigation,
} from "@remix-run/react";

import { generateMeta } from "~/utils/generateMeta";
import {
  generateRandomName,
  getPredefinedText,
} from "~/utils/userDetailsHelper";
import { handleError } from "~/utils/notifications";
import { createPendingUser } from "~/db/utils";
import { preventUserAccessForTherapists } from "~/utils/session.server";

import type {
  MetaFunction,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import type { PendingUser } from "~/types/db.types";

export const meta: MetaFunction = generateMeta("Home");

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await preventUserAccessForTherapists(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  let userName = formData.get("userName")?.toString() || "";
  let userMessage = formData.get("userMessage")?.toString() || "";

  if (userName === "") {
    userName = generateRandomName();
  }
  if (userMessage === "") {
    userMessage = getPredefinedText();
  }

  const pendingUser = await createPendingUser(userName, userMessage);
  if (pendingUser) {
    return redirect(`/userChat/${pendingUser.user_id}`);
  }

  return json({ pendingUser });
};

export default function Index() {
  const pendingUser = useActionData<PendingUser>();
  const navigation = useNavigation();

  useEffect(() => {
    if (pendingUser !== undefined) {
      handleError(
        "Wasn't able to create a pending user on the database",
        "Something wrong. Try again..."
      );
    }
  }, [pendingUser]);

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome to GuardedHeart Therapy!
        </h1>
        <p className="text-secondary">
          Get matched with a therapist ANONYMOUSLY
        </p>
      </div>

      <Form method="post" className="space-y-4">
        <div>
          <input
            type="text"
            name="userName"
            className="w-full bg-background border border-custom rounded-md py-2 px-3 focus:outline-none focus:ring-2 text-black"
            placeholder="Your name (if you'd like)"
          />
        </div>
        <div>
          <textarea
            name="userMessage"
            rows={4}
            className="w-full bg-background border border-custom rounded-md py-2 px-3 focus:outline-none focus:ring-2 text-black"
            placeholder="What's on your mind that's troubling you? We are here to listen."
          />
        </div>
        <button
          type="submit"
          disabled={
            navigation.state === "submitting" || navigation.state === "loading"
          }
          className="w-full bg-base text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 disabled:opacity-50"
        >
          {navigation.state === "submitting" || navigation.state === "loading"
            ? "Starting Chat..."
            : "Start Chat"}
        </button>
      </Form>
    </div>
  );
}
