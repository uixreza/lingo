"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-multi-date-picker";
import "react-multi-date-picker/styles/layouts/prime.css";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";
import {
  Lock,
  Globe,
  Clock,
  CalendarDays,
  Users,
  User,
  FileText,
  CheckCircle,
  Hourglass,
  XCircle,
  Loader2,
  Copy,
  ExternalLink,
  Video,
} from "lucide-react";

const timeSlots = ["08:30", "10:00", "12:30", "15:00", "17:00", "19:00"];

const languages = [
  { id: "en", label: "English", flag: "🇬🇧", available: true },
  { id: "tr", label: "Turkish", flag: "🇹🇷", available: false },
  { id: "de", label: "German", flag: "🇩🇪", available: false },
];

const initialRequests = [
  {
    id: 1,
    date: "1404/10/22",
    time: "10:00",
    language: "English",
    type: "Public",
    status: "approved" as const,
    meetLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: 4,
    date: "1404/11/10",
    time: "17:00",
    language: "English",
    type: "Private",
    reason: "تقویت مهارت رایتینگ",
    status: "approved" as const,
  },
  {
    id: 2,
    date: "1404/10/25",
    time: "12:30",
    language: "English",
    type: "Private",
    reason: "آمادگی برای آزمون آیلتس",
    status: "pending" as const,
  },
  {
    id: 3,
    date: "1404/09/15",
    time: "15:00",
    language: "English",
    type: "Public",
    status: "canceled" as const,
  },
];

type RequestStatus = "approved" | "pending" | "canceled";

