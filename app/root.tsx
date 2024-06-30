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
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="text min-h-screen flex flex-col">
        <Header />
        <main className="bg-background  py-8 px-4 sm:px-6 lg:px-8 flex-grow flex items-center justify-center">
          <div className="bg-surface rounded-lg shadow-md w-full max-w-4xl overflow-y-auto ">
            {children}
          </div>
        </main>
        <ToastContainer theme="dark" />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
