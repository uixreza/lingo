"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { ChevronDown, List } from "lucide-react";
import { toPersianDigits, type TocHeading } from "./utils";

const ACTIVE_OFFSET = 100;

export default function BlogToc({
  headings,
  collapsible = false,
}: {
  headings: TocHeading[];
  collapsible?: boolean;
}) {
  const [active, setActive] = useState(headings[0]?.id ?? "");
  const [open, setOpen] = useState(!collapsible);

  useEffect(() => {
    function updateActive() {
      let current = "";

      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= ACTIVE_OFFSET) {
          current = heading.id;
        } else {
          break;
        }
      }

      setActive(current || headings[0]?.id || "");
    }

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  function goTo(id: string) {
    if (collapsible && open) flushSync(() => setOpen(false));
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      aria-label="فهرست مطالب"
      className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <button
        type="button"
        onClick={() => collapsible && setOpen((o) => !o)}
        aria-expanded={collapsible ? open : undefined}
        className={`flex w-full items-center justify-between gap-2 px-4 py-3.5 text-sm font-bold text-white ${
          collapsible ? "cursor-pointer hover:bg-white/[0.02]" : "cursor-default"
        }`}>
        <span className="flex items-center gap-2">
          <List className="h-4 w-4 text-green-400" />
          فهرست مطالب
        </span>
        <span className="flex items-center gap-1.5 text-xs font-normal text-[#888]">
          {toPersianDigits(String(headings.length))} بخش
          {collapsible && (
            <ChevronDown
              className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          )}
        </span>
      </button>

      <ol
        className={`border-t border-white/5 py-1.5 ${open ? "block" : "hidden"}`}>
        {headings.map((heading, index) => {
          const isActive = active === heading.id;
          return (
            <li key={heading.id}>
              <button
                type="button"
                onClick={() => goTo(heading.id)}
                className={`flex w-full items-start gap-2.5 border-r-2 py-2 pl-3 pr-3 text-right text-[13px] leading-relaxed transition-colors ${
                  isActive
                    ? "border-green-400 bg-green-500/10 text-green-400"
                    : "border-transparent text-[#94A3B8] hover:text-white"
                }`}>
                <span
                  className={`mt-px w-5 shrink-0 text-center text-[11px] tabular-nums ${
                    isActive ? "text-green-400" : "text-[#666]"
                  }`}>
                  {toPersianDigits(String(index + 1))}
                </span>
                <span
                  className={`line-clamp-2 ${
                    heading.level === 3 ? "pr-4 text-[12px] opacity-90" : ""
                  }`}>
                  {heading.text}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
