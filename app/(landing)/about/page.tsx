"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  Clock,
  UserRound,
  Users,
} from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

type MentorData = {
  id: number;
  name: string;
  title: string | null;
  photoUrl: string | null;
  bio: string | null;
  certifications: string[];
  languages: string[];
  experience: string | null;
  education: string | null;
};

export default function About() {
  const { t, locale } = useLang();
  const [mentor, setMentor] = useState<MentorData | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    fetch("/api/mentor")
      .then((r) => r.json())
      .then((d) => {
        if (d.mentor) setMentor(d.mentor);
      })
      .catch(() => {});
  }, []);

  const displayName =
    locale === "fa" ? mentor?.name || t("about.name") : t("about.name");
  const displayTitle =
    locale === "fa"
      ? mentor?.title || t("about.subtitle")
      : t("about.subtitle");
  const displayBio =
    locale === "fa" ? mentor?.bio || t("about.bio") : t("about.bio");
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const headingFont =
    locale === "fa"
      ? "'Dana', 'Anjoman', sans-serif"
      : "var(--font-plus-jakarta), sans-serif";

  const stats = [
    {
      icon: Briefcase,
      value:
        locale === "fa" ? mentor?.experience || "۵+" : "5+",
      label: t("about.years"),
    },
    {
      icon: Users,
      value: locale === "fa" ? "۲۰۰+" : "200+",
      label: t("about.students"),
    },
    {
      icon: Clock,
      value: locale === "fa" ? "۳۰۰۰+" : "3,000+",
      label: t("about.teachingHours"),
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070d0a] pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 start-1/4 h-[420px] w-[420px] rounded-full bg-[#05df72]/[0.08] blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[520px] -end-32 h-[360px] w-[360px] rounded-full bg-[#46fc8b]/[0.05] blur-[120px]"
      />

      {/* Masthead */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-5 pt-8 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/mainIcon.webp"
            alt="LingoFam"
            width={30}
            height={30}
            className="h-[30px] w-[30px]"
          />
          <span
            className="text-[22px] tracking-tight text-[#eef4ee]"
            style={{ fontFamily: '"Poolary", sans-serif', fontWeight: 400 }}>
            Lingo<span className="text-[#46fc8b]">Fam</span>
          </span>
        </Link>

        <span className="inline-flex items-center gap-2 rounded-full border border-[#46fc8b]/20 bg-[#46fc8b]/[0.06] px-3 py-1.5 text-[10.5px] font-semibold text-[#46fc8b]">
          <UserRound size={13} />
          <span
            className={locale === "fa" ? "" : "uppercase tracking-[0.18em]"}>
            {t("about.title")}
          </span>
        </span>
      </div>

      {/* Hero */}
      <section className="relative z-10 mx-auto w-full max-w-[1280px] px-5 pb-12 pt-12 lg:px-10 lg:pb-16 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-7 lg:col-span-7">
            <div className="flex flex-col gap-4">
              <motion.h1
                variants={fadeUp}
                className="text-[42px] leading-[1.05] tracking-tight text-[#eef4ee] sm:text-[54px] lg:text-[62px]"
                style={{
                  fontFamily: headingFont,
                  fontWeight: locale === "fa" ? 800 : 700,
                }}>
                {displayName}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-[14px] font-semibold text-[#46fc8b] sm:text-[15px]">
                {displayTitle}
              </motion.p>
            </div>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[12px] text-[#b7c7ba]">
                <BadgeCheck size={14} className="shrink-0 text-[#46fc8b]" />
                {t("landing.footer.immersive")}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[12px] text-[#b7c7ba]">
                <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-[#46fc8b]/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#46fc8b]" />
                </span>
                {t("landing.hero.streak")} {t("landing.metrics.students")}
              </span>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/test"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-[#46fc8b] via-[#20f47f] to-[#05df72] px-6 py-3.5 text-[14px] font-bold text-[#003918] ring-1 ring-inset ring-white/25 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0">
                <span>{t("landing.hero.determineLevel")}</span>
                <span className="rounded-full bg-[#003918]/10 px-2 py-0.5 text-[10px] font-bold ring-1 ring-[#003918]/15">
                  {t("landing.hero.free")}
                </span>
                <ArrowRight
                  size={16}
                  className="rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                />
              </Link>
              <span className="inline-flex items-center gap-2 text-[12px] text-[#9fb5a6]">
                <BadgeCheck size={14} className="shrink-0 text-[#46fc8b]" />
                {t("landing.hero.rating")}
              </span>
            </motion.div>
          </motion.div>

          {/* Portrait */}
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative mx-auto w-full max-w-[400px] lg:col-span-5">
            <div className="relative rounded-[34px] border border-white/[0.08] bg-[linear-gradient(160deg,#151e18_0%,#101713_55%,#0b120e_100%)] p-2.5 shadow-[0_40px_120px_-60px_rgba(0,0,0,0.95)]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] bg-[#0f1612]">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-8 top-10 h-48 rounded-full bg-[#05df72]/[0.16] blur-[70px]"
                />
                {imageFailed ? (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#12351f] to-[#0a1a10] text-[46px] font-bold text-[#46fc8b]">
                    {initials}
                  </div>
                ) : (
                  <Image
                    src="/me.jpg"
                    alt={displayName}
                    fill
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 400px, 88vw"
                    className="object-cover"
                    onError={() => setImageFailed(true)}
                  />
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#050b07] via-[#050b07]/65 to-transparent"
                />
                <div className="absolute bottom-4 start-4 end-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9fb5a6]">
                      {t("landing.hero.streak")}
                    </p>
                    <p
                      className="mt-1 text-[26px] font-bold leading-none text-[#eef4ee]"
                      style={{ fontFamily: headingFont }}>
                      {t("landing.metrics.students")}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#46fc8b]/20 bg-[#050b07]/80 px-2.5 py-1 text-[10.5px] font-semibold text-[#46fc8b] backdrop-blur-md">
                    <BadgeCheck size={12} />
                    {t("landing.footer.immersive")}
                  </span>
                </div>
              </div>
            </div>

            <span
              aria-hidden="true"
              className="absolute -top-3 -end-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#46fc8b]/20 bg-[#0b140f] text-[#46fc8b] shadow-[0_20px_50px_-24px_rgba(70,252,139,0.55)]">
              <UserRound size={20} />
            </span>
          </motion.div>
        </div>
      </section>

      {/* Stats rail */}
      <section className="relative z-10 mx-auto w-full max-w-[1280px] px-5 pb-12 lg:px-10 lg:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[26px] border border-white/[0.07] bg-[#0f1612]/80 backdrop-blur-xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#46fc8b]/30 to-transparent"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {stats.map(({ icon: Icon, value, label }, i) => (
              <div
                key={label}
                className={`flex items-center gap-4 p-5 sm:p-6 ${
                  i > 0 ? "border-t border-white/[0.06] sm:border-s sm:border-t-0" : ""
                }`}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#46fc8b]/12 bg-[#46fc8b]/[0.06] text-[#46fc8b]">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <p
                    className="text-[24px] font-bold leading-none tracking-tight text-[#eef4ee]"
                    style={{ fontFamily: headingFont }}>
                    {value}
                  </p>
                  <p className="mt-2 text-[11.5px] leading-5 text-[#9fb5a6]">
                    {label}
                  </p>
                </div>
                <span className="ms-auto font-mono text-[9px] tracking-[0.2em] text-[#5d7565]">
                  {`0${i + 1}`}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Story */}
      <section className="relative z-10 mx-auto w-full max-w-[1280px] px-5 pb-12 lg:px-10 lg:pb-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4 lg:col-span-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#46fc8b]/20 bg-[#46fc8b]/[0.06] px-3 py-1.5 text-[10.5px] font-semibold text-[#46fc8b]">
              <BadgeCheck size={13} />
              <span
                className={
                  locale === "fa" ? "" : "uppercase tracking-[0.18em]"
                }>
                {t("landing.founder.label")}
              </span>
            </span>
            <h2
              className="max-w-sm text-[30px] leading-[1.18] tracking-tight text-[#eef4ee] sm:text-[34px] lg:text-[40px]"
              style={{
                fontFamily: headingFont,
                fontWeight: locale === "fa" ? 800 : 700,
              }}>
              {t("landing.founder.headline")}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="relative overflow-hidden rounded-[30px] border border-white/[0.07] bg-[linear-gradient(150deg,#121b15_0%,#0d1510_60%,#0a110d_100%)] p-6 sm:p-8 lg:col-span-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 end-0 h-56 w-56 rounded-full bg-[#46fc8b]/[0.07] blur-[90px]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-3 start-5 select-none font-serif text-[90px] leading-none text-[#46fc8b]/15">
              &ldquo;
            </span>
            <p
              dir={locale === "en" ? "ltr" : "rtl"}
              className="relative text-[15px] leading-8 text-[#c9d6cc] sm:text-[16px] sm:leading-9">
              {displayBio}
            </p>

            {locale === "fa" && mentor?.education && (
              <div className="relative mt-7 flex items-start gap-3 border-t border-white/[0.06] pt-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#46fc8b]/12 bg-[#46fc8b]/[0.05] text-[#46fc8b]">
                  <Building2 size={16} />
                </span>
                <p className="pt-1.5 text-[13px] leading-6 text-[#9fb5a6]">
                  {mentor.education}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto w-full max-w-[1280px] px-5 pb-8 lg:px-10 lg:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-[linear-gradient(140deg,#151e18_0%,#0d1510_55%,#0a110d_100%)] p-6 sm:p-8 lg:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-28 start-1/3 h-72 w-72 rounded-full bg-[#05df72]/[0.12] blur-[110px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#46fc8b]/40 to-transparent"
          />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-2xl flex-col gap-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#46fc8b]/20 bg-[#46fc8b]/[0.06] px-3 py-1.5 text-[10.5px] font-semibold text-[#46fc8b]">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#46fc8b] opacity-40" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#46fc8b]" />
                </span>
                <span
                  className={
                    locale === "fa" ? "" : "uppercase tracking-[0.18em]"
                  }>
                  {t("landing.cta.label")}
                </span>
              </span>
              <h2
                className="text-[28px] leading-[1.18] tracking-tight text-[#eef4ee] sm:text-[34px] lg:text-[38px]"
                style={{
                  fontFamily: headingFont,
                  fontWeight: locale === "fa" ? 800 : 700,
                }}>
                {t("landing.cta.headline")}
              </h2>
              <p className="max-w-xl text-[14px] leading-7 text-[#9fb5a6]">
                {t("landing.cta.subtitle")}
              </p>
            </div>

            <Link
              href="/test"
              className="group inline-flex w-fit shrink-0 items-center gap-2.5 rounded-xl bg-[#46fc8b] px-6 py-3.5 text-[14px] font-bold text-[#003918] ring-1 ring-inset ring-white/25 transition-colors hover:bg-[#7bffb0]">
              <span>{t("landing.cta.claimTrial")}</span>
              <ArrowRight
                size={16}
                className="rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
              />
            </Link>
          </div>
        </motion.div>

        <p className="mt-6 text-center text-[11px] text-[#6f8a79]">
          {t("landing.footer.copyright")}
        </p>
      </section>
    </main>
  );
}
