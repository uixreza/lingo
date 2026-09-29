"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Fingerprint, Brain, Mic, Settings, ArrowRight, Quote } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

const pillars = [
  { icon: Brain, color: "text-[#46fc8b]", bg: "bg-[#46fc8b]/10", key: "pillar1" },
  { icon: Mic, color: "text-[#4edea3]", bg: "bg-[#4edea3]/10", key: "pillar2" },
  { icon: Settings, color: "text-[#3cfd8a]", bg: "bg-[#3cfd8a]/10", key: "pillar3" },
];

export default function FounderSection() {
  const { t, locale } = useLang();

  return (
    <section className="w-full max-w-[1280px] mx-auto px-5 lg:px-10 py-12 lg:py-20">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[#46fc8b] text-[12px] font-semibold uppercase tracking-widest">
            <Fingerprint size={16} />
            <span>{t("landing.founder.label")}</span>
          </div>
          <h2
            className="text-[30px] lg:text-[40px] leading-tight font-semibold text-[#dde5dd] tracking-tight"
            style={{ fontFamily: locale === "fa" ? "var(--font-morabba-light), 'Dana', sans-serif" : "var(--font-plus-jakarta), 'Dana', sans-serif" }}>
            {t("landing.founder.headline")}
          </h2>
          <p className="text-[15px] leading-[24px] text-[#bacbb9] max-w-2xl">
            {t("landing.founder.subtitle")}
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Founder Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 flex flex-col justify-between p-6 lg:p-8 rounded-2xl bg-[#1a211d]/90 backdrop-blur-xl shadow-xl relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#46fc8b]/10 blur-3xl pointer-events-none" />
            <div className="flex flex-col gap-4 z-10">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#242c27] shrink-0 shadow-md">
                  <Image
                    src="/me.jpg"
                    alt={t("landing.founder.name")}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[22px] font-semibold text-[#dde5dd]">
                    {t("landing.founder.name")}
                  </span>
                  <span className="text-[13px] font-medium text-[#46fc8b]">
                    {t("landing.founder.title")}
                  </span>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-[#2f3732] text-[10px] font-medium text-[#bacbb9] uppercase">
                      {t("landing.founder.cert1")}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#2f3732] text-[10px] font-medium text-[#bacbb9] uppercase">
                      {t("landing.founder.cert2")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#09100c]/60 text-[#bacbb9] text-[13px] leading-[20px] italic relative">
                <Quote
                  size={24}
                  className="absolute top-2 right-2 text-[#2f3732]"
                />
                &ldquo;{t("landing.founder.quote")}&rdquo;
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-[#242c27]/60">
                  <p className="text-[22px] font-semibold text-[#dde5dd]">
                    1-on-1
                  </p>
                  <p className="text-[12px] text-[#bacbb9]">
                    {t("landing.founder.sessions")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#242c27]/60">
                  <p className="text-[22px] font-semibold text-[#46fc8b]">
                    A1–C2
                  </p>
                  <p className="text-[12px] text-[#bacbb9]">
                    {t("landing.founder.avgIelts")}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 z-10">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-[13px] text-[#46fc8b] hover:text-[#3cfd8a] transition-colors font-semibold group">
                <span>{t("landing.founder.readMore")}</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </motion.div>

          {/* Methodology Pillars */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7 flex flex-col justify-between gap-4 p-6 lg:p-8 rounded-2xl bg-[#161d19] shadow-xl">
            <div className="flex flex-col gap-5">
              {pillars.map((p) => (
                <div key={p.key} className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${p.bg} flex items-center justify-center ${p.color} shrink-0`}>
                    <p.icon size={24} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[22px] font-semibold text-[#dde5dd]">
                      {p.key === "pillar1" ? t("landing.founder.pillar1") : p.key === "pillar2" ? t("landing.founder.pillar2") : t("landing.founder.pillar3")}
                    </h3>
                    <p className="text-[15px] leading-[24px] text-[#bacbb9]">
                      {p.key === "pillar1" ? t("landing.founder.pillar1Desc") : p.key === "pillar2" ? t("landing.founder.pillar2Desc") : t("landing.founder.pillar3Desc")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#242c27]/40 mt-2">
              <span className="text-[13px] text-[#bacbb9]">
                {t("landing.founder.cohort")}
              </span>
              <Link
                href="/test"
                className="px-4 py-1.5 rounded-lg bg-[#46fc8b]/20 hover:bg-[#46fc8b]/30 text-[#46fc8b] text-[13px] font-semibold transition-colors">
                {t("landing.founder.exploreTracks")}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
