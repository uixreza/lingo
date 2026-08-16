"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";
import moment from "moment-jalaali";
import {
  User,
  Mail,
  Save,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Calendar,
  Trophy,
  RefreshCw,
  Loader2,
  Send,
  Star,
  Search,
  UserPlus,
  Unplug,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/components/dashboard/LoadingSpinner";
import Avatar from "@/components/dashboard/Avatar";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

type RankingUser = {
  id: number;
  fullname: string;
  avatarSeed: string | null;
  isPro: boolean;
  joinDate: string;
  rank: number;
  friendStatus: "none" | "pending" | "friends";
  friendIncoming: boolean;
};

type FriendRequest = {
  id: number;
  sender: {
    id: number;
    fullname: string;
    avatarSeed: string | null;
    isPro: boolean;
  };
};

const tabVariants = {
  initial: { opacity: 0, y: 16, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.99 },
};

const inputClass =
  "w-full bg-[var(--dash-bg)]/70 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm outline-none border border-[var(--dash-muted)]/15 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] transition-all placeholder:text-[var(--dash-muted)]/60";

const labelClass =
  "flex items-center gap-1.5 text-sm font-semibold text-[var(--dash-text)] mb-2";

const cardClass =
  "relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-bg)]/40 p-6";

const accentBar =
  "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent";

const listVariants = {
  initial: { opacity: 0, y: 12 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3 },
  }),
};

function toFa(value: number | string): string {
  const digits = "۰۱۲۳۴۵۶۷۸۹";
  return String(value).replace(/[0-9]/g, (d) => digits[+d]);
}

const faMonths = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const WHEEL_ITEM_H = 44;
const WHEEL_VISIBLE = 5;
const WHEEL_PAD = 2;

