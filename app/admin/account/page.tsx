"use client";

import { useState, useEffect, useRef } from "react";
import DatePicker from "react-multi-date-picker";
import "react-multi-date-picker/styles/layouts/prime.css";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import {
  User,
  Mail,
  Save,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Calendar,
  Upload,
  Camera,
  Award,
  Briefcase,
  GraduationCap,
} from "lucide-react";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    certifications: {
      TTC: false,
      TOEFL: false,
      IELTS: false,
      Duolingo: false,
    },
    teachingExperience: "",
    universityCertificates: "",
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [level, setLevel] = useState("");
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
        certifications: { TTC: true, TOEFL: true, IELTS: true, Duolingo: false },
        teachingExperience:
          "۵ سال تدریس زبان انگلیسی\nمدرس دوره‌های آیلتس و تافل\nتدریس در آموزشگاه‌های معتبر تهران",
        universityCertificates:
          "کارشناسی ارشد آموزش زبان انگلیسی - دانشگاه تهران\nکارشناسی زبان و ادبیات انگلیسی - دانشگاه شهید بهشتی",
      });
      setIsLoading(false);
    }, 800);
  }, []);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCertificationToggle = (cert: string) => {
    setUserData((prev) => ({
      ...prev,
      certifications: {
        ...prev.certifications,
        [cert]: !prev.certifications[cert as keyof typeof prev.certifications],
      },
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    { id: "certification", label: "درخواست گواهی", icon: Award },
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
    <div dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-8 bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 space-y-6">
              {/* User Card */}
              <div className="text-center">
                <div className="relative mx-auto w-20 h-20">
                  <div
                    className="w-20 h-20 rounded-2xl bg-green-500 flex items-center justify-center mx-auto shadow-xl overflow-hidden cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}>
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-black" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -left-1 w-7 h-7 bg-[var(--dash-sides)] border-2 border-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-500 transition-all duration-200 group">
                    <Camera className="h-3.5 w-3.5 text-green-500 group-hover:text-black transition-colors" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="font-bold text-[var(--dash-text)] mt-4 text-lg">
                  {userData.name || "کاربر"}
                </p>
                <p className="text-[var(--dash-muted)] text-sm">مدیر</p>
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
          <div className="flex-1">
            <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-8">
              {/* Success/Error Message */}
              {saveMessage && (
                <div
                  className={`mb-6 p-4 rounded-xl text-center font-medium ${
                    saveMessage.type === "success"
                      ? "bg-green-500 text-black"
                      : "bg-red-500/20 text-red-500"
                  }`}>
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
                      className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-black rounded-xl font-bold shadow-lg hover:bg-green-400 transition-all duration-300">
                      <Save className="h-4 w-4" />
                      ذخیره
                    </button>
                  </div>

                  {/* Basic Info */}
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
                      <DatePicker
                        value={userData.birthDate}
                        onChange={(val: any) => {
                          const formatted = val?.format?.("YYYY/MM/DD") ?? "";
                          setUserData((prev) => ({
                            ...prev,
                            birthDate: formatted,
                          }));
                        }}
                        calendar={persian}
                        locale={persian_fa}
                        format="YYYY/MM/DD"
                        containerClassName="w-full"
                        inputClass="w-full bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm border-0 focus:ring-2 focus:ring-green-500/50 transition-all shadow-xl"
                        calendarPosition="bottom-right"
                      />
                    </div>
                  </div>

                  {/* Bio / Certifications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                        <Award className="h-4 w-4 inline ml-1" />
                        مدارک و گواهینامه‌ها
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {["TTC", "TOEFL", "IELTS", "Duolingo"].map(
                          (cert) => (
                            <label
                              key={cert}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                userData.certifications[
                                  cert as keyof typeof userData.certifications
                                ]
                                  ? "bg-green-500/20 text-green-500 border border-green-500/40"
                                  : "bg-[var(--hover-bg)] text-[var(--dash-text)] border border-transparent hover:border-[var(--dash-muted)]/30"
                              }`}>
                              <input
                                type="checkbox"
                                checked={
                                  userData.certifications[
                                    cert as keyof typeof userData.certifications
                                  ]
                                }
                                onChange={() =>
                                  handleCertificationToggle(cert)
                                }
                                className="sr-only"
                              />
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 ${
                                  userData.certifications[
                                    cert as keyof typeof userData.certifications
                                  ]
                                    ? "bg-green-500 text-black"
                                    : "bg-[var(--dash-sides)] border border-[var(--dash-muted)]/40"
                                }`}>
                                {userData.certifications[
                                  cert as keyof typeof userData.certifications
                                ] && (
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span className="text-sm font-medium">
                                {cert}
                              </span>
                            </label>
                          ),
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                        <Briefcase className="h-4 w-4 inline ml-1" />
                        سابقه تدریس
                      </label>
                      <textarea
                        name="teachingExperience"
                        value={userData.teachingExperience}
                        onChange={handleProfileChange}
                        rows={4}
                        className="w-full bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all shadow-xl resize-none"
                        placeholder="سابقه تدریس خود را وارد کنید"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                        <GraduationCap className="h-4 w-4 inline ml-1" />
                        مدارک دانشگاهی
                      </label>
                      <textarea
                        name="universityCertificates"
                        value={userData.universityCertificates}
                        onChange={handleProfileChange}
                        rows={3}
                        className="w-full bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all shadow-xl resize-none"
                        placeholder="مدارک دانشگاهی خود را وارد کنید"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Certification Request Tab */}
              {activeTab === "certification" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[var(--dash-text)]">
                      درخواست گواهی
                    </h2>
                  </div>

                  <div className="bg-[var(--hover-bg)] rounded-xl p-6 text-center">
                    <Award className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-[var(--dash-text)] font-medium mb-2">
                      گواهی شرکت در دوره‌ها
                    </p>
                    <p className="text-[var(--dash-muted)] text-sm mb-6 max-w-md mx-auto">
                      پس از اتمام موفقیت‌آمیز هر دوره، می‌توانید گواهی معتبر
                      دریافت کنید. برای مشاهده گواهی‌های خود روی دکمه زیر کلیک
                      کنید.
                    </p>
                    <button className="px-6 py-3 bg-green-500 text-black rounded-xl font-bold shadow-lg hover:bg-green-400 transition-all duration-300 inline-flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      مشاهده گواهی‌ها
                    </button>
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
                          className="w-full bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all shadow-xl pl-11"
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

                  <button
                    onClick={handleChangePassword}
                    className="w-full py-3 bg-green-500 text-black rounded-xl font-bold shadow-lg hover:bg-green-400 transition-all duration-300">
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
