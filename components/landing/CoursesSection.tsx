"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  BookOpen,
  Briefcase,
  Clock,
  Flame,
  Globe,
  Headset,
  Infinity,
  Layers,
  Lock,
  ShieldCheck,
  Target,
  User,
  type LucideIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/i18n";
import {
  courseDiscount,
  courses,
  type Course,
  type CourseKey,
} from "@/lib/courses";

const courseIcons: Record<CourseKey, LucideIcon> = {
  general: BookOpen,
  ielts: Target,
  business: Briefcase,
  german: Globe,
};

const trustItems = [
  { key: "lifetime", Icon: Infinity },
  { key: "mentor", Icon: Headset },
  { key: "certificate", Icon: Award },
  { key: "guarantee", Icon: ShieldCheck },
] as const;

function CourseCard({
  course,
  index,
  className = "",
  t,
  locale,
  formatPrice,
  onBuy,
}: {
  course: Course;
  index: number;
  className?: string;
  t: (key: TranslationKey) => string;
  locale: string;
  formatPrice: (value: number) => string;
  onBuy: () => void;
}) {
  const discount = courseDiscount(course);
  const Icon = courseIcons[course.key];

  const skin = course.hot
    ? "border-[#05df72]/40 bg-[#1a211d] shadow-[0_0_44px_rgba(5,223,114,0.12)] hover:border-[#05df72]/60"
    : "border-white/[0.08] bg-[#161d19] hover:border-[#05df72]/30 hover:bg-[#1a211d]";

  const cta = course.hot
    ? "w-full rounded-xl bg-[#05df72] px-5 py-3 text-[14px] font-bold text-[#003918] transition-all duration-300 hover:bg-[#3cfd8a] hover:shadow-[0_0_28px_rgba(5,223,114,0.45)] active:scale-[0.98]"
    : "w-full rounded-xl border border-[#05df72]/35 bg-white/[0.03] px-5 py-3 text-[14px] font-semibold text-[#46fc8b] transition-all duration-300 hover:border-[#05df72] hover:bg-[#05df72]/10 active:scale-[0.98]";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className={`group relative flex flex-col rounded-2xl border p-5 transition-all duration-300 sm:p-6 ${skin} ${className}`}>
      {course.hot && (
        <span className="absolute -top-3.5 start-5 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#05df72] px-3 py-1 text-[11px] font-bold text-[#003918] shadow-[0_6px_18px_rgba(5,223,114,0.35)]">
          <Flame size={12} strokeWidth={2.5} />
          {t("courses.hot")}
        </span>
      )}

      <div className="flex items-center justify-between gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-[#09100c] text-[#46fc8b] transition-transform duration-300 group-hover:-translate-y-0.5">
          <Icon size={20} />
        </span>
        <span className="rounded-full border border-[#4edea3]/25 bg-[#4edea3]/10 px-2.5 py-1 text-[11px] font-semibold text-[#4edea3]">
          {course.level}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <h3 className="text-[19px] font-bold leading-snug text-white">
          {t(`courses.${course.key}.title`)}
        </h3>
        <p className="line-clamp-2 text-[13px] leading-6 text-[#bacbb9]">
          {t(`courses.${course.key}.desc`)}
        </p>
      </div>

      <ul className="mt-4 flex flex-wrap items-center gap-2">
        <li className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[11px] text-[#bacbb9]">
          <Layers size={12} className="text-[#4edea3]" />
          CEFR
        </li>
        <li className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[11px] text-[#bacbb9]">
          <Clock size={12} className="text-[#4edea3]" />
          {formatPrice(course.weeks)} {t("courses.weeksUnit")}
        </li>
        <li className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[11px] text-[#bacbb9]">
          <BookOpen size={12} className="text-[#4edea3]" />
          {formatPrice(course.lessons)} {t("courses.lessonsUnit")}
        </li>
      </ul>

      <div className="mt-auto flex flex-col gap-2.5 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          {discount > 0 && (
            <span className="rounded-md border border-[#ef9a9a]/30 bg-[#ef9a9a]/10 px-1.5 py-0.5 text-[11px] font-bold text-[#ef9a9a]">
              {formatPrice(discount)}
              {locale === "fa" ? "٪" : "%"} {t("courses.discount")}
            </span>
          )}
          {course.oldPrice > 0 && (
            <span className="text-[12px] tabular-nums text-[#7c8b7d] line-through">
              {formatPrice(course.oldPrice)}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-[26px] font-extrabold tabular-nums text-[#46fc8b]">
            {formatPrice(course.price)}
          </span>
          <span className="text-[12px] text-[#bacbb9]">
            {t("courses.currency")}
          </span>
        </div>

        <span className="text-[11px] text-[#859585]">
          {course.oldPrice > 0
            ? t("courses.price.discounted")
            : t("courses.price.standard")}
        </span>

        <button type="button" onClick={onBuy} className={`${cta} mt-1.5`}>
          <span className="inline-flex items-center justify-center gap-2">
            <Lock size={15} strokeWidth={2.5} />
            {t("courses.buy")}
          </span>
        </button>
      </div>
    </motion.article>
  );
}

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
    <section className="relative mx-auto w-full max-w-[1320px] px-4 pb-16 pt-28 sm:px-6 lg:px-10 lg:pb-20 lg:pt-24">
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#05df72]/[0.07] blur-[150px]" />

      {/* Section 1 — Hero header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[12px] font-medium text-[#dde5dd]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#05df72]" />
          {t("courses.badge")}
        </span>

        <h1 className="text-[30px] font-extrabold leading-tight tracking-tight text-white sm:text-[38px] lg:text-[44px]">
          {t("courses.headline")}{" "}
          <span className="text-[#05df72]">{t("courses.headlineAccent")}</span>
        </h1>

        <p className="max-w-xl text-[15px] leading-7 text-[#bacbb9]">
          {t("courses.subtitle")}
        </p>
      </motion.div>

      {/* Section 2 — Course cards (desktop 4-column grid) */}
      <div className="relative mt-12 hidden grid-cols-4 items-stretch gap-6 lg:grid">
        {courses.map((course, index) => (
          <CourseCard
            key={course.key}
            course={course}
            index={index}
            t={t}
            locale={locale}
            formatPrice={formatPrice}
            onBuy={handleBuy}
          />
        ))}
      </div>

      {/* Section 2 — Course cards (mobile snap carousel) */}
      <div className="relative -mx-4 mt-9 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 lg:hidden">
        {courses.map((course, index) => (
          <CourseCard
            key={course.key}
            course={course}
            index={index}
            className="w-[84%] shrink-0 snap-start"
            t={t}
            locale={locale}
            formatPrice={formatPrice}
            onBuy={handleBuy}
          />
        ))}
      </div>

      {/* Section 3 — Trust / value propositions */}
      <div className="relative mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-10 lg:grid-cols-4 lg:gap-6">
        {trustItems.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className="flex flex-col items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#161d19]/80 p-4 text-center backdrop-blur-sm lg:p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#05df72]/10 text-[#05df72] ring-1 ring-[#05df72]/20">
              <item.Icon size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-white">
                {t(`courses.trust.${item.key}.title`)}
              </p>
              <p className="mt-1 text-[11px] leading-5 text-[#859585]">
                {t(`courses.trust.${item.key}.desc`)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mock checkout toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 sm:bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-white/10 bg-[#0d1412] px-4 py-3 text-[13px] text-[#dde5dd] shadow-xl">
            <User size={14} className="shrink-0 text-[#46fc8b]" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
