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
      className="relative min-h-screen bg-[#09100c] overflow-hidden">
      {/* Ambient blurs */}
      <div className="absolute top-[-200px] left-[-10%] w-[800px] h-[800px] rounded-full bg-[#05df72]/8 blur-[180px] pointer-events-none" />
      <div className="absolute top-[30%] left-[55%] -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#46fc8b]/5 blur-[140px] pointer-events-none" />

      <LandingNavbar />
      <CoursesSection />
      <ConversionFooter />
    </main>
  );
}
