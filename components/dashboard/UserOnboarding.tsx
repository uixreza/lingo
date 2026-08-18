"use client";
import { motion, type Variants } from "framer-motion";
import { useSyncExternalStore, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Cake, Wallet } from "lucide-react";

const sheetVariants: Variants = {
  hidden: { y: "100%" },
  show: { y: 0, transition: { type: "tween", duration: 0.3, ease: "easeOut" } },
};

const dialogVariants: Variants = {
  hidden: { scale: 0.9, opacity: 0, y: 10 },
  show: { scale: 1, opacity: 1, y: 0, transition: { duration: 0.2 } },
};

function useIsDesktop() {
  const subscribe = (onChange: () => void) => {
    const mql = window.matchMedia("(min-width: 640px)");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  };
  const getSnapshot = () => window.matchMedia("(min-width: 640px)").matches;
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export default function UserOnboarding() {
  const [submitting, setSubmitting] = useState(false);
  const { update: updateSession } = useSession();
  const router = useRouter();
  const isDesktop = useIsDesktop();

  const finish = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const seed = Math.random().toString(36).substring(2, 10);
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarSeed: seed }),
      });
      if (!res.ok) throw new Error("save failed");
      try {
        await updateSession({ user: { avatarSeed: seed } });
      } catch {
        // session refresh failure shouldn't block completion
      }
      router.push("/dashboard");
    } catch {
      alert("خطا در ذخیره اطلاعات. دوباره تلاش کنید.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center sm:p-4 bg-[#04070a]/85 backdrop-blur-md overflow-hidden">
      {/* Green glare of light */}
      <div className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full bg-[#22c55e]/15 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-[420px] h-[420px] rounded-full bg-[#16a34a]/10 blur-[120px] pointer-events-none" />

      <motion.div
        key={isDesktop ? "dialog" : "sheet"}
        variants={isDesktop ? dialogVariants : sheetVariants}
        initial="hidden"
        animate="show"
        className={`relative w-full sm:max-w-md bg-[#0d1412] border border-green-500/20 shadow-2xl shadow-green-500/10 ${
          isDesktop ? "rounded-2xl" : "rounded-t-3xl pb-9"
        }`}>
        <div className={`${isDesktop ? "hidden" : "flex justify-center pt-4"}`}>
          <span className="w-10 h-1.5 rounded-full bg-white/15" />
        </div>

        <div className="px-8 py-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
            className="w-20 h-20 rounded-2xl bg-green-500/15 flex items-center justify-center">
            <Cake className="w-10 h-10 text-green-400" />
          </motion.div>

          <h2 className="mt-5 text-2xl font-bold text-white flex items-center gap-2">
            <Cake className="w-6 h-6 text-green-400" />
            تبریک! به خانواده لینگوفم خوش آمدید
            <Cake className="w-6 h-6 text-green-400" />
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-[#aaa]">
            عضویت شما با موفقیت انجام شد. مبلغ{" "}
            <span className="font-bold text-green-400">۱۵۰٬۰۰۰ تومان</span> هدیه
            خوش‌آمدگویی به کیف پول شما شارژ شد.
          </p>

          <div className="mt-4 rounded-lg px-4 py-2.5 flex items-center gap-2 border border-green-500/20 bg-green-500/10">
            <Wallet className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">
              موجودی شما: ۱۵۰٬۰۰۰ تومان
            </span>
          </div>

          <button
            onClick={finish}
            disabled={submitting}
            className="mt-6 w-full flex items-center justify-center rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold py-3 text-sm transition-colors disabled:opacity-60">
            {submitting ? "در حال انتقال..." : "ورود به داشبورد"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}