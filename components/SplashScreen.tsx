"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: 5 + ((i * 37) % 90),
  top: 8 + ((i * 53) % 84),
  size: 2 + (i % 3),
  duration: 2.4 + (i % 5) * 0.7,
  delay: (i % 9) * 0.35,
  driftX: ((i % 7) - 3) * 12,
  driftY: ((i % 5) - 2) * 10,
}));

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const audio = new Audio("/assets/sounds/intro.mp3");
    audio.volume = 1;

    const tryPlay = () => {
      const p = audio.play();
      if (p?.catch) p.catch(() => {});
    };

    tryPlay();

    const onInteract = () => {
      tryPlay();
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("touchstart", onInteract);
      window.removeEventListener("click", onInteract);
    };

    window.addEventListener("pointerdown", onInteract);
    window.addEventListener("keydown", onInteract);
    window.addEventListener("touchstart", onInteract);
    window.addEventListener("click", onInteract);

    const t = setTimeout(() => {
      setVisible(false);
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("touchstart", onInteract);
      window.removeEventListener("click", onInteract);
    }, 3200);
    return () => {
      clearTimeout(t);
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("touchstart", onInteract);
      window.removeEventListener("click", onInteract);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[999] bg-[#04070a] overflow-hidden flex items-center justify-center">
          {/* Green glares of light (static) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-[#22c55e]/15 blur-[140px]" />
          <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-[#16a34a]/10 blur-[120px]" />
          <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-[#4ade80]/10 blur-[120px]" />

          {/* Particles flying around */}
          {PARTICLES.map((p) => (
            <motion.span
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1, 1, 0.5] }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute rounded-full bg-green-400"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: p.size,
                height: p.size,
                boxShadow: "0 0 8px rgba(74, 222, 128, 0.9)",
              }}
            />
          ))}

          {/* Center icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center gap-5">
            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-[#22c55e]/25 blur-2xl animate-splash-pulse" />
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-24 h-24 sm:w-28 sm:h-28">
                <Image
                  src="/assets/img/sideIcon.png"
                  alt="Lingofam"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Lingo<span className="text-green-400">Fam</span>
              </p>
              <p className="text-xs sm:text-sm text-[#7a7a7a] mt-1.5">
                زبان رو طبیعی یاد بگیر
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 rounded-full bg-green-400"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
