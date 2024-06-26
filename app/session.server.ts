import { createCookieSessionStorage, redirect } from "@remix-run/node";

import {
  createOnlineTherapist,
  deleteOnlineTherapist,
} from "./db/utils";

import { Therapist } from "./types/db.types";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export const { getSession, commitSession, destroySession } = storage;

export async function requireTherapistSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const therapist = session.get("therapist");

  if (!therapist) {
    throw redirect("/");
  }

  return therapist as Therapist;
}

export async function preventUserAccessForTherapists(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const therapist = session.get("therapist");

  if (therapist) {
    throw redirect("/dashboard");
  }

  return null;
}

export async function saveTherapistToSession(therapist: Therapist, request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  session.set("therapist", therapist);
  await createOnlineTherapist(therapist.id);

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

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
