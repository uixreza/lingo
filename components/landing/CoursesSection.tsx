"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Clock, Layers, ShoppingBag, Flame, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";

const courses = [
  {
    key: "general",
    price: 1490000,
    oldPrice: 1900000,
    lessons: 24,
    weeks: 8,
    level: "A1–B1",
    hot: true,
  },
  {
    key: "ielts",
    price: 2950000,
    oldPrice: 3600000,
    lessons: 36,
    weeks: 10,
    level: "B1–C1",
    hot: false,
  },
  {
    key: "business",
    price: 1850000,
    oldPrice: 0,
    lessons: 20,
    weeks: 6,
    level: "B1–B2",
    hot: false,
  },
  {
    key: "german",
    price: 1250000,
    oldPrice: 1600000,
    lessons: 18,
    weeks: 8,
    level: "A1–A2",
    hot: false,
  },
] as const;

export default function CoursesSection() {
  const { t, locale } = useLang();
  const { data: session } = useSession();
  const { open: openAuth } = useAuth();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(value);

  const handleBuy = () => {
    if (!session?.user) {
      openAuth();
      return;
    }
    setToast(t("courses.checkoutSoon"));
  };

  return (
    <section className="relative w-full max-w-[1280px] mx-auto px-5 lg:px-10 pt-28 lg:pt-24 pb-16 lg:pb-20">
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
              {t("courses.label")}
            </span>
            <h1
              className="text-[30px] lg:text-[40px] leading-tight font-semibold text-[#dde5dd] tracking-tight"
              style={{ fontFamily: locale === "fa" ? "var(--font-morabba-light), 'Dana', sans-serif" : "var(--font-plus-jakarta), 'Dana', sans-serif" }}>
              {t("courses.headline")}
            </h1>
          </div>
          <p className="text-[15px] leading-[24px] text-[#bacbb9] max-w-md">
            {t("courses.subtitle")}
          </p>
        </motion.div>

        {/* Course cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {courses.map((c, i) => (
            <motion.article
              key={c.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative p-6 rounded-2xl bg-[#1a211d] ring-1 ring-white/5 flex flex-col gap-4 hover:bg-[#242c27] hover:ring-[#05df72]/30 transition-all shadow-lg group">
              {c.hot && (
                <span className="absolute -top-3 start-5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0d1412] ring-1 ring-[#05df72]/40 text-[11px] font-semibold text-[#46fc8b] shadow-[0_0_16px_rgba(70,252,139,0.25)]">
                  <Flame size={12} />
                  {t("courses.hot")}
                </span>
              )}

              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#09100c] text-[11px] text-[#4edea3]">
                  {t("courses.level")} {c.level}
                </span>
                <span className="w-10 h-10 rounded-xl bg-[#2f3732] flex items-center justify-center text-[#46fc8b] group-hover:scale-110 transition-transform">
                  <BookOpen size={20} />
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="text-[20px] font-semibold text-[#dde5dd]">
                  {t(`courses.${c.key}.title`)}
                </h2>
                <p className="text-[13px] leading-[21px] text-[#bacbb9]">
                  {t(`courses.${c.key}.desc`)}
                </p>
              </div>

              <ul className="flex flex-wrap items-center gap-2 text-[11px] text-[#bacbb9]">
                <li className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#09100c]">
                  <BookOpen size={12} className="text-[#46fc8b]" />
                  {formatPrice(c.lessons)} {t("courses.lessonsUnit")}
                </li>
                <li className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#09100c]">
                  <Clock size={12} className="text-[#46fc8b]" />
                  {formatPrice(c.weeks)} {t("courses.weeksUnit")}
                </li>
                <li className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#09100c]">
                  <Layers size={12} className="text-[#46fc8b]" />
                  CEFR
                </li>
              </ul>

              <div className="mt-auto pt-2 flex flex-col gap-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 min-w-0">
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-[22px] lg:text-[24px] font-semibold text-[#46fc8b] tabular-nums whitespace-nowrap">
                      {formatPrice(c.price)}
                    </span>
                    <span className="text-[12px] text-[#bacbb9] whitespace-nowrap">
                      {t("courses.currency")}
                    </span>
                  </div>
                  {c.oldPrice > 0 && (
                    <span className="text-[12px] text-[#7c8b7d] line-through tabular-nums whitespace-nowrap">
                      {formatPrice(c.oldPrice)}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleBuy}
                  className="w-full px-5 py-3 rounded-xl bg-[#05df72] text-[#003918] font-semibold text-[14px] shadow-[0_0_26px_rgba(70,252,139,0.35)] hover:shadow-[0_0_36px_rgba(70,252,139,0.6)] hover:bg-[#3cfd8a] transition-all duration-300 flex items-center justify-center gap-2">
                  <ShoppingBag size={16} />
                  {t("courses.buy")}
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Mock checkout toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0d1412] border border-white/10 shadow-xl text-[13px] text-[#dde5dd]">
            <User size={14} className="text-[#46fc8b] shrink-0" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
