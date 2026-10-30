"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Globe,
  Layers,
  Play,
  ShoppingBasket,
  Target,
  type LucideIcon,
} from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { getPurchasedCourses, type CourseKey } from "@/lib/courses";

const courseIcons: Record<CourseKey, LucideIcon> = {
  general: BookOpen,
  ielts: Target,
  business: Briefcase,
  german: Globe,
};

export default function DashboardCoursesPage() {
  const { t, locale } = useLang();
  const { count } = useCart();

  const formatPrice = (value: number) =>
    new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(value);

  const owned = getPurchasedCourses();

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

      {owned.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#05df72]/20 bg-[var(--dash-sides)]/80 px-6 py-16 text-center shadow-lg backdrop-blur-xl">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#05df72]/10 text-[#00693a] ring-1 ring-[#05df72]/25 dark:text-[#05df72]">
            <BookOpen className="h-7 w-7" />
          </span>
          <p className="text-sm text-[var(--dash-muted)]">
            {t("dashboard.courses.empty")}
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-xl bg-[#05df72] px-5 py-2.5 text-sm font-bold text-[#003918] transition-all duration-200 hover:bg-[#3cfd8a] active:scale-[0.98]">
            {t("dashboard.courses.emptyCta")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {owned.map(({ course, progress }, index) => {
            const Icon = courseIcons[course.key];

            return (
              <motion.article
                key={course.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="group relative flex flex-col rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[var(--dash-sides)] via-[var(--dash-sides)] to-[var(--dash-sides)]/70 p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition-colors duration-300 hover:border-[#05df72]/40">
                <span className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#05df72]/10 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />

                <span className="absolute -top-3 start-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#05df72] to-[#4edea3] px-2.5 py-1 text-[11px] font-bold text-[#003918] shadow-[0_6px_16px_rgba(5,223,114,0.3)]">
                  <CheckCircle2 size={12} strokeWidth={2.5} />
                  {t("dashboard.courses.owned")}
                </span>

                <div className="relative flex items-center justify-between gap-3 pt-2">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#05df72] to-[#4edea3] text-[#003918] shadow-[0_8px_24px_rgba(5,223,114,0.3)]">
                    <Icon className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <span className="rounded-full border border-[#05df72]/25 bg-[#05df72]/10 px-2.5 py-1 text-[11px] font-semibold text-[#00693a] dark:text-[#46fc8b]">
                    {course.level}
                  </span>
                </div>

                <div className="relative mt-4 flex flex-col gap-1.5">
                  <h2 className="text-[17px] font-bold leading-snug text-[var(--dash-text)]">
                    {t(`courses.${course.key}.title`)}
                  </h2>
                  <p className="line-clamp-2 text-[13px] leading-6 text-[var(--dash-muted)]">
                    {t(`courses.${course.key}.desc`)}
                  </p>
                </div>

                <ul className="relative mt-4 flex flex-wrap items-center gap-2">
                  <li className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-[var(--dash-muted)]">
                    <Layers size={12} className="text-[#4edea3]" />
                    CEFR
                  </li>
                  <li className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-[var(--dash-muted)]">
                    <Clock size={12} className="text-[#4edea3]" />
                    {formatPrice(course.weeks)} {t("courses.weeksUnit")}
                  </li>
                  <li className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-[var(--dash-muted)]">
                    <BookOpen size={12} className="text-[#4edea3]" />
                    {formatPrice(course.lessons)} {t("courses.lessonsUnit")}
                  </li>
                </ul>

                <div className="relative mt-auto pt-5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--dash-muted)]">
                    <span>{t("dashboard.courses.progress")}</span>
                    <span className="tabular-nums text-[var(--dash-text)]">
                      {formatPrice(progress)}
                      {locale === "fa" ? "٪" : "%"}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--hover-bg)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#05df72] to-[#4edea3]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <Link
                    href="/dashboard/sessions"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#05df72] px-4 py-2.5 text-sm font-bold text-[#003918] transition-all duration-200 hover:bg-[#3cfd8a] active:scale-[0.98] shadow-[0_0_20px_rgba(5,223,114,0.25)]">
                    <Play size={15} strokeWidth={2.5} />
                    {t("dashboard.courses.continue")}
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
