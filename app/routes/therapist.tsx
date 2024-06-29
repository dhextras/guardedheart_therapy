import { useEffect } from "react";
import invariant from "tiny-invariant";
import {
  useLoaderData,
  Form,
  Link,
  useActionData,
  useNavigation,
} from "@remix-run/react";
import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";

import { handleError } from "~/utils/notifications";
import { getTherapistByCode } from "~/db/utils";
import { getSession, saveTherapistToSession } from "~/utils/session.server";

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
  const navigation = useNavigation();
  const data = useLoaderData<TherapistData>();
  const actionData = useActionData<TherapistErrorActionData>();

  useEffect(() => {
    if (actionData?.error && actionData?.details) {
      handleError(actionData.details, actionData.error);
    }
  }, [actionData]);

  if (data && data?.therapist) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {data.therapist.name}
          </h1>
          <p className="text-secondary">
            Total Conversations: {data.therapist.total_conversations}
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300"
            >
              Logout
            </button>
          </Form>
          <Link to="/dashboard">
            <button className="bg-base text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300">
              Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Therapist Login</h1>
      </div>
      <Form method="post" className="space-y-4">
        <div>
          <input
            id="code"
            type="text"
            name="code"
            className="w-full bg-background border border-custom rounded-md py-2 px-3 focus:outline-none focus:ring-2 text-black"
            placeholder="Enter your therapist code..."
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
            ? "Checking..."
            : "Login"}
        </button>
      </Form>
    </div>
  );
}
