import type { MetaFunction } from "@remix-run/node";
import { generateMeta } from "~/utils/generateMeta";
import { getAllPendingUsers } from "~/db/supabase.utils";
import { handleError } from "~/utils/notifications";
import { Link, useLoaderData } from "@remix-run/react";
import type { PendingUser } from "~/types/db.types";

export const meta: MetaFunction = generateMeta("Dashboard");

export const loader = async () => {
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
      <h1>Therapist dashboard</h1>
      {pendingUsers.length === 0 ? (
        <p>No pending users</p>
      ) : (
        <ul>
          {pendingUsers.map((user) => (
            <li>
              {user.name} - {user.initial_message}
              <br></br>
              <Link to={`/chat/${user.id}`}>
                <button>Chat</button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}