import { useEffect } from "react";
import invariant from "tiny-invariant";
import { LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";

import { getPendingUserById } from "~/db/utils";
import { showToast } from "~/utils/notifications";
import { generateMeta } from "~/utils/generateMeta";
import { preventUserAccessForTherapists } from "~/session.server";

export const meta: MetaFunction = generateMeta("Chat");

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.id, "id must be provided");
  await preventUserAccessForTherapists(request);
  const user = await getPendingUserById(params.id);

  if (user === null) {
    return redirect("/");
  }

  return user;
};

export default function ChatRoute() {
  useEffect(() => {
    showToast("Not yet implemented....");
  }, []);

  return (
    <div>
      <h1>Chat Page</h1>
    </div>
  );
}
