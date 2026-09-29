"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Brain, Star, Target, Globe } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function HeroSection({ christmas }: { christmas: boolean }) {
  const [starting, setStarting] = useState(false);
  const { data: session } = useSession();
  const { open: openAuth } = useAuth();
  const { t, locale } = useLang();

  return (
    <section className="relative w-full max-w-[1280px] mx-auto px-5 lg:px-10 pt-28 lg:pt-24 pb-16 lg:pb-20">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left — Copy */}
        <div className="lg:col-span-6 flex flex-col gap-4 z-10">
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#242c27]/80 backdrop-blur-md w-fit">
            <span className="w-2 h-2 rounded-full bg-[#46fc8b] shadow-[0_0_8px_#46fc8b] animate-pulse" />
            <span className="text-[12px] font-semibold text-[#46fc8b] uppercase tracking-wider">
              {t("landing.hero.badge")}
            </span>
          </motion.div>

          <motion.div variants={item} className="flex flex-col gap-1">
            <span
              className="text-4xl sm:text-5xl md:text-[56px] leading-[1.1] tracking-tight text-[#dde5dd]"
              style={{
                fontFamily:
                  locale === "fa"
                    ? "var(--font-morabba-light), 'Dana', sans-serif"
                    : "var(--font-plus-jakarta), 'Dana', sans-serif",
                fontWeight: 300,
              }}>
              {t("landing.hero.heading1")}
            </span>
            <span
              className="text-4xl sm:text-5xl md:text-[56px] leading-[1.1] tracking-tight text-[#46fc8b] font-semibold"
              style={{
                fontFamily:
                  locale === "fa"
                    ? "var(--font-morabba-bold), 'Dana', sans-serif"
                    : "var(--font-plus-jakarta), 'Dana', sans-serif",
                textShadow: "0 0 32px rgba(70,252,139,0.45)",
              }}>
              {t("landing.hero.heading2")}
            </span>
          </motion.div>

          <motion.p
            variants={item}
            className="text-[18px] leading-[28px] text-[#bacbb9] max-w-xl"
            style={{
              fontFamily:
                locale === "fa"
                  ? "var(--font-morabba-light), 'Dana', sans-serif"
                  : "var(--font-plus-jakarta), 'Dana', sans-serif",
            }}>
            {t("landing.hero.subtitle")}
          </motion.p>

          <motion.div
            variants={item}
            className="flex flex-wrap items-center gap-4 pt-1">
            <Link href={session ? "/dashboard/sessions" : "#"}>
              <button
                onClick={(e) => {
                  if (session) {
                    setStarting(true);
                  } else {
                    e.preventDefault();
                    openAuth();
                  }
                }}
                className="px-6 py-3.5 rounded-xl bg-[#05df72] text-[#003918] font-semibold shadow-[0_0_26px_rgba(70,252,139,0.45)] hover:shadow-[0_0_36px_rgba(70,252,139,0.7)] hover:bg-[#3cfd8a] transition-all duration-300 flex items-center gap-2 text-[15px]">
                <span>{t("landing.hero.start")}</span>
                <Zap size={18} />
              </button>
            </Link>
            <div className="relative inline-flex">
              <Link
                href="/test"
                className="px-5 py-3 rounded-xl bg-[#242c27]/90 hover:bg-[#2f3732] text-[#dde5dd] text-[13px] transition-all backdrop-blur-md flex items-center gap-2 ring-1 ring-white/10">
                <Brain size={18} className="text-[#10b981]" />
                <span>{t("landing.hero.determineLevel")}</span>
              </Link>
              <span className="absolute -top-2.5 -right-2 px-2 py-0.5 rounded-full bg-[#00a572] text-[#00311f] text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(0,165,114,0.5)]">
                {t("landing.hero.free")}
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-2">
              {["EN", "TR", "DE"].map((lang, i) => (
                <div
                  key={lang}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border-2 border-[#09100c]"
                  style={{
                    backgroundColor: ["#242c27", "#2f3732", "#3c4a3d"][i],
                    color: ["#46fc8b", "#4edea3", "#3cfd8a"][i],
                  }}>
                  {lang}
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-[#46fc8b]">
                <Star size={16} fill="currentColor" />
                <span className="text-[12px] font-semibold text-[#dde5dd]">
                  A1 – C2
                </span>
              </div>
              <span className="text-[13px] text-[#bacbb9]">
                {t("landing.hero.rating")}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right — Visual */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          <div className="relative w-full max-w-[540px] flex items-center justify-center">
            <Image
              key={christmas ? "snow" : "default"}
              alt="LingoFam studio"
              src={christmas ? "/miniRoomSnow.webp" : "/miniRoom.webp"}
              width={800}
              height={600}
              quality={100}
              className="w-full h-auto select-none pointer-events-none"
              priority
            />

            {/* Floating pill — CEFR Level */}
            <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-[#09100c]/85 backdrop-blur-xl shadow-lg flex items-center gap-2.5 animate-float">
              <div className="w-9 h-9 rounded-lg bg-[#46fc8b]/20 flex items-center justify-center text-[#46fc8b]">
                <Target size={20} />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#dde5dd]">
                  {t("landing.hero.streak")}
                </p>
                <p className="text-[13px] font-medium text-[#46fc8b]">
                  {t("landing.hero.streakDays")}
                </p>
              </div>
            </div>

            {/* Floating pill — Languages */}
            <div className="absolute bottom-5 right-5 p-2.5 rounded-xl bg-[#09100c]/85 backdrop-blur-xl shadow-lg flex items-center gap-2.5 animate-float-delay">
              <div className="w-9 h-9 rounded-lg bg-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                <Globe size={20} />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#dde5dd]">
                  {t("landing.hero.fluency")}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-[#10b981]">
                    {t("landing.hero.fluencyValue")}
                  </span>
                  <span className="text-[11px] text-[#bacbb9]">
                    {t("landing.hero.fluencyLabel")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
