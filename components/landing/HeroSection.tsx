"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Brain, Star, Target, Globe, Loader2 } from "lucide-react";
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
  const [avatarSeeds, setAvatarSeeds] = useState<string[] | null>(null);
  const { data: session } = useSession();
  const { open: openAuth } = useAuth();
  const { t, locale } = useLang();

  useEffect(() => {
    setAvatarSeeds(
      Array.from({ length: 3 }, () => Math.random().toString(36).slice(2, 10)),
    );
  }, []);

  const [badgeLead, ...badgeAccentParts] = t("landing.hero.badge")
    .split("•")
    .map((part) => part.trim())
    .filter(Boolean);
  const badgeAccent = badgeAccentParts.join(" • ");

  return (
    <section className="relative w-full max-w-[1280px] mx-auto px-5 lg:px-10 pt-28 lg:pt-24 pb-16 lg:pb-20">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left — Copy */}
        <div className="relative z-10 flex flex-col gap-5 lg:col-span-6 lg:gap-6">
          {/* Local ambient glow behind the copy */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 start-0 -z-10 h-64 w-64 rounded-full bg-[#05df72]/10 blur-[90px]"
          />

          {/* Eyebrow badge */}
          <motion.div
            variants={item}
            className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-[#46fc8b]/12 via-[#0b1410]/80 to-[#0b1410]/70 py-1.5 pe-3.5 ps-3 shadow-[0_10px_30px_-18px_rgba(5,223,114,0.6)] backdrop-blur-xl">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#46fc8b] opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#46fc8b] shadow-[0_0_8px_#46fc8b]" />
              </span>
              <span
                className={`text-[11px] font-semibold text-[#dde5dd] ${
                  locale === "fa" ? "" : "uppercase tracking-[0.12em]"
                }`}>
                {badgeLead}
              </span>
            </span>
            {badgeAccent && (
              <span
                className={`inline-flex items-center rounded-full border border-[#46fc8b]/20 bg-[#46fc8b]/[0.07] px-3 py-1.5 text-[11px] font-semibold text-[#46fc8b] shadow-[0_0_24px_-10px_rgba(70,252,139,0.65)] ${
                  locale === "fa" ? "" : "uppercase tracking-[0.12em]"
                }`}>
                {badgeAccent}
              </span>
            )}
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={item} className="flex flex-col gap-1">
            <span
              className="text-balance text-4xl leading-[1.12] tracking-tight text-[#dde5dd] sm:text-5xl md:text-[56px]"
              style={{
                fontFamily:
                  locale === "fa"
                    ? "'Dana', 'Anjoman', sans-serif"
                    : "var(--font-plus-jakarta), sans-serif",
                fontWeight: locale === "fa" ? 900 : 700,
              }}>
              {t("landing.hero.heading1")}
            </span>
            <span
              className="text-balance bg-gradient-to-r from-[#46fc8b] via-[#7bffb0] to-[#05df72] bg-clip-text text-4xl leading-[1.12] tracking-tight text-transparent drop-shadow-[0_0_28px_rgba(70,252,139,0.32)] sm:text-5xl md:text-[56px]"
              style={{
                fontFamily:
                  locale === "fa"
                    ? "'Dana', 'Anjoman', sans-serif"
                    : "var(--font-plus-jakarta), sans-serif",
                fontWeight: locale === "fa" ? 900 : 700,
              }}>
              {t("landing.hero.heading2")}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.div
            variants={item}
            className="relative max-w-xl overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0d1812]/80 via-[#0b1410]/55 to-[#09100c]/40 shadow-[0_18px_50px_-35px_rgba(0,0,0,0.9)] backdrop-blur-md">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 end-0 h-32 w-48 rounded-full bg-[#46fc8b]/10 blur-[45px]"
            />
            <p
              className="relative px-4 py-4 text-pretty text-[15.5px] leading-[28px] text-[#c2d0c3] sm:px-5 sm:text-[16.5px] sm:leading-[30px]"
              style={{
                fontFamily:
                  locale === "fa"
                    ? "'Dana', 'Anjoman', sans-serif"
                    : "var(--font-plus-jakarta), sans-serif",
              }}>
              {t("landing.hero.subtitle")}
            </p>
          </motion.div>

          {/* CTA dock */}
          <motion.div variants={item} className="pt-1">
            <div className="relative flex w-full max-w-[520px] flex-col gap-2 rounded-[26px] border border-white/10 bg-white/[0.035] p-2 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:flex-row">
              <Link
                href={session ? "/dashboard/sessions" : "#"}
                onClick={(e) => {
                  if (session) {
                    setStarting(true);
                  } else {
                    e.preventDefault();
                    openAuth();
                  }
                }}
                className="group relative flex flex-1 items-center justify-between gap-3 overflow-hidden rounded-[18px] bg-gradient-to-br from-[#46fc8b] via-[#20f47f] to-[#05df72] px-5 py-3.5 font-semibold text-[#003918] ring-1 ring-inset ring-white/25 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.45)_50%,transparent_75%)] opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100"
                />
                <span className="relative text-[15px] font-bold">
                  {t("landing.hero.start")}
                </span>
                <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#003918]/10 ring-1 ring-[#003918]/15 transition-transform duration-300 group-hover:scale-105">
                  {starting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Zap size={16} fill="currentColor" />
                  )}
                </span>
              </Link>

              <Link
                href="/test"
                className="group flex flex-1 items-center justify-between gap-3 rounded-[18px] px-4 py-3.5 text-start transition-colors duration-300 hover:bg-white/[0.05]">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#10b981]/12 text-[#10b981] ring-1 ring-[#10b981]/15">
                    <Brain size={16} />
                  </span>
                  <span className="truncate text-[13.5px] font-semibold text-[#dde5dd]">
                    {t("landing.hero.determineLevel")}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-[#46fc8b]/10 px-2 py-0.5 text-[10px] font-bold text-[#46fc8b] ring-1 ring-[#46fc8b]/25">
                  {t("landing.hero.free")}
                </span>
              </Link>
            </div>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={item} className="w-fit max-w-full">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-white/[0.07] bg-[#0b1410]/60 px-4 py-3 backdrop-blur-md">
              <div className="flex -space-x-2.5 rtl:space-x-reverse">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-9 overflow-hidden rounded-full border-2 border-[#0b1410] bg-[#1b2a22] shadow-[0_4px_14px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
                    {avatarSeeds && (
                      <img
                        src={`https://api.dicebear.com/10.x/notionists/svg?seed=${encodeURIComponent(avatarSeeds[i])}`}
                        alt="LingoFam student"
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>

              <span className="hidden h-8 w-px bg-white/10 sm:block" />

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#46fc8b]/12 text-[#46fc8b] ring-1 ring-[#46fc8b]/20">
                    <Star size={11} fill="currentColor" />
                  </span>
                  <span className="text-[11.5px] font-semibold text-[#dde5dd]">
                    A1 – C2
                  </span>
                </div>
                <span className="text-[11.5px] leading-5 text-[#9fb5a6]">
                  {t("landing.hero.rating")}
                </span>
              </div>
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
