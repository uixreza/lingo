"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sileo";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";

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
    <LanguageProvider>
      <CartProvider>
        <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster
            position="top-center"
            theme="dark"
            options={{ duration: 4000, fill: "#1a1a2e" }}
          />
        </ThemeProvider>
        </SessionProvider>
      </CartProvider>
    </LanguageProvider>
  );
}
