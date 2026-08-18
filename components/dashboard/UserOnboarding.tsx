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
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center sm:p-4 bg-[var(--dash-bg)]/80 backdrop-blur-md">
      <motion.div
        key={isDesktop ? "dialog" : "sheet"}
        variants={isDesktop ? dialogVariants : sheetVariants}
        initial="hidden"
        animate="show"
        className={`w-full sm:max-w-md bg-[var(--dash-sides)] border shadow-xl ${
          isDesktop
            ? "rounded-2xl border-[var(--dash-muted)]"
            : "rounded-t-3xl pb-9 border-t border-x border-[var(--dash-muted)]"
        }`}>
        <div className={`${isDesktop ? "hidden" : "flex justify-center pt-4"}`}>
          <span className="w-10 h-1.5 rounded-full bg-[var(--dash-muted)]" />
        </div>

        <div className="px-8 py-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--dash-accent)/15" }}>
            <Cake className="w-10 h-10" style={{ color: "var(--dash-accent)" }} />
          </motion.div>

          <h2
            className="mt-5 text-2xl font-bold flex items-center gap-2"
            style={{ color: "var(--dash-text)" }}>
            <Cake className="w-6 h-6" style={{ color: "var(--dash-accent)" }} />
            تبریک! به خانواده لینگوفم خوش آمدید
            <Cake className="w-6 h-6" style={{ color: "var(--dash-accent)" }} />
          </h2>

          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--dash-muted)" }}>
            عضویت شما با موفقیت انجام شد. مبلغ{" "}
            <span className="font-bold" style={{ color: "var(--dash-accent)" }}>
              ۱۵۰٬۰۰۰ تومان
            </span>{" "}
            هدیه خوش‌آمدگویی به کیف پول شما شارژ شد.
          </p>

          <div
            className="mt-4 rounded-lg px-4 py-2.5 flex items-center gap-2 border"
            style={{
              backgroundColor: "var(--dash-accent)/10",
              borderColor: "var(--dash-accent)/30",
            }}>
            <Wallet className="w-4 h-4" style={{ color: "var(--dash-accent)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--dash-accent)" }}>
              موجودی شما: ۱۵۰٬۰۰۰ تومان
            </span>
          </div>

          <button
            onClick={finish}
            disabled={submitting}
            className="mt-6 w-full flex items-center justify-center rounded-full py-3 font-semibold text-white transition hover:opacity-90 active:opacity-100 disabled:opacity-60"
            style={{ backgroundColor: "var(--dash-accent)" }}>
            {submitting ? "در حال انتقال..." : "ورود به داشبورد"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}