export default function SessionsPage() {
  const [date, setDate] = useState<DateObject | null>(null);
  const [time, setTime] = useState<string[]>([]);
  const [language, setLanguage] = useState("en");
  const [classType, setClassType] = useState<"Public" | "Private">("Private");
  const [reason, setReason] = useState("");

  const [mounted, setMounted] = useState(false);
  const [requests] = useState(initialRequests);
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopyLink = async (id: number, link: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const canSubmit =
    mounted &&
    language &&
    classType &&
    (classType === "Public" || (date && time.length > 0));

  const filteredRequests =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const statusIcons = {
    approved: CheckCircle,
    pending: Hourglass,
    canceled: XCircle,
  };
  const statusColors = {
    approved: "text-green-500",
    pending: "text-orange-500",
    canceled: "text-red-500",
  };
  const statusBg = {
    approved: "bg-green-500/10",
    pending: "bg-orange-500/10",
    canceled: "bg-red-500/10",
  };
  const statusLabel = {
    approved: "تأیید شده",
    pending: "در انتظار",
    canceled: "لغو شده",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Right: Request Form (wider) */}
      <div className="lg:col-span-3 bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
        <h2 className="text-xl font-bold text-[var(--dash-text)] mb-6">
          درخواست کلاس زبان
        </h2>

        <div className="space-y-5">
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
              زبان
            </label>
            <div className="grid grid-cols-3 gap-3">
              {languages.map((lang) => {
                const selected = language === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => lang.available && setLanguage(lang.id)}
                    disabled={!lang.available}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                      !lang.available
                        ? "opacity-40 cursor-not-allowed bg-[var(--hover-bg)]"
                        : selected
                          ? "ring-2 ring-green-500 bg-green-500/10 text-green-600 dark:text-green-400 shadow-lg"
                          : "bg-[var(--hover-bg)] text-[var(--dash-text)] hover:bg-[var(--hover-bg-strong)]"
                    }`}>
                    <span className="text-2xl">{lang.flag}</span>
                    <span>{lang.label}</span>
                    {!lang.available && (
                      <Lock className="absolute top-2 left-2 h-3.5 w-3.5 text-[var(--dash-muted)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Class Type */}
          <div>
            <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
              نوع کلاس
            </label>
            <div className="flex gap-3">
              {[
                { value: "Public" as const, label: "عمومی", available: false },
                { value: "Private" as const, label: "خصوصی", available: true },
              ].map(({ value, label, available }) => (
                <button
                  key={value}
                  onClick={() => available && setClassType(value)}
                  disabled={!available}
                  className={`relative flex items-center gap-2 flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    !available
                      ? "opacity-40 cursor-not-allowed bg-[var(--hover-bg)]"
                      : classType === value
                        ? "ring-2 ring-green-500 bg-green-500/10 text-green-600 dark:text-green-400 shadow-lg"
                        : "bg-[var(--hover-bg)] text-[var(--dash-text)] hover:bg-[var(--hover-bg-strong)]"
                  }`}>
                  {value === "Public" ? (
                    <Users className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <div>
                    <div>{label}</div>
                    {value === "Private" && (
                      <div className="text-[10px] opacity-70 mt-0.5">۱.۵ ساعته</div>
                    )}
                  </div>
                  {!available && (
                    <Lock className="absolute top-2 left-2 h-3.5 w-3.5 text-[var(--dash-muted)]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Reason (conditional) */}
          {classType === "Private" && (
            <div>
              <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                دلیل یادگیری
              </label>
              <div className="relative">
                <FileText className="absolute top-3 right-3 h-4 w-4 text-[var(--dash-muted)] pointer-events-none" />
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="دلیل خود را برای یادگیری این زبان بنویسید..."
                  rows={3}
                  className="w-full bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 pr-10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                />
              </div>
            </div>
          )}

          {/* Date & Time (only for Private) */}
          {classType === "Private" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                  تاریخ
                </label>
                <DatePicker
                  value={date}
                  onChange={(v) => setDate(v)}
                  calendar={persian}
                  locale={persian_fa}
                  format="YYYY/MM/DD"
                  placeholder="انتخاب تاریخ کلاس"
                  containerClassName="w-full"
                  inputClass="w-full outline-none bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm border-0 focus:ring-2 focus:ring-green-500/50 transition-all"
                  calendarPosition="bottom-right"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                  ساعت پیشنهادی کلاس
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((t) => {
                    const isSelected = time.includes(t);
                    return (
                      <button
                        key={t}
                        onClick={() =>
                          setTime(
                            isSelected
                              ? time.filter((s) => s !== t)
                              : [...time, t],
                          )
                        }
                        className={`flex items-center justify-center gap-2 px-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border-2 ${
                          isSelected
                            ? "border-green-500 text-green-600 dark:text-green-400 shadow-lg shadow-green-500/20 bg-transparent"
                            : "border-[var(--dash-muted)]/20 text-[var(--dash-text)] hover:border-green-500/30 bg-transparent"
                        }`}>
                        <span
                          className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            isSelected
                              ? "border-green-500 bg-green-500"
                              : "border-[var(--dash-muted)]"
                          }`}>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                          )}
                        </span>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Public notification */}
          {classType === "Public" && (
            <div className="bg-[var(--hover-bg)] rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/20">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-[var(--dash-muted)]">
                  تاریخ و ساعت کلاس‌های عمومی از طریق پیامک یا ایمیل به شما
                  اطلاع داده خواهد شد.
                </p>
              </div>
            </div>
          )}

          {/* Teacher Introduction */}
          <div className="bg-[var(--hover-bg)] rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-[var(--dash-text)] mb-3">
              مدرس شما
            </h3>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg">
                RK
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-sm font-bold text-[var(--dash-text)]">
                  رضا کمالی
                </p>
                <p className="text-xs text-[var(--dash-muted)]">سن: ۲۶ سال</p>
                <p className="text-xs text-[var(--dash-muted)]">
                  مدرک: TTC Holder
                </p>
                <p className="text-xs text-[var(--dash-muted)]">
                  سابقه تدریس: ۳ سال
                </p>
                <p className="text-xs text-[var(--dash-muted)]">
                  کارشناسی ارشد زبان انگلیسی از دانشگاه بجنورد
                </p>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="bg-[var(--hover-bg)] rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--dash-muted)]">
                قیمت هر جلسه
              </span>
              <div className="text-left">
                {classType ? (
                  <div>
                    <span className="text-sm font-medium text-[var(--dash-text)]">
                      {classType === "Private" ? "۴۰۰,۰۰۰" : "۱۵۰,۰۰۰"}
                      <span className="text-xs font-medium text-[var(--dash-muted)] mr-1">
                        تومان
                      </span>
                    </span>
                    {classType === "Public" && (
                      <div className="text-base font-bold text-[var(--dash-text)] mt-0.5">
                        {"۲,۲۵۰,۰۰۰"}
                        <span className="text-xs font-medium text-[var(--dash-muted)] mr-1">
                          تومان / ۱۵ جلسه
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-[var(--dash-muted)]">
                    نوع کلاس را انتخاب کنید
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            disabled={!canSubmit}
            className={`w-full py-3 rounded-xl font-bold transition-all duration-300 shadow-xl ${
              canSubmit
                ? "bg-green-500 text-black hover:bg-green-400 hover:scale-[1.02]"
                : "bg-[var(--hover-bg)] text-[var(--dash-muted)] cursor-not-allowed"
            }`}>
            ثبت درخواست
          </button>
        </div>
      </div>

      {/* Left: Requests List (narrower) */}
      <div className="lg:col-span-2 bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
        <h2 className="text-xl font-bold text-[var(--dash-text)] mb-6">
          درخواست‌های من
        </h2>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "approved", "pending", "canceled"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                filter === key
                  ? "bg-green-500 text-black shadow-lg"
                  : "bg-[var(--hover-bg)] text-[var(--dash-text)] hover:bg-[var(--hover-bg-strong)]"
              }`}>
              {key === "all" ? "همه" : statusLabel[key]}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredRequests.length === 0 && (
            <p className="text-[var(--dash-muted)] text-center py-12">
              درخواستی یافت نشد
            </p>
          )}
          {filteredRequests.map((req) => {
            const StatusIcon = statusIcons[req.status];
            return (
              <div
                key={req.id}
                className="bg-[var(--hover-bg)] rounded-xl p-5 shadow-xl transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${statusBg[req.status]}`}>
                      <StatusIcon
                        className={`h-5 w-5 ${statusColors[req.status]}`}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--dash-text)]">
                        {req.language}
                      </p>
                      <p className="text-xs text-[var(--dash-muted)] mt-0.5">
                        {req.type}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusBg[req.status]} ${statusColors[req.status]}`}>
                    {statusLabel[req.status]}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--dash-muted)]">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {req.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {req.time}
                  </span>
                </div>
                {req.reason && (
                  <p className="text-xs text-[var(--dash-muted)] mt-3 pr-1 border-r-2 border-[var(--dash-muted)]/30">
                    {req.reason}
                  </p>
                )}

                {req.status === "approved" && (
                  <div className="mt-4 pt-4 border-t border-[var(--dash-muted)]/20 space-y-3">
                    {"meetLink" in req && req.meetLink ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        <span className="text-xs truncate text-left font-mono flex-1" style={{ color: "var(--dash-text)", direction: "ltr" }}>
                          {req.meetLink}
                        </span>
                        <button
                          onClick={() => handleCopyLink(req.id, req.meetLink!)}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0">
                          {copiedId === req.id ? (
                            <span className="text-xs text-green-500 font-medium">کپی شد</span>
                          ) : (
                            <Copy className="h-3.5 w-3.5" style={{ color: "var(--dash-muted)" }} />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 text-green-500 animate-spin shrink-0" />
                        <span className="text-xs" style={{ color: "var(--dash-muted)" }}>
                          لینک در تاریخ جلسه قرار داده می‌شود
                        </span>
                      </div>
                    )}

                    <a
                      href={"meetLink" in req && req.meetLink ? req.meetLink : "#"}
                      target={"meetLink" in req && req.meetLink ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                        "meetLink" in req && req.meetLink
                          ? "bg-green-500 text-black hover:bg-green-400 shadow-lg"
                          : "bg-[var(--hover-bg)] text-[var(--dash-muted)] cursor-not-allowed opacity-60"
                      }`}
                      onClick={(e) => {
                        if (!("meetLink" in req && req.meetLink)) e.preventDefault();
                      }}>
                      <Video className="h-4 w-4" />
                      شرکت در کلاس
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
