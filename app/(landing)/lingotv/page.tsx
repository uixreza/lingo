"use client";

import { motion } from "framer-motion";
import { MonitorPlay } from "lucide-react";

export default function LingoTVPage() {
  return (
    <main
      style={{ fontFamily: "'Morabba', 'Dana', sans-serif" }}
      className="relative min-h-screen bg-[#050505] overflow-hidden flex items-center justify-center">
      <div className="absolute top-[-150px] left-[10%] w-[600px] h-[600px] rounded-full bg-[#22c55e]/15 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[10%] w-[500px] h-[500px] rounded-full bg-[#4ade80]/8 blur-[140px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-3xl bg-green-500/10 border border-green-500/25 flex items-center justify-center mb-8 shadow-2xl shadow-green-500/20">
          <MonitorPlay className="w-9 h-9 text-green-400" />
        </motion.div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
          لینگو‌تی‌وی
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
            به زودی
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#888] max-w-md leading-relaxed">
          ویدیوهای آموزشی، پادکست‌ها و محتوای ویدیویی جذاب لینگو‌فام به‌زودی اینجا
          منتشر می‌شود.
        </p>
      </div>
    </main>
  );
}
