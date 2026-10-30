"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  CreditCard,
  Flame,
  Globe,
  ShoppingBasket,
  Target,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { getCourse, courseDiscount, type Course, type CourseKey } from "@/lib/courses";

const courseIcons: Record<CourseKey, LucideIcon> = {
  general: BookOpen,
  ielts: Target,
  business: Briefcase,
  german: Globe,
};

export default function BasketPage() {
  const { t, locale } = useLang();
  const { items, remove } = useCart();

  const formatPrice = (value: number) =>
    new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(value);

  const selected = items
    .map(getCourse)
    .filter((course): course is Course => course !== undefined);
  const total = selected.reduce((sum, course) => sum + course.price, 0);

  const handleRemove = (key: CourseKey) => {
    remove(key);
    toast(t("basket.removedToast"));
  };

  if (selected.length === 0) {
    return (
      <div className="pb-24">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#05df72]/20 bg-[var(--dash-sides)]/80 px-6 py-16 text-center shadow-lg backdrop-blur-xl">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#05df72]/10 text-[#00693a] ring-1 ring-[#05df72]/25 dark:text-[#05df72]">
            <ShoppingBasket className="h-7 w-7" />
          </span>
          <p className="text-sm text-[var(--dash-muted)]">{t("basket.empty")}</p>
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-2 rounded-xl bg-[#05df72] px-5 py-2.5 text-sm font-bold text-[#003918] transition-all duration-200 hover:bg-[#3cfd8a] active:scale-[0.98]">
            {t("basket.emptyCta")}
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--dash-text)]">
          {t("basket.title")}
        </h1>
        <p className="mt-1 text-sm text-[var(--dash-muted)]">
          {t("basket.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {selected.map((course) => {
              const Icon = courseIcons[course.key];
              const discount = courseDiscount(course);

              return (
                <motion.div
                  key={course.key}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-4 rounded-2xl border border-[#05df72]/20 bg-[var(--dash-sides)]/80 p-4 shadow-lg backdrop-blur-xl">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#05df72]/10 text-[#00693a] ring-1 ring-[#05df72]/25 dark:text-[#05df72]">
                    <Icon className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-[15px] font-bold text-[var(--dash-text)]">
                        {t(`courses.${course.key}.title`)}
                      </h2>
                      {course.hot && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#05df72]/15 px-2 py-0.5 text-[10px] font-bold text-[#00693a] dark:text-[#05df72]">
                          <Flame size={10} strokeWidth={2.5} />
                          {t("courses.hot")}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--dash-muted)]">
                      <span>
                        {t("courses.level")} {course.level}
                      </span>
                      <span>
                        {formatPrice(course.weeks)} {t("courses.weeksUnit")}
                      </span>
                      <span>
                        {formatPrice(course.lessons)} {t("courses.lessonsUnit")}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[17px] font-extrabold tabular-nums text-[var(--dash-text)]">
                        {formatPrice(course.price)}
                      </span>
                      <span className="text-[11px] text-[var(--dash-muted)]">
                        {t("courses.currency")}
                      </span>
                    </div>
                    {discount > 0 && (
                      <span className="rounded-md border border-[var(--danger)]/30 bg-[var(--danger-hover-bg)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--danger)]">
                        {formatPrice(discount)}
                        {locale === "fa" ? "٪" : "%"} {t("courses.discount")}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(course.key)}
                    aria-label={t("basket.remove")}
                    title={t("basket.remove")}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-hover-bg)] text-[var(--danger)] transition-all duration-200 hover:bg-[var(--danger)] hover:text-black">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <aside className="h-fit rounded-2xl border border-[#05df72]/25 bg-[var(--dash-sides)]/80 p-5 shadow-lg backdrop-blur-xl">
          <span className="text-[13px] text-[var(--dash-muted)]">
            {t("basket.items").replace(
              "{count}",
              selected.length.toLocaleString(locale === "fa" ? "fa-IR" : "en-US"),
            )}
          </span>

          <div className="mt-4 flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium text-[var(--dash-text)]">
              {t("basket.total")}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold tabular-nums text-[var(--dash-text)]">
                {formatPrice(total)}
              </span>
              <span className="text-xs text-[var(--dash-muted)]">
                {t("courses.currency")}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toast(t("courses.checkoutSoon"))}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#05df72] px-4 py-3 text-sm font-bold text-[#003918] transition-all duration-200 hover:bg-[#3cfd8a] active:scale-[0.98] shadow-[0_0_24px_rgba(5,223,114,0.3)]">
            <CreditCard size={16} strokeWidth={2.5} />
            {t("basket.checkout")}
          </button>

          <Link
            href="/dashboard/courses"
            className="mt-3 block text-center text-xs font-medium text-[var(--dash-muted)] transition-colors hover:text-[var(--dash-text)]">
            {t("basket.emptyCta")}
          </Link>
        </aside>
      </div>
    </div>
  );
}
