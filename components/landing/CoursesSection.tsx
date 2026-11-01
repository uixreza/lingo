"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Clock,
  Flame,
  Headset,
  Infinity,
  Layers,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/i18n";
import { courses, type Course } from "@/lib/courses";

const trustItems = [
  { key: "lifetime", Icon: Infinity },
  { key: "mentor", Icon: Headset },
  { key: "certificate", Icon: Award },
  { key: "guarantee", Icon: ShieldCheck },
] as const;

function CourseCard({
  course,
  index,
  t,
  formatPrice,
}: {
  course: Course;
  index: number;
  t: (key: TranslationKey) => string;
  formatPrice: (value: number) => string;
}) {
  const skin = course.hot
    ? "border-[#05df72]/40 bg-[#1a211d] shadow-[0_0_44px_rgba(5,223,114,0.12)] hover:border-[#05df72]/60"
    : "border-white/[0.08] bg-[#161d19] hover:border-[#05df72]/30 hover:bg-[#1a211d]";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className={`group relative flex flex-col rounded-2xl border p-5 transition-all duration-300 sm:p-6 ${skin}`}>
      <div className="relative -mx-5 -mt-5 mb-5 overflow-hidden rounded-t-2xl sm:-mx-6 sm:-mt-6">
        <Image
          src={course.thumbnail}
          alt={t(`courses.${course.key}.title`)}
          width={400}
          height={300}
          className="h-64 w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04] sm:h-72"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161d19] via-transparent to-transparent" />
        <span className="absolute top-3 end-3 rounded-full border border-[#4edea3]/25 bg-[#09100c]/80 px-3 py-1 text-[12px] font-semibold text-[#4edea3] backdrop-blur-sm">
          {course.level}
        </span>
        {course.hot && (
          <span className="absolute top-3 start-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#05df72] px-3 py-1 text-[11px] font-bold text-[#003918] shadow-[0_6px_18px_rgba(5,223,114,0.35)]">
            <Flame size={12} strokeWidth={2.5} />
            {t("courses.hot")}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-[20px] font-extrabold leading-snug text-white sm:text-[22px]">
          {t(`courses.${course.key}.title`)}
        </h3>
        <p className="text-[14px] leading-7 text-[#bacbb9]">
          {t(`courses.${course.key}.desc`)}
        </p>
      </div>

      <ul className="mt-5 flex flex-wrap items-center gap-2">
        <li className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-[#bacbb9]">
          <Layers size={13} className="text-[#4edea3]" />
          CEFR
        </li>
        <li className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-[#bacbb9]">
          <Clock size={13} className="text-[#4edea3]" />
          {formatPrice(course.weeks)} {t("courses.weeksUnit")}
        </li>
        <li className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-[#bacbb9]">
          <BookOpen size={13} className="text-[#4edea3]" />
          {formatPrice(course.lessons)} {t("courses.lessonsUnit")}
        </li>
      </ul>

      <div className="mt-5 flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="text-[15px] font-bold tracking-wide text-[#46fc8b]">
          {t("courses.comingSoon")}
        </span>
      </div>
    </motion.article>
  );
}

type FilterKey = "all" | "hot" | "beginner" | "intermediate";

export default function CoursesSection() {
  const { t, locale } = useLang();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const formatPrice = (value: number) =>
    new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(value);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: t("courses.filter.all") },
    { key: "hot", label: t("courses.filter.hot") },
    { key: "beginner", label: t("courses.filter.beginner") },
    { key: "intermediate", label: t("courses.filter.intermediate") },
  ];

  const visibleCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "hot" && course.hot) ||
        (filter === "beginner" && course.level.includes("A1")) ||
        (filter === "intermediate" && course.level.includes("B"));
      if (!matchesFilter) return false;
      if (!q) return true;
      const title = t(`courses.${course.key}.title`).toLowerCase();
      return title.includes(q) || course.key.includes(q);
    });
  }, [query, filter, t]);

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

      {/* Search & filters */}
      <div className="relative mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#859585]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("courses.searchPlaceholder")}
            className="w-full rounded-xl border border-white/[0.08] bg-[#161d19] ps-11 pe-4 py-3 text-[14px] text-[#dde5dd] placeholder:text-[#859585] outline-none transition-colors focus:border-[#05df72]/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                filter === f.key
                  ? "border-[#05df72] bg-[#05df72]/10 text-[#46fc8b]"
                  : "border-white/[0.08] bg-white/[0.03] text-[#bacbb9] hover:border-[#05df72]/40 hover:text-[#dde5dd]"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section 2 — Course cards */}
      <div className="relative mt-8 grid w-full grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:max-w-4xl">
        {visibleCourses.map((course, index) => (
          <CourseCard
            key={course.key}
            course={course}
            index={index}
            t={t}
            formatPrice={formatPrice}
          />
        ))}
        {visibleCourses.length === 0 && (
          <p className="col-span-full py-10 text-center text-[14px] text-[#859585]">
            {t("courses.noResults")}
          </p>
        )}
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
    </section>
  );
}
