"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Zap,
  CheckCircle2,
  ArrowRight,
  MousePointerClick,
} from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

const sentence =
  '"Despite the harsh market conditions, the startup managed to ______ a profit in its third quarter."';
const options = ["bring forward", "turn in", "turn out", "carry off"];
const correctIndex = 1;

export default function DiagnosticWidget() {
  const [selected, setSelected] = useState<number | null>(null);
  const { t, locale } = useLang();
  const headingFont =
    locale === "fa"
      ? "'Dana', 'Anjoman', sans-serif"
      : "var(--font-plus-jakarta), sans-serif";
  const launchLabel = t("landing.diagnostic.launchTest")
    .replace(/[→←]\s*$/, "")
    .trim();

  return (
    <section className="relative mx-auto w-full max-w-[1280px] px-5 py-14 lg:px-10 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55 }}
        className="relative overflow-hidden rounded-[32px] border border-white/[0.07] bg-[linear-gradient(140deg,#121b15_0%,#0d1510_55%,#0a110d_100%)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 start-1/3 h-80 w-80 rounded-full bg-[#05df72]/[0.1] blur-[100px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -end-24 h-80 w-80 rounded-full bg-[#46fc8b]/[0.05] blur-[100px]"
        />

        <div className="relative grid gap-10 p-6 sm:p-8 lg:grid-cols-12 lg:items-center lg:gap-12 lg:p-10">
          {/* Copy */}
          <div className="flex flex-col gap-5 lg:col-span-5">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#46fc8b]/20 bg-[#46fc8b]/[0.06] px-3 py-1.5 text-[10.5px] font-semibold text-[#46fc8b]">
              <Zap size={13} />
              <span
                className={
                  locale === "fa" ? "" : "uppercase tracking-[0.18em]"
                }>
                {t("landing.diagnostic.tag")}
              </span>
            </span>

            <h2
              className="max-w-md text-[30px] leading-[1.2] tracking-tight text-[#eef4ee] sm:text-[36px] lg:text-[40px]"
              style={{
                fontFamily: headingFont,
                fontWeight: locale === "fa" ? 800 : 700,
              }}>
              {t("landing.diagnostic.headline")}
            </h2>

            <p className="max-w-md text-[14.5px] leading-7 text-[#9fb5a6]">
              {t("landing.diagnostic.subtitle")}
            </p>

            <div className="flex flex-wrap gap-2.5">
              {[t("landing.diagnostic.noCredit"), t("landing.diagnostic.instantScore")].map(
                (feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[12px] text-[#b7c7ba]">
                    <CheckCircle2 size={14} className="shrink-0 text-[#46fc8b]" />
                    {feature}
                  </span>
                ),
              )}
            </div>

            <div className="pt-1">
              <Link
                href="/test"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#46fc8b] px-5 py-3 text-[13.5px] font-bold text-[#003918] ring-1 ring-inset ring-white/25 transition-colors hover:bg-[#7bffb0]">
                <span>{launchLabel}</span>
                <ArrowRight
                  size={16}
                  className="rtl:rotate-180 transition-transform"
                />
              </Link>
            </div>
          </div>

          {/* Interactive sample */}
          <div className="rounded-[24px] border border-white/[0.08] bg-[#0b130e]/80 p-4 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-5 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] font-semibold text-[#9fb5a6]">
                {t("landing.diagnostic.question")}
              </span>
              <span className="rounded-full border border-[#46fc8b]/20 bg-[#46fc8b]/[0.07] px-2.5 py-1 text-[10px] font-semibold text-[#46fc8b]">
                {t("landing.diagnostic.level")}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-[2px]" aria-hidden="true">
              {Array.from({ length: 50 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i === 0 ? "bg-[#46fc8b]" : "bg-white/[0.06]"
                  }`}
                />
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-white/[0.06] bg-[#09100c] p-4">
              <p
                dir="ltr"
                className="text-left font-mono text-[13px] leading-6 text-[#dde5dd] sm:text-[14px] sm:leading-7">
                {sentence}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2" dir="ltr">
              {options.map((opt, i) => {
                const isCorrect = i === correctIndex;
                const isSelected = selected === i;
                const showCorrect = selected !== null && isCorrect;
                const showWrong = selected !== null && isSelected && !isCorrect;
                const muted =
                  selected !== null && !isCorrect && !isSelected;

                return (
                  <button
                    key={opt}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelected(i)}
                    dir="ltr"
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200 ${
                      showCorrect
                        ? "border-[#46fc8b] bg-[#46fc8b] text-[#003918]"
                        : showWrong
                          ? "border-red-400/40 bg-red-500/10 text-[#ffb4ab]"
                          : `border-white/[0.07] bg-white/[0.03] text-[#dde5dd] hover:border-[#46fc8b]/30 hover:bg-[#46fc8b]/[0.06] ${
                              muted ? "opacity-55" : ""
                            }`
                    }`}>
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border font-mono text-[9px] font-semibold ${
                          showCorrect
                            ? "border-[#003918]/20 bg-[#003918]/10"
                            : showWrong
                              ? "border-red-400/30 bg-red-500/10"
                              : "border-white/10 bg-white/[0.04] text-[#9fb5a6]"
                        }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="font-mono text-[12px]">{opt}</span>
                    </span>
                    {showCorrect ? (
                      <Check size={15} className="shrink-0" />
                    ) : showWrong ? (
                      <X size={15} className="shrink-0" />
                    ) : (
                      <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/10" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-[11.5px] text-[#9fb5a6]">
              <MousePointerClick size={14} className="shrink-0 text-[#46fc8b]" />
              {t("landing.diagnostic.hint")}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
