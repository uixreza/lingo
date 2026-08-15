"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { House, LayoutDashboard, LifeBuoy, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const bannedMsg =
  "حساب شما مسدود شده است؛ برای اطلاعات بیشتر با تیم پشتیبانی تماس بگیرید";

const sheetVariants: Variants = {
  hidden: { y: "100%" },
  show: { y: 0, transition: { type: "tween", duration: 0.3, ease: "easeOut" } },
  exit: { y: "100%", transition: { type: "tween", duration: 0.25, ease: "easeIn" } },
};

const dialogVariants: Variants = {
  hidden: { scale: 0.9, opacity: 0, y: 10 },
  show: { scale: 1, opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { scale: 0.9, opacity: 0, y: 10, transition: { duration: 0.15 } },
};

const links = [
  { label: "خانه", icon: House, route: "/" },
  { label: "لینگوبلاگ", icon: LayoutDashboard, route: "/blog" },
  { label: "پشتیبانی", icon: LifeBuoy, route: "https://t.me/lingofam_support" },
];

const container = {
  hidden: { y: 40, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const item = {
  hidden: { y: 12, opacity: 0 },
  show: { y: 0, opacity: 1 },
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

export default function Navbar() {
  const { open } = useAuth();
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showSupportPrompt, setShowSupportPrompt] = useState(false);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (window.location.search.includes("banned=1")) {
      toast.error(bannedMsg);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const isActive = (route: string) =>
    route.startsWith("http")
      ? false
      : route === "/"
        ? pathname === "/"
        : pathname.startsWith(route);

  return (
    <>
      <motion.nav
        variants={container}
        initial="hidden"
        animate="show"
        className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/5 shadow-lg shadow-black/20 max-w-[95vw] sm:max-w-none">
        {links.map(({ label, icon: Icon, route }) => {
        const active = isActive(route);
        if (route.startsWith("http")) {
          return (
            <motion.button
              key={label}
              variants={item}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSupportPrompt(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-sm font-medium text-[#a0a0a0] hover:text-white hover:bg-white/10 transition-colors duration-200">
              <Icon size={16} className="text-[#a0a0a0]" />
              <span>{label}</span>
            </motion.button>
          );
        }
        return (
          <Link key={label} href={route}>
            <motion.button
              variants={item}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-sm font-medium transition-colors duration-200 ${
                active
                  ? "text-green-400 bg-green-500/10"
                  : "text-[#a0a0a0] hover:text-white hover:bg-white/10"
              }`}>
              <Icon
                size={16}
                className={active ? "text-green-400" : "text-[#a0a0a0]"}
              />
              <span>{label}</span>
            </motion.button>
          </Link>
        );
      })}

        <motion.div
          variants={item}
          className="w-px h-5 sm:h-6 bg-white/10 mx-0.5 sm:mx-1"
        />

        {session?.user ? (
          <Link href="/dashboard">
            <motion.button
              variants={item}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl bg-green-500 text-black font-semibold text-xs sm:text-sm hover:bg-green-400">
              <User size={16} />
              داشبورد
            </motion.button>
          </Link>
        ) : (
          <motion.button
            variants={item}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={open}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl bg-green-500 text-black font-semibold text-xs sm:text-sm hover:bg-green-400">
            <User size={16} />
            ورود
          </motion.button>
        )}
      </motion.nav>

      <AnimatePresence>
        {showSupportPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSupportPrompt(false)}
            className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
            <motion.div
              onClick={(e) => e.stopPropagation()}
              key={isDesktop ? "dialog" : "sheet"}
              variants={isDesktop ? dialogVariants : sheetVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className={`bg-[#0d1412] border border-green-500/20 p-6 w-full sm:max-w-sm shadow-2xl shadow-green-500/10 ${
                isDesktop ? "rounded-2xl" : "rounded-t-3xl pb-9"
              }`}>
              <div className={`${isDesktop ? "hidden" : "flex justify-center mb-4"}`}>
                <span className="w-10 h-1.5 rounded-full bg-white/15" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
                  <LifeBuoy className="w-5 h-5 text-green-400" />
                </span>
                <h3 className="text-white font-bold text-base">
                  پشتیبانی لینگوفام
                </h3>
              </div>
              <p className="text-[#aaa] text-sm leading-relaxed mb-6">
                شما به گفتگوی پشتیبانی تلگرام منتقل خواهید شد.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSupportPrompt(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#aaa] hover:bg-white/10 hover:text-white text-sm font-medium transition-colors">
                  بیخیال
                </button>
                <a
                  href="https://t.me/lingofam_support"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowSupportPrompt(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold text-sm text-center transition-colors">
                  ادامه
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
