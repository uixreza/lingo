"use client";

import { motion } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";

const metrics = [
  { key: "students", color: "text-[#46fc8b]" },
  { key: "ielts", color: "text-[#4edea3]" },
  { key: "ai", color: "text-[#dde5dd]" },
  { key: "heritage", color: "text-[#3cfd8a]" },
] as const;

export default function MetricsBar() {
  const { t, locale } = useLang();

  return (
    <section className="w-full max-w-[1280px] mx-auto px-5 lg:px-10 py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 rounded-2xl bg-[#1a211d]/70 backdrop-blur-xl p-6 lg:p-8 shadow-xl">
        {metrics.map((m) => (
          <div
            key={m.key}
            className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
            <span
              className={`text-[34px] leading-tight font-semibold ${m.color}`}
              style={{ fontFamily: locale === "fa" ? "var(--font-morabba-light), 'Dana', sans-serif" : "var(--font-plus-jakarta), 'Dana', sans-serif" }}>
              {t(`landing.metrics.${m.key}`)}
            </span>
            <span className="text-[13px] text-[#bacbb9]">
              {t(`landing.metrics.${m.key}Label`)}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
