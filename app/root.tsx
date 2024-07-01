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

/**
 * Layout component that renders the main structure of the application.
 * @param {React.ReactNode} children - The content to be rendered within the layout.
 * @returns {JSX.Element} The rendered layout component.
 */
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
        <main className="bg-background py-8 px-4 sm:px-6 lg:px-8 flex-grow flex items-center justify-center">
          <div className="bg-surface rounded-lg shadow-md w-full max-w-4xl overflow-y-auto max-h-secondary-div">
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

/**
 * Root component that renders the Outlet from Remix.
 * @returns {JSX.Element} The rendered root component.
 */
export default function App() {
  return <Outlet />;
}
