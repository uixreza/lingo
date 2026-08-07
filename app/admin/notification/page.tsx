"use client";
import { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  MessageCircle,
  LifeBuoy,
  Trash2,
  CheckCheck,
  Clock,
  Loader2,
  Send,
  Plus,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageSkeleton } from "@/components/dashboard/Skeletons";
import toast from "react-hot-toast";

type Notification = {
  id: string;
  type:
    | "success"
    | "warning"
    | "info"
    | "achievement"
    | "message"
    | "ticket";
  title: string;
  message: string;
  time: string;
  read: boolean;
};

type UserOption = {
  id: number;
  fullname: string;
  email: string | null;
};

const TYPE_STYLES = {
  info: {
    icon: Info,
    label: "اطلاع‌رسانی",
    tile: "bg-blue-500/10 text-blue-500",
    pill: "text-blue-600 dark:text-blue-400",
  },
  success: {
    icon: CheckCircle,
    label: "موفقیت",
    tile: "bg-green-500/10 text-green-500",
    pill: "text-green-600 dark:text-green-400",
  },
  warning: {
    icon: AlertCircle,
    label: "هشدار",
    tile: "bg-yellow-500/10 text-yellow-500",
    pill: "text-yellow-600 dark:text-yellow-400",
  },
  achievement: {
    icon: Star,
    label: "دستاورد",
    tile: "bg-purple-500/10 text-purple-500",
    pill: "text-purple-600 dark:text-purple-400",
  },
  message: {
    icon: MessageCircle,
    label: "پیام",
    tile: "bg-cyan-500/10 text-cyan-500",
    pill: "text-cyan-600 dark:text-cyan-400",
  },
  ticket: {
    icon: LifeBuoy,
    label: "تیکت",
    tile: "bg-orange-500/10 text-orange-500",
    pill: "text-orange-600 dark:text-orange-400",
  },
} as const;

