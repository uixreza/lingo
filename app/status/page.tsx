"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HelpCircle, Wrench, Loader2, RotateCcw } from "lucide-react";

export default function StatusPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"shutdown" | "updating" | null>(null);
  const [checking, setChecking] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/site-status");
      if (res.ok) {
        const data = await res.json();
        if (data.shutdown) {
          setStatus("shutdown");
        } else if (data.updating) {
          setStatus("updating");
        } else {
          setStatus(null);
          router.push("/dashboard");
        }
      }
    } catch {
      // keep showing current status
    } finally {
      setChecking(false);
    }
  }, [router]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (checking) {
    return (
      <div className="min-h-[100dvh] bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-[100dvh] bg-[#050505] flex items-end lg:items-center justify-center lg:px-4"
      style={{ fontFamily: "'Morabba', 'Dana', sans-serif" }}>
      {/* Background blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-200px] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#22c55e]/5 blur-[150px]" />
        <div className="absolute bottom-[-200px] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[150px]" />
      </div>

      {/* Mobile: Bottom Sheet — Desktop: Centered Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md lg:mb-0">
        {/* Mobile sheet handle */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        <div className="rounded-t-3xl lg:rounded-3xl border border-white/10 bg-[#0a0f0a]/95 lg:bg-[#0a0f0a]/80 backdrop-blur-xl shadow-2xl p-8 pb-10 lg:pb-8 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${
              status === "shutdown"
                ? "bg-red-500/15 ring-1 ring-red-500/30"
                : "bg-amber-500/15 ring-1 ring-amber-500/30"
            }`}>
            {status === "shutdown" ? (
              <HelpCircle className="h-10 w-10 text-red-400" />
            ) : (
              <Wrench className="h-10 w-10 text-amber-400" />
            )}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-extrabold text-white mb-3">
            {status === "shutdown"
              ? "سایت در حال حاضر تعطیل است"
              : "در حال بروزرسانی"}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-[#888] leading-relaxed mb-8">
            {status === "shutdown"
              ? "این سرویس به‌طور موقت غیرفعال است. لطفاً بعداً دوباره تلاش کنید."
              : "ما در حال بروزرسانی اپلیکیشن هستیم تا تجربه بهتری برای شما فراهم کنیم. لطفاً صبور باشید."}
          </motion.p>

          {/* Status indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6 ${
              status === "shutdown"
                ? "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
                : "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"
            }`}>
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                status === "shutdown" ? "bg-red-500" : "bg-amber-500"
              }`}
            />
            {status === "shutdown" ? "غیرفعال" : "بروزرسانی در حال انجام"}
          </motion.div>

          {/* Try Again Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}>
            <button
              onClick={() => router.push("/")}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-black transition-all duration-300 bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 active:scale-[0.98]">
              <RotateCcw className="h-4 w-4" />
              تلاش مجدد
            </button>
          </motion.div>

          {/* Auto-refresh notice */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-[11px] text-[#555] mt-5">
            این صفحه هر ۱۰ ثانیه به‌صورت خودکار بررسی می‌شود
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
