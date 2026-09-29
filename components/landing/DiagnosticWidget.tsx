"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

const sentence = '"Despite the harsh market conditions, the startup managed to ______ a profit in its third quarter."';
const options = [
  "bring forward",
  "turn in",
  "turn out",
  "carry off",
];
const correctIndex = 1;

export default function DiagnosticWidget() {
  const [selected, setSelected] = useState<number | null>(null);
  const { t, locale } = useLang();

  return (
    <section className="w-full max-w-[1280px] mx-auto px-5 lg:px-10 py-12 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="p-6 lg:p-8 rounded-3xl bg-[#161d19] shadow-2xl relative overflow-hidden">
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#00a572]/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left — Copy */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#242c27] w-fit text-[13px] font-medium text-[#46fc8b]">
              <span>⚡</span>
              <span>{t("landing.diagnostic.tag")}</span>
            </div>
            <h2
              className="text-[30px] leading-tight font-semibold text-[#dde5dd]"
              style={{ fontFamily: locale === "fa" ? "var(--font-morabba-light), 'Dana', sans-serif" : "var(--font-plus-jakarta), 'Dana', sans-serif" }}>
              {t("landing.diagnostic.headline")}
            </h2>
            <p className="text-[13px] leading-[20px] text-[#bacbb9]">
              {t("landing.diagnostic.subtitle")}
            </p>
            <div className="flex items-center gap-4 pt-1 text-[13px] text-[#bacbb9]">
              <span className="flex items-center gap-1">
                <span className="text-[#46fc8b] font-bold">✓</span>{" "}
                {t("landing.diagnostic.noCredit")}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-[#46fc8b] font-bold">✓</span>{" "}
                {t("landing.diagnostic.instantScore")}
              </span>
            </div>
          </div>

          {/* Right — Widget */}
          <div className="lg:col-span-7 p-5 lg:p-6 rounded-2xl bg-[#1a211d]/90 backdrop-blur-xl shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#bacbb9]">
                {t("landing.diagnostic.question")}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#2f3732] text-[#4edea3] text-[11px] font-medium">
                {t("landing.diagnostic.level")}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#09100c]">
              <p className="text-[15px] leading-[24px] text-[#dde5dd] font-medium" dir="ltr" style={{ textAlign: "left" }}>
                {sentence}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((opt, i) => {
                const isCorrect = i === correctIndex;
                const isSelected = selected === i;
                const showCorrect = selected !== null && isCorrect;
                const showWrong = selected !== null && isSelected && !isCorrect;

                return (
                  <button
                    key={opt}
                    onClick={() => setSelected(i)}
                    className={`p-3 rounded-xl text-left transition-all flex items-center justify-between group ${
                      showCorrect
                        ? "bg-[#05df72] text-[#003918]"
                        : showWrong
                          ? "bg-[#93000a] text-[#ffdad6]"
                          : "bg-[#242c27] hover:bg-[#2f3732] text-[#dde5dd]"
                    }`}>
                    <span className="text-[13px] font-medium" dir="ltr">
                      {String.fromCharCode(65 + i)}) {opt}
                    </span>
                    <Check
                      size={16}
                      className={`transition-opacity ${
                        showCorrect || showWrong
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[12px] text-[#bacbb9]">
                {t("landing.diagnostic.hint")}
              </span>
              <Link
                href="/test"
                className="text-[13px] font-medium text-[#46fc8b] hover:underline">
                {t("landing.diagnostic.launchTest")}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
