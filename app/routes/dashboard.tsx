import { useEffect } from "react";
import {
  Link,
  json,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";

import { getAllPendingUsers } from "~/db/utils";
import { handleError } from "~/utils/notifications";
import { generateMeta } from "~/utils/generateMeta";
import { requireTherapistSession } from "~/utils/session.server";

import type { PendingUser } from "~/types/db.types";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = generateMeta("Dashboard");

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireTherapistSession(request);
  const pendingUsers = await getAllPendingUsers();

  const url = new URL(request.url);
  return json({
    pending_users: pendingUsers,
    user_not_found: url.searchParams.get("error") === "",
  });
};

export default function Index() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { pending_users, user_not_found } = useLoaderData<{
    pending_users: PendingUser[] | null;
    user_not_found: boolean;
  }>();

  if (pending_users === null) {
    handleError(
      "There was an error loading the pending users, from the database",
      "Couldn't get user. Please try again"
    );
    return;
  }

  useEffect(() => {
    if (user_not_found) {
      handleError(
        "The user you were trying to chat with was not found under pending users, probably either he got connected with other therapist or left",
        "User not found"
      );
      navigate("/dashboard");
    }
  }, [user_not_found, navigate]);

  return (
    <div className="max-w-3xl mx-auto flex flex-col max-h-secondary-div py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      {pending_users.length === 0 ? (
        <h3 className="text-center my-auto">
          There are currently no users waiting for a chat session.
        </h3>
      ) : (
        <ul className="space-y-4 overflow-y-auto">
          {pending_users.map((user) => (
            <li
              key={user.id}
              className="rounded-lg shadow-lg bg-[#4d4d4d] p-4 flex justify-between items-center m-4"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full mr-3">
                  <img
                    src="/user-icon.png"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <h2 className="text-md font-semibold">
                    {user.name.length > 20
                      ? `${user.name.slice(0, 20)}...`
                      : user.name}
                  </h2>
                  <p className="text-[12px] text-gray-400 rounded-md bg-custom">
                    {user.initial_message.length > 80
                      ? `${user.initial_message.slice(0, 80)}...`
                      : user.initial_message}
                  </p>
                </div>
              </div>
              <Link
                to={`/therapistChat/${user.user_id}`}
                className={`bg-base text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 ${
                  navigation.state === "submitting" ||
                  navigation.state === "loading"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={(e) => {
                  if (
                    navigation.state === "submitting" ||
                    navigation.state === "loading"
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                {navigation.state === "submitting" ||
                navigation.state === "loading"
                  ? "Loading..."
                  : "Chat"}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
