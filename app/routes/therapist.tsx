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
      <div className="max-w-md mx-auto flex flex-col max-h-secondary-div py-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            Welcome back, {data.therapist.name}
          </h1>
        </div>
        <div className="border rounded-2xl p-4 text-center my-auto">
          <p className="text-secondary">
            Your total conversations: {data.therapist.total_conversations}
          </p>
          <p className="text-secondary">
            Successfully logged in at:{" "}
            {new Date(data.therapist.last_login).toLocaleString()}{" "}
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
    <div className="max-w-md mx-auto flex flex-col max-h-secondary-div py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Therapist Login</h1>
      </div>
      <div className="border rounded-2xl p-4 text-center my-auto">
        <p className="mt-2">
          Registration is not available through the web app. Please contact the
          admin if you are a verified therapist or want to become a therapist.
        </p>
      </div>
      <div className="flex flex-col">
        <Form method="post" className="flex flex-col gap-2 space-y-4 mb-2">
          <div>
            <label htmlFor="code" className="font-semibold">
              Enter your Therapist Code:
            </label>
            <input
              id="code"
              type="text"
              name="code"
              className="w-full border border-custom rounded-md py-2 px-3 focus:outline-none focus:ring-2 text-black"
              placeholder="EX:- John$fdsal"
            />
          </div>
          <button
            type="submit"
            disabled={
              navigation.state === "submitting" ||
              navigation.state === "loading"
            }
            className="w-full bg-base text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 disabled:opacity-50"
          >
            {navigation.state === "submitting" || navigation.state === "loading"
              ? "Checking..."
              : "Login"}
          </button>
        </Form>
      </div>
    </div>
  );
}
