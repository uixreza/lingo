"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Minus, Plus } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  const { t, locale } = useLang();
  const headingFont =
    locale === "fa"
      ? "'Dana', 'Anjoman', sans-serif"
      : "var(--font-plus-jakarta), sans-serif";

  return (
    <section className="relative mx-auto w-full max-w-[1280px] px-5 py-14 lg:px-10 lg:py-24">
      <div className="flex flex-col gap-8 lg:gap-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-5">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#46fc8b]/20 bg-[#46fc8b]/[0.06] px-3 py-1.5 text-[10.5px] font-semibold text-[#46fc8b]">
            <HelpCircle size={13} />
            <span
              className={locale === "fa" ? "" : "uppercase tracking-[0.18em]"}>
              {t("landing.faq.label")}
            </span>
          </span>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <h2
              className="max-w-2xl text-[32px] leading-[1.15] tracking-tight text-[#eef4ee] sm:text-[38px] lg:text-[46px]"
              style={{
                fontFamily: headingFont,
                fontWeight: locale === "fa" ? 800 : 700,
              }}>
              {t("landing.faq.headline")}
            </h2>
            <p className="max-w-md text-[14.5px] leading-7 text-[#9fb5a6] lg:text-end">
              {t("landing.faq.subtitle")}
            </p>
          </div>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#0f1612]">
          {faqKeys.map((key, i) => {
            const isOpen = open === i;
            const panelId = `faq-panel-${key}`;
            const buttonId = `faq-button-${key}`;

            return (
              <div
                key={key}
                className={`transition-colors duration-300 ${
                  i > 0 ? "border-t border-white/[0.06]" : ""
                } ${isOpen ? "bg-[#121b15]" : "hover:bg-white/[0.02]"}`}>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-start sm:px-6">
                  <span
                    className={`w-7 shrink-0 font-mono text-[10px] font-semibold tracking-[0.15em] transition-colors ${
                      isOpen ? "text-[#46fc8b]" : "text-[#5d7565]"
                    }`}>
                    {`0${i + 1}`}
                  </span>
                  <span
                    className={`min-w-0 flex-1 text-[14.5px] font-medium leading-snug transition-colors sm:text-[16px] ${
                      isOpen
                        ? "text-[#eef4ee]"
                        : "text-[#dde5dd] group-hover:text-white"
                    }`}>
                    {t(`landing.faq.${key}.question`)}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                      isOpen
                        ? "border-[#46fc8b]/30 bg-[#46fc8b]/10 text-[#46fc8b]"
                        : "border-white/[0.08] text-[#9fb5a6] group-hover:border-[#46fc8b]/25 group-hover:text-[#46fc8b]"
                    }`}>
                    {isOpen ? (
                      <Minus size={15} className="transition-transform duration-300" />
                    ) : (
                      <Plus size={15} className="transition-transform duration-300" />
                    )}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      className="overflow-hidden">
                      <p className="px-5 pb-6 text-[13.5px] leading-7 text-[#9fb5a6] ps-[3.1rem] sm:px-6 sm:ps-[3.6rem]">
                        {t(`landing.faq.${key}.answer`)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
