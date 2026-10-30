"use client";

import { useLang } from "@/contexts/LanguageContext";

import LandingNavbar from "@/components/landing/LandingNavbar";
import CoursesSection from "@/components/landing/CoursesSection";
import ConversionFooter from "@/components/landing/ConversionFooter";

export default function CoursesPage() {
  const { locale } = useLang();

  return (
    <main
      style={{
        fontFamily:
          locale === "en"
            ? "var(--font-plus-jakarta), 'Dana', sans-serif"
            : "var(--font-morabba-light), 'Dana', sans-serif",
      }}
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0b1410] via-[#09100c] to-[#060b08]">
      {/* Ambient blurs */}
      <div className="pointer-events-none absolute top-[-200px] left-[-10%] h-[800px] w-[800px] rounded-full bg-[#05df72]/8 blur-[180px]" />
      <div className="pointer-events-none absolute top-[30%] left-[55%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#46fc8b]/5 blur-[140px]" />

      <LandingNavbar />
      <CoursesSection />
      <ConversionFooter />
    </main>
  );
}
