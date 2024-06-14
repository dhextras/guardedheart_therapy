import Header from "~/components/Header";
import { ToastContainer } from "react-toastify";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Header />
        <div
          style={{
            border: "2px solid black",
            margin: "20px",
            marginTop: "80px",
            borderRadius: "20px",
            display: "flex",
            justifyContent: "center",
            height: "70vh",
            padding: "20px",
          }}
        >
          {children}
        </div>
        <ToastContainer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
