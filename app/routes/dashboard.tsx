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
      "Error getting users...",
      "There was an error loading the pending users"
    );
    return;
  }

  useEffect(() => {
    if (user_not_found) {
      handleError(
        "User not found",
        "The user you were trying to chat with was not found"
      );
      navigate("/dashboard");
    }
  }, [user_not_found, navigate]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      {pending_users.length === 0 ? (
        <p className="text-center">No pending users</p>
      ) : (
        <ul className="space-y-4">
          {pending_users.map((user) => (
            <li
              key={user.id}
              className="bg-surface rounded-lg shadow-md p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="mt-1">{user.initial_message}</p>
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
