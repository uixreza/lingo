"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, Maximize2 } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

export default function IntroVideoSection() {
  const { t, locale } = useLang();
  const [playing, setPlaying] = useState(false);

  return (
    <section className="w-full max-w-[1280px] mx-auto px-5 lg:px-10 py-8 lg:py-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[12px] font-semibold text-[#46fc8b] uppercase tracking-widest">
            {t("landing.intro.label")}
          </span>
          <h2
            className="text-[30px] lg:text-[40px] leading-tight font-semibold text-[#dde5dd] tracking-tight"
            style={{ fontFamily: locale === "fa" ? "var(--font-morabba-light), 'Dana', sans-serif" : "var(--font-plus-jakarta), 'Dana', sans-serif" }}>
            {t("landing.intro.headline")}
          </h2>
        </div>
        <p className="text-[15px] leading-[24px] text-[#bacbb9] max-w-md">
          {t("landing.intro.subtitle")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="relative mt-8 lg:mt-10">
        {/* Ambient theme glow behind the video */}
        <div className="pointer-events-none absolute -inset-8 rounded-[48px] bg-[#05df72]/10 blur-[80px]" />
        <div className="pointer-events-none absolute -top-12 left-[18%] w-[420px] h-[220px] rounded-full bg-[#46fc8b]/12 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-12 right-[16%] w-[360px] h-[200px] rounded-full bg-[#05df72]/8 blur-[90px]" />
        <div className="pointer-events-none absolute inset-x-10 -bottom-6 h-16 rounded-full bg-[#05df72]/15 blur-[60px]" />

        <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#111c16] via-[#0b1310] to-[#060a08] ring-1 ring-white/10 shadow-[0_24px_90px_rgba(5,223,114,0.18)] group">
          {/* Mock frame content */}
          <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_30%_25%,rgba(70,252,139,0.18),transparent_55%),radial-gradient(circle_at_75%_70%,rgba(5,223,114,0.12),transparent_50%)]" />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(221,229,221,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(221,229,221,0.35) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage:
                "radial-gradient(circle at center, black 20%, transparent 75%)",
            }}
          />

          {/* Mock badge */}
          <span className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md ring-1 ring-white/10 text-[11px] font-semibold text-[#dde5dd]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#46fc8b] animate-pulse" />
            {t("landing.intro.mock")}
          </span>

          <AnimatePresence mode="wait">
            {!playing ? (
              <motion.div
                key="poster"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  aria-label={t("landing.intro.play")}
                  className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#05df72] text-[#003918] shadow-[0_0_50px_rgba(70,252,139,0.5)] transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_70px_rgba(70,252,139,0.7)] focus:outline-none focus:ring-4 focus:ring-[#05df72]/40">
                  <span className="absolute inset-0 rounded-full bg-[#05df72]/40 animate-ping" style={{ animationDuration: "2.4s" }} />
                  <Play className="relative h-8 w-8 translate-x-[2px]" fill="currentColor" />
                </button>
                <span className="text-[13px] font-medium text-[#bacbb9]">
                  {t("landing.intro.play")}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="player"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
                <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />

                <div className="relative flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[#dde5dd]/70 text-[13px] font-semibold px-3 py-1.5 rounded-full bg-black/50 ring-1 ring-white/10">
                    {t("landing.intro.playingNote")}
                  </motion.div>
                </div>

                {/* Mock player controls */}
                <div className="relative mt-4 flex items-center gap-3 rounded-2xl bg-black/55 backdrop-blur-md px-3 py-2.5 ring-1 ring-white/10">
                  <button
                    type="button"
                    onClick={() => setPlaying(false)}
                    aria-label={t("landing.intro.pause")}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#05df72] text-[#003918] hover:bg-[#3cfd8a] transition-colors">
                    <Pause className="h-4 w-4" fill="currentColor" />
                  </button>
                  <span className="text-[11px] tabular-nums text-[#bacbb9]" dir="ltr">
                    00:04
                  </span>
                  <div className="relative h-1.5 flex-1 rounded-full bg-white/15 overflow-hidden">
                    <motion.div
                      initial={{ width: "4%" }}
                      animate={{ width: "62%" }}
                      transition={{ duration: 8, ease: "linear" }}
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#46fc8b] to-[#05df72]"
                    />
                  </div>
                  <span className="text-[11px] tabular-nums text-[#bacbb9]" dir="ltr">
                    02:30
                  </span>
                  <div className="hidden sm:flex items-center gap-2 text-[#bacbb9]">
                    <Volume2 className="h-4 w-4" />
                    <Maximize2 className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
