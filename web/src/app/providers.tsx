"use client";
import { SessionProvider } from "next-auth/react";

/**
 * Filter one specific, benign React 19 deprecation warning emitted by
 * third-party libraries that still read `element.ref` (the GrapesJS Studio
 * SDK editor and react-simple-code-editor). They function correctly under
 * React 19; the message is noise (and trips the Next dev-overlay badge).
 * Everything else is passed through untouched.
 */
if (typeof window !== "undefined") {
  const w = window as unknown as { __refWarnPatched?: boolean };
  if (!w.__refWarnPatched) {
    w.__refWarnPatched = true;
    const original = console.error;
    console.error = (...args: unknown[]) => {
      const first = args[0];
      const text =
        typeof first === "string"
          ? first
          : first instanceof Error
            ? first.message
            : "";
      if (text.includes("Accessing element.ref was removed in React 19")) {
        return;
      }
      original.apply(console, args as []);
    };
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
