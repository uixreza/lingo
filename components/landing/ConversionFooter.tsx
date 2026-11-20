"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Download,
  Shield,
  Award,
  Lock,
  Phone,
  Mail,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";

const footerLinks = {
  tracks: ["immersive", "japanese", "freeTest"],
  ecosystem: [
    "methodologyLink",
    "meetFounder",
    "blogInsights",
    "desktopMobile",
    "studentPanel",
  ],
  trust: [
    { key: "cefr", desc: "cefrDesc", icon: Award },
    { key: "ssl", desc: "sslDesc", icon: Lock },
    { key: "mastery", desc: "masteryDesc", icon: Shield },
  ],
};

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

const ctaFade = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const ctaContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function ConversionFooter() {
  const { data: session } = useSession();
  const { open: openAuth } = useAuth();
  const { t, locale } = useLang();
  const headingFont =
    locale === "fa"
      ? "'Dana', 'Anjoman', sans-serif"
      : "var(--font-plus-jakarta), sans-serif";
  const columnLabel =
    locale === "fa"
      ? "text-[11px] font-semibold text-[#6f8a79]"
      : "text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6f8a79]";

  return (
    <>
      {/* CTA Banner */}
      <section className="mx-auto w-full max-w-[1280px] px-5 py-6 lg:px-10 lg:py-10">
        <motion.div
          variants={ctaContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-[linear-gradient(140deg,#151e18_0%,#0d1510_55%,#0a110d_100%)]">
          <div
            aria-hidden="true"
            className="absolute top-[-150px] start-1/3 h-[320px] w-[560px] rounded-full bg-[#05df72]/[0.14] blur-[130px]"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[-150px] -end-24 h-[340px] w-[340px] rounded-full bg-[#46fc8b]/[0.08] blur-[110px]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#46fc8b]/40 to-transparent"
          />

          <div className="relative grid gap-10 p-6 sm:p-8 lg:grid-cols-12 lg:items-center lg:gap-8 lg:p-12">
            {/* Copy */}
            <div className="flex flex-col items-start gap-5 lg:col-span-7">
              <motion.span
                variants={ctaFade}
                className="inline-flex items-center gap-2 rounded-full border border-[#46fc8b]/20 bg-[#46fc8b]/[0.06] px-3 py-1.5 text-[10.5px] font-semibold text-[#46fc8b]">
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
              </motion.span>

              <motion.h2
                variants={ctaFade}
                className="max-w-2xl text-[32px] leading-[1.15] tracking-tight sm:text-[42px]"
                style={{
                  fontFamily: headingFont,
                  fontWeight: locale === "fa" ? 800 : 700,
                }}>
                <span className="bg-gradient-to-r from-[#eef4ee] via-[#e2ffec] to-[#7bffb0] bg-clip-text text-transparent">
                  {t("landing.cta.headline")}
                </span>
              </motion.h2>

              <motion.p
                variants={ctaFade}
                className="max-w-xl text-[14.5px] leading-7 text-[#9fb5a6]">
                {t("landing.cta.subtitle")}
              </motion.p>

              <motion.div
                variants={ctaFade}
                className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={session ? "/test" : "#"}
                  onClick={(e) => {
                    if (!session) {
                      e.preventDefault();
                      openAuth();
                    }
                  }}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-[#46fc8b] via-[#20f47f] to-[#05df72] px-6 py-3.5 text-[14px] font-bold text-[#003918] ring-1 ring-inset ring-white/25 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0">
                  <span className="relative">{t("landing.cta.claimTrial")}</span>
                  <ArrowRight
                    size={16}
                    className="relative rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100"
                  />
                </Link>

                <Link
                  href="/download"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-[13.5px] font-medium text-[#dde5dd] backdrop-blur-md transition-colors hover:border-[#46fc8b]/25 hover:bg-[#46fc8b]/[0.06]">
                  <Download size={16} className="text-[#4edea3]" />
                  <span>{t("landing.cta.downloadApp")}</span>
                </Link>
              </motion.div>
            </div>

            {/* CEFR orbit */}
            <motion.div
              variants={ctaFade}
              aria-hidden="true"
              className="relative mx-auto h-[270px] w-[270px] sm:h-[300px] sm:w-[300px] lg:col-span-5">
              <div className="absolute inset-0 rounded-full border border-[#46fc8b]/10" />
              <div className="absolute inset-[38px] rounded-full border border-dashed border-[#46fc8b]/[0.18]" />
              <div className="absolute inset-[76px] rounded-full border border-[#46fc8b]/10" />
              <div className="absolute inset-[36%] flex flex-col items-center justify-center rounded-full border border-[#46fc8b]/20 bg-[#0b140f] text-center shadow-[0_0_70px_-24px_rgba(70,252,139,0.5)]">
                <span className="font-mono text-[19px] font-bold tracking-tight text-[#46fc8b] sm:text-[21px]">
                  A1–C2
                </span>
                <span className="mt-0.5 text-[8.5px] uppercase tracking-[0.22em] text-[#6f8a79]">
                  CEFR
                </span>
              </div>

              {levels.map((level, i) => {
                const positions = [
                  "left-1/2 top-0 -translate-x-1/2",
                  "right-0 top-[15%]",
                  "bottom-[15%] right-0",
                  "bottom-0 left-1/2 -translate-x-1/2",
                  "bottom-[15%] left-0",
                  "left-0 top-[15%]",
                ];
                const active = level === "B2";
                return (
                  <span
                    key={level}
                    className={`absolute flex h-8 min-w-8 items-center justify-center rounded-full border px-2 font-mono text-[9px] font-semibold backdrop-blur-md ${positions[i]} ${
                      active
                        ? "border-[#46fc8b]/35 bg-[#46fc8b]/10 text-[#46fc8b]"
                        : "border-white/[0.08] bg-[#0b140f]/90 text-[#7f9487]"
                    }`}>
                    {level}
                  </span>
                );
              })}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-10 w-full overflow-hidden border-t border-white/[0.06] bg-[#080e0b]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-[380px] w-[380px]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(70,252,139,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(70,252,139,0.22) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            maskImage:
              "radial-gradient(ellipse 90% 90% at 0% 100%, rgba(0,0,0,0.9) 0%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 90% at 0% 100%, rgba(0,0,0,0.9) 0%, transparent 72%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 end-0 h-72 w-72 rounded-full bg-[#05df72]/[0.05] blur-[100px]"
        />

        <div className="relative z-10 mx-auto max-w-[1280px] px-5 pb-24 pt-14 lg:px-10 lg:pt-16">
          <div className="grid gap-10 pb-12 lg:grid-cols-12 lg:gap-8">
            {/* Brand */}
            <div className="flex flex-col gap-5 lg:col-span-5">
              <div className="flex w-fit items-center gap-2.5" dir="ltr">
                <Image
                  src="/mainIcon.webp"
                  alt="LingoFam"
                  width={30}
                  height={30}
                  className="h-[30px] w-[30px]"
                />
                <span
                  className="text-[24px] tracking-tight text-[#eef4ee]"
                  style={{ fontFamily: '"Poolary", sans-serif', fontWeight: 400 }}>
                  Lingo<span className="text-[#46fc8b]">Fam</span>
                </span>
              </div>

              <p className="max-w-sm text-[13px] leading-6 text-[#9fb5a6]">
                {t("landing.footer.desc")}
              </p>

              <div className="flex flex-col gap-2.5">
                <span className={columnLabel}>
                  {t("landing.footer.contact")}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="tel:09388628892"
                    className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[12px] text-[#dde5dd] transition-colors hover:border-[#46fc8b]/25 hover:bg-[#46fc8b]/[0.06]">
                    <Phone size={13} className="shrink-0 text-[#46fc8b]" />
                    <span dir="ltr" className="tracking-wide">
                      09388628892
                    </span>
                  </a>
                  <a
                    href="mailto:lingofam@atomicmail.io"
                    className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[12px] text-[#dde5dd] transition-colors hover:border-[#46fc8b]/25 hover:bg-[#46fc8b]/[0.06]">
                    <Mail size={13} className="shrink-0 text-[#46fc8b]" />
                    <span dir="ltr" className="tracking-wide">
                      lingofam@atomicmail.io
                    </span>
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  referrerPolicy="origin"
                  target="_blank"
                  href="https://trustseal.enamad.ir/?id=7486730&Code=G77bF9erLIXFjYTYnvtJqtyzzNcQsep2">
                  <Image
                    unoptimized
                    width={40}
                    height={40}
                    referrerPolicy="origin"
                    className="rounded-lg border-none"
                    src="https://ailinabrishami.com/wp-content/uploads/2025/01/%D9%84%D9%88%DA%AF%D9%88-%D8%A7%DB%8C%D9%86%D9%85%D8%A7%D8%AF.webp?id=7486730&Code=G77bF9erLIXFjYTYnvtJqtyzzNcQsep2"
                    alt="Enamad Trust Seal"
                  />
                </a>
                <Image
                  unoptimized
                  width={40}
                  height={40}
                  referrerPolicy="origin"
                  className="rounded-lg border-none"
                  src="https://silvernight.ir/wp-content/uploads/2024/06/snapppay-logo.png"
                  alt="SnapPay"
                />
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
              <div className="flex flex-col gap-3">
                <span className={columnLabel}>{t("landing.footer.tracks")}</span>
                {footerLinks.tracks.map((key) => (
                  <Link
                    key={key}
                    href="/test"
                    className="text-[13px] text-[#a9bcae] transition-colors hover:text-[#46fc8b]">
                    {key === "immersive"
                      ? t("landing.footer.immersive")
                      : key === "japanese"
                        ? t("landing.footer.japanese")
                        : t("landing.footer.freeTest")}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <span className={columnLabel}>
                  {t("landing.footer.ecosystem")}
                </span>
                {footerLinks.ecosystem.map((key) => (
                  <Link
                    key={key}
                    href={
                      key === "blogInsights"
                        ? "/blog"
                        : key === "meetFounder"
                          ? "/about"
                          : key === "desktopMobile"
                            ? "/download"
                            : "/"
                    }
                    className="text-[13px] text-[#a9bcae] transition-colors hover:text-[#46fc8b]">
                    {key === "methodologyLink"
                      ? t("landing.footer.methodologyLink")
                      : key === "meetFounder"
                        ? t("landing.footer.meetFounder")
                        : key === "blogInsights"
                          ? t("landing.footer.blogInsights")
                          : key === "desktopMobile"
                            ? t("landing.footer.desktopMobile")
                            : t("landing.footer.studentPanel")}
                  </Link>
                ))}
              </div>

              <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
                <span className={columnLabel}>{t("landing.footer.trust")}</span>
                {footerLinks.trust.map((item) => (
                  <div key={item.key} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#46fc8b]/10 bg-[#46fc8b]/[0.05] text-[#46fc8b]">
                      <item.icon size={13} />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[12.5px] font-medium text-[#dde5dd]">
                        {item.key === "cefr"
                          ? t("landing.footer.cefr")
                          : item.key === "ssl"
                            ? t("landing.footer.ssl")
                            : t("landing.footer.mastery")}
                      </span>
                      <span className="mt-0.5 text-[10.5px] leading-4 text-[#7f9487]">
                        {item.key === "cefr"
                          ? t("landing.footer.cefrDesc")
                          : item.key === "ssl"
                            ? t("landing.footer.sslDesc")
                            : t("landing.footer.masteryDesc")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row">
            <span className="text-[11px] text-[#6f8a79]">
              {t("landing.footer.copyright")}
            </span>
            <div className="flex items-center gap-4">
              <Link
                href="/policy"
                className="text-[11px] text-[#6f8a79] transition-colors hover:text-[#46fc8b]">
                {t("landing.footer.privacy")}
              </Link>
              <Link
                href="/policy"
                className="text-[11px] text-[#6f8a79] transition-colors hover:text-[#46fc8b]">
                {t("landing.footer.terms")}
              </Link>
              <Link
                href="/policy"
                className="text-[11px] text-[#6f8a79] transition-colors hover:text-[#46fc8b]">
                {t("landing.footer.security")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
