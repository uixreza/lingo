"use client";

import { usePathname } from "next/navigation";
import { Play, Pause } from "lucide-react";
import { useRadio } from "@/components/RadioProvider";

export default function RadioButton() {
  const pathname = usePathname();
  const { playing, failed, toggle } = useRadio();

  if (pathname === "/dashboard") return null;

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "توقف رادیو" : "پخش رادیو"}
      title={playing ? "توقف رادیو" : "پخش رادیو"}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-[var(--dash-sides)]/90 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 px-3 py-2 transition-all duration-200 hover:scale-105 active:scale-95">
      <span className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center shadow-lg">
        {playing ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 mr-0.5" />
        )}
      </span>
      <span className="text-right">
        <span className="block text-xs font-bold text-[var(--dash-text)]">
          رادیو انگلیسی
        </span>
        <span className="block text-[11px] text-[var(--dash-muted)]">
          {failed
            ? "پخش در دسترس نیست"
            : playing
              ? "در حال پخش زنده..."
              : "ضربه بزنید تا پخش شود"}
        </span>
      </span>
    </button>
  );
}
