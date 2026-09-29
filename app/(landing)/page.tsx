"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Snowfall from "react-snowfall";
import { useLang } from "@/contexts/LanguageContext";

import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import MetricsBar from "@/components/landing/MetricsBar";
import FounderSection from "@/components/landing/FounderSection";
import PlatformPillars from "@/components/landing/PlatformPillars";
import DiagnosticWidget from "@/components/landing/DiagnosticWidget";
import ConversionFooter from "@/components/landing/ConversionFooter";

function useIsMobile() {
  const subscribe = (onChange: () => void) => {
    const mql = window.matchMedia("(max-width: 639px)");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  };
  const getSnapshot = () => window.matchMedia("(max-width: 639px)").matches;
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}

export default function Home() {
  const [christmas, setChristmas] = useState(false);
  const isMobile = useIsMobile();
  const { locale } = useLang();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/site-status", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setChristmas(data.christmas);
        }
      } catch {
        // default to false
      }
    };
    fetchStatus();
  }, []);

  return (
    <main
      style={{
        fontFamily:
          locale === "en"
            ? "var(--font-plus-jakarta), 'Dana', sans-serif"
            : "var(--font-morabba-light), 'Dana', sans-serif",
      }}
      className="relative min-h-screen bg-[#09100c] overflow-hidden">
      {christmas && (
        <Snowfall
          color="#dee4fd"
          snowflakeCount={isMobile ? 40 : 200}
          speed={[0.5, 3]}
          wind={[-0.5, 2]}
          radius={[0.5, 3]}
        />
      )}

      {/* Ambient blurs */}
      <div className="absolute top-[-200px] left-[-10%] w-[800px] h-[800px] rounded-full bg-[#05df72]/8 blur-[180px] pointer-events-none" />
      <div className="absolute top-[30%] left-[55%] -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#46fc8b]/5 blur-[140px] pointer-events-none" />
      <div className="absolute top-[60%] left-[15%] w-[300px] h-[300px] rounded-full bg-[#05df72]/6 blur-[100px] pointer-events-none" />

      <LandingNavbar />
      <HeroSection christmas={christmas} />
      <MetricsBar />
      <FounderSection />
      <PlatformPillars />
      <DiagnosticWidget />
      <ConversionFooter />
    </main>
  );
}
