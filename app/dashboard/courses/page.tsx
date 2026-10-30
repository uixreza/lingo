"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Briefcase,
  Check,
  Clock,
  Flame,
  Globe,
  Layers,
  Plus,
  ShoppingBasket,
  Target,
  type LucideIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { courses, courseDiscount, type CourseKey } from "@/lib/courses";

const courseIcons: Record<CourseKey, LucideIcon> = {
  general: BookOpen,
  ielts: Target,
  business: Briefcase,
  german: Globe,
};

export default function DashboardCoursesPage() {
  const { t, locale } = useLang();
  const { has, add, count } = useCart();

  const formatPrice = (value: number) =>
    new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(value);

  const handleAdd = (key: CourseKey) => {
    if (has(key)) return;
    add(key);
    toast.success(t("basket.addedToast"));
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--dash-text)]">
            {t("dashboard.courses.title")}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--dash-muted)]">
            {t("dashboard.courses.subtitle")}
          </p>
        </div>

        <Link
          href="/dashboard/basket"
          className="inline-flex items-center gap-2 rounded-xl border border-[#05df72]/35 bg-[#05df72]/10 px-4 py-2.5 text-sm font-bold text-[#00693a] transition-all duration-200 hover:bg-[#05df72]/20 dark:text-[#05df72] dark:hover:text-[#3cfd8a]">
          <ShoppingBasket className="h-4 w-4" />
          {t("dashboard.courses.viewBasket")}
          {count > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#05df72] px-1.5 text-[11px] font-bold text-[#003918]">
              {count.toLocaleString(locale === "fa" ? "fa-IR" : "en-US")}
            </span>
          )}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {courses.map((course, index) => {
          const Icon = courseIcons[course.key];
          const discount = courseDiscount(course);
          const inBasket = has(course.key);

          return (
            <motion.article
              key={course.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className={`relative flex flex-col rounded-2xl border bg-[var(--dash-sides)]/80 p-5 shadow-lg backdrop-blur-xl transition-all duration-200 ${
                course.hot
                  ? "border-[#05df72]/45 shadow-[#05df72]/10"
                  : "border-[var(--dash-muted)]/15 hover:border-[#05df72]/40"
              }`}>
              {course.hot && (
                <span className="absolute -top-3 start-4 z-10 inline-flex items-center gap-1 rounded-full bg-[#05df72] px-2.5 py-1 text-[11px] font-bold text-[#003918] shadow-[0_6px_16px_rgba(5,223,114,0.3)]">
                  <Flame size={12} strokeWidth={2.5} />
                  {t("courses.hot")}
                </span>
              )}

              <div className="flex items-center justify-between gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#05df72]/10 text-[#00693a] ring-1 ring-[#05df72]/25 dark:text-[#05df72]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="rounded-full border border-[var(--dash-muted)]/25 bg-[var(--hover-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--dash-text)]">
                  {course.level}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-1.5">
                <h2 className="text-[17px] font-bold leading-snug text-[var(--dash-text)]">
                  {t(`courses.${course.key}.title`)}
                </h2>
                <p className="line-clamp-2 text-[13px] leading-6 text-[var(--dash-muted)]">
                  {t(`courses.${course.key}.desc`)}
                </p>
              </div>

              <ul className="mt-4 flex flex-wrap items-center gap-2">
                <li className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--dash-muted)]/15 bg-[var(--hover-bg)] px-2 py-1 text-[11px] text-[var(--dash-muted)]">
                  <Layers size={12} className="text-[var(--dash-accent)]" />
                  CEFR
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--dash-muted)]/15 bg-[var(--hover-bg)] px-2 py-1 text-[11px] text-[var(--dash-muted)]">
                  <Clock size={12} className="text-[var(--dash-accent)]" />
                  {formatPrice(course.weeks)} {t("courses.weeksUnit")}
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--dash-muted)]/15 bg-[var(--hover-bg)] px-2 py-1 text-[11px] text-[var(--dash-muted)]">
                  <BookOpen size={12} className="text-[var(--dash-accent)]" />
                  {formatPrice(course.lessons)} {t("courses.lessonsUnit")}
                </li>
              </ul>

              <div className="mt-auto flex flex-col gap-2 pt-5">
                <div className="flex flex-wrap items-center gap-2">
                  {discount > 0 && (
                    <span className="rounded-md border border-[var(--danger)]/30 bg-[var(--danger-hover-bg)] px-1.5 py-0.5 text-[11px] font-bold text-[var(--danger)]">
                      {formatPrice(discount)}
                      {locale === "fa" ? "٪" : "%"} {t("courses.discount")}
                    </span>
                  )}
                  {course.oldPrice > 0 && (
                    <span className="text-[12px] tabular-nums text-[var(--dash-muted)] line-through">
                      {formatPrice(course.oldPrice)}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-[22px] font-extrabold tabular-nums text-[var(--dash-text)]">
                    {formatPrice(course.price)}
                  </span>
                  <span className="text-[12px] text-[var(--dash-muted)]">
                    {t("courses.currency")}
                  </span>
                </div>

                {inBasket ? (
                  <Link
                    href="/dashboard/basket"
                    className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#05df72] px-4 py-2.5 text-sm font-bold text-[#003918] transition-all duration-200 hover:bg-[#3cfd8a] active:scale-[0.98]">
                    <Check size={16} strokeWidth={2.5} />
                    {t("dashboard.courses.added")}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAdd(course.key)}
                    className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#05df72]/45 bg-[var(--hover-bg)] px-4 py-2.5 text-sm font-bold text-[var(--dash-text)] transition-all duration-200 hover:bg-[#05df72]/10 active:scale-[0.98]">
                    <Plus size={16} strokeWidth={2.5} />
                    {t("dashboard.courses.add")}
                  </button>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
