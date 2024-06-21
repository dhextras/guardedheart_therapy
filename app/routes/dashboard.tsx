import { Link, useLoaderData } from "@remix-run/react";

import { handleError } from "~/utils/notifications";
import { generateMeta } from "~/utils/generateMeta";
import { getAllPendingUsers } from "~/db/utils";
import { requireTherapistSession } from "~/session.server";

import type { PendingUser } from "~/types/db.types";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = generateMeta("Dashboard");

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireTherapistSession(request);
  const pendingUsers = await getAllPendingUsers();
  return pendingUsers;
};

export default function Index() {
  const pendingUsers = useLoaderData<PendingUser[] | null>();

  if (pendingUsers === null) {
    handleError(
      "Error getting users...",
      "There was an error loading the pending users"
    );
    return;
  }

  return (
    <>
      {pendingUsers.length === 0 ? (
        <p>No pending users</p>
      ) : (
        <ul>
          {pendingUsers.map((user) => (
            <li>
              {user.name} - {user.initial_message}
              <br></br>
              <Link to={`/therapistChat/${user.id}`}>
                <button>Chat</button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
