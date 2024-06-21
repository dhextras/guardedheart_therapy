import invariant from "tiny-invariant";
import { useLoaderData, Form } from "@remix-run/react";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";

import { generateMeta } from "~/utils/generateMeta";
import { preventUserAccessForTherapists } from "~/session.server";
import { getPendingUserById, removePendingUser } from "~/db/utils";

import type { PendingUser } from "~/types/db.types";
import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node";

export const meta: MetaFunction = generateMeta("Match");

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.id, "id must be provided");
  await preventUserAccessForTherapists(request);
  const user = await getPendingUserById(params.id);

  if (user === null) {
    return redirect("/");
  }

  return user;
};

export const action = async ({ params }: ActionFunctionArgs) => {
  invariant(params.id, "id must be provided");
  await removePendingUser(params.id);
  return redirect("/");
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
      <Form method="post">
        <button type="submit">Leave</button>
      </Form>
    </div>
  );
}
