import { ToastContainer } from "react-toastify";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import Header from "~/components/Header";

import "~/styles/root.css";
import "~/styles/tailwind.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-100 min-h-screen flex flex-col">
        <Header />
        <main className=" py-8 px-4 sm:px-6 lg:px-8 flex-grow flex items-center justify-center min-w-screen">
          <div className="bg-white rounded-lg shadow-md p-6 min-w-[90vw] min-h-[75vh] flex items-center justify-center">{children}</div>
        </main>
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