function toFa(value: number | string) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "چند لحظه پیش";
  if (minutes < 60) return `${toFa(minutes)} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${toFa(hours)} ساعت پیش`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${toFa(days)} روز پیش`;
  const months = Math.floor(days / 30);
  return `${toFa(months)} ماه پیش`;
}

function TypeIcon({ type }: { type: Notification["type"] }) {
  const cfg = TYPE_STYLES[type] ?? TYPE_STYLES.info;
  const Icon = cfg.icon;  return (
    <div className={`shrink-0 p-2.5 rounded-xl ${cfg.tile}`}>
      <Icon className="h-5 w-5" />
    </div>
  );
}

const inputClass =
  "w-full bg-[var(--dash-bg)]/70 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm outline-none border border-[var(--dash-muted)]/15 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] transition-all placeholder:text-[var(--dash-muted)]/60";
const labelClass =
  "block text-sm font-medium text-[var(--dash-muted)] mb-2";

const cardClass =
  "relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg";
const accentBar =
  "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent";

const listVariants = {
  initial: { opacity: 0, y: 12 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.3 },
  }),
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState("all");
  const [notifType, setNotifType] = useState<Notification["type"]>("info");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok && !cancelled) {
          const data: Notification[] = await res.json();
          setNotifications(data);
        }
      } catch {
        // ignore
      }
      try {
        const res = await fetch("/api/admin/notifications");
        if (res.ok && !cancelled) {
          const data: UserOption[] = await res.json();
          setUsers(data);
        }
      } catch {
        // ignore
      }
      if (!cancelled) setLoading(false);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data: Notification[] = await res.json();
        setNotifications(data);
      }
    } catch {
      // ignore
    }
  };

  const handleSend = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser,
          type: notifType,
          title: notifTitle.trim(),
          message: notifMessage.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "خطای ناشناخته" }));
        toast.error(err.error || "خطا در ارسال اعلان");
        return;
      }
      setNotifTitle("");
      setNotifMessage("");
      setNotifType("info");
      setSelectedUser("all");
      setShowForm(false);
      await fetchNotifications();
      toast.success("اعلان با موفقیت ارسال شد");
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSending(false);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.length - unreadCount;

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      toast.error("خطا در بروزرسانی اعلان");
    }
    setConfirmId(null);
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("همه اعلان‌ها خوانده شد");
    } catch {
      toast.error("خطا در خواندن همه اعلان‌ها");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      toast.error("خطا در حذف اعلان");
    }
    setConfirmId(null);
  };

  const clearAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearRead: true }),
      });
      setNotifications((prev) => prev.filter((n) => !n.read));
      toast.success("اعلان‌های خوانده‌شده پاک شدند");
    } catch {
      toast.error("خطا در پاک کردن اعلان‌ها");
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`${cardClass} p-6`}>
          <div className={accentBar} />
          <div className="pointer-events-none absolute -top-24 -left-10 h-48 w-48 rounded-full bg-[var(--dash-accent)]/15 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-green-500/10">
                <Bell className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--dash-text)]">
                  اعلان‌ها
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    {toFa(unreadCount)} اعلان خوانده نشده
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowForm((v) => !v)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-black transition-all duration-300 bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
                {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {showForm ? "بستن فرم" : "جدید"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--dash-text)] border border-[var(--dash-muted)]/20 dark:border-white/25 bg-[var(--dash-bg)]/40 hover:bg-[var(--dash-bg)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                <CheckCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                خواندن همه
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={clearAllRead}
                disabled={readCount === 0}
                title="پاک کردن خوانده‌ها"
                className="p-2.5 rounded-xl text-red-600 dark:text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* Send form */}
        <AnimatePresence>
          {showForm && (
            <motion.section
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden">
              <div className={`${cardClass} p-6 border-green-500/30`}>
                <div className={accentBar} />
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-2.5 rounded-xl bg-green-500/10">
                    <Send className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-lg font-bold text-[var(--dash-text)]">
                    ارسال اعلان جدید
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>دریافت‌کننده</label>
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className={`${inputClass} cursor-pointer appearance-none`}>
                      <option value="all">همه کاربران</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullname} ({u.email ?? "---"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>نوع اعلان</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.keys(TYPE_STYLES) as Notification["type"][]).map(
                        (key) => {
                          const cfg = TYPE_STYLES[key];
                          const Icon = cfg.icon;
                          const active = notifType === key;
                          return (
                            <motion.button
                              key={key}
                              type="button"
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setNotifType(key)}
                              className={`relative flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                                active
                                  ? "border-green-500/60 bg-green-500/10 text-[var(--dash-text)] shadow-lg shadow-green-500/5"
                                  : "border-transparent bg-[var(--dash-bg)]/50 text-[var(--dash-muted)] hover:bg-[var(--dash-bg)] hover:border-[var(--dash-muted)]/30"
                              }`}>
                              {active && (
                                <motion.span
                                  layoutId="notif-type-pill"
                                  className="absolute inset-0 rounded-xl bg-green-500/10"
                                />
                              )}
                              <Icon
                                className={`h-4 w-4 relative z-10 ${cfg.pill}`}
                              />
                              <span className="relative z-10">{cfg.label}</span>
                            </motion.button>
                          );
                        },
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>عنوان</label>
                    <input
                      type="text"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      placeholder="عنوان اعلان..."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>متن پیام</label>
                    <textarea
                      value={notifMessage}
                      onChange={(e) => setNotifMessage(e.target.value)}
                      placeholder="متن اعلان..."
                      rows={4}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <motion.button
                    whileTap={sending ? {} : { scale: 0.98 }}
                    onClick={handleSend}
                    disabled={sending || !notifTitle.trim() || !notifMessage.trim()}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
                    {sending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                    {sending ? "در حال ارسال..." : "ارسال اعلان"}
                  </motion.button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Filter tabs */}
        <div className="w-full flex justify-center sm:w-auto sm:justify-start">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full sm:w-auto inline-flex p-1.5 rounded-2xl bg-[var(--dash-sides)]/80 backdrop-blur-xl border border-[var(--dash-muted)]/15 dark:border-white/20 shadow-lg">
            {[
              { key: "all" as const, label: "همه", count: notifications.length },
              { key: "unread" as const, label: "خوانده نشده", count: unreadCount },
              { key: "read" as const, label: "خوانده شده", count: readCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`relative z-10 flex-1 sm:flex-none inline-flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-6 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                  filter === tab.key
                    ? "text-black"
                    : "text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                }`}>
                {filter === tab.key && (
                  <motion.span
                    layoutId="notif-filter-pill"
                    className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                <span
                  className={`relative z-10 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                    filter === tab.key
                      ? "bg-black/15"
                      : "bg-[var(--dash-muted)]/20 text-[var(--dash-muted)]"
                  }`}>
                  {toFa(tab.count)}
                </span>
              </button>
            ))}
          </motion.div>
        </div>

        {/* Notification list */}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filteredNotifications.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${cardClass} p-12 text-center`}>
                <BellOff className="h-14 w-14 text-[var(--dash-muted)] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[var(--dash-text)] mb-2">
                  هیچ اعلانی یافت نشد
                </h3>
                <p className="text-[var(--dash-muted)] text-sm">
                  {filter === "all"
                    ? "هنوز هیچ اعلانی دریافت نکرده‌اید."
                    : `هیچ اعلان ${
                        filter === "unread" ? "خوانده نشده" : "خوانده شده"
                      }‌ای وجود ندارد.`}
                </p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification, i) => (
                <motion.div
                  key={notification.id}
                  layout
                  variants={listVariants}
                  custom={i}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
                  className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 ${
                    !notification.read
                      ? "border-green-500/30 bg-[var(--dash-sides)]/90 shadow-lg shadow-green-500/5"
                      : "border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/70 hover:border-[var(--dash-muted)]/30"
                  }`}>
                  <div className="flex gap-3.5">
                    <TypeIcon type={notification.type} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-bold truncate ${
                                notification.read
                                  ? "text-[var(--dash-text)]/70"
                                  : "text-[var(--dash-text)]"
                              }`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600 dark:text-green-400">
                                جدید
                              </span>
                            )}
                          </div>
                          <p className="text-[var(--dash-muted)] mt-1 text-sm leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2.5 text-xs text-[var(--dash-muted)]">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{relativeTime(notification.time)}</span>
                            <span className="inline-flex items-center gap-1.5 font-medium px-2 py-0.5 rounded-full bg-[var(--dash-muted)]/10">
                              {(TYPE_STYLES[notification.type] ?? TYPE_STYLES.info).label}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {!notification.read && (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors duration-200"
                              title="خوانده شد">
                              <CheckCheck className="h-4 w-4" />
                            </motion.button>
                          )}
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              setConfirmId(
                                confirmId === notification.id
                                  ? null
                                  : notification.id,
                              )
                            }
                            className="p-2 rounded-lg text-[var(--dash-muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors duration-200"
                            title="حذف">
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {confirmId === notification.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden">
                            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                              <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-2">
                                آیا از حذف این اعلان مطمئن هستید؟
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors duration-200">
                                  بله، حذف شود
                                </button>
                                <button
                                  onClick={() => setConfirmId(null)}
                                  className="px-3 py-1.5 bg-[var(--dash-muted)]/20 text-[var(--dash-text)] text-sm rounded-lg hover:bg-[var(--dash-muted)]/30 transition-colors duration-200">
                                  انصراف
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}