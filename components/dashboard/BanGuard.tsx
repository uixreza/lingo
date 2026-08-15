"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function BanGuard() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json().catch(() => ({ banned: false }));
        if (cancelled || !data?.banned) return;
        await signOut({ callbackUrl: "/?banned=1" });
      } catch {
        // ignore
      }
    };
    void check();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}