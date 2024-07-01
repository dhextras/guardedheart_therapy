import { createCookieSessionStorage, redirect } from "@remix-run/node";

import {
  createOnlineTherapist,
  deleteOnlineTherapist,
  updateLastLogin,
} from "~/db/utils";

import { Therapist } from "~/types/db.types";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "anonymous_therapy_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export const { getSession, commitSession, destroySession } = storage;

/**
 * Checks if the current session has a therapist object.
 * If not, redirects to the root path.
 * @param request - The current request object.
 * @returns The therapist object from the session.
 */
export async function requireTherapistSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const therapist = session.get("therapist");

  if (!therapist) {
    throw redirect("/");
  }

  return therapist as Therapist;
}

/**
 * Checks if the current session has a therapist object.
 * If so, redirects to the dashboard path.
 * @param request - The current request object.
 * @returns null if no therapist is in the session.
 */
export async function preventUserAccessForTherapists(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const therapist = session.get("therapist");

  if (therapist) {
    throw redirect("/dashboard");
  }

  return null;
}

/**
 * Saves the therapist object to the current session.
 * Creates an online therapist record and updates the last login time.
 * Redirects to the dashboard path with the updated session cookie.
 * @param therapist - The therapist object to save.
 * @param request - The current request object.
 * @returns A redirect response with the updated session cookie.
 */
export async function saveTherapistToSession(
  therapist: Therapist,
  request: Request
) {
  const session = await getSession(request.headers.get("Cookie"));
  session.set("therapist", therapist);
  await createOnlineTherapist(therapist.id);
  await updateLastLogin(therapist.id);

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

/**
 * Logs out the current therapist from the session.
 * Deletes the online therapist record and redirects to the root path.
 * @param request - The current request object.
 * @returns A redirect response with the destroyed session cookie.
 */
export async function logout(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const therapist = session.get("therapist");
  await deleteOnlineTherapist(therapist.id);

  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
