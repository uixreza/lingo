"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Download, Shield, Award, Lock } from "lucide-react";
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

export default function ConversionFooter() {
  const { data: session } = useSession();
  const { open: openAuth } = useAuth();
  const { t, locale } = useLang();

  return (
    <>
      {/* CTA Banner */}
      <section className="w-full max-w-[1280px] mx-auto px-5 lg:px-10 py-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl p-8 lg:p-12 bg-gradient-to-r from-[#242c27] via-[#1a211d] to-[#242c27] shadow-2xl overflow-hidden text-center flex flex-col items-center gap-4">
          <div className="absolute inset-0 bg-[#46fc8b]/5 pointer-events-none" />
          <span className="text-[12px] font-semibold text-[#46fc8b] uppercase tracking-widest z-10">
            {t("landing.cta.label")}
          </span>
          <h2
            className="text-[30px] lg:text-[40px] leading-tight font-bold text-[#dde5dd] max-w-2xl tracking-tight z-10"
            style={{ fontFamily: locale === "fa" ? "var(--font-morabba-light), 'Dana', sans-serif" : "var(--font-plus-jakarta), 'Dana', sans-serif" }}>
            {t("landing.cta.headline")}
          </h2>
          <p className="text-[18px] leading-[28px] text-[#bacbb9] max-w-xl z-10">
            {t("landing.cta.subtitle")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 z-10">
            <button
              onClick={(e) => {
                if (!session) {
                  e.preventDefault();
                  openAuth();
                }
              }}
              className="px-6 py-3.5 rounded-xl bg-[#05df72] text-[#003918] font-semibold shadow-[0_0_30px_rgba(70,252,139,0.5)] hover:shadow-[0_0_40px_rgba(70,252,139,0.7)] hover:bg-[#3cfd8a] transition-all duration-300 flex items-center gap-2 text-[15px]">
              <span>{t("landing.cta.claimTrial")}</span>
              <ArrowRight size={18} />
            </button>
            <Link
              href="/download"
              className="px-5 py-3 rounded-xl bg-[#2f3732]/80 hover:bg-[#2f3732] text-[#dde5dd] text-[13px] transition-colors flex items-center gap-2">
              <Download size={18} className="text-[#4edea3]" />
              <span>{t("landing.cta.downloadApp")}</span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full bg-[#09100c] shadow-[0_-1px_12px_rgba(0,0,0,0.4)] mt-16">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-10 pt-12 lg:pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12">
            {/* Brand */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Image src="/mainIcon.webp" alt="LingoFam" width={28} height={28} className="w-7 h-7" />
                <span className="text-[22px] font-bold text-[#dde5dd] tracking-tight">
                  Lingo<span className="text-[#46fc8b]">Fam</span>
                </span>
              </div>
              <p className="text-[13px] leading-[20px] text-[#bacbb9] max-w-sm">
                {t("landing.footer.desc")}
              </p>
              <a
                referrerPolicy="origin"
                target="_blank"
                href="https://trustseal.enamad.ir/?id=7486730&Code=G77bF9erLIXFjYTYnvtJqtyzzNcQsep2"
                className="mt-1">
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
