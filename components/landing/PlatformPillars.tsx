"use client";

import { motion } from "framer-motion";
import { Gamepad2, AudioWaveform, Users } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

const pillars = [
  {
    icon: Gamepad2,
    color: "text-[#46fc8b]",
    bg: "bg-[#2f3732]",
    key: "drill",
    metricType: "bar" as const,
  },
  {
    icon: AudioWaveform,
    color: "text-[#4edea3]",
    bg: "bg-[#2f3732]",
    key: "speech",
    metricType: "status" as const,
  },
  {
    icon: Users,
    color: "text-[#3cfd8a]",
    bg: "bg-[#2f3732]",
    key: "lounges",
    metricType: "rooms" as const,
  },
];

export default function PlatformPillars() {
  const { t, locale } = useLang();

  return (
    <section className="w-full max-w-[1280px] mx-auto px-5 lg:px-10 py-8 lg:py-16">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[12px] font-semibold text-[#46fc8b] uppercase tracking-widest">
              {t("landing.pillars.label")}
            </span>
            <h2
              className="text-[30px] lg:text-[40px] leading-tight font-semibold text-[#dde5dd] tracking-tight"
              style={{ fontFamily: locale === "fa" ? "var(--font-morabba-light), 'Dana', sans-serif" : "var(--font-plus-jakarta), 'Dana', sans-serif" }}>
              {t("landing.pillars.headline")}
            </h2>
          </div>
          <p className="text-[15px] leading-[24px] text-[#bacbb9] max-w-md">
            {t("landing.pillars.subtitle")}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-6 lg:p-8 rounded-2xl bg-[#1a211d] flex flex-col gap-4 hover:bg-[#242c27] transition-colors shadow-lg group">
              <div
                className={`w-12 h-12 rounded-xl ${p.bg} flex items-center justify-center ${p.color} group-hover:scale-110 transition-transform`}>
                <p.icon size={26} />
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-[22px] font-semibold text-[#dde5dd]">
                  {p.key === "drill" ? t("landing.pillars.drill") : p.key === "speech" ? t("landing.pillars.speech") : t("landing.pillars.lounges")}
                </h3>
                <p className="text-[13px] leading-[20px] text-[#bacbb9]">
                  {p.key === "drill" ? t("landing.pillars.drillDesc") : p.key === "speech" ? t("landing.pillars.speechDesc") : t("landing.pillars.loungesDesc")}
                </p>
              </div>

              {/* Metric */}
              <div className="mt-auto pt-2">
                {p.metricType === "bar" && (
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[#09100c] text-[11px] text-[#46fc8b]">
                      {t("landing.pillars.drillMetric")}: EN / TR / DE
                    </span>
                  </div>
                )}
                {p.metricType === "status" && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#09100c] text-[11px] text-[#4edea3]">
                    <span>{t("landing.pillars.speechLatency")}: 50</span>
                    <span className="text-[#bacbb9]">
                      {t("landing.pillars.speechMatch")}
                    </span>
                  </div>
                )}
                {p.metricType === "rooms" && (
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[#09100c] text-[11px] text-[#3cfd8a]">
                      {t("landing.pillars.activeRooms")}: Dictionary, Notebook, Radio, Blog
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
