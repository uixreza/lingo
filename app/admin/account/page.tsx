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
} from "lucide-react";
import Avatar from "@/components/dashboard/Avatar";
import MentorTab from "@/components/admin/MentorTab";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function AccountPage() {
  const { update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
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
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [level, setLevel] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("");
  const [isPro, setIsPro] = useState(false);
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
          setIsPro(data.isPro ?? false);
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
      setIsPro(data.isPro ?? false);
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
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "خطا در تغییر رمز عبور");
      }
      toast.success("رمز عبور با موفقیت تغییر کرد");
      setPasswordData({
        currentPassword: "",
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

  const tabs = [
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
            <div className="sticky top-8 bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 space-y-6">
              {/* User Card */}
              <div className="text-center">
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
                  <button
                    onClick={handleRotateAvatar}
                    className="absolute -bottom-1 -left-1 bg-[var(--dash-sides)] hover:bg-[var(--hover-bg-strong)] rounded-full p-1.5 shadow-lg transition-all duration-200 border border-[var(--hover-bg-strong)]"
                    title="تغییر تصویر پروفایل">
                    <RefreshCw className="h-4 w-4 text-[var(--dash-text)]" />
                  </button>
                </div>
                <p className="font-bold text-[var(--dash-text)] mt-4 text-lg">
                  {userData.name || "کاربر"}
                </p>
                <p className="text-[var(--dash-muted)] text-sm mt-1">
                  مدیر
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-[var(--dash-muted)]/20"></div>

              {/* Navigation Tabs */}
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                        activeTab === tab.id
                          ? "bg-green-500 text-black shadow-lg"
                          : "text-[var(--dash-text)] hover:bg-[var(--hover-bg)] hover:text-[var(--dash-text)]"
                      }`}>
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="relative overflow-hidden bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl">
              <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-green-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-green-500/5 blur-3xl" />

              <div className="relative p-8">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-1.5 rounded-full bg-green-500" />
                      <div>
                        <h2 className="text-xl font-bold text-[var(--dash-text)]">
                          اطلاعات پروفایل
                        </h2>
                        <p className="text-xs text-[var(--dash-muted)] mt-1">
                          مشخصات خود را ویرایش و به‌روزرسانی کنید
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-black rounded-xl font-bold shadow-lg shadow-green-500/25 hover:bg-green-400 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-green-500">
                      {savingProfile ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {savingProfile ? "در حال ذخیره..." : "ذخیره"}
                    </button>
                  </div>

                  <div className="bg-[var(--hover-bg)] rounded-2xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                        <User className="h-4 w-4 inline ml-1" />
                        نام کامل
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleProfileChange}
                        className="w-full bg-[var(--dash-bg)]/60 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/60 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                        <Mail className="h-4 w-4 inline ml-1" />
                        آدرس ایمیل
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleProfileChange}
                        className="w-full bg-[var(--dash-bg)]/60 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/60 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                        <Phone className="h-4 w-4 inline ml-1" />
                        شماره تلفن
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={userData.phone}
                        disabled
                        className="w-full bg-[var(--dash-bg)]/60 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm opacity-60 cursor-not-allowed"
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                        <Calendar className="h-4 w-4 inline ml-1" />
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
                        inputClass="w-full outline-none bg-[var(--dash-bg)]/60 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm border-0 focus:ring-2 focus:ring-green-500/60 transition-all"
                        calendarPosition="bottom-right"
                      />
                    </div>
                    </div>
                  </div>

                  {/* Level Selection */}
                  <div className="bg-[var(--hover-bg)] rounded-2xl p-6">
                    <label className="block text-sm font-medium text-[var(--dash-muted)] mb-3">
                      سطح زبان
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => {
                        const levelColors: Record<string, string> = {
                          A1: "bg-green-500/15 text-green-700 dark:text-green-300 hover:bg-green-500/25",
                          A2: "bg-green-500/15 text-green-700 dark:text-green-300 hover:bg-green-500/25",
                          B1: "bg-orange-500/15 text-orange-700 dark:text-orange-300 hover:bg-orange-500/25",
                          B2: "bg-orange-500/15 text-orange-700 dark:text-orange-300 hover:bg-orange-500/25",
                          C1: "bg-red-500/15 text-red-700 dark:text-red-300 hover:bg-red-500/25",
                          C2: "bg-red-500/15 text-red-700 dark:text-red-300 hover:bg-red-500/25",
                        };
                        const selectedColors: Record<string, string> = {
                          A1: "bg-green-500 text-white shadow-lg",
                          A2: "bg-green-500 text-white shadow-lg",
                          B1: "bg-orange-500 text-white shadow-lg",
                          B2: "bg-orange-500 text-white shadow-lg",
                          C1: "bg-red-500 text-white shadow-lg",
                          C2: "bg-red-500 text-white shadow-lg",
                        };
                        return (
                          <button
                            key={lvl}
                            onClick={() => setLevel(lvl === level ? "" : lvl)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                              level === lvl
                                ? selectedColors[lvl]
                                : levelColors[lvl]
                            }`}>
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Mentor Tab */}
              {activeTab === "mentor" && <MentorTab />}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-1.5 rounded-full bg-green-500" />
                    <div>
                      <h2 className="text-xl font-bold text-[var(--dash-text)]">
                        تغییر رمز عبور
                      </h2>
                      <p className="text-xs text-[var(--dash-muted)] mt-1">
                        رمز عبور خود را به‌صورت دوره‌ای تغییر دهید
                      </p>
                    </div>
                  </div>

                  <div className="bg-[var(--hover-bg)] rounded-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                        رمز عبور فعلی
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full bg-[var(--dash-bg)]/60 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/60 transition-all pl-11"
                          placeholder="رمز عبور فعلی را وارد کنید"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors">
                          {showCurrentPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                        رمز عبور جدید
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full bg-[var(--dash-bg)]/60 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/60 transition-all pl-11"
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
                      <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                        تکرار رمز عبور جدید
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full bg-[var(--dash-bg)]/60 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/60 transition-all pl-11"
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

                  <button
                    onClick={handleChangePassword}
                    disabled={savingPassword}
                    className="w-full py-3 bg-green-500 text-black rounded-xl font-bold shadow-lg shadow-green-500/25 hover:bg-green-400 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-green-500 inline-flex items-center justify-center gap-2">
                    {savingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {savingPassword ? "در حال تغییر..." : "تغییر رمز عبور"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}