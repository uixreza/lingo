"use client";

import { useLang } from "@/contexts/LanguageContext";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { locale } = useLang();
  return (
    <div
      className="flex w-full overflow-hidden h-screen bg-[url('/assets/img/pattern.png')] bg-[var(--dash-bg)] transition-colors duration-300"
      dir={locale === "en" ? "ltr" : "rtl"}>
      {children}
    </div>
  );
}
