import type { MetaFunction } from "@remix-run/node";
import { generateMeta } from "~/utils/generateMeta";

export const meta: MetaFunction = generateMeta("Therapist Login");

export default function Index() {
  return <>Therapist login page</>;
}
