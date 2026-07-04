"use client";

import Image from "next/image";
import { motion } from "framer-motion";

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
  return (
    <main className="relative min-h-screen bg-[#050505] overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.15, 0.2, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-200px] left-[-10%] w-[800px] h-[800px] rounded-full bg-[#22c55e]/15 blur-[180px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.18, 0.12] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-[-350px] right-[-8%] w-[750px] h-[750px] rounded-full bg-[#16a34a]/12 blur-[160px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.04, 1], opacity: [0.08, 0.14, 0.08] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute top-[30%] left-[55%] -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#4ade80]/8 blur-[140px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-[60%] left-[15%] w-[300px] h-[300px] rounded-full bg-[#22c55e]/10 blur-[100px] pointer-events-none"
      />

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col-reverse lg:flex-row items-center max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-24 min-h-screen gap-6 sm:gap-10 lg:gap-16">
        <div className="flex-1 text-center lg:text-right">
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-sm mb-8">
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
          <motion.li
            variants={item}
            className="mt-6 text-lg text-[#888] max-w-xl leading-relaxed mx-auto lg:mx-0">
            منابع و تعیین سطح رایگان
          </motion.li>
          <motion.li
            variants={item}
            className="mt-2 text-lg text-[#888] max-w-xl leading-relaxed mx-auto lg:mx-0">
            زمان انعطاف پذیر جلسات
          </motion.li>
          <motion.div
            variants={item}
            className="mt-10 flex gap-4 justify-center lg:justify-start">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3.5 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-2xl shadow-lg shadow-green-500/25">
              شروع کن
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3.5 border border-green-500/30 text-green-400 hover:bg-green-500/10 rounded-2xl">
              پشتیبانی
            </motion.button>
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
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.45, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] rounded-full bg-[#22c55e]/20 blur-[80px] sm:blur-[100px] pointer-events-none"
            />
            <motion.div
              animate={{ opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-tr from-green-500/15 via-transparent to-transparent rounded-3xl blur-3xl"
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
