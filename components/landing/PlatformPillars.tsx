"use client";

import { motion } from "framer-motion";
import { Gamepad2, AudioWaveform, Users } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

const pillars = [
  { icon: Gamepad2, key: "drill" },
  { icon: AudioWaveform, key: "speech" },
  { icon: Users, key: "lounges" },
];

export default function PlatformPillars() {
  const { t, locale } = useLang();
  const headingFont =
    locale === "fa"
      ? "'Dana', 'Anjoman', sans-serif"
      : "var(--font-plus-jakarta), sans-serif";

  return (
    <section className="relative mx-auto w-full max-w-[1280px] px-5 py-14 lg:px-10 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 start-0 h-64 w-64 rounded-full bg-[#05df72]/[0.05] blur-[100px]"
      />

      <div className="relative flex flex-col gap-8 lg:gap-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-5">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#46fc8b]/20 bg-[#46fc8b]/[0.06] px-3 py-1.5 text-[10.5px] font-semibold text-[#46fc8b]">
            <Gamepad2 size={13} />
            <span
              className={locale === "fa" ? "" : "uppercase tracking-[0.18em]"}>
              {t("landing.pillars.label")}
            </span>
          </span>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <h2
              className="max-w-2xl text-[32px] leading-[1.15] tracking-tight text-[#eef4ee] sm:text-[38px] lg:text-[46px]"
              style={{
                fontFamily: headingFont,
                fontWeight: locale === "fa" ? 800 : 700,
              }}>
              {t("landing.pillars.headline")}
            </h2>
            <p className="max-w-md text-[14.5px] leading-7 text-[#9fb5a6] lg:text-end">
              {t("landing.pillars.subtitle")}
            </p>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
          {pillars.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="group relative flex flex-col overflow-hidden rounded-[26px] border border-white/[0.07] bg-[#101713] p-6 transition-colors duration-300 hover:border-[#46fc8b]/20 hover:bg-[#121b15] lg:p-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 -end-14 h-44 w-44 rounded-full bg-[#46fc8b]/[0.06] opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              />

              <div className="relative flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#46fc8b]/15 bg-[#46fc8b]/[0.07] text-[#46fc8b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <p.icon size={22} />
                </span>
                <span className="font-mono text-[10px] tracking-[0.25em] text-[#6f8a79]">
                  {`0${i + 1}`}
                </span>
              </div>

              <div className="relative mt-5 flex flex-col gap-2">
                <h3 className="text-[20px] font-semibold leading-snug text-[#eef4ee]">
                  {p.key === "drill"
                    ? t("landing.pillars.drill")
                    : p.key === "speech"
                      ? t("landing.pillars.speech")
                      : t("landing.pillars.lounges")}
                </h3>
                <p className="text-[13.5px] leading-6 text-[#9fb5a6]">
                  {p.key === "drill"
                    ? t("landing.pillars.drillDesc")
                    : p.key === "speech"
                      ? t("landing.pillars.speechDesc")
                      : t("landing.pillars.loungesDesc")}
                </p>
              </div>

            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
