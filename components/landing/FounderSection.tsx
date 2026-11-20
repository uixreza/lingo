"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Fingerprint,
  Brain,
  Mic,
  Settings,
  ArrowRight,
  ArrowUpRight,
  Quote,
} from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

const pillars = [
  { icon: Brain, key: "pillar1" },
  { icon: Mic, key: "pillar2" },
  { icon: Settings, key: "pillar3" },
];

export default function FounderSection() {
  const { t, locale } = useLang();
  const headingFont =
    locale === "fa"
      ? "'Dana', 'Anjoman', sans-serif"
      : "var(--font-plus-jakarta), sans-serif";

  return (
    <section className="relative mx-auto w-full max-w-[1280px] px-5 py-14 lg:px-10 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 end-0 h-72 w-72 rounded-full bg-[#05df72]/[0.06] blur-[110px]"
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
            <Fingerprint size={13} />
            <span
              className={
                locale === "fa" ? "" : "uppercase tracking-[0.18em]"
              }>
              {t("landing.founder.label")}
            </span>
          </span>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <h2
              className="max-w-2xl text-[32px] leading-[1.15] tracking-tight text-[#eef4ee] sm:text-[38px] lg:text-[46px]"
              style={{
                fontFamily: headingFont,
                fontWeight: locale === "fa" ? 800 : 700,
              }}>
              {t("landing.founder.headline")}
            </h2>
            <p className="max-w-md text-[14.5px] leading-7 text-[#9fb5a6] lg:text-end">
              {t("landing.founder.subtitle")}
            </p>
          </div>
        </motion.div>

        {/* Founder + story */}
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:gap-7">
          {/* Founder portrait card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55 }}
            className="group relative flex flex-col overflow-hidden rounded-[30px] border border-white/[0.07] bg-[#0f1612] shadow-[0_35px_90px_-50px_rgba(0,0,0,0.95)] lg:col-span-5">
            <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/9] lg:aspect-[4/3]">
              <Image
                src="/me.jpg"
                alt={t("landing.founder.name")}
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover object-[50%_22%] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1612] via-[#0f1612]/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <p className="text-[23px] font-bold leading-tight tracking-tight text-white">
                  {t("landing.founder.name")}
                </p>
                <p className="mt-1 text-[13px] font-semibold text-[#46fc8b]">
                  {t("landing.founder.title")}
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10.5px] font-medium text-[#a9bcae]">
                  {t("landing.founder.cert1")}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10.5px] font-medium text-[#a9bcae]">
                  {t("landing.founder.cert2")}
                </span>
              </div>

              <div className="mt-auto flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 py-3.5">
                    <p className="text-[20px] font-bold tracking-tight text-[#eef4ee]">
                      {locale === "fa" ? "۱۰۰٪" : "100%"}
                    </p>
                    <p className="mt-0.5 text-[11.5px] leading-4 text-[#8ba394]">
                      {t("landing.founder.sessions")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 py-3.5">
                    <p className="text-[20px] font-bold tracking-tight text-[#46fc8b]">
                      A1–C2
                    </p>
                    <p className="mt-0.5 text-[11.5px] leading-4 text-[#8ba394]">
                      {t("landing.founder.avgIelts")}
                    </p>
                  </div>
                </div>

                <Link
                  href="/about"
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-[#46fc8b]/15 bg-[#46fc8b]/[0.06] px-4 py-2 text-[13px] font-semibold text-[#46fc8b] transition-colors hover:bg-[#46fc8b]/[0.12]">
                  <span>{t("landing.founder.readMore")}</span>
                  <ArrowRight
                    size={15}
                    className="rtl:rotate-180 transition-transform"
                  />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Story timeline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative flex flex-col justify-between gap-8 overflow-hidden rounded-[30px] border border-white/[0.07] bg-[linear-gradient(160deg,#151e18_0%,#101713_55%,#0b120e_100%)] p-6 sm:p-8 lg:col-span-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -end-16 h-64 w-64 rounded-full bg-[#05df72]/[0.09] blur-[80px]"
            />

            <div className="relative">
              <div className="mb-7 flex items-center gap-3">
                <span
                  dir="ltr"
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-[#6f8a79]">
                  01 / 03
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent rtl:bg-gradient-to-l" />
              </div>

              <div className="flex flex-col">
                {pillars.map((p, i) => (
                  <motion.div
                    key={p.key}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                    className="relative flex gap-4 pb-7 last:pb-0 sm:gap-5">
                    {i < pillars.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute start-6 top-[3.25rem] h-[calc(100%-3rem)] w-px bg-gradient-to-b from-[#46fc8b]/30 via-[#46fc8b]/10 to-transparent"
                      />
                    )}

                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#46fc8b]/15 bg-[#46fc8b]/[0.07] text-[#46fc8b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                      <p.icon size={22} />
                      <span className="absolute -end-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border border-[#46fc8b]/25 bg-[#0c1310] px-1 font-mono text-[9px] font-bold text-[#46fc8b]">
                        {`0${i + 1}`}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <h3 className="text-[19px] font-semibold leading-snug text-[#eef4ee] sm:text-[21px]">
                        {p.key === "pillar1"
                          ? t("landing.founder.pillar1")
                          : p.key === "pillar2"
                            ? t("landing.founder.pillar2")
                            : t("landing.founder.pillar3")}
                      </h3>
                      <p className="mt-1.5 max-w-xl text-[13.5px] leading-6 text-[#9fb5a6] sm:text-[14px]">
                        {p.key === "pillar1"
                          ? t("landing.founder.pillar1Desc")
                          : p.key === "pillar2"
                            ? t("landing.founder.pillar2Desc")
                            : t("landing.founder.pillar3Desc")}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#46fc8b] opacity-40" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#46fc8b]" />
                </span>
                <span className="text-[12.5px] leading-5 text-[#b7c7ba]">
                  {t("landing.founder.cohort")}
                </span>
              </div>

              <Link
                href="/test"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#46fc8b] px-4 py-2.5 text-[13px] font-bold text-[#003918] transition-colors hover:bg-[#7bffb0]">
                <span>{t("landing.founder.exploreTracks")}</span>
                <ArrowUpRight size={15} className="rtl:-scale-x-100" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Founder quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative overflow-hidden rounded-[30px] border border-[#46fc8b]/10 bg-[linear-gradient(100deg,rgba(70,252,139,0.07)_0%,rgba(15,22,18,0.65)_45%,rgba(11,18,14,0.9)_100%)] px-6 py-7 sm:px-10 sm:py-9">
          <Quote
            aria-hidden="true"
            className="pointer-events-none absolute -top-3 start-4 h-24 w-24 text-[#46fc8b]/[0.07]"
            fill="currentColor"
          />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <p
              className={`max-w-4xl text-[16px] leading-8 text-[#d6e2d8] sm:text-[18px] sm:leading-9 ${
                locale === "en" ? "italic" : ""
              }`}>
              &ldquo;{t("landing.founder.quote")}&rdquo;
            </p>
            <div className="flex shrink-0 items-center gap-3">
              <span className="h-10 w-px bg-gradient-to-b from-[#46fc8b]/60 to-transparent" />
              <div>
                <p className="text-[13px] font-semibold text-[#eef4ee]">
                  {t("landing.founder.name")}
                </p>
                <p className="mt-0.5 text-[11.5px] text-[#8ba394]">
                  {t("landing.founder.title")}
                </p>
              </div>
            </div>
          </div>
        </motion.blockquote>
      </div>
    </section>
  );
}
