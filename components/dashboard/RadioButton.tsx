"use client";

import { usePathname } from "next/navigation";
import { Play, Pause, Radio } from "lucide-react";
import { useRadio } from "@/components/RadioProvider";

function EqualizerBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-green-400 transition-all ${
            active ? "animate-eq" : "h-[4px]"
          }`}
          style={{
            animationDelay: active ? `${i * 0.15}s` : undefined,
            height: active ? undefined : "4px",
          }}
        />
      ))}
    </div>
  );
}

export default function RadioButton() {
  const pathname = usePathname();
  const { playing, failed, toggle } = useRadio();

  if (pathname === "/dashboard") return null;

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "توقف رادیو" : "پخش رادیو"}
      title={playing ? "توقف رادیو" : "پخش رادیو"}
      className={`fixed bottom-5 right-5 z-50 group flex items-center gap-2.5  pl-4 pr-2 py-1 rounded-full transition-all duration-300 hover:scale-[1.03] active:scale-95
        bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/15 dark:border-white/10
        shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        ${playing ? "ring-1 ring-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.15)]" : ""}`}>
      <span
        className={`relative w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all duration-300
          ${
            playing
              ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-[0_0_16px_rgba(34,197,94,0.4)]"
              : "bg-white/10 dark:bg-white/8 text-green-500 group-hover:bg-white/15 dark:group-hover:bg-white/12"
          }`}>
        {playing ? (
          <Pause className="w-3.5 h-3.5" />
        ) : (
          <Play className="w-3.5 h-3.5 mr-[-1px]" />
        )}
        {playing && (
          <span className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
        )}
      </span>

      <span className="flex flex-col items-end gap-0.5">
        <span className="flex items-center gap-1.5">
          <EqualizerBars active={playing} />
          <span className="text-[11px] font-bold text-[var(--dash-text)] leading-none">
            رادیو انگلیسی
          </span>
        </span>
        <span className="text-[10px] text-[var(--dash-muted)] leading-none">
          {failed
            ? "پخش در دسترس نیست"
            : playing
              ? "در حال پخش زنده"
              : "برای پخش لمس کنید"}
        </span>
      </span>
    </button>
  );
}
