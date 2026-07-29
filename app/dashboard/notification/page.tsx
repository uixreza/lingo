"use client";
import { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  Filter,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  MessageCircle,
  CheckCheck,
  Clock,
  Loader2,
} from "lucide-react";
import LoadingSpinner from "@/components/dashboard/LoadingSpinner";

type Notification = {
  id: string;
  type: "success" | "warning" | "info" | "achievement" | "message";
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const typeStyles: Record<
  Notification["type"],
  { border: string; text: string; bg: string; glow: string }
> = {
  success: {
    border: "border-r-green-500",
    text: "text-green-500",
    bg: "bg-green-500/10",
    glow: "shadow-green-500/20",
  },
  warning: {
    border: "border-r-red-500",
    text: "text-red-500",
    bg: "bg-red-500/10",
    glow: "shadow-red-500/20",
  },
  info: {
    border: "border-r-blue-500",
    text: "text-blue-500",
    bg: "bg-blue-500/10",
    glow: "shadow-blue-500/20",
  },
  achievement: {
    border: "border-r-purple-500",
    text: "text-purple-500",
    bg: "bg-purple-500/10",
    glow: "shadow-purple-500/20",
  },
  message: {
    border: "border-r-cyan-500",
    text: "text-cyan-500",
    bg: "bg-cyan-500/10",
    glow: "shadow-cyan-500/20",
  },
};

const typeIcons: Record<Notification["type"], typeof Bell> = {
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
  achievement: Star,
  message: MessageCircle,
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "چند لحظه پیش";
  if (minutes < 60) return `${minutes} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ساعت پیش`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} روز پیش`;
  const months = Math.floor(days / 30);
  return `${months} ماه پیش`;
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data: Notification[] = await res.json();
        setNotifications(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[var(--dash-sides)] rounded-2xl shadow-lg p-6 mb-6 border border-[var(--dash-muted)]/20 dark:border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-[var(--light-purple)] to-[var(--dark-purple)] hidden md:block rounded-xl shadow-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--dash-text)]">
                  اعلان‌ها
                </h1>
                <p className="text-[var(--dash-muted)] mt-1">
                  {unreadCount} اعلان خوانده نشده
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--light-purple)]/10 to-[var(--dark-purple)]/10 border border-[var(--light-purple)]/20 dark:border-white/30 rounded-xl text-[var(--dash-text)] hover:from-[var(--light-purple)]/20 hover:to-[var(--dark-purple)]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                <CheckCheck className="h-4 w-4" />
                <span className="text-sm font-medium">خواندن همه</span>
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl shadow-lg mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[var(--dash-muted)] max-sm:hidden" />
            <div className="flex flex-wrap gap-1 bg-[var(--dash-bg)] rounded-xl p-1 border border-[var(--dash-muted)]/20 dark:border-white/20">
              {[
                { key: "all", label: "همه", count: notifications.length },
                { key: "unread", label: "خوانده نشده", count: unreadCount },
                {
                  key: "read",
                  label: "خوانده شده",
                  count: notifications.length - unreadCount,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filter === tab.key
                      ? "bg-gradient-to-r from-[var(--light-purple)] to-[var(--dark-purple)] text-white shadow-lg"
                      : "text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                  }`}>
                  <span className="flex items-center gap-2">
                    {tab.label}
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        filter === tab.key
                          ? "bg-white/20"
                          : "bg-[var(--dash-muted)]/20"
                      }`}>
                      {tab.count}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-[var(--dash-sides)] rounded-2xl shadow-lg p-12 text-center border border-[var(--dash-muted)]/20 dark:border-white/20">
              <BellOff className="h-16 w-16 text-[var(--dash-muted)] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[var(--dash-text)] mb-2">
                هیچ اعلانی یافت نشد
              </h3>
              <p className="text-[var(--dash-muted)]">
                {filter === "all"
                  ? "هنوز هیچ اعلانی دریافت نکرده‌اید."
                  : `هیچ اعلان ${
                      filter === "unread" ? "خوانده نشده" : "خوانده شده"
                    }‌ای وجود ندارد.`}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const style = typeStyles[notification.type];
              const Icon = typeIcons[notification.type];
              return (
                <div
                  key={notification.id}
                  className={`bg-[var(--dash-sides)] rounded-2xl shadow-lg p-4 border border-[var(--dash-muted)]/20 dark:border-white/20 border-r-4 transition-all duration-200 hover:shadow-xl ${
                    style.border
                  } ${!notification.read ? `shadow-lg ${style.glow}` : ""}`}>
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <Icon className={`h-5 w-5 ${style.text}`} />
                            <h3
                              className={`font-semibold text-base ${style.text}`}>
                              {notification.title}
                            </h3>
                          </div>
                          <p className="text-[var(--dash-muted)] text-sm leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1 text-xs text-[var(--dash-muted)]">
                              <Clock className="h-3 w-3" />
                              <span>{relativeTime(notification.time)}</span>
                            </div>
                            {!notification.read && (
                              <span
                                className={`inline-block w-2 h-2 rounded-full ${style.text}`}></span>
                            )}
                          </div>
                        </div>

                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-green-600 hover:bg-green-500/10 rounded-xl transition-colors duration-200 shrink-0"
                            title="علامت به عنوان خوانده شده">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-gradient-to-r from-[var(--light-purple)]/10 to-[var(--dark-purple)]/10 border border-[var(--light-purple)]/20 dark:border-white/30 rounded-xl text-[var(--dash-text)] hover:from-[var(--light-purple)]/20 hover:to-[var(--dark-purple)]/20 transition-all duration-200 shadow-lg font-medium">
              بارگذاری اعلان‌های بیشتر
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
