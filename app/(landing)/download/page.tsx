"use client";

import { motion, type Variants } from "framer-motion";
import { Download, Smartphone, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#22c55e]/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#4ade80]/5 blur-[140px] rounded-full pointer-events-none" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-md flex flex-col items-center gap-10">
        {/* Back link */}
        <motion.div variants={item} className="w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#888] hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4" />
            بازگشت به صفحه اصلی
          </Link>
        </motion.div>

        {/* App Icon */}
        <motion.div variants={item} className="relative">
          <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
          <div className="relative w-28 h-28 rounded-3xl bg-[#0d1412] border border-green-500/25 flex items-center justify-center shadow-lg shadow-green-500/10">
            <Image
              src="/mainIcon.webp"
              alt="Lingofam"
              width={80}
              height={80}
              className="rounded-2xl"
              priority
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div variants={item} className="text-center space-y-3">
          <h1
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "Morabba, sans-serif" }}>
            دانلود لینگوفم
          </h1>
          <p className="text-[#aaa] text-sm leading-relaxed max-w-xs mx-auto">
            اپلیکیشن لینگوفم را روی گوشی اندرویدی خود نصب کنید و زبان را
            طبیعی‌تر یاد بگیرید.
          </p>
        </motion.div>

        {/* Download Buttons */}
        <motion.div variants={item} className="w-full flex flex-col gap-4">
          {/* Cafe Bazaar */}
          <a
            href="https://cafebazaar.ir/app/id.nomi.lingofam"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 w-full p-4 rounded-2xl bg-[#0d1412] border border-green-500/20 hover:border-green-500/40 hover:bg-[#111a16] transition-all duration-300 shadow-lg shadow-green-500/5">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src="https://avatars.githubusercontent.com/u/1029659?s=280&v=4"
                alt="Cafe Bazaar"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">دانلود از کافه‌بازار</p>
              <p className="text-[#888] text-xs mt-0.5">
                نصب از طریق فروشگاه رسمی کافه‌بازار
              </p>
            </div>
            <Download className="w-5 h-5 text-green-400 shrink-0 group-hover:scale-110 transition-transform" />
          </a>

          {/* Direct APK */}
          <a
            href="/lingofam.apk"
            download
            className="group flex items-center gap-4 w-full p-4 rounded-2xl bg-gradient-to-l from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
            <div className="w-14 h-14 rounded-xl bg-black/15 flex items-center justify-center shrink-0">
              <Smartphone className="w-7 h-7 text-black" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-black font-bold text-sm">دانلود مستقیم APK</p>
              <p className="text-black/60 text-xs mt-0.5">
                فایل نصبی مستقیم از سایت لینگوفم
              </p>
            </div>
            <Download className="w-5 h-5 text-black shrink-0 group-hover:scale-110 transition-transform" />
          </a>
        </motion.div>

        {/* Footer note */}
        <motion.p
          variants={item}
          className="text-[#555] text-xs text-center leading-relaxed">
          نسخه اندروید ۵ به بالا پشتیبانی می‌شود
        </motion.p>
      </motion.div>
    </div>
  );
}
