"use client";

import { useSyncExternalStore, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Download, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLang } from "@/contexts/LanguageContext";

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

const DISMISS_KEY = "lingofam-install-dismissed";

function useIsDesktop() {
  const subscribe = (onChange: () => void) => {
    const mql = window.matchMedia("(min-width: 640px)");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  };
  const getSnapshot = () => window.matchMedia("(min-width: 640px)").matches;
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

function useStandalone() {
  const subscribe = (onChange: () => void) => {
    const mql = window.matchMedia("(display-mode: standalone)");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  };
  const getSnapshot = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export default function PWAInstallPrompt() {
  const [open, setOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const isStandalone = useStandalone();
  const router = useRouter();
  const shownRef = useRef(false);
  const { t } = useLang();

  useEffect(() => {
    if (isStandalone || isDesktop || shownRef.current) return;

    const timer = window.setTimeout(() => {
      if (!sessionStorage.getItem(DISMISS_KEY)) setOpen(true);
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [isStandalone, isDesktop]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  };

  const goToDownload = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
    router.push("/download");
  };

  return (
    <AnimatePresence>
      {open && !isStandalone && !isDesktop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
          className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            onClick={(e) => e.stopPropagation()}
            key="sheet"
            variants={sheetVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="bg-[#0d1412] border border-green-500/20 p-6 w-full sm:max-w-sm shadow-2xl shadow-green-500/10 rounded-t-3xl pb-9">
            <div className="flex justify-center mb-4">
              <span className="w-10 h-1.5 rounded-full bg-white/15" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 text-green-400" />
              </span>
              <h3 className="flex-1 min-w-0 text-white font-bold text-base">{t("pwa.title")}</h3>
              <button
                onClick={dismiss}
                className="me-auto p-1.5 rounded-lg text-[#aaa] hover:text-white hover:bg-white/10 transition-colors shrink-0">
                <X size={16} />
              </button>
            </div>
            <p className="text-[#aaa] text-sm leading-relaxed mb-6">
              {t("pwa.description")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={dismiss}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#aaa] hover:bg-white/10 hover:text-white text-sm font-medium transition-colors">
                {t("pwa.later")}
              </button>
              <button
                onClick={goToDownload}
                className="flex-1 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold text-sm text-center transition-colors">
                {t("pwa.download")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
