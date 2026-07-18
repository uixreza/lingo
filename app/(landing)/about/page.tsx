"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { GitBranch, GraduationCap, Code, BookOpen } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const skills = [
  { label: "مدرس زبان انگلیسی", icon: GraduationCap },
  { label: "توسعه‌دهنده وب", icon: Code },
];

export default function About() {
  return (
    <main className="relative min-h-screen bg-[#050505] overflow-hidden">
      <div className="absolute top-[10%] left-[-15%] w-[700px] h-[700px] rounded-full bg-[#22c55e]/10 blur-[200px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#4ade80]/8 blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-[#22c55e]/6 blur-[100px] pointer-events-none" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-32 min-h-screen flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        <motion.div
          variants={fadeUp}
          className="flex-shrink-0 flex flex-col items-center">
          <div className="relative mb-5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-6px] rounded-full bg-gradient-to-br from-green-400 via-emerald-500 to-green-400 opacity-40 blur-[2px]"
            />
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-[3px] border-green-500/40 shadow-lg shadow-green-500/20">
              <Image
                src="/rez.jpg"
                alt="رضا کمالی"
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = document.createElement("div");
                    fallback.className =
                      "w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500/30 to-emerald-500/30 text-4xl sm:text-5xl font-bold text-green-400";
                    fallback.textContent = "RK";
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
          </div>

          <motion.h1
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-green-400 to-emerald-300 mb-1">
            رضا کمالی
          </motion.h1>
          <motion.p variants={fadeUp} className="text-[#666] text-sm">
            درباره من
          </motion.p>
        </motion.div>

        <motion.div variants={fadeUp} className="flex-1 w-full space-y-6">
          <motion.div
            variants={fadeUp}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 sm:p-8">
            <p className="text-[#aaa] text-base sm:text-lg leading-relaxed">
              من سه سال است که در آموزشگاه‌های مختلف زبان انگلیسی تدریس می‌کنم و
              با دانش‌آموزان در سطوح مختلف با اهداف متفاوت کار کرده‌ام. کارشناسی
              ارشد زبان انگلیسی از دانشگاه بجنورد دارم.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 sm:p-8">
            <h2 className="text-green-400 text-sm font-medium mb-4 flex items-center gap-2">
              <BookOpen size={16} />
              مهارت‌ها
            </h2>
            <div className="flex flex-wrap gap-3">
              {skills.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                  <Icon size={16} />
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-2">
            <motion.a
              href="https://github.com/lingofam"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2.5 px-6 py-3 bg-green-500 text-black font-semibold rounded-2xl text-sm shadow-lg shadow-green-500/25">
              <GitBranch size={18} />
              گیت‌هاب
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>

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
