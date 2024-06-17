import { Link } from "@remix-run/react";

export default function Header() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
      }}
    >
      <div>
        <Link to="/">
          <img src="/Logo.png" alt="Logo" height="100px" />
        </Link>
      </div>
      <div style={{ display: "flex", gap: "15px" }}>
        <Link to="/therapist">
          <button
            style={{
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Therapist
          </button>
        </Link>
      </div>
    </header>
  );
}
