// components/dashboard/NotificationPage.tsx
"use client";
import { useState } from "react";
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
} from "lucide-react";

type Notification = {
  id: string;
  type: "success" | "warning" | "info" | "achievement" | "message";
  title: string;
  message: string;
  time: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "achievement",
      title: "سطح جدید! 🎉",
      message: "تبریک! شما به سطح ۳ رسیدید. به همین منوال ادامه دهید.",
      time: "۵ دقیقه پیش",
      read: false,
    },
    {
      id: "2",
      type: "message",
      title: "پیام جدید از استاد",
      message: "استاد علی محمدی برای شما پیام جدیدی ارسال کرده است.",
      time: "۱ ساعت پیش",
      read: false,
      action: {
        label: "مشاهده پیام",
        onClick: () => console.log("View message"),
      },
    },
    {
      id: "3",
      type: "success",
      title: "پرداخت موفق",
      message: "پرداخت شما به مبلغ ۱۵۰,۰۰۰ تومان با موفقیت انجام شد.",
      time: "۲ ساعت پیش",
      read: true,
    },
    {
      id: "4",
      type: "warning",
      title: "یادآوری جلسه",
      message: "جلسه فردا با استاد فاطمه کریمی را فراموش نکنید.",
      time: "۱ روز پیش",
      read: true,
    },
    {
      id: "5",
      type: "info",
      title: "بروزرسانی سیستم",
      message: "سیستم جدیدی برای بهبود تجربه کاربری اضافه شده است.",
      time: "۲ روز پیش",
      read: true,
    },
    {
      id: "6",
      type: "achievement",
      title: "مدال جدید! 🏆",
      message: 'شما مدال "یادگیرنده سریع" را کسب کردید.',
      time: "۳ روز پیش",
      read: true,
    },
  ]);

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [showActions, setShowActions] = useState<string | null>(null);

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
    setShowActions(null);
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id),
    );
    setShowActions(null);
  };

  const clearAllRead = () => {
    setNotifications(
      notifications.filter((notification) => !notification.read),
    );
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

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "border-r-4 border-r-green-500";
      case "warning":
        return "border-r-4 border-r-yellow-500";
      case "info":
        return "border-r-4 border-r-blue-500";
      case "achievement":
        return "border-r-4 border-r-purple-500";
      case "message":
        return "border-r-4 border-r-cyan-500";
      default:
        return "border-r-4 border-r-gray-500";
    }
  };

  return (
    <div className="min-h-screen  py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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

              <button
                onClick={clearAllRead}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 dark:border-white/30 rounded-xl text-red-600 dark:text-red-400 hover:from-red-500/20 hover:to-red-600/20 transition-all duration-200 shadow-lg">
                <Trash2 className="h-4 w-4" />
                <span className="text-sm font-medium">پاک کردن خوانده‌ها</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-[var(--dash-sides)] rounded-2xl shadow-lg p-2 mb-6 border border-[var(--dash-muted)]/20 dark:border-white/20">
          <div className="flex items-center gap-4">
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

        {/* Notifications List */}
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
                  {/* Content */}
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
                            <span>{notification.time}</span>
                          </div>
                          {!notification.read && (
                            <span className="inline-block w-2 h-2 bg-[var(--light-purple)] rounded-full"></span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
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

                    {/* Action Button */}
                    {notification.action && (
                      <div className="mt-3">
                        <button
                          onClick={notification.action.onClick}
                          className="px-4 py-2 bg-gradient-to-r from-[var(--light-purple)]/10 to-[var(--dark-purple)]/10 border border-[var(--light-purple)]/20 dark:border-white/30 rounded-xl text-[var(--dark-purple)] dark:text-white text-sm font-medium hover:from-[var(--light-purple)]/20 hover:to-[var(--dark-purple)]/20 transition-all duration-200 shadow-lg">
                          {notification.action.label}
                        </button>
                      </div>
                    )}

                    {/* Delete Confirmation */}
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

        {/* Load More Button */}
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
