import { useEffect } from "react";
import invariant from "tiny-invariant";
import { useLoaderData, Form, Link, useActionData } from "@remix-run/react";
import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";

import { handleError } from "~/utils/notifications";
import { getTherapistByCode } from "~/db/utils";
import { getSession, saveTherapistToSession } from "~/session.server";

import type { TherapistData } from "~/types/db.types";
import type { TherapistErrorActionData } from "~/types/notification.types";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const therapist = session.get("therapist");

  if (therapist) {
    const updatedTherapist = await getTherapistByCode(therapist.code);
    session.set("therapist", updatedTherapist);
    return json({ therapist: updatedTherapist });
  }

  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const code = formData.get("code");
  invariant(typeof code === "string", "Code must be a string");

  try {
    const therapist = await getTherapistByCode(code);
    if (!therapist) {
      return json(
        {
          error: "Invalid Therapist Code",
          details: `There is no therapist found with the code '${code}' in the db. please check again....`,
        },
        { status: 400 }
      );
    }
    return saveTherapistToSession(therapist, request);
  } catch (error) {
    return json(
      { error: "Internal Server error", details: error },
      { status: 500 }
    );
  }
};

export default function TherapistLogin() {
  const data = useLoaderData<TherapistData>();
  const actionData = useActionData<TherapistErrorActionData>();

  useEffect(() => {
    if (actionData?.error && actionData?.details) {
      handleError(actionData.details, actionData.error);
    }
  }, [actionData]);

  if (data && data?.therapist) {
    return (
      <div>
        <h1>Welcome, {data.therapist.name}</h1>
        <p>Total Conversations: {data.therapist.total_conversations}</p>
        <Form action="/logout" method="post">
          <button type="submit">Logout</button>
        </Form>
        <Link to="/dashboard">
          <button>Dashboard</button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Therapist Login</h1>
      <Form method="post">
        <label>
          Login
          <input
            id="code"
            type="text"
            name="code"
            placeholder="Enter your therapist code..."
          />
        </label>
        <button type="submit">Login</button>
      </Form>
    </div>
  );
}