function WheelColumn({
  items,
  activeIndex,
  onActiveChange,
  className = "",
}: {
  items: string[];
  activeIndex: number;
  onActiveChange: (index: number) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(activeIndex);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = activeIndex * WHEEL_ITEM_H;
    setActive(activeIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  return (
    <div
      ref={ref}
      onScroll={() => {
        const el = ref.current;
        if (!el) return;
        const idx = Math.round(el.scrollTop / WHEEL_ITEM_H);
        const clamped = Math.max(0, Math.min(items.length - 1, idx));
        if (clamped !== active) {
          setActive(clamped);
          onActiveChange(clamped);
        }
      }}
      style={{ height: WHEEL_ITEM_H * WHEEL_VISIBLE }}
      className={`overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [scroll-snap-type:y_mandatory] ${className}`}>
      {Array.from({ length: WHEEL_PAD }).map((_, i) => (
        <div key={`pad-t-${i}`} style={{ height: WHEEL_ITEM_H }} />
      ))}
      {items.map((item, i) => (
        <div
          key={i}
          style={{ height: WHEEL_ITEM_H }}
          className={`[scroll-snap-align:center] [scroll-snap-stop:always] flex items-center justify-center text-sm font-bold transition-colors duration-75 ${
            i === active
              ? "text-green-500"
              : "text-[var(--dash-muted)]/45"
          }`}>
          {item}
        </div>
      ))}
      {Array.from({ length: WHEEL_PAD }).map((_, i) => (
        <div key={`pad-b-${i}`} style={{ height: WHEEL_ITEM_H }} />
      ))}
    </div>
  );
}

function JalaliWheelPicker({
  value,
  onChange,
}: {
  value: DateObject | null;
  onChange: (value: DateObject) => void;
}) {
  const base =
    value ?? new DateObject({ calendar: persian, locale: persian_fa });
  const jYear = base.year;
  const jMonth = base.month.number;
  const jDay = base.day;

  const years = useMemo(() => {
    const current = new DateObject({
      calendar: persian,
      locale: persian_fa,
    }).year;
    const start = Math.max(1300, current - 80);
    return Array.from({ length: current - start + 1 }, (_, i) => start + i);
  }, []);

  const yearIdx = (() => {
    const found = years.indexOf(jYear);
    if (found >= 0) return found;
    return jYear < years[0] ? 0 : years.length - 1;
  })();

  const setValue = (y: number, m: number, d: number) => {
    onChange(
      new DateObject({
        year: y,
        month: m,
        day: d,
        calendar: persian,
        locale: persian_fa,
      }),
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 bg-[var(--dash-bg)]/60 py-3">
      <div className="grid grid-cols-3 gap-2 px-5 pb-2">
        <p className="text-center text-[10px] font-bold text-[var(--dash-muted)]">
          روز
        </p>
        <p className="text-center text-[10px] font-bold text-[var(--dash-muted)]">
          ماه
        </p>
        <p className="text-center text-[10px] font-bold text-[var(--dash-muted)]">
          سال
        </p>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute left-5 right-5 top-1/2 -translate-y-1/2 z-10 h-11 rounded-xl bg-green-500/10 ring-1 ring-green-500/25" />
        <div className="flex gap-2 px-5" style={{ height: WHEEL_ITEM_H * WHEEL_VISIBLE }}>
          <WheelColumn
            className="flex-1"
            items={Array.from({ length: moment.jDaysInMonth(jYear, jMonth - 1) }, (_, i) =>
              toFa(i + 1),
            )}
            activeIndex={jDay - 1}
            onActiveChange={(d) => setValue(jYear, jMonth, d + 1)}
          />
          <WheelColumn
            className="flex-1"
            items={faMonths}
            activeIndex={jMonth - 1}
            onActiveChange={(m) =>
              setValue(jYear, m + 1, Math.min(jDay, moment.jDaysInMonth(jYear, m)))
            }
          />
          <WheelColumn
            className="flex-1"
            items={years.map((y) => toFa(y))}
            activeIndex={yearIdx}
            onActiveChange={(y) =>
              setValue(
                years[y],
                jMonth,
                Math.min(jDay, moment.jDaysInMonth(years[y], jMonth - 1)),
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [birthDate, setBirthDate] = useState<DateObject | null>(
    () => new DateObject().convert(persian, persian_fa),
  );
  const [mobilePickerOpen, setMobilePickerOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [level, setLevel] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyFriends, setShowOnlyFriends] = useState(false);
  const [friendAction, setFriendAction] = useState<{
    id: number;
    type: "add" | "accept" | "remove" | "disconnect";
  } | null>(null);
  const [disconnectTarget, setDisconnectTarget] =
    useState<RankingUser | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/account");
        if (res.ok) {
          const data = await res.json();
          setUserData({
            name: data.name,
            email: data.email ?? "",
            phone: data.phone,
          });
          if (data.birthDate)
            setBirthDate(
              new DateObject({
                date: data.birthDate,
                calendar: persian,
                locale: persian_fa,
              }),
            );
          setLevel(data.fluencyLevel ?? "");
          setAvatarSeed(data.avatarSeed ?? data.phone);
          setIsPro(data.isPro ?? false);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await fetch("/api/ranking");
        if (res.ok) {
          const data = await res.json();
          setRanking(data.ranking ?? []);
          setCurrentUserId(data.currentUserId ?? null);
        }
      } catch (err) {
        console.error("Error fetching ranking:", err);
      }
    };
    fetchRanking();
  }, []);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const res = await fetch("/api/friends");
        if (res.ok) {
          const data = await res.json();
          setFriendRequests(data.requests ?? []);
        }
      } catch (err) {
        console.error("Error fetching friend requests:", err);
      }
    };
    fetchFriendRequests();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (savingProfile) return;
    setSavingProfile(true);
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          ...(birthDate
            ? {
                birthDate: new DateObject(birthDate)
                  .setDigits("0123456789".split(""))
                  .format("YYYY/MM/DD"),
              }
            : {}),
          ...(level ? { fluencyLevel: level } : {}),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setUserData({
        name: data.name,
        email: data.email,
        phone: data.phone,
      });
      if (data.birthDate)
        setBirthDate(
          new DateObject({
            date: data.birthDate,
            calendar: persian,
            locale: persian_fa,
          }),
        );
      setLevel(data.fluencyLevel ?? "");
      setIsPro(data.isPro ?? false);
      toast.success("اطلاعات با موفقیت ذخیره شد");
      try {
        await updateSession({
          user: {
            fullname: data.name,
            avatarSeed: data.avatarSeed ?? null,
          },
        });
      } catch {
        // session refresh failure shouldn't fail the save
      }
    } catch {
      toast.error("خطا در ذخیره اطلاعات");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRotateAvatar = async () => {
    const newSeed = Math.random().toString(36).substring(2, 10);
    setAvatarSeed(newSeed);
    try {
      await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarSeed: newSeed }),
      });
      try {
        await updateSession({ user: { avatarSeed: newSeed } });
      } catch {
        // session refresh failure shouldn't fail the save
      }
    } catch {
      // background save, revert not needed
    }
  };

  const handleChangePassword = async () => {
    if (savingPassword) return;
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("رمز عبور جدید و تکرار آن مطابقت ندارند");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: passwordData.newPassword,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success("رمز عبور با موفقیت تغییر کرد");
      setPasswordData({
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "خطا در تغییر رمز عبور";
      toast.error(message);
    } finally {
      setSavingPassword(false);
    }
  };

  const runFriendAction = async (
    userId: number,
    type: "add" | "accept" | "remove" | "disconnect",
  ) => {
    if (friendAction !== null) return;
    setFriendAction({ id: userId, type });
    try {
      let res: Response;
      if (type === "add") {
        res = await fetch("/api/friends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiverId: userId }),
        });
      } else if (type === "accept") {
        res = await fetch("/api/friends/accept", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
      } else {
        res = await fetch("/api/friends", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Friend action failed");
      setRanking((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                friendStatus: data.friendStatus,
                friendIncoming: data.friendIncoming ?? false,
              }
            : u,
        ),
      );
      if (type === "accept" || type === "remove") {
        setFriendRequests((prev) =>
          prev.filter((r) => r.sender.id !== userId),
        );
      }
      if (type === "add") toast.success("درخواست دوستی ارسال شد");
      else if (type === "accept") toast.success("درخواست دوستی پذیرفته شد");
      else if (type === "disconnect") toast.success("ارتباط قطع شد");
      else toast.success("درخواست حذف شد");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "خطا در ارسال درخواست دوستی";
      toast.error(message);
    } finally {
      setFriendAction(null);
    }
  };

  const confirmDisconnect = async () => {
    if (!disconnectTarget) return;
    const target = disconnectTarget;
    await runFriendAction(target.id, "disconnect");
    setDisconnectTarget(null);
  };

  const filteredRanking = ranking.filter(
    (user) =>
      (!showOnlyFriends || user.friendStatus === "friends") &&
      user.fullname.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const tabs: { id: string; label: string; icon: typeof User }[] = [
    { id: "profile", label: "پروفایل", icon: User },
    { id: "security", label: "امنیت", icon: Lock },
    { id: "ranking", label: "رتبه‌بندی", icon: Trophy },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div dir="rtl">
      <div className="max-w-5xl mx-auto py-8 space-y-6">
        {/* Save notice */}
        <div className="flex items-center backdrop-blur-3xl gap-2.5 bg-blue-500/10 rounded-xl px-4 py-3 ring-1 ring-blue-500/20">
          <svg className="h-4 w-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-400 leading-relaxed font-medium">
            لطفاً برای ثبت تغییرات روی دکمه ذخیره کلیک کنید
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="sticky top-8 relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg p-6 space-y-6">
              <div className="pointer-events-none absolute -top-24 -right-10 h-48 w-48 rounded-full bg-[var(--dash-accent)]/15 blur-3xl" />
              {/* User Card */}
              <div className="relative text-center">
                <div className="relative inline-flex">
                  {isPro ? (
                    <div className="pro-border rounded-2xl p-[2px]">
                      <div className="bg-[var(--hover-bg-strong)] rounded-[14px] p-1">
                        <Avatar
                          seed={avatarSeed}
                          size={80}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="green-border rounded-2xl p-[2px]">
                      <div className="bg-[var(--hover-bg-strong)] rounded-[14px] p-1">
                        <Avatar
                          seed={avatarSeed}
                          size={80}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRotateAvatar}
                    className="absolute -bottom-1 -left-1 bg-[var(--dash-sides)] hover:bg-[var(--hover-bg-strong)] rounded-full p-1.5 shadow-lg transition-all duration-200 border border-[var(--hover-bg-strong)]"
                    title="تغییر تصویر پروفایل">
                    <RefreshCw className="h-4 w-4 text-[var(--dash-text)]" />
                  </motion.button>
                </div>
                <p className="font-bold text-[var(--dash-text)] mt-4 text-lg">
                  {userData.name || "کاربر"}
                </p>
                {isPro ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-500 dark:text-purple-400 mt-1.5">
                    <Star className="h-3.5 w-3.5 fill-purple-400" />
                    کاربر ویژه
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 mt-1.5">
                    <User className="h-3.5 w-3.5" />
                    کاربر عادی
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="relative h-px bg-[var(--dash-muted)]/20"></div>

              {/* Navigation Tabs */}
              <div className="relative space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${
                        isActive
                          ? "bg-gradient-to-l from-green-500 to-emerald-500 text-black shadow-lg shadow-green-500/25"
                          : "text-[var(--dash-text)] hover:bg-[var(--hover-bg)]"
                      }`}>
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg">
              <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-[var(--dash-accent)]/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-green-500/5 blur-3xl" />

              <div className="relative p-8">
                <AnimatePresence mode="wait">
                  {/* Profile Tab */}
                  {activeTab === "profile" && (
                    <motion.div
                      key="profile"
                      variants={tabVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="space-y-8">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-green-500/10">
                            <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-[var(--dash-text)]">
                              اطلاعات پروفایل
                            </h2>
                            <p className="text-xs text-[var(--dash-muted)] mt-1">
                              مشخصات خود را ویرایش و به‌روزرسانی کنید
                            </p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={savingProfile ? {} : { scale: 1.02 }}
                          whileTap={savingProfile ? {} : { scale: 0.98 }}
                          onClick={handleSaveProfile}
                          disabled={savingProfile}
                          className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base rounded-xl font-bold text-black transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
                          {savingProfile ? (
                            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                          ) : (
                            <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          )}
                          {savingProfile ? "در حال ذخیره..." : "ذخیره"}
                        </motion.button>
                      </div>

                      <div className={cardClass}>
                        <div className={accentBar} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className={labelClass}>
                              <User className="h-4 w-4 text-[var(--dash-accent)]" />
                              نام کامل
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={userData.name}
                              onChange={handleProfileChange}
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>
                              <Mail className="h-4 w-4 text-[var(--dash-accent)]" />
                              آدرس ایمیل
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={userData.email}
                              onChange={handleProfileChange}
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>
                              <Phone className="h-4 w-4 text-[var(--dash-accent)]" />
                              شماره تلفن
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={userData.phone}
                              disabled
                              className={`${inputClass} opacity-60 cursor-not-allowed`}
                              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                            />
                          </div>

                          <div>
                            <label className={labelClass}>
                              <Calendar className="h-4 w-4 text-[var(--dash-accent)]" />
                              تاریخ تولد
                            </label>
                            <button
                              type="button"
                              onClick={() => setMobilePickerOpen(true)}
                              className="w-full flex items-center justify-between gap-2 outline-none bg-[var(--dash-bg)]/70 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm border border-[var(--dash-muted)]/15 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] transition-all">
                              <span
                                className={
                                  birthDate
                                    ? ""
                                    : "text-[var(--dash-muted)]/60"
                                }>
                                {birthDate
                                  ? birthDate.format("YYYY/MM/DD")
                                  : "انتخاب تاریخ تولد"}
                              </span>
                              <span className="p-1.5 rounded-lg bg-green-500/10">
                                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Level Selection */}
                      <div className={cardClass}>
                        <div className={accentBar} />
                        <label className={labelClass}>
                          <Star className="h-4 w-4 text-[var(--dash-accent)]" />
                          سطح زبان
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => {
                            const isSelected = level === lvl;
                            const group =
                              lvl.startsWith("A")
                                ? "green"
                                : lvl.startsWith("B")
                                  ? "orange"
                                  : "red";
                            const base = {
                              green:
                                "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/25",
                              orange:
                                "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25",
                              red: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25",
                            }[group];
                            return (
                              <motion.button
                                key={lvl}
                                whileHover={isSelected ? {} : { scale: 1.05 }}
                                whileTap={isSelected ? {} : { scale: 0.95 }}
                                onClick={() =>
                                  setLevel(lvl === level ? "" : lvl)
                                }
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${
                                  isSelected
                                    ? "bg-gradient-to-l from-green-500 to-emerald-500 text-black border-transparent shadow-lg shadow-green-500/25"
                                    : base
                                }`}>
                                {lvl}
                              </motion.button>
                            );
                          })}
                        </div>
                        <a
                          href="https://t.me/lingofam_support"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-4 px-3.5 py-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/25 hover:bg-sky-500/20 hover:ring-sky-500/40 transition-colors text-xs font-medium">
                          <Send className="h-3.5 w-3.5" />
                          درخواست رایگان تعیین سطح (تلگرام)
                        </a>
                      </div>
                    </motion.div>
                  )}

                  {/* Ranking Tab */}
                  {activeTab === "ranking" && (
                    <motion.div
                      key="ranking"
                      variants={tabVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-green-500/10">
                          <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-[var(--dash-text)]">
                            رتبه‌بندی کاربران
                          </h2>
                          <p className="text-xs text-[var(--dash-muted)] mt-1">
                            بر اساس میزان پیشرفت در یادگیری
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative flex-1 min-w-[200px]">
                          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dash-muted)]" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="جستجوی کاربر..."
                            className={`${inputClass} pr-11`}
                          />
                        </div>
                        <motion.label
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--dash-bg)]/60 cursor-pointer select-none border border-[var(--dash-muted)]/15 hover:bg-[var(--dash-bg)] transition-all duration-200">
                          <input
                            type="checkbox"
                            checked={showOnlyFriends}
                            onChange={(e) =>
                              setShowOnlyFriends(e.target.checked)
                            }
                            className="w-4 h-4 accent-green-500 cursor-pointer"
                          />
                          <span className="text-sm text-[var(--dash-text)]">
                            فقط دوستان
                          </span>
                        </motion.label>
                      </div>

                      {/* Pending Friend Requests Section */}
                      {friendRequests.length > 0 && (
                        <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 space-y-3">
                          <div className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4 text-amber-500" />
                            <h3 className="font-bold text-[var(--dash-text)] text-sm">
                              درخواست‌های دوستی
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-xs font-bold">
                              {toFa(friendRequests.length)}
                            </span>
                          </div>

                          {friendRequests.map((req) => {
                            const isBusy = friendAction?.id === req.sender.id;
                            return (
                              <motion.div
                                key={req.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25 }}
                                className="flex items-center gap-3 p-3 rounded-xl bg-[var(--dash-bg)]/50 border border-[var(--dash-muted)]/10">
                                <div className="relative shrink-0">
                                  {req.sender.isPro ? (
                                    <div className="pro-border rounded-xl p-[2px]">
                                      <div className="bg-[var(--hover-bg-strong)] rounded-[10px] p-0.5">
                                        <Avatar
                                          seed={req.sender.avatarSeed || req.sender.fullname}
                                          size={36}
                                          className="w-9 h-9 rounded-[10px]"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <Avatar
                                      seed={req.sender.avatarSeed || req.sender.fullname}
                                      size={36}
                                      className="w-9 h-9 rounded-xl bg-[var(--hover-bg-strong)]"
                                    />
                                  )}
                                  {req.sender.isPro && (
                                    <span className="absolute -bottom-1 -left-1 rounded-full bg-[var(--dash-sides)] p-0.5 ring-1 ring-purple-400/40">
                                      <Star className="h-2.5 w-2.5 fill-purple-400 text-purple-400" />
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm text-[var(--dash-text)] truncate">
                                    {req.sender.fullname}
                                  </p>
                                  <p className="text-xs text-amber-500/90 font-medium flex items-center gap-1">
                                    <Loader2 className="h-3 w-3" />
                                    در انتظار تایید شما
                                  </p>
                                </div>
                                <motion.button
                                  whileTap={isBusy ? {} : { scale: 0.95 }}
                                  onClick={() =>
                                    runFriendAction(req.sender.id, "accept")
                                  }
                                  disabled={isBusy}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-black bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/20 hover:shadow-green-500/35 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                                  {isBusy && friendAction?.type === "accept" ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <UserPlus className="h-3.5 w-3.5" />
                                  )}
                                  پذیرش
                                </motion.button>
                                <button
                                  onClick={() =>
                                    runFriendAction(req.sender.id, "remove")
                                  }
                                  disabled={isBusy}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--hover-bg-strong)] text-[var(--dash-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                                  رد کردن
                                </button>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      <div className="space-y-3">
                        <AnimatePresence initial={false}>
                          {filteredRanking.map((user, i) => {
                            const isTopThree = user.rank <= 3;
                            const isCurrentUser = user.id === currentUserId;
                            const rankColors = [
                              "bg-yellow-400",
                              "bg-gray-300",
                              "bg-amber-600",
                            ];
                            return (
                              <motion.div
                                key={user.id}
                                layout
                                variants={listVariants}
                                custom={i}
                                initial="initial"
                                animate="animate"
                                exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                                  isCurrentUser
                                    ? "border-green-500/30 bg-green-500/10 shadow-lg shadow-green-500/5"
                                    : "border-[var(--dash-muted)]/10 bg-[var(--dash-bg)]/40 hover:border-[var(--dash-muted)]/25"
                                }`}>
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                                    user.rank === 1
                                      ? "trophy-shine bg-purple-600 text-white"
                                      : isTopThree
                                        ? `${rankColors[user.rank - 1]} text-black`
                                        : "bg-[var(--hover-bg-strong)] text-[var(--dash-text)]"
                                  }`}>
                                  {user.rank === 1 ? (
                                    <Trophy className="h-5 w-5 relative z-10" />
                                  ) : (
                                    toFa(user.rank)
                                  )}
                                </div>
                                <div className="relative shrink-0">
                                  {user.isPro ? (
                                    <div className="pro-border rounded-xl p-[2px]">
                                      <div className="bg-[var(--hover-bg-strong)] rounded-[10px] p-0.5">
                                        <Avatar
                                          seed={user.avatarSeed || user.fullname}
                                          size={40}
                                          className="w-10 h-10 rounded-[10px] bg-[var(--hover-bg-strong)]"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <Avatar
                                      seed={user.avatarSeed || user.fullname}
                                      size={44}
                                      className="w-11 h-11 rounded-xl shrink-0 bg-[var(--hover-bg-strong)]"
                                    />
                                  )}
                                  {user.isPro && (
                                    <span className="absolute -bottom-1 -left-1 rounded-full bg-[var(--dash-sides)] p-0.5 ring-1 ring-purple-400/40">
                                      <Star className="h-3 w-3 fill-purple-400 text-purple-400" />
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-[var(--dash-text)] truncate flex items-center gap-2">
                                    {user.fullname}
                                    {isCurrentUser && (
                                      <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                                        شما
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs text-[var(--dash-muted)] mt-1">
                                    تاریخ عضویت: {user.joinDate}
                                  </p>
                                </div>
                                {!isCurrentUser && (
                                  <div className="flex items-center gap-2 shrink-0">
                                    {user.friendStatus === "friends" ? (
                                      <button
                                        onClick={() => setDisconnectTarget(user)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-red-500/15 hover:text-red-500 transition-all duration-200"
                                        title="قطع ارتباط">
                                        <Unplug className="h-3.5 w-3.5" />
                                        قطع ارتباط
                                      </button>
                                    ) : user.friendStatus === "pending" ? (
                                      <>
                                        <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--hover-bg-strong)] text-[var(--dash-muted)]">
                                          در انتظار تایید
                                        </span>
                                        {!user.friendIncoming && (
                                          <button
                                            onClick={() =>
                                              runFriendAction(user.id, "remove")
                                            }
                                            disabled={friendAction?.id === user.id}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--hover-bg-strong)] text-[var(--dash-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                                            لغو
                                          </button>
                                        )}
                                      </>
                                    ) : (
                                      <motion.button
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() =>
                                          runFriendAction(user.id, "add")
                                        }
                                        disabled={friendAction?.id === user.id}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[var(--light-purple)] to-[var(--dark-purple)] text-white shadow-lg shadow-[var(--dark-purple)]/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                                        {friendAction?.id === user.id &&
                                        friendAction?.type === "add" ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <UserPlus className="h-3.5 w-3.5" />
                                        )}
                                        افزودن
                                      </motion.button>
                                    )}
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                        {filteredRanking.length === 0 && (
                          <div className="rounded-2xl border border-[var(--dash-muted)]/15 bg-[var(--dash-bg)]/40 p-8 text-center text-[var(--dash-muted)]">
                            {searchQuery.trim()
                              ? "کاربری با این نام پیدا نشد"
                              : "کاربری برای نمایش وجود ندارد"}
                          </div>
                        )}
                      </div>

                      {/* Disconnect confirmation modal */}
                      {disconnectTarget &&
                        createPortal(
                          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <div
                              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                              onClick={() => setDisconnectTarget(null)}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 12 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ duration: 0.25 }}
                              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/95 backdrop-blur-xl shadow-2xl p-6">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-red-500/15 shrink-0">
                                  <Unplug className="h-5 w-5 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-[var(--dash-text)]">
                                  قطع ارتباط
                                </h3>
                              </div>
                              <p className="text-sm text-[var(--dash-muted)] leading-relaxed mb-6">
                                آیا از قطع ارتباط با{" "}
                                <span className="font-bold text-[var(--dash-text)]">
                                  «{disconnectTarget.fullname}»
                                </span>{" "}
                                مطمئن هستید؟
                              </p>
                              <div className="flex gap-3">
                                <motion.button
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setDisconnectTarget(null)}
                                  disabled={!!friendAction}
                                  className="flex-[2] py-3 rounded-xl font-bold text-black transition-all duration-300 disabled:opacity-60 bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25">
                                  نه، منصرف شدم
                                </motion.button>
                                <button
                                  onClick={confirmDisconnect}
                                  disabled={!!friendAction}
                                  className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold ring-1 ring-red-500/20 hover:bg-red-500/20 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2">
                                  {friendAction?.type === "disconnect" && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  )}
                                  بله، قطع ارتباط
                                </button>
                              </div>
                            </motion.div>
                          </div>,
                          document.body,
                        )}
                    </motion.div>
                  )}

                  {/* Security Tab */}
                  {activeTab === "security" && (
                    <motion.div
                      key="security"
                      variants={tabVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-green-500/10">
                          <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-[var(--dash-text)]">
                            تغییر رمز عبور
                          </h2>
                          <p className="text-xs text-[var(--dash-muted)] mt-1">
                            رمز عبور خود را به‌صورت دوره‌ای تغییر دهید
                          </p>
                        </div>
                      </div>

                      <div className={cardClass}>
                        <div className={accentBar} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className={labelClass}>
                              <Lock className="h-4 w-4 text-[var(--dash-accent)]" />
                              رمز عبور جدید
                            </label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className={`${inputClass} pl-11`}
                                placeholder="رمز عبور جدید را وارد کنید"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowNewPassword(!showNewPassword)
                                }
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors">
                                {showNewPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className={labelClass}>
                              <Lock className="h-4 w-4 text-[var(--dash-accent)]" />
                              تکرار رمز عبور جدید
                            </label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className={`${inputClass} pl-11`}
                                placeholder="رمز عبور جدید را مجدد وارد کنید"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors">
                                {showConfirmPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <motion.button
                        whileHover={savingPassword ? {} : { scale: 1.01 }}
                        whileTap={savingPassword ? {} : { scale: 0.99 }}
                        onClick={handleChangePassword}
                        disabled={savingPassword}
                        className="w-full py-3.5 rounded-xl font-bold text-black transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
                        {savingPassword ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        {savingPassword ? "در حال تغییر..." : "تغییر رمز عبور"}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobilePickerOpen && (
          <div className="fixed inset-0 z-[80] lg:flex lg:items-center lg:justify-center lg:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobilePickerOpen(false)}
            />
            <motion.div
              initial={{ y: "100%", opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 inset-x-0 rounded-t-3xl bg-[var(--dash-sides)]/95 backdrop-blur-xl border-t border-[var(--dash-muted)]/15 shadow-2xl p-6 pb-8 lg:static lg:rounded-2xl lg:w-full lg:max-w-md lg:border lg:pb-6">
              <div className="flex justify-center pb-3 lg:hidden">
                <div className="w-12 h-1.5 bg-[var(--dash-muted)]/25 rounded-full" />
              </div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="p-2 rounded-xl bg-green-500/15 shrink-0">
                    <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-[var(--dash-text)]">
                      تاریخ تولد
                    </h3>
                    <p className="text-xs text-[var(--dash-muted)] mt-0.5 truncate">
                      {birthDate ? birthDate.format("YYYY/MM/DD") : ""}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setMobilePickerOpen(false)}
                  className="shrink-0 px-5 py-2.5 rounded-xl font-bold text-black bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25">
                  تأیید
                </motion.button>
              </div>
              <JalaliWheelPicker value={birthDate} onChange={setBirthDate} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}