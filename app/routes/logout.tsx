import { ActionFunction } from "@remix-run/node";
import { logout } from "~/utils/session.server";

/**
 * Action function to handle logout requests.
 *
 * @param {Object} param0 - Object containing the request object.
 * @param {Request} param0.request - The incoming request object.
 * @returns {Promise<Response>} - The response object after logging out.
 */
export const action: ActionFunction = async ({ request }) => {
  return logout(request);
};
