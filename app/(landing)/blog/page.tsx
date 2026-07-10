"use client";

import { motion } from "framer-motion";
import { Rss } from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function BlogPage() {
  return (
    <main className="relative min-h-screen bg-[#050505] flex items-center justify-center overflow-hidden">
      <div className="absolute top-[-150px] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#22c55e]/10 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#4ade80]/8 blur-[140px] pointer-events-none" />

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center text-center px-4">
        <motion.div
          variants={item}
          className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-8">
          <Rss size={28} className="text-green-400" />
        </motion.div>

        <motion.h1
          variants={item}
          className="text-3xl sm:text-4xl font-bold text-white leading-tight">
          لینگوبلاگ
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-4 text-lg text-[#888] max-w-md leading-relaxed">
          به زودی...
        </motion.p>

        <motion.div
          variants={item}
          className="mt-12 w-32 h-1 rounded-full bg-gradient-to-r from-green-500/40 via-green-400/60 to-green-500/40" />
      </motion.section>
    </main>
  );
}
