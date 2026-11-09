"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Download, Shield, Award, Lock, Phone, Mail } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";

const footerLinks = {
  tracks: [
    "immersive",
    "business",
    "tech",
    "japanese",
    "freeTest",
  ],
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
  show: { transition: { staggerChildren: 0.12 } },
};

export default function ConversionFooter() {
  const { data: session } = useSession();
  const { open: openAuth } = useAuth();
  const { t, locale } = useLang();

  return (
    <>
      {/* CTA Banner */}
      <section className="w-full max-w-[1280px] mx-auto px-5 lg:px-10 py-12 lg:py-20">
        <motion.div
          variants={ctaContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="relative rounded-[28px] overflow-hidden border border-white/[0.08] shadow-[0_24px_80px_-28px_rgba(5,222,114,0.3)]">
          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#131c16] via-[#0b1410] to-[#0b1410]" />
          <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[560px] h-[320px] rounded-full bg-[#05df72]/20 blur-[130px] pointer-events-none" />
          <div className="absolute bottom-[-130px] right-[-8%] w-[380px] h-[380px] rounded-full bg-[#46fc8b]/10 blur-[120px] pointer-events-none" />
          {/* Top hairline */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#46fc8b]/50 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center gap-5 px-6 py-14 lg:py-20">
            <motion.span
              variants={ctaFade}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#242c27]/80 border border-green-500/25 backdrop-blur-md text-[12px] font-semibold text-[#46fc8b] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#46fc8b] shadow-[0_0_8px_#46fc8b] animate-pulse" />
              {t("landing.cta.label")}
            </motion.span>

            <motion.h2
              variants={ctaFade}
              className="text-[32px] sm:text-[44px] leading-[1.15] font-bold max-w-2xl tracking-tight"
              style={{ fontFamily: locale === "fa" ? "var(--font-morabba-light), 'Dana', sans-serif" : "var(--font-plus-jakarta), 'Dana', sans-serif" }}>
              <span className="bg-gradient-to-r from-[#dde5dd] via-white to-[#46fc8b] bg-clip-text text-transparent">
                {t("landing.cta.headline")}
              </span>
            </motion.h2>

            <motion.p
              variants={ctaFade}
              className="text-[17px] leading-[28px] text-[#bacbb9] max-w-xl">
              {t("landing.cta.subtitle")}
            </motion.p>

            <motion.div
              variants={ctaFade}
              className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <button
                onClick={(e) => {
                  if (!session) {
                    e.preventDefault();
                    openAuth();
                  }
                }}
                className="group relative overflow-hidden px-7 py-3.5 rounded-2xl bg-[#05df72] text-[#003918] font-bold text-[15px] shadow-[0_0_30px_rgba(70,252,139,0.45)] hover:shadow-[0_0_44px_rgba(70,252,139,0.7)] hover:bg-[#3cfd8a] transition-all duration-300 flex items-center gap-2">
                <span>{t("landing.cta.claimTrial")}</span>
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none group-hover:translate-x-full transition-transform duration-700" />
              </button>
              <Link
                href="/download"
                className="px-6 py-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md text-[#dde5dd] text-[14px] font-medium hover:border-green-500/40 hover:bg-green-500/10 transition-all duration-300 flex items-center gap-2">
                <Download size={18} className="text-[#4edea3]" />
                <span>{t("landing.cta.downloadApp")}</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full bg-[#09100c] shadow-[0_-1px_12px_rgba(0,0,0,0.4)] mt-16 overflow-hidden">
        {/* Fade grid pattern — left side */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 w-[380px] h-[380px] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(70,252,139,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(70,252,139,0.35) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            maskImage:
              "radial-gradient(ellipse 90% 90% at 0% 100%, rgba(0,0,0,0.9) 0%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 90% at 0% 100%, rgba(0,0,0,0.9) 0%, transparent 72%)",
          }}
        />
        <div className="relative z-10 max-w-[1280px] mx-auto px-5 lg:px-10 pt-12 lg:pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12">
            {/* Brand */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Image src="/mainIcon.webp" alt="LingoFam" width={28} height={28} className="w-7 h-7" />
                <span
                  className="text-[22px] text-[#dde5dd] tracking-tight"
                  style={{ fontFamily: '"Poolary", sans-serif', fontWeight: 400 }}>
                  Lingo<span className="text-[#46fc8b]">Fam</span>
                </span>
              </div>
              <p className="text-[13px] leading-[20px] text-[#bacbb9] max-w-sm">
                {t("landing.footer.desc")}
              </p>
              <div className="mt-1 flex flex-col gap-2 w-fit rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <span className="text-[11px] uppercase tracking-widest text-[#859585] px-1">
                  {t("landing.footer.contact")}
                </span>
                <div className="flex flex-wrap items-center gap-2" dir="ltr">
                  <a
                    href="tel:09388628892"
                    className="group flex items-center gap-2 rounded-xl bg-[#46fc8b]/10 px-3 py-2 text-[12px] text-[#dde5dd] transition-colors hover:bg-[#46fc8b]/20">
                    <Phone size={13} className="text-[#46fc8b] shrink-0" />
                    <span className="tracking-wide">09388628892</span>
                  </a>
                  <a
                    href="mailto:lingofam@atomicmail.io"
                    className="group flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-[12px] text-[#dde5dd] transition-colors hover:bg-white/10">
                    <Mail size={13} className="text-[#46fc8b] shrink-0" />
                    <span className="tracking-wide">lingofam@atomicmail.io</span>
                  </a>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-3">
                <a referrerPolicy="origin" target="_blank" href="https://trustseal.enamad.ir/?id=7486730&Code=G77bF9erLIXFjYTYnvtJqtyzzNcQsep2">
                  <Image
                    unoptimized
                    width={40}
                    height={40}
                    referrerPolicy="origin"
                    className="border-none rounded-lg"
                    src="https://ailinabrishami.com/wp-content/uploads/2025/01/%D9%84%D9%88%DA%AF%D9%88-%D8%A7%DB%8C%D9%86%D9%85%D8%A7%D8%AF.webp?id=7486730&Code=G77bF9erLIXFjYTYnvtJqtyzzNcQsep2"
                    alt="Enamad Trust Seal"
                  />
                </a>
                <Image
                  unoptimized
                  width={40}
                  height={40}
                  referrerPolicy="origin"
                  className="border-none rounded-lg"
                  src="https://silvernight.ir/wp-content/uploads/2024/06/snapppay-logo.png"
                  alt="SnapPay"
                />
              </div>
            </div>

            {/* Learning Tracks */}
            <div className="flex flex-col gap-3">
              <span className="text-[22px] font-semibold text-[#dde5dd]">
                {t("landing.footer.tracks")}
              </span>
              {footerLinks.tracks.map((key) => (
                <Link
                  key={key}
                  href="/test"
                  className="text-[13px] text-[#bacbb9] hover:text-[#46fc8b] transition-colors">
                  {key === "immersive" ? t("landing.footer.immersive") : key === "business" ? t("landing.footer.business") : key === "tech" ? t("landing.footer.tech") : key === "japanese" ? t("landing.footer.japanese") : t("landing.footer.freeTest")}
                </Link>
              ))}
            </div>

            {/* Ecosystem */}
            <div className="flex flex-col gap-3">
              <span className="text-[22px] font-semibold text-[#dde5dd]">
                {t("landing.footer.ecosystem")}
              </span>
              {footerLinks.ecosystem.map((key) => (
                <Link
                  key={key}
                  href={key === "blogInsights" ? "/blog" : key === "meetFounder" ? "/about" : key === "desktopMobile" ? "/download" : "/"}
                  className="text-[13px] text-[#bacbb9] hover:text-[#46fc8b] transition-colors">
                  {key === "methodologyLink" ? t("landing.footer.methodologyLink") : key === "meetFounder" ? t("landing.footer.meetFounder") : key === "blogInsights" ? t("landing.footer.blogInsights") : key === "desktopMobile" ? t("landing.footer.desktopMobile") : t("landing.footer.studentPanel")}
                </Link>
              ))}
            </div>

            {/* Trust */}
            <div className="flex flex-col gap-3">
              <span className="text-[22px] font-semibold text-[#dde5dd]">
                {t("landing.footer.trust")}
              </span>
              {footerLinks.trust.map((item) => (
                <div key={item.key} className="flex items-start gap-2">
                  <item.icon
                    size={16}
                    className="text-[#46fc8b] mt-0.5 shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-[#dde5dd]">
                      {item.key === "cefr" ? t("landing.footer.cefr") : item.key === "ssl" ? t("landing.footer.ssl") : t("landing.footer.mastery")}
                    </span>
                    <span className="text-[11px] text-[#bacbb9]">
                      {item.key === "cefr" ? t("landing.footer.cefrDesc") : item.key === "ssl" ? t("landing.footer.sslDesc") : t("landing.footer.masteryDesc")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[11px] text-[#859585]">
              {t("landing.footer.copyright")}
            </span>
            <div className="flex items-center gap-4">
              <Link
                href="/policy"
                className="text-[11px] text-[#859585] hover:text-[#46fc8b] transition-colors">
                {t("landing.footer.privacy")}
              </Link>
              <Link
                href="/policy"
                className="text-[11px] text-[#859585] hover:text-[#46fc8b] transition-colors">
                {t("landing.footer.terms")}
              </Link>
              <Link
                href="/policy"
                className="text-[11px] text-[#859585] hover:text-[#46fc8b] transition-colors">
                {t("landing.footer.security")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
