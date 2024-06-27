import { useEffect } from "react";
import { Link, json, useLoaderData, useNavigate } from "@remix-run/react";

import { getAllPendingUsers } from "~/db/utils";
import { handleError } from "~/utils/notifications";
import { generateMeta } from "~/utils/generateMeta";
import { requireTherapistSession } from "~/session.server";

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
  }, [user_not_found]);

  return (
    <>
      {pending_users.length === 0 ? (
        <p>No pending users</p>
      ) : (
        <ul>
          {pending_users.map((user) => (
            <li key={user.id}>
              {user.name} - {user.initial_message}
              <br></br>
              <Link to={`/therapistChat/${user.user_id}`}>
                <button>Chat</button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
