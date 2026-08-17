"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronsLeftRight } from "lucide-react";

interface HorizScrollbarProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

interface HandleState {
  left: number;
  visible: boolean;
}

export default function HorizScrollbar({ scrollRef, className = "" }: HorizScrollbarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerId: number; startX: number; startLeft: number } | null>(null);
  const [handle, setHandle] = useState<HandleState>({ left: 0, visible: false });

  const update = () => {
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setHandle((h) => (h.visible ? { ...h, visible: false } : h));
      return;
    }

    const maxLeft = track.clientWidth;
    const left = (el.scrollLeft / maxScroll) * maxLeft;

    setHandle((h) =>
      h.left === left && h.visible ? h : { left, visible: true },
    );
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    update();
    el.addEventListener("scroll", update);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollRef]);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track || !handle.visible) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startLeft: el.scrollLeft,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track || !drag.current || drag.current.pointerId !== e.pointerId) return;

    const dx = e.clientX - drag.current.startX;
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollLeft = drag.current.startLeft + (dx / track.clientWidth) * maxScroll;
  };

  const endDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (drag.current && drag.current.pointerId === e.pointerId) {
      drag.current = null;
    }
  };

  return (
    <div
      ref={trackRef}
      className={`pointer-events-none absolute bottom-0 right-0 hidden h-1.5 w-36 items-center rounded-full bg-[var(--dash-muted)]/20 lg:flex ${className}`}>
      <button
        type="button"
        aria-label="جابه‌جایی ماه‌ها با کشیدن"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`pointer-events-auto absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--dash-accent)] shadow-md ring-2 ring-[var(--dash-accent)]/30 transition-colors hover:bg-[var(--dash-accent)]/80 ${
          handle.visible ? "cursor-grab active:cursor-grabbing" : "opacity-0"
        }`}
        style={{ left: handle.left, touchAction: "none" }}>
        <ChevronsLeftRight className="absolute inset-0 m-auto h-3 w-3 text-[var(--dash-bg)]" strokeWidth={3} />
      </button>
    </div>
  );
}