import type { MetaFunction } from "@remix-run/node";
import { generateMeta } from "~/utils/generateMeta";
import { Form } from "@remix-run/react";
import { getTherapistByCode } from "~/db/supabase.utils";
import { handleError, showToast } from "~/utils/notifications";

export const meta: MetaFunction = generateMeta("Therapist Login");

export default function Index() {
  return (
    <div>
      <h1>Therapist Login</h1>
      <Form method="post">
        <label>
          Login
          <input
            id="code"
            type="text"
            name="code"
            placeholder="Enter your therapist code..."
          />
        </label>
        <button type="submit">Login</button>
      </Form>
    </div>
  );
}
