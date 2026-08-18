"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((r) => r.unregister());
      });
      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // service worker unavailable (e.g. http)
    });
  }, []);

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1a1a2e",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
