import { Form, json, redirect, useActionData } from "@remix-run/react";
import { generateMeta } from "~/utils/generateMeta";
import {
  generateRandomName,
  getPredefinedText,
} from "~/utils/userDetailsHelper";
import { createPendingUser } from "~/db/supabase.utils";

import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { handleError } from "~/utils/notifications";
import { useEffect } from "react";
import { PendingUser } from "~/types/db.types";

export const meta: MetaFunction = generateMeta("Home");

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
    return redirect(`/match/${pendingUser.id}`);
  }

  return json({ pendingUser });
};

export default function Index() {
  const pendingUser = useActionData<PendingUser>();

  useEffect(() => {
    if (pendingUser !== undefined) {
      handleError(
        "Wasn't able to create a pending user on the databse",
        "Something wrong. Try again..."
      );
    }
  }, [pendingUser]);

  return (
    <div>
      <div>
        <h1>Welcome to GuardedHeart Therapy!</h1>
        <p>Get matched with a therapist ANONYMOUSLY</p>
      </div>

      <Form method="post">
        <div>
          <input
            type="text"
            name="userName"
            style={{ height: "20px", width: "400px" }}
            placeholder="your name.. feel free to leave empty if you'd like.."
          />
          <br />
          <input
            type="text"
            name="userMessage"
            style={{ height: "100px", width: "600px" }}
            placeholder="Whatare the problems you are facing.... feel free to leave empty if you'd like.."
          />
        </div>
        <button type="submit">Get a Therapist</button>
      </Form>
    </div>
  );
}
