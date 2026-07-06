"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Save,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Calendar,
} from "lucide-react";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setUserData({
        name: "محمد احمدی",
        email: "mohammad@example.com",
        phone: "۰۹۱۲۳۴۵۶۷۸۹",
        birthDate: "۱۳۷۵-۰۳-۱۵",
      });
      setIsLoading(false);
    }, 800);
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setSaveMessage({ type: "success", text: "اطلاعات با موفقیت ذخیره شد" });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveMessage({
        type: "error",
        text: "رمز عبور جدید و تکرار آن مطابقت ندارند",
      });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setSaveMessage({
        type: "error",
        text: "رمز عبور باید حداقل ۶ کاراکتر باشد",
      });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setSaveMessage({ type: "success", text: "رمز عبور با موفقیت تغییر کرد" });
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const tabs = [
    { id: "profile", label: "پروفایل", icon: User },
    { id: "security", label: "امنیت", icon: Lock },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-[var(--dash-text)]">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--dash-text)] mb-2">
            تنظیمات
          </h1>
          <p className="text-[var(--dash-muted)]">
            مدیریت / ویرایش اطلاعات کاربری
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-8 bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 space-y-6">
              {/* User Card */}
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-green-500 flex items-center justify-center mx-auto shadow-xl">
                  <User className="h-8 w-8 text-black" />
                </div>
                <p className="font-bold text-[var(--dash-text)] mt-4 text-lg">
                  {userData.name || "کاربر"}
                </p>
                <p className="text-[var(--dash-muted)] text-sm">کاربر عادی</p>
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
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-8">
              {/* Success/Error Message */}
              {saveMessage && (
                <div
                  className={`mb-6 p-4 rounded-xl text-center font-medium ${
                    saveMessage.type === "success"
                      ? "bg-green-500 text-black"
                      : "bg-red-500/20 text-red-500"
                  }`}
                >
                  {saveMessage.text}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[var(--dash-text)]">
                      اطلاعات پروفایل
                    </h2>
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-black rounded-xl font-bold shadow-lg hover:bg-green-400 transition-all duration-300"
                    >
                      <Save className="h-4 w-4" />
                      ذخیره
                    </button>
                  </div>

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
                        className="w-full bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all shadow-xl"
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
                        className="w-full bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all shadow-xl"
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
                        onChange={handleProfileChange}
                        className="w-full bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all shadow-xl"
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                        <Calendar className="h-4 w-4 inline ml-1" />
                        تاریخ تولد
                      </label>
                      <input
                        type="text"
                        name="birthDate"
                        value={userData.birthDate}
                        onChange={handleProfileChange}
                        className="w-full bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all shadow-xl"
                        placeholder="۱۳۷۵-۰۳-۱۵"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-8">
                  <h2 className="text-xl font-bold text-[var(--dash-text)]">
                    تغییر رمز عبور
                  </h2>

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
                          className="w-full bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all shadow-xl pl-11"
                          placeholder="رمز عبور فعلی را وارد کنید"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                          className="w-full bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all shadow-xl pl-11"
                          placeholder="رمز عبور جدید را وارد کنید"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                          className="w-full bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all shadow-xl pl-11"
                          placeholder="رمز عبور جدید را مجدد وارد کنید"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    className="w-full py-3 bg-green-500 text-black rounded-xl font-bold shadow-lg hover:bg-green-400 transition-all duration-300"
                  >
                    تغییر رمز عبور
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
