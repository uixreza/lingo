"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  const { t, locale } = useLang();

  return (
    <section className="w-full max-w-[1280px] mx-auto px-5 lg:px-10 py-12 lg:py-20">
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:w-1/3 flex flex-col gap-3">
          <span className="text-[12px] font-semibold text-[#46fc8b] uppercase tracking-widest">
            {t("landing.faq.label")}
          </span>
          <h2
            className="text-[30px] lg:text-[40px] leading-tight font-semibold text-[#dde5dd] tracking-tight"
            style={{ fontFamily: locale === "fa" ? "var(--font-morabba-light), 'Dana', sans-serif" : "var(--font-plus-jakarta), 'Dana', sans-serif" }}>
            {t("landing.faq.headline")}
          </h2>
          <p className="text-[15px] leading-[24px] text-[#bacbb9] max-w-md">
            {t("landing.faq.subtitle")}
          </p>
        </motion.div>

        {/* Accordion */}
        <div className="lg:w-2/3 flex flex-col gap-3">
          {faqKeys.map((key, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className={`rounded-2xl bg-[#1a211d] overflow-hidden transition-colors ${
                  isOpen ? "bg-[#242c27] shadow-lg" : "hover:bg-[#242c27]"
                }`}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-right cursor-pointer">
                  <div className="flex items-center gap-3 min-w-0">
                    <HelpCircle
                      size={20}
                      className={`shrink-0 transition-colors ${
                        isOpen ? "text-[#46fc8b]" : "text-[#bacbb9]"
                      }`}
                    />
                    <span className="text-[16px] font-medium text-[#dde5dd]">
                      {t(`landing.faq.${key}.question`)}
                    </span>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-[#bacbb9] transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[#46fc8b]" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden">
                      <p className="px-5 pb-5 ps-[2.75rem] text-[13px] leading-[20px] text-[#bacbb9]">
                        {t(`landing.faq.${key}.answer`)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
