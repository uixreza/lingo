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
  Trash2,
  CheckCheck,
  Clock,
  Loader2,
  Send,
  Plus,
  X,
} from "lucide-react";
import { PageSkeleton } from "@/components/dashboard/Skeletons";

type Notification = {
  id: string;
  type: "success" | "warning" | "info" | "achievement" | "message";
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

const types = [
  { value: "info", label: "اطلاع‌رسانی", color: "text-blue-500" },
  { value: "success", label: "موفقیت", color: "text-green-500" },
  { value: "warning", label: "هشدار", color: "text-yellow-500" },
  { value: "achievement", label: "دستاورد", color: "text-purple-500" },
  { value: "message", label: "پیام", color: "text-cyan-500" },
];

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
  const [showActions, setShowActions] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState("all");
  const [notifType, setNotifType] = useState("info");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [sending, setSending] = useState(false);

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

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data: UserOption[] = await res.json();
        setUsers(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

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
        alert(err.error || "خطا در ارسال اعلان");
        return;
      }
      setNotifTitle("");
      setNotifMessage("");
      setNotifType("info");
      setSelectedUser("all");
      setShowForm(false);
      fetchNotifications();
    } catch {
      alert("خطا در ارتباط با سرور");
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

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setShowActions(null);
  };

  const markAllAsRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = async (id: string) => {
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications(notifications.filter((n) => n.id !== id));
    setShowActions(null);
  };

  const clearAllRead = async () => {
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearRead: true }),
    });
    setNotifications(notifications.filter((n) => !n.read));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "achievement":
        return <Star className="h-5 w-5 text-purple-500" />;
      case "message":
        return <MessageCircle className="h-5 w-5 text-cyan-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[var(--dash-sides)] rounded-2xl shadow-lg p-6 mb-6 border border-[var(--dash-muted)]/20 dark:border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 ">
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
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all duration-200 shadow-lg">
                {showForm ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">اعلان جدید</span>
              </button>
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--light-purple)]/10 to-[var(--dark-purple)]/10 border border-[var(--light-purple)]/20 dark:border-white/30 rounded-xl text-[var(--dash-text)] hover:from-[var(--light-purple)]/20 hover:to-[var(--dark-purple)]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                <CheckCheck className="h-4 w-4" />
                <span className="text-sm font-medium">خواندن همه</span>
              </button>
              <button
                onClick={clearAllRead}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 dark:border-white/30 rounded-xl text-red-600 dark:text-red-400 hover:from-red-500/20 hover:to-red-600/20 transition-all duration-200 shadow-lg">
                <Trash2 className="h-4 w-4" />
                <span className="text-sm font-medium">پاک کردن خوانده‌ها</span>
              </button>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="bg-[var(--dash-sides)] rounded-2xl shadow-lg p-6 mb-6 border border-green-500/20">
            <h2 className="text-lg font-bold text-[var(--dash-text)] mb-5 flex items-center gap-2">
              <Send className="h-5 w-5 text-green-500" />
              ارسال اعلان جدید
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                  دریافت‌کننده
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full bg-[var(--dash-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm border border-[var(--dash-muted)]/20 focus:outline-none focus:ring-2 focus:ring-green-500/50">
                  <option value="all">همه کاربران</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullname} ({u.email ?? "---"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                  نوع اعلان
                </label>
                <div className="flex flex-wrap gap-2">
                  {types.map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => setNotifType(value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                        notifType === value
                          ? "border-green-500 bg-green-500/10 text-green-400"
                          : "border-[var(--dash-muted)]/20 text-[var(--dash-muted)] hover:border-green-500/30"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                  عنوان
                </label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="عنوان اعلان..."
                  className="w-full bg-[var(--dash-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm border border-[var(--dash-muted)]/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                  متن پیام
                </label>
                <textarea
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="متن اعلان..."
                  rows={4}
                  className="w-full bg-[var(--dash-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm border border-[var(--dash-muted)]/20 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
                />
              </div>

              <button
                onClick={handleSend}
                disabled={sending || !notifTitle.trim() || !notifMessage.trim()}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                {sending ? "در حال ارسال..." : "ارسال اعلان"}
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl  mb-6">
          <div className="flex items-center gap-2 ">
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
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-[var(--dash-sides)] rounded-2xl shadow-lg p-4 border border-[var(--dash-muted)]/20 dark:border-white/20 transition-all duration-200 hover:shadow-xl ${
                  !notification.read
                    ? "shadow-lg shadow-[var(--light-purple)]/30"
                    : ""
                }`}>
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3
                          className={`font-semibold text-[var(--dash-text)] ${
                            !notification.read
                              ? "text-[var(--dark-purple)] dark:text-white"
                              : ""
                          }`}>
                          {notification.title}
                        </h3>
                        <p className="text-[var(--dash-muted)] mt-1 text-sm leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1 text-xs text-[var(--dash-muted)]">
                            <Clock className="h-3 w-3" />
                            <span>{relativeTime(notification.time)}</span>
                          </div>
                          {!notification.read && (
                            <span className="inline-block w-2 h-2 bg-[var(--light-purple)] rounded-full"></span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-green-600 hover:bg-green-500/10 rounded-xl transition-colors duration-200"
                            title="علامت به عنوان خوانده شده">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() =>
                            setShowActions(
                              showActions === notification.id
                                ? null
                                : notification.id,
                            )
                          }
                          className="p-2 text-[var(--dash-muted)] hover:bg-[var(--dash-muted)]/10 rounded-xl transition-colors duration-200">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {showActions === notification.id && (
                      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-600 dark:text-red-400 text-sm mb-2">
                          آیا از حذف این اعلان مطمئن هستید؟
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors duration-200">
                            بله، حذف شود
                          </button>
                          <button
                            onClick={() => setShowActions(null)}
                            className="px-3 py-1 bg-[var(--dash-muted)]/20 text-[var(--dash-text)] text-sm rounded-lg hover:bg-[var(--dash-muted)]/30 transition-colors duration-200">
                            انصراف
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-gradient-to-r from-[var(--light-purple)] to-[var(--dark-purple)] border border-[var(--light-purple)] dark:border-white/30 rounded-xl text-[var(--dash-text)] hover:from-[var(--light-purple)] hover:to-[var(--dark-purple)] transition-all duration-200 shadow-lg font-medium">
              بارگذاری اعلان‌های بیشتر
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
