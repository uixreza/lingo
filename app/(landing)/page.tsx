"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

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

  return (
    <main
      style={{ fontFamily: "'Morabba', 'Dana', sans-serif" }}
      className="relative min-h-screen bg-[#050505] overflow-hidden">
      <div className="absolute top-[-200px] left-[-10%] w-[800px] h-[800px] rounded-full bg-[#22c55e]/15 blur-[180px] pointer-events-none" />
      <div className="absolute top-[30%] left-[55%] -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#4ade80]/8 blur-[140px] pointer-events-none" />
      <div className="absolute top-[60%] left-[15%] w-[300px] h-[300px] rounded-full bg-[#22c55e]/10 blur-[100px] pointer-events-none" />

      {marqueeLoading ? (
        <div
          className="fixed top-4 left-0 z-40 flex justify-center lg:justify-start px-4 w-full lg:w-1/3"
          style={{ direction: "ltr" }}>
          <div className="flex items-center gap-3 overflow-hidden w-full rounded-xl bg-[#0a0f0a]/80 backdrop-blur-xl ring-1 ring-green-500/15 px-4 py-2.5 animate-pulse">
            <span className="shrink-0 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
                <span className="w-3.5 h-3.5 rounded-sm bg-green-500/30" />
              </span>
            </span>
            <div className="flex-1 space-y-2">
              <div className="h-2 w-16 bg-white/10 rounded-full" />
              <div className="h-2 w-36 bg-white/10 rounded-full" />
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
              اطلاعیه
            </span>
            <div className="relative flex-1 overflow-hidden min-w-0">
              <div className="flex w-max will-change-transform animate-marquee">
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

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col-reverse lg:flex-row items-center max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 lg:pt-8 pb-24 min-h-screen gap-2 sm:gap-10 lg:gap-16">
        <div className="flex-1 text-center lg:text-right">
          <motion.div
            variants={item}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-sm mb-8">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-green-400"
            />
            آموزش تعاملی زبان
          </motion.div>
          <motion.h1
            variants={item}
            className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            انگلیسی رو
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              تو خونه یاد بگیر
            </span>
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-6 text-lg text-[#888] max-w-xl leading-relaxed mx-auto lg:mx-0">
            با درس‌های تعاملی و تمرین‌های روزمره، انگلیسی رو سریع‌تر و عمیق‌تر
            یادبگیر.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex gap-4 justify-center lg:justify-start">
            <Link href="/dashboard/sessions">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStarting(true)}
                disabled={starting}
                className="px-8 py-3.5 bg-green-500 hover:bg-green-400 disabled:bg-green-500/60 text-black font-semibold rounded-2xl shadow-lg shadow-green-500/25 flex items-center gap-2">
                {starting && <Loader2 size={16} className="animate-spin" />}
                {starting ? "در حال انتقال..." : "شروع کن"}
              </motion.button>
            </Link>
            <Link href="/about">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 border border-green-500/30 text-green-400 hover:bg-green-500/10 rounded-2xl">
                درباره من
              </motion.button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          variants={item}
          className="flex-1 flex justify-center lg:justify-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            className="relative flex items-center justify-center">
            <div className="absolute w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] rounded-full bg-[#22c55e]/20 blur-[80px] sm:blur-[100px] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-green-500/15 via-transparent to-transparent rounded-3xl blur-3xl" />

            <motion.div
              animate={{
                scale: [1, 1.25, 1.45],
                opacity: [0.15, 0.06, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.6,
              }}
              className="absolute w-[240px] sm:w-[340px] h-[240px] sm:h-[340px] rounded-full border border-green-400/20 will-change-transform"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute w-[270px] sm:w-[380px] h-[270px] sm:h-[380px] rounded-full border border-dashed border-green-400/15 will-change-transform"
            />
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-[240px] sm:w-[340px] h-[240px] sm:h-[340px] rounded-full bg-[#22c55e]/5 blur-2xl will-change-transform pointer-events-none"
            />
            <Image
              alt="mini Room"
              src={"/miniRoom.png"}
              width={600}
              height={600}
              className="relative select-none pointer-events-none w-full max-w-md lg:max-w-xl drop-shadow-2xl"
              priority
            />
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="fixed left-4 hidden sm:block sm:left-10 bottom-0 z-10 pb-6 text-[10px] sm:text-xs text-[#555]">
        © 2026 Lingofam
      </motion.footer>
    </main>
  );
}
