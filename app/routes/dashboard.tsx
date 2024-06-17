import type { MetaFunction } from "@remix-run/node";
import { generateMeta } from "~/utils/generateMeta";

export const meta: MetaFunction = generateMeta("Dashboard");

export default function Index() {
  return <>Therapist dashboard</>;
}
