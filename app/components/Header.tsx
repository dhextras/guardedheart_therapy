import LogoSvg from "~/components/Logo";
import { Link } from "@remix-run/react";

export default function Header() {
  return (
    <header className="bg-surface py-4 px-6 flex justify-between items-center border-b border-custom">
      <div>
        <Link to="/">
          <LogoSvg />
        </Link>
      </div>
      <div>
        <Link to="/therapist">
          <button className="bg-base text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 hover:bg-primary-hover">
            Therapist
          </button>
        </Link>
      </div>
    </header>
  );
}
