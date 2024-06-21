import type { MetaFunction } from "@remix-run/node";
import { generateMeta } from "~/utils/generateMeta";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { useLoaderData } from "@remix-run/react";
import { getPendingUserByUserId } from "~/db/supabase.utils";
import { PendingUser } from "~/types/db.types";
import { preventUserAccessForTherapists } from "~/session.server";

export const meta: MetaFunction = generateMeta("Match");

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.id, "id must be provided");
  await preventUserAccessForTherapists(request);
  const user = await getPendingUserByUserId(params.id);
  if (user === null) {
    return redirect("/");
  }
  return user;
};

export default function Index() {
  const user = useLoaderData<PendingUser>();

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h1>Welcome {user.name}</h1>
      <p>Your initial message: {user.initial_message}</p>
      <p>Please wait for a therapist to pick you up...</p>
    </div>
  );
}
