import type { MetaFunction } from "@remix-run/node";
import { generateMeta } from "~/utils/generateMeta";

export const meta: MetaFunction = generateMeta("Match");

export default function Index() {
  return <>Matching wating page</>;
}
