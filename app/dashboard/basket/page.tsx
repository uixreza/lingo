"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  CreditCard,
  Layers,
  MinusCircle,
  ShieldCheck,
  ShoppingBasket,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { getCourse, courseDiscount, type Course, type CourseKey } from "@/lib/courses";

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
            href="/courses"
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
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {selected.map((course) => {
              const discount = courseDiscount(course);

              return (
                <motion.div
                  key={course.key}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--dash-sides)]/60 shadow-xl shadow-black/10 backdrop-blur-xl">
                  <div className="flex flex-col sm:flex-row">
                    {/* Thumbnail */}
                    <div className="relative h-40 w-full shrink-0 overflow-hidden sm:h-auto sm:w-52">
                      <Image
                        src={course.thumbnail}
                        alt={t(`courses.${course.key}.title`)}
                        fill
                        sizes="(max-width: 640px) 100vw, 208px"
                        quality={90}
                        className="h-full w-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-transparent sm:to-[var(--dash-sides)]/40" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <h2 className="text-[16px] font-extrabold leading-tight text-[var(--dash-text)]">
                            {t(`courses.${course.key}.title`)}
                          </h2>
                          <button
                            type="button"
                            onClick={() => handleRemove(course.key)}
                            aria-label={t("basket.remove")}
                            title={t("basket.remove")}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--dash-muted)] transition-all duration-200 hover:bg-[var(--danger-hover-bg)] hover:text-[var(--danger)]">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#05df72]/20 bg-[#05df72]/8 px-2.5 py-1 text-[11px] font-semibold text-[#00693a] dark:text-[#46fc8b]">
                            <Layers size={11} />
                            {course.level}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] text-[var(--dash-muted)]">
                            <Clock size={11} />
                            {formatPrice(course.weeks)} {t("courses.weeksUnit")}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] text-[var(--dash-muted)]">
                            {formatPrice(course.lessons)} {t("courses.lessonsUnit")}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/[0.06] pt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[22px] font-extrabold tabular-nums leading-none text-[var(--dash-text)]">
                            {formatPrice(course.price)}
                          </span>
                          <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                            {t("courses.currency")}
                          </span>
                          {course.oldPrice > course.price && (
                            <span className="text-[12px] tabular-nums text-[var(--dash-muted)]/70 line-through">
                              {formatPrice(course.oldPrice)}
                            </span>
                          )}
                        </div>
                        {discount > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#05df72]/10 px-2.5 py-1 text-[11px] font-bold text-[#00693a] dark:text-[#46fc8b]">
                            <MinusCircle size={11} />
                            {formatPrice(discount)}
                            {locale === "fa" ? "٪" : "%"} {t("courses.discount")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <aside className="h-fit overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--dash-sides)]/60 shadow-xl shadow-black/10 backdrop-blur-xl lg:sticky lg:top-6">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#05df72]/10 via-transparent to-transparent px-5 py-4">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#05df72]/10 blur-2xl" />
            <h3 className="relative text-[15px] font-extrabold text-[var(--dash-text)]">
              {t("basket.title")}
            </h3>
            <span className="relative mt-0.5 block text-[12px] text-[var(--dash-muted)]">
              {t("basket.items").replace(
                "{count}",
                selected.length.toLocaleString(locale === "fa" ? "fa-IR" : "en-US"),
              )}
            </span>
          </div>

          {/* Order items */}
          <div className="space-y-2 border-b border-white/[0.06] px-5 py-3">
            {selected.map((course) => (
              <div
                key={course.key}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={course.thumbnail}
                      alt=""
                      fill
                      sizes="36px"
                      quality={90}
                      className="object-cover"
                    />
                  </div>
                  <span className="truncate text-[12px] font-semibold text-[var(--dash-text)]">
                    {t(`courses.${course.key}.title`)}
                  </span>
                </div>
                <span className="shrink-0 text-[12px] font-bold tabular-nums text-[var(--dash-muted)]">
                  {formatPrice(course.price)}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="px-5 py-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[13px] font-medium text-[var(--dash-muted)]">
                {t("basket.total")}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[28px] font-extrabold leading-none tabular-nums text-[var(--dash-text)]">
                  {formatPrice(total)}
                </span>
                <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                  {t("courses.currency")}
                </span>
              </div>
            </div>

            {/* SnapPay */}
            <button
              type="button"
              onClick={() => toast(t("courses.checkoutSoon"))}
              className="group relative mt-5 flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e40af] to-[#2563eb] py-4 pr-20 pl-4 text-white transition-all duration-200 hover:from-[#1d4ed8] hover:to-[#3b82f6] active:scale-[0.98] shadow-[0_8px_28px_rgba(37,99,235,0.4)]">
              <div className="absolute inset-0 bg-white/[0.06] opacity-0 transition-opacity group-hover:opacity-100" />
              <Image
                unoptimized
                src="https://offerjo.ir/wp-content/uploads/2025/07/logo-3-300x184.webp"
                alt="SnapPay"
                width={44}
                height={44}
                className="absolute right-3 top-1/2 h-7 w-auto -translate-y-1/2 brightness-0 invert drop-shadow-md"
              />
              <span className="relative min-w-0 flex-1 text-center">
                <span className="block text-[13px] font-bold">
                  {t("basket.snapPay")}
                </span>
                <span className="block text-[11px] font-medium text-white/85">
                  {formatPrice(4)} × {formatPrice(Math.ceil(total / 4))}{" "}
                  {t("courses.currency")}
                </span>
              </span>
            </button>

            {/* Divider */}
            <div className="my-3 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                {locale === "fa" ? "یا" : "or"}
              </span>
              <span className="h-px flex-1 bg-white/[0.06]" />
            </div>

            {/* Checkout */}
            <button
              type="button"
              onClick={() => toast(t("courses.checkoutSoon"))}
              className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#05df72] to-[#4edea3] px-4 py-4 text-[14px] font-bold text-[#003918] transition-all duration-200 hover:from-[#3cfd8a] hover:to-[#6ef7b8] active:scale-[0.98] shadow-[0_8px_28px_rgba(5,223,114,0.35)]">
              <div className="absolute inset-0 bg-white/[0.1] opacity-0 transition-opacity group-hover:opacity-100" />
              <CreditCard size={17} strokeWidth={2.5} className="relative" />
              <span className="relative">{t("basket.checkout")}</span>
            </button>

            {/* Trust note */}
            <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.03] px-3 py-2">
              <ShieldCheck size={13} className="text-[#46fc8b]" />
              <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                {t("basket.securePayment")}
              </span>
            </div>

            <Link
              href="/courses"
              className="mt-3 block text-center text-[12px] font-medium text-[var(--dash-muted)] transition-colors hover:text-[var(--dash-text)]">
              {t("basket.emptyCta")}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
