import LogoSvg from "~/components/Logo";
import { Link } from "@remix-run/react";

export default function Header() {
  return (
    <header className="bg-gray-800 py-4 px-6 flex justify-between items-center">
      <div>
        <Link to="/">
          <LogoSvg />
        </Link>
      </div>
      <div>
        <Link to="/therapist">
          <button className="bg-base text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300">
            Therapist
          </button>
        </Link>
      </div>
    </header>
  );
}
