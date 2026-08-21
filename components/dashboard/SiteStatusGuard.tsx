"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SiteStatusGuard() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch("/api/site-status", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data.shutdown || data.updating) {
          router.push("/status");
        }
      } catch {
        // ignore
      }
    };

    void check();
    const interval = setInterval(check, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [router]);

  return null;
}
