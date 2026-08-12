"use client";
import { useState, useEffect } from "react";
import { Megaphone, Plus, Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

type MarqueeItem = {
  id: number;
  text: string;
  isActive: boolean;
};

function toFa(value: number | string) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
}

export default function MarqueeSection() {
  const [marquee, setMarquee] = useState<MarqueeItem[]>([]);
  const [marqueeText, setMarqueeText] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleteMarqueeId, setDeleteMarqueeId] = useState<number | null>(null);
  const [deletingMarquee, setDeletingMarquee] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/management/marquee")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setMarquee(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const addMarquee = async () => {
    const text = marqueeText.trim();
    if (!text || adding) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/management/marquee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در افزودن اطلاعیه");
        return;
      }
      setMarqueeText("");
      const marqueeRes = await fetch("/api/admin/management/marquee");
      if (marqueeRes.ok) setMarquee(await marqueeRes.json());
      toast.success("اطلاعیه با موفقیت افزوده شد");
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setAdding(false);
    }
  };

  const deleteMarquee = async (id: number) => {
    if (deletingMarquee) return;
    setDeletingMarquee(true);
    try {
      const res = await fetch("/api/admin/management/marquee", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در حذف اطلاعیه");
        return;
      }
      setMarquee((prev) => prev.filter((m) => m.id !== id));
      toast.success("اطلاعیه حذف شد");
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setDeletingMarquee(false);
      setDeleteMarqueeId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl shadow-lg shadow-[var(--dash-muted)]/5 border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl">
      <div
        className="flex items-center justify-between p-6"
        style={{ borderBottom: "1px solid var(--dash-muted)/10" }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10">
            <Megaphone className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--dash-text)" }}>
            اطلاعیه‌های متحرک
          </h2>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
          {toFa(marquee.length)} مورد
        </span>
      </div>

      <div className="p-6">
        <div className="flex gap-2 mb-5">
          <input
            type="text"
            value={marqueeText}
            onChange={(e) => setMarqueeText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addMarquee();
            }}
            placeholder="متن اطلاعیه جدید..."
            className="flex-1 min-w-0 bg-[var(--dash-bg)]/70 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm outline-none border border-[var(--dash-muted)]/15 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] transition-all placeholder:text-[var(--dash-muted)]/60"
          />
          <motion.button
            whileTap={marqueeText.trim() && !adding ? { scale: 0.97 } : {}}
            onClick={addMarquee}
            disabled={!marqueeText.trim() || adding}
            className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            افزودن
          </motion.button>
        </div>

        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {marquee.length === 0 ? (
              <div className="text-center py-10">
                <Megaphone className="h-10 w-10 mx-auto text-[var(--dash-muted)]/40 mb-3" />
                <p className="text-sm text-[var(--dash-muted)]">
                  هنوز اطلاعیه‌ای افزوده نشده است
                </p>
              </div>
            ) : (
              marquee.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  className="rounded-xl bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="shrink-0 w-6 h-6 mt-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold flex items-center justify-center">
                        {toFa(i + 1)}
                      </span>
                      <p className="text-sm text-[var(--dash-text)] leading-relaxed min-w-0 break-words">
                        {item.text}
                      </p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setDeleteMarqueeId(
                          deleteMarqueeId === item.id ? null : item.id,
                        )
                      }
                      className="shrink-0 p-2 rounded-lg text-[var(--dash-muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors duration-200"
                      title="حذف">
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {deleteMarqueeId === item.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden">
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                          <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-2">
                            آیا از حذف این اطلاعیه مطمئن هستید؟
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => deleteMarquee(item.id)}
                              disabled={deletingMarquee}
                              className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50">
                              {deletingMarquee ? "در حال حذف..." : "بله، حذف شود"}
                            </button>
                            <button
                              onClick={() => setDeleteMarqueeId(null)}
                              className="px-3 py-1.5 bg-[var(--dash-muted)]/20 text-[var(--dash-text)] text-sm rounded-lg hover:bg-[var(--dash-muted)]/30 transition-colors duration-200">
                              انصراف
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}