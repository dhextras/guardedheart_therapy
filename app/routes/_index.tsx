import { Link } from "@remix-run/react";

import type { MetaFunction } from "@remix-run/node";
import { generateMeta } from "~/utils/generateMeta";

export const meta: MetaFunction = generateMeta("Home");

export default function Index() {
  return (
    <div>
      <div>
        <h1>Welcome to GuardedHeart Therapy!</h1>
        <p>Get matched with a therapist ANONYMOUSLY</p>
      </div>
      <div>
        <input
          type="text"
          style={{ height: "20px", width: "400px" }}
          placeholder="your name.. feel free to leave empty if you'd like.."
        />
        <br />
        <input
          type="text"
          style={{ height: "100px", width: "600px" }}
          placeholder="Whatare the problems you are facing.... feel free to leave empty if you'd like.."
        />
      </div>
      <Link to="/match">
        <button>Get a Therapist</button>
      </Link>
    </div>
  );
}
