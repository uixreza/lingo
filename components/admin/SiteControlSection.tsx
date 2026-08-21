"use client";
import { useState, useEffect } from "react";
import { Power, RefreshCw, Loader2, ShieldAlert, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function SiteControlSection() {
  const [shutdown, setShutdown] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/site-status")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) {
          setShutdown(d.shutdown);
          setUpdating(d.updating);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = async (mode: "shutdown" | "updating") => {
    if (saving) return;
    setSaving(true);

    const newShutdown = mode === "shutdown" ? !shutdown : false;
    const newUpdating = mode === "updating" ? !updating : false;

    try {
      const res = await fetch("/api/admin/site-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shutdown: newShutdown, updating: newUpdating }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در بروزرسانی وضعیت");
        return;
      }
      const data = await res.json();
      setShutdown(data.shutdown);
      setUpdating(data.updating);
      if (data.shutdown) {
        toast.success("حالت تعطیل فعال شد — کاربران از داشبورد ریدایرکت می‌شوند");
      } else if (data.updating) {
        toast.success("حالت بروزرسانی فعال شد — کاربران به صفحه وضعیت هدایت می‌شوند");
      } else {
        toast.success("همه حالت‌ها غیرفعال شد — سایت عادی است");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl shadow-lg shadow-[var(--dash-muted)]/5 border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-[var(--hover-bg-strong)] animate-pulse" />
          <div className="h-5 w-32 rounded bg-[var(--hover-bg-strong)] animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-20 rounded-xl bg-[var(--hover-bg)] animate-pulse" />
          <div className="h-20 rounded-xl bg-[var(--hover-bg)] animate-pulse" />
        </div>
      </motion.div>
    );
  }

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
          <div className="p-2.5 rounded-xl bg-red-500/10">
            <Power className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--dash-text)" }}>
            کنترل کلی سایت
          </h2>
        </div>
        {(shutdown || updating) && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse">
            حالت فعال
          </span>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Shutdown Toggle */}
        <div
          className={`relative rounded-xl border p-4 transition-all duration-300 ${
            shutdown
              ? "bg-red-500/10 border-red-500/30"
              : "bg-[var(--dash-bg)]/60 border-[var(--dash-muted)]/10 hover:border-[var(--dash-muted)]/20"
          }`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`p-2 rounded-xl shrink-0 transition-colors duration-300 ${
                  shutdown ? "bg-red-500/20" : "bg-[var(--hover-bg)]"
                }`}>
                <ShieldAlert
                  className={`h-5 w-5 transition-colors duration-300 ${
                    shutdown
                      ? "text-red-500"
                      : "text-[var(--dash-muted)]"
                  }`}
                />
              </div>
              <div className="min-w-0">
                <p
                  className="text-sm font-bold"
                  style={{ color: "var(--dash-text)" }}>
                  حالت تعطیل
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--dash-muted)" }}>
                  دسترسی کاربران به داشبورد قطع می‌شود
                </p>
              </div>
            </div>
            <button
              onClick={() => toggle("shutdown")}
              disabled={saving}
              className={`relative shrink-0 w-12 h-7 rounded-full transition-all duration-300 ${
                shutdown
                  ? "bg-red-500 shadow-lg shadow-red-500/30"
                  : "bg-[var(--hover-bg-strong)]"
              } disabled:opacity-50`}>
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md ${
                  shutdown ? "right-1" : "right-6"
                }`}
              />
            </button>
          </div>
          {shutdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 pt-3 border-t border-red-500/20">
              <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                کاربران هنگام ورود به داشبورد به صفحه وضعیت هدایت می‌شوند
              </p>
            </motion.div>
          )}
        </div>

        {/* Updating Toggle */}
        <div
          className={`relative rounded-xl border p-4 transition-all duration-300 ${
            updating
              ? "bg-amber-500/10 border-amber-500/30"
              : "bg-[var(--dash-bg)]/60 border-[var(--dash-muted)]/10 hover:border-[var(--dash-muted)]/20"
          }`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`p-2 rounded-xl shrink-0 transition-colors duration-300 ${
                  updating ? "bg-amber-500/20" : "bg-[var(--hover-bg)]"
                }`}>
                <Wrench
                  className={`h-5 w-5 transition-colors duration-300 ${
                    updating
                      ? "text-amber-500"
                      : "text-[var(--dash-muted)]"
                  }`}
                />
              </div>
              <div className="min-w-0">
                <p
                  className="text-sm font-bold"
                  style={{ color: "var(--dash-text)" }}>
                  حالت بروزرسانی
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--dash-muted)" }}>
                  کاربران به صفحه «در حال بروزرسانی» هدایت می‌شوند
                </p>
              </div>
            </div>
            <button
              onClick={() => toggle("updating")}
              disabled={saving}
              className={`relative shrink-0 w-12 h-7 rounded-full transition-all duration-300 ${
                updating
                  ? "bg-amber-500 shadow-lg shadow-amber-500/30"
                  : "bg-[var(--hover-bg-strong)]"
              } disabled:opacity-50`}>
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md ${
                  updating ? "right-1" : "right-6"
                }`}
              />
            </button>
          </div>
          {updating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 pt-3 border-t border-amber-500/20">
              <p className="text-xs text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                کاربران به صفحه وضعیت ریدایرکت می‌شوند و پیام بروزرسانی را می‌بینند
              </p>
            </motion.div>
          )}
        </div>

        {saving && (
          <div className="flex items-center justify-center gap-2 py-2">
            <Loader2 className="h-4 w-4 text-[var(--dash-muted)] animate-spin" />
            <span className="text-xs text-[var(--dash-muted)]">
              در حال بروزرسانی...
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
