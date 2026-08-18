"use client";

import { useSyncExternalStore, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Download, Share, Plus, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

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

function useIsIOS() {
  const subscribe = () => () => {};
  const getSnapshot = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as Window & { MSStream?: unknown }).MSStream;
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export default function PWAInstallPrompt() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const wantInstall = useRef(false);
  const [open, setOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const isIOS = useIsIOS();
  const isStandalone = useStandalone();

  const promptNow = async () => {
    const prompt = deferredPrompt.current;
    if (!prompt) return;
    deferredPrompt.current = null;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") {
      sessionStorage.setItem(DISMISS_KEY, "1");
      setOpen(false);
    }
  };

  useEffect(() => {
    if (isStandalone || isDesktop) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      if (!sessionStorage.getItem(DISMISS_KEY)) setOpen(true);
      if (wantInstall.current) {
        wantInstall.current = false;
        void promptNow();
      }
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const onInstalled = () => {
      sessionStorage.setItem(DISMISS_KEY, "1");
      setOpen(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    const timer = window.setTimeout(() => {
      if (!sessionStorage.getItem(DISMISS_KEY)) setOpen(true);
    }, 8000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearTimeout(timer);
    };
  }, [isStandalone, isDesktop]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  };

  const install = () => {
    if (deferredPrompt.current) {
      void promptNow();
    } else {
      wantInstall.current = true;
    }
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
                <Download className="w-5 h-5 text-green-400" />
              </span>
              <h3 className="text-white font-bold text-base">نصب اپلیکیشن لینگوفم</h3>
              <button
                onClick={dismiss}
                className="mr-auto p-1.5 rounded-lg text-[#aaa] hover:text-white hover:bg-white/10 transition-colors">
                <X size={16} />
              </button>
            </div>
            <p className="text-[#aaa] text-sm leading-relaxed mb-6">
              {isIOS ? (
                <>
                  برای نصب اپلیکیشن روی گوشی، دکمه{" "}
                  <span className="inline-flex items-center gap-1 text-white">
                    <Share size={14} /> اشتراک‌گذاری
                  </span>{" "}
                  را بزنید و گزینه{" "}
                  <span className="inline-flex items-center gap-1 text-white">
                    <Plus size={14} /> افزودن به صفحه اصلی
                  </span>{" "}
                  را انتخاب کنید.
                </>
              ) : (
                "با نصب لینگوفم، دسترسی سریع‌تر و تجربه‌ای مثل اپلیکیشن‌های موبایل خواهید داشت."
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={dismiss}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#aaa] hover:bg-white/10 hover:text-white text-sm font-medium transition-colors">
                بعداً
              </button>
              {!isIOS && (
                <button
                  onClick={install}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold text-sm text-center transition-colors">
                  نصب
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}