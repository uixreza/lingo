"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Presentation,
  Languages,
  History,
} from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

const metrics = [
  { key: "students", icon: GraduationCap, color: "text-[#46fc8b]" },
  { key: "ielts", icon: Presentation, color: "text-[#4edea3]" },
  { key: "ai", icon: Languages, color: "text-[#dde5dd]" },
  { key: "heritage", icon: History, color: "text-[#3cfd8a]" },
] as const;

function extractYears(experience: string | null | undefined): number | null {
  if (!experience) return null;
  const normalized = experience
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  const match = normalized.match(/\d+/);
  if (!match) return null;
  const years = parseInt(match[0], 10);
  return Number.isFinite(years) && years > 0 ? years : null;
}

export default function MetricsBar() {
  const { t, locale } = useLang();
  const [years, setYears] = useState<number | null>(null);
  const headingFont =
    locale === "fa"
      ? "'Dana', 'Anjoman', sans-serif"
      : "var(--font-plus-jakarta), sans-serif";

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const res = await fetch("/api/mentor", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setYears(extractYears(data?.mentor?.experience));
      } catch {
        // keep the static fallback value
      }
    };
    fetchExperience();
  }, []);

  const metricValue = (key: (typeof metrics)[number]["key"]) => {
    if (key === "heritage" && years !== null) {
      const n = new Intl.NumberFormat(
        locale === "fa" ? "fa-IR" : "en-US",
      ).format(years);
      return `+${n} ${t("landing.metrics.yearsUnit")}`;
    }
    return t(`landing.metrics.${key}`);
  };

  return (
    <section
      id="metrics"
      className="relative mx-auto w-full max-w-[1280px] px-5 py-4 lg:px-10 lg:py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[26px] border border-white/[0.07] bg-[#0f1612]/80 backdrop-blur-xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#46fc8b]/30 to-transparent"
        />

        <div className="grid grid-cols-2 md:grid-cols-4">
          {metrics.map((m, i) => (
            <div
              key={m.key}
              className={`group relative flex flex-col gap-4 p-5 transition-colors duration-300 hover:bg-white/[0.02] sm:p-6 ${
                i >= 2 ? "border-t border-white/[0.06] md:border-t-0" : ""
              } ${
                i % 2 === 1 ? "border-s border-white/[0.06]" : ""
              } ${
                i === 0
                  ? "md:border-s-0"
                  : "md:border-s md:border-white/[0.06]"
              }`}>
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border border-[#46fc8b]/12 bg-[#46fc8b]/[0.06] ${m.color}`}>
                  <m.icon size={16} />
                </span>
                <span className="font-mono text-[9px] tracking-[0.2em] text-[#5d7565]">
                  {`0${i + 1}`}
                </span>
              </div>

              <div>
                <p
                  className={`text-[27px] font-bold leading-none tracking-tight sm:text-[30px] ${m.color}`}
                  style={{ fontFamily: headingFont }}>
                  {metricValue(m.key)}
                </p>
                <p className="mt-2.5 text-[11.5px] leading-5 text-[#9fb5a6]">
                  {t(`landing.metrics.${m.key}Label`)}
                </p>
              </div>

              <span
                aria-hidden="true"
                className="mt-auto h-px w-full bg-gradient-to-r from-[#46fc8b]/20 to-transparent rtl:bg-gradient-to-l"
              />
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
