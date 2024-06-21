import { useEffect } from "react";
import { MetaFunction } from "@remix-run/node";

import { generateMeta } from "~/utils/generateMeta";
import { showToast } from "~/utils/notifications";

export const meta: MetaFunction = generateMeta("Chat");

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
