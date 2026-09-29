"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Download, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";

export default function LandingNavbar() {
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const { open: openAuth } = useAuth();
  const { t, locale, setLocale } = useLang();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setLangOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { label: t("landing.nav.courses"), href: "/test" },
    { label: t("landing.nav.methodology"), href: "/about" },
    { label: t("landing.nav.founder"), href: "/about" },
    { label: "LingoBlog", href: "/blog" },
    { label: t("landing.nav.levelTest"), href: "/test" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[#09100c]/85 backdrop-blur-xl border-b border-white/5"
      style={{ direction: "ltr" }}>
      <div className="mx-auto max-w-[1280px] px-5 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/mainIcon.webp" alt="LingoFam" width={28} height={28} className="w-7 h-7" />
            <span className="text-lg font-bold text-white tracking-tight">
              Lingo<span className="text-[#05df72]">Fam</span>
            </span>
          </Link>

          {/* Nav Links — desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-3 py-2 rounded-lg text-[13px] font-medium text-[#9ebaaa] hover:text-white hover:bg-white/5 transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Language */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 ring-1 ring-white/10 hover:ring-white/25 text-[#9ebaaa] hover:text-white transition-all text-xs font-medium">
                <span>{locale === "fa" ? "\u{1F1EE}\u{1F1F7}" : "\u{1F1EC}\u{1F1E7}"}</span>
                <span className="uppercase">{locale === "fa" ? "FA" : "EN"}</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform ${langOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    className="absolute top-full mt-1.5 right-0 bg-[#0d1412] border border-white/10 rounded-xl overflow-hidden shadow-xl min-w-[120px] z-50">
                    {(
                      [
                        { code: "fa" as const, flag: "\u{1F1EE}\u{1F1F7}", label: "\u0641\u0627\u0631\u0633\u06CC" },
                        { code: "en" as const, flag: "\u{1F1EC}\u{1F1E7}", label: "English" },
                      ] as const
                    ).map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLocale(l.code);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors ${
                          locale === l.code
                            ? "bg-[#05df72]/10 text-[#05df72]"
                            : "text-[#9ebaaa] hover:bg-white/5 hover:text-white"
                        }`}>
                        <span className="text-sm">{l.flag}</span>
                        <span className="font-medium">{l.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Download */}
            <Link
              href="/download"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 ring-1 ring-[#05df72]/25 text-[#05df72] hover:bg-[#05df72]/10 hover:ring-[#05df72]/40 transition-all text-xs font-medium">
              <Download size={14} />
              <span className="hidden md:inline">{t("home.download")}</span>
            </Link>

            {/* Portal CTA */}
            {session?.user ? (
              <Link
                href="/dashboard/sessions"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#05df72] text-[#003918] font-semibold text-xs hover:bg-[#3cfd8a] transition-all shadow-[0_0_12px_rgba(5,223,114,0.4)]">
                <User size={14} />
                <span className="hidden sm:inline">
                  {t("landing.nav.portal")}
                </span>
              </Link>
            ) : (
              <button
                onClick={openAuth}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#05df72] text-[#003918] font-semibold text-xs hover:bg-[#3cfd8a] transition-all shadow-[0_0_12px_rgba(5,223,114,0.4)]">
                <User size={14} />
                <span className="hidden sm:inline">
                  {t("landing.nav.portal")}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
