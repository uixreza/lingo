"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Snowfall from "react-snowfall";
import { useSession } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";

function useIsMobile() {
  const subscribe = (onChange: () => void) => {
    const mql = window.matchMedia("(max-width: 639px)");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  };
  const getSnapshot = () => window.matchMedia("(max-width: 639px)").matches;
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function Home() {
  const [marqueeTexts, setMarqueeTexts] = useState<string[]>([]);
  const [marqueeLoading, setMarqueeLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [christmas, setChristmas] = useState(false);
  const [imgKey, setImgKey] = useState(0);
  const isMobile = useIsMobile();
  const { data: session } = useSession();
  const { open: openAuth } = useAuth();
  const { t, locale } = useLang();

  useEffect(() => {
    const fetchMarquee = async () => {
      try {
        const res = await fetch("/api/dashboard/daily-content");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.marquee) && data.marquee.length > 0)
            setMarqueeTexts(data.marquee);
        }
      } catch {
        // keep marquee hidden on failure
      } finally {
        setMarqueeLoading(false);
      }
    };
    fetchMarquee();
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/site-status", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setChristmas(data.christmas);
          setImgKey(Date.now());
        }
      } catch {
        // default to false
      }
    };
    fetchStatus();
  }, []);

  return (
    <main
      style={{ fontFamily: "'Morabba', 'Dana', sans-serif" }}
      className="relative min-h-screen bg-[#050505] overflow-hidden">
      {christmas && (
        <Snowfall
          color="#dee4fd"
          snowflakeCount={isMobile ? 40 : 200}
          speed={[0.5, 3]}
          wind={[-0.5, 2]}
          radius={[0.5, 3]}
        />
      )}
      <div className="absolute top-[-200px] left-[-10%] w-[800px] h-[800px] rounded-full bg-[#22c55e]/15 blur-[180px] pointer-events-none" />
      <div className="absolute top-[30%] left-[55%] -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#4ade80]/8 blur-[140px] pointer-events-none" />
      <div className="absolute top-[60%] left-[15%] w-[300px] h-[300px] rounded-full bg-[#22c55e]/10 blur-[100px] pointer-events-none" />

      {marqueeLoading ? (
        <div
          className="fixed top-4 left-0 z-40 flex justify-center lg:justify-start px-4 w-full lg:w-1/3"
          style={{ direction: "ltr" }}>
          <div className="flex items-center gap-3 overflow-hidden w-full rounded-xl bg-[#0a0f0a]/80 backdrop-blur-xl ring-1 ring-green-500/15 px-4 py-2.5">
            <span className="shrink-0 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center animate-pulse">
                <span className="w-3.5 h-3.5 rounded-sm bg-green-500/30" />
              </span>
            </span>
            <div className="flex-1 space-y-2">
              <div className="h-2 w-16 bg-white/10 rounded-full animate-pulse" />
              <div className="h-2 w-36 bg-white/10 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      ) : marqueeTexts.length > 0 ? (
        <div
          className="fixed top-4 left-0 z-40 flex justify-center lg:justify-start px-4 w-full lg:w-1/3"
          style={{ direction: "ltr" }}>
          <div className="flex items-center gap-3 overflow-hidden w-full rounded-xl bg-[#0a0f0a]/80 backdrop-blur-xl ring-1 ring-green-500/15 px-4 py-2.5">
            <span className="shrink-0 flex items-center gap-2 text-xs font-bold text-green-400">
              <span className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </span>
              {t("home.notice")}
            </span>
            <div className="relative flex-1 overflow-hidden min-w-0">
              <div className="flex w-max will-change-transform animate-marquee-reverse">
                {[0, 1].map((dup) => (
                  <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
                    {marqueeTexts.map((msg, i) => (
                      <span
                        key={i}
                        className="text-xs font-medium text-[#888] hover:text-white whitespace-nowrap px-6 flex items-center gap-2">
                        {msg}
                        <span className="w-1 h-1 rounded-full bg-green-500/60 shrink-0" />
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

<a className="fixed top-20 right-4 lg:top-4 z-40 border-none" referrerPolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=7486730&Code=G77bF9erLIXFjYTYnvtJqtyzzNcQsep2'><Image unoptimized width={50} height={50} referrerPolicy='origin' className="border-none" src='https://ailinabrishami.com/wp-content/uploads/2025/01/%D9%84%D9%88%DA%AF%D9%88-%D8%A7%DB%8C%D9%86%D9%85%D8%A7%D8%AF.webp?id=7486730&Code=G77bF9erLIXFjYTYnvtJqtyzzNcQsep2' alt='' style={{cursor:"pointer"}} /></a>
      {/* LingoTV button - hidden for now */}
      {/* <Link href="/lingotv">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(34,197,94,0.45)",
              "0 0 0 9px rgba(34,197,94,0)",
              "0 0 0 0 rgba(34,197,94,0.45)",
            ],
          }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          className="fixed top-4 right-4 z-40 hidden lg:flex items-center gap-2 pl-2.5 pr-4 py-2 rounded-xl bg-[#0a0f0a]/80 border border-green-500/30 backdrop-blur-xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-[11px] font-black tracking-[0.2em] text-green-400">
            LIVE
          </span>
          <span className="text-xs font-bold text-green-400">LingoTV</span>
        </motion.button>
      </Link> */}

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col-reverse lg:flex-row items-center max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 lg:pt-8 pb-24 min-h-screen gap-2 sm:gap-10 lg:gap-16">
        <div className={`flex-1 text-center ${locale === "en" ? "lg:text-left" : "lg:text-right"}`}>
          <motion.div
            variants={item}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-sm mb-8">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-green-400"
            />
            {t("home.badge")}
          </motion.div>
          <motion.h1
            variants={item}
            className="text-[1.875rem] sm:text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            {t("home.heading1")}
            <br />
            <span className="animate-neon-flicker">
              {t("home.heading2")}
            </span>
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-4 sm:mt-6 text-base sm:text-lg text-[#888] w-5/6 max-w-xl leading-relaxed mx-auto lg:mx-0">
            {t("home.subtitle")}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-6 sm:mt-10 flex gap-3 sm:gap-4 justify-center lg:justify-start">
            <Link href={session ? "/dashboard/sessions" : "#"}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(34,197,94,0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  if (session) {
                    setStarting(true);
                  } else {
                    e.preventDefault();
                    openAuth();
                  }
                }}
                disabled={starting}
                className="px-7 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-l from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 disabled:from-green-500/60 disabled:to-emerald-400/60 text-black font-bold rounded-full shadow-lg shadow-green-500/30 flex items-center gap-2 transition-all duration-200 text-[0.9rem] sm:text-base">
                {starting && <Loader2 size={16} className="animate-spin" />}
                {starting ? t("home.starting") : t("home.start")}
              </motion.button>
            </Link>
            <Link href="/about">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-7 sm:px-8 py-3 sm:py-3.5 border border-white/20 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/5 rounded-full backdrop-blur-sm transition-all duration-200 text-[0.9rem] sm:text-base">
                {t("home.about")}
              </motion.button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          variants={item}
          className="flex-1 flex justify-evenly">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            className="relative flex items-center justify-center">
            <div className="absolute w-[220px] sm:w-[350px] h-[220px] sm:h-[350px] rounded-full bg-[#22c55e]/20 blur-[70px] sm:blur-[100px] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-green-500/15 via-transparent to-transparent rounded-3xl blur-3xl" />

            <Image
              key={imgKey}
              alt="mini Room"
              src={christmas ? "/miniRoomSnow.webp" : "/miniRoom.webp"}
              width={800}
              height={800}
              quality={100}
              className="relative select-none pointer-events-none w-full max-w-[290px] lg:min-w-md drop-shadow-2xl"
              priority
            />
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="fixed bottom-0 left-0 right-0 hidden sm:flex items-center justify-between px-10 z-10 pb-6 text-[10px] sm:text-xs text-[#555]">
        <span>© 2026 Lingofam</span>
        <Link href="/policy" className="hover:text-white transition-colors">
          {t("home.policy")}
        </Link>
      </motion.footer>
    </main>
  );
}
