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

  // User data - only essential fields
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
  });

  // Password change form
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
    // Simulate loading user data
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
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--light-purple)] mx-auto mb-4"></div>
          <p className="text-[var(--dash-text)]">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen ">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--dash-text)" }}>
            تنظیمات
          </h1>
          <p style={{ color: "var(--dash-muted)" }}>
            مدیریت / ویرایش اطلاعات کاربری
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar with gradient styling */}
          <div className="md:w-64 flex-shrink-0">
            <div className="sticky top-8 rounded-xl shadow-lg border border-[var(--dash-muted)]/20 overflow-hidden">
              {/* User Card */}
              <div className="p-4 bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold">{userData.name || "کاربر"}</p>
                    <p className="text-white/80 text-xs">کاربر عادی</p>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="p-2 bg-[var(--dash-sides)]">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                        activeTab === tab.id
                          ? "bg-gradient-to-l from-[var(--light-purple)] to-[var(--dark-purple)] text-white shadow-md"
                          : "text-[var(--dash-muted)] hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)]"
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
          <div className="flex-1">
            <div className="bg-[var(--dash-sides)] rounded-xl shadow-lg border border-[var(--dash-muted)]/20 p-6">
              {/* Success/Error Message */}
              {saveMessage && (
                <div
                  className={`mb-4 p-3 rounded-lg text-center ${
                    saveMessage.type === "success"
                      ? "bg-green-500/20 text-green-600"
                      : "bg-red-500/20 text-red-600"
                  }`}>
                  {saveMessage.text}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[var(--dash-text)]">
                      اطلاعات پروفایل
                    </h2>
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--light-purple)] to-[var(--dark-purple)] text-white rounded-lg font-medium shadow-md hover:shadow-xl transition-all hover:scale-105">
                      <Save className="h-4 w-4" />
                      ذخیره
                    </button>
                  </div>

                  <div className="space-y-5">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--dash-text)]">
                        <User className="h-4 w-4 inline ml-1" />
                        نام کامل
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-xl shadow-md focus:shadow-lg focus:outline-none transition-all duration-200"
                        style={{
                          backgroundColor: "var(--dash-bg)",
                          color: "var(--dash-text)",
                          boxShadow:
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        }}
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--dash-text)]">
                        <Mail className="h-4 w-4 inline ml-1" />
                        آدرس ایمیل
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-xl shadow-md focus:shadow-lg focus:outline-none transition-all duration-200"
                        style={{
                          backgroundColor: "var(--dash-bg)",
                          color: "var(--dash-text)",
                          boxShadow:
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        }}
                      />
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--dash-text)]">
                        <Phone className="h-4 w-4 inline ml-1" />
                        شماره تلفن
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={userData.phone}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-xl shadow-md focus:shadow-lg focus:outline-none transition-all duration-200"
                        style={{
                          backgroundColor: "var(--dash-bg)",
                          color: "var(--dash-text)",
                          boxShadow:
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        }}
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      />
                    </div>

                    {/* Birth Date Field */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--dash-text)]">
                        <Calendar className="h-4 w-4 inline ml-1" />
                        تاریخ تولد
                      </label>
                      <input
                        type="text"
                        name="birthDate"
                        value={userData.birthDate}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-xl shadow-md focus:shadow-lg focus:outline-none transition-all duration-200"
                        style={{
                          backgroundColor: "var(--dash-bg)",
                          color: "var(--dash-text)",
                          boxShadow:
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        }}
                        placeholder="۱۳۷۵-۰۳-۱۵"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[var(--dash-text)]">
                    تغییر رمز عبور
                  </h2>

                  <div className="space-y-5">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--dash-text)]">
                        رمز عبور فعلی
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-3 rounded-xl shadow-md focus:shadow-lg focus:outline-none transition-all duration-200 pl-11"
                          style={{
                            backgroundColor: "var(--dash-bg)",
                            color: "var(--dash-text)",
                            boxShadow:
                              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          }}
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

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--dash-text)]">
                        رمز عبور جدید
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-3 rounded-xl shadow-md focus:shadow-lg focus:outline-none transition-all duration-200 pl-11"
                          style={{
                            backgroundColor: "var(--dash-bg)",
                            color: "var(--dash-text)",
                            boxShadow:
                              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          }}
                          placeholder="رمز عبور جدید را وارد کنید"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors">
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--dash-text)]">
                        تکرار رمز عبور جدید
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-3 rounded-xl shadow-md focus:shadow-lg focus:outline-none transition-all duration-200 pl-11"
                          style={{
                            backgroundColor: "var(--dash-bg)",
                            color: "var(--dash-text)",
                            boxShadow:
                              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          }}
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

                    <button
                      onClick={handleChangePassword}
                      className="w-full py-3 bg-gradient-to-r from-[var(--light-purple)] to-[var(--dark-purple)] text-white rounded-lg font-medium shadow-md hover:shadow-xl transition-all hover:scale-105">
                      تغییر رمز عبور
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
