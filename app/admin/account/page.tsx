"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-multi-date-picker";
import "react-multi-date-picker/styles/layouts/prime.css";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";
import { PageSkeleton } from "@/components/dashboard/Skeletons";
import {
  User,
  Mail,
  Save,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Calendar,
  RefreshCw,
  Loader2,
  Star,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/dashboard/Avatar";
import MentorTab from "@/components/admin/MentorTab";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

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

type TabId = "profile" | "mentor" | "security";

export default function AccountPage() {
  const { update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [birthDate, setBirthDate] = useState<DateObject | null>(
    () => new DateObject().convert(persian, persian_fa),
  );
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
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

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
        } else if (res.status === 401) {
          toast.error("ابتدا وارد حساب خود شوید");
        }
      } catch {
        toast.error("خطا در دریافت اطلاعات");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
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
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save");
      }
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
      toast.success("اطلاعات با موفقیت ذخیره شد");
      try {
        await updateSession({
          user: { fullname: data.name, avatarSeed: data.avatarSeed ?? null },
        });
      } catch {
        // session refresh failure shouldn't fail the save
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "خطا در ذخیره اطلاعات";
      toast.error(message);
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
      toast.success("تصویر پروفایل تغییر کرد");
    } catch {
      toast.error("خطا در ذخیره تصویر");
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
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "خطا در تغییر رمز عبور");
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

  const tabs: { id: TabId; label: string; icon: typeof User }[] = [
    { id: "profile", label: "پروفایل", icon: User },
    { id: "mentor", label: "مدرس", icon: Star },
    { id: "security", label: "امنیت", icon: Lock },
  ];

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
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
                  <div className="green-border rounded-2xl p-[2px]">
                    <div className="bg-[var(--hover-bg-strong)] rounded-[14px] p-1">
                      <Avatar
                        seed={avatarSeed}
                        size={80}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 mt-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  مدیر
                </span>
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
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-black transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
                          {savingProfile ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
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
                            <DatePicker
                              value={birthDate}
                              onChange={(v) => setBirthDate(v)}
                              calendar={persian}
                              locale={persian_fa}
                              format="YYYY/MM/DD"
                              placeholder="انتخاب تاریخ تولد"
                              containerClassName="w-full"
                              inputClass="w-full outline-none bg-[var(--dash-bg)]/70 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm border border-[var(--dash-muted)]/15 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] transition-all"
                              calendarPosition="bottom-right"
                            />
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
                      </div>
                    </motion.div>
                  )}

                  {/* Mentor Tab */}
                  {activeTab === "mentor" && (
                    <motion.div
                      key="mentor"
                      variants={tabVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeOut" }}>
                      <MentorTab />
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
    </div>
  );
}