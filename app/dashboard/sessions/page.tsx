"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
  ChevronDown,
} from "lucide-react";
import moment from "moment-jalaali";
import toast, { Toaster } from "react-hot-toast";

const timeSlots = ["08:30", "10:00", "12:30", "15:00", "17:00", "19:00"];

const persianMonths = [
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

const days = Array.from({ length: 31 }, (_, i) => i + 1);

function getCurrentJalaliYear() {
  return parseInt(moment().format("jYYYY"));
}

const languages = [
  { id: "en", label: "English", flag: "🇬🇧", available: true },
  { id: "tr", label: "Turkish", flag: "🇹🇷", available: false },
  { id: "de", label: "German", flag: "🇩🇪", available: false },
];

type SessionItem = {
  id: number;
  date: string;
  time: string;
  language: string;
  type: string;
  status: "Approved" | "Pending" | "Canceled";
  meetLink?: string | null;
  reason?: string | null;
};

type RequestStatus = "Approved" | "Pending" | "Canceled";

export default function SessionsPage() {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [language, setLanguage] = useState("en");
  const [classType, setClassType] = useState<"Public" | "Private">("Private");
  const [reason, setReason] = useState("");

  const [mounted, setMounted] = useState(false);
  const [requests, setRequests] = useState<SessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(0);

  const availableMonths = mounted
    ? persianMonths.slice(currentMonth - 1)
    : persianMonths;

  const handleCopyLink = async (id: number, link: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    setMounted(true);
    setCurrentMonth(parseInt(moment().format("jM")));
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/sessions");
        if (res.ok) {
          const data: SessionItem[] = await res.json();
          setRequests(data);
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const canSubmit =
    language &&
    classType &&
    (classType === "Public" ||
      (selectedDay && selectedMonth && selectedTimeSlot));

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const sessionDate = `${getCurrentJalaliYear()}/${String(selectedMonth).padStart(2, "0")}/${String(selectedDay).padStart(2, "0")}`;
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionDate,
          startTime: selectedTimeSlot,
          language:
            languages.find((l) => l.id === language)?.label || "English",
          sessionType: classType,
          reasonForLearning: reason || null,
        }),
      });
      if (res.status === 402) {
        toast.error("موجودی کیف پول کافی نیست");
        setTimeout(() => {
          window.location.href = "/dashboard/wallet";
        }, 1500);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.error || `خطا (کد ${res.status})`;
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }
      const created = await res.json();
      setRequests((prev) => [created, ...prev]);
      setSelectedDay("");
      setSelectedMonth("");
      setSelectedTimeSlot("");
      setReason("");
      toast.success("درخواست جلسه شما با موفقیت ثبت شد");
      window.dispatchEvent(new Event("balance-update"));
    } catch (err) {
      setErrorMsg("خطا در برقراری ارتباط");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const statusIcons = {
    Approved: CheckCircle,
    Pending: Hourglass,
    Canceled: XCircle,
  };
  const statusColors = {
    Approved: "text-green-500",
    Pending: "text-orange-500",
    Canceled: "text-red-500",
  };
  const statusBg = {
    Approved: "bg-green-500/10",
    Pending: "bg-orange-500/10",
    Canceled: "bg-red-500/10",
  };
  const statusLabel = {
    Approved: "تأیید شده",
    Pending: "در انتظار",
    Canceled: "لغو شده",
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{ style: { direction: "rtl", fontFamily: "inherit" } }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Right: Request Form (wider) */}
        <div className="lg:col-span-3 bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-1 rounded-full bg-green-500" />
            <h2 className="text-xl font-bold text-[var(--dash-text)]">
              درخواست کلاس زبان
            </h2>
          </div>

          <div className="space-y-7">
            {/* Language */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">
                  ۱
                </span>
                <label className="text-sm font-medium text-[var(--dash-muted)]">
                  زبان مورد نظر
                </label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {languages.map((lang) => {
                  const selected = language === lang.id;
                  return (
                    <button
                      key={lang.id}
                      onClick={() => lang.available && setLanguage(lang.id)}
                      disabled={!lang.available}
                      className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                        !lang.available
                          ? "opacity-30 cursor-not-allowed"
                          : selected
                            ? "bg-green-500/10 ring-1 ring-green-500/40 text-green-400"
                            : "bg-[var(--hover-bg)] text-[var(--dash-text)] hover:bg-[var(--hover-bg-strong)]"
                      }`}>
                      <span className="text-2xl">{lang.flag}</span>
                      <span>{lang.label}</span>
                      {!lang.available && (
                        <div className="absolute inset-0 bg-[var(--dash-sides)]/60 rounded-xl flex items-center justify-center">
                          <Lock className="h-4 w-4 text-[var(--dash-muted)]" />
                        </div>
                      )}
                      {selected && (
                        <div className="absolute -top-1 -left-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                          <svg
                            className="h-2.5 w-2.5 text-black"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Class Type */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">
                  ۲
                </span>
                <label className="text-sm font-medium text-[var(--dash-muted)]">
                  نوع کلاس
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: "Public" as const,
                    label: "عمومی",
                    desc: "۱۵ جلسه گروهی",
                    icon: Users,
                    available: true,
                  },
                  {
                    value: "Private" as const,
                    label: "خصوصی",
                    desc: "۱.۵ ساعته",
                    icon: User,
                    available: true,
                  },
                ].map(({ value, label, desc, icon: Icon, available }) => (
                  <button
                    key={value}
                    onClick={() => available && setClassType(value)}
                    disabled={!available}
                    className={`relative flex items-center gap-3 p-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                      !available
                        ? "opacity-30 cursor-not-allowed bg-[var(--hover-bg)]"
                        : classType === value
                          ? "bg-green-500/10 ring-1 ring-green-500/40 text-green-400"
                          : "bg-[var(--hover-bg)] text-[var(--dash-text)] hover:bg-[var(--hover-bg-strong)]"
                    }`}>
                    <div
                      className={`p-2 rounded-lg ${classType === value && available ? "bg-green-500/20" : "bg-[var(--dash-sides)]/40"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{label}</div>
                      <div className="text-[10px] opacity-60 mt-0.5">
                        {desc}
                      </div>
                    </div>
                    {!available && (
                      <Lock className="absolute top-2 left-2 h-3.5 w-3.5 text-[var(--dash-muted)]" />
                    )}
                    {classType === value && available && (
                      <div className="absolute -top-1 -left-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          className="h-2.5 w-2.5 text-black"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason (conditional) */}
            {classType === "Private" && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">
                    ۳
                  </span>
                  <label className="text-sm font-medium text-[var(--dash-muted)]">
                    دلیل یادگیری
                  </label>
                </div>
                <div className="relative">
                  <FileText className="absolute top-3 right-3 h-4 w-4 text-[var(--dash-muted)]/40 pointer-events-none" />
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="دلیل خود را برای یادگیری این زبان بنویسید..."
                    rows={3}
                    className="w-full bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 pr-10 text-sm resize-none focus:outline-none ring-1 ring-transparent focus:ring-green-500/30 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Date & Time (only for Private) */}
            {classType === "Private" && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">
                    {reason ? "۴" : "۳"}
                  </span>
                  <label className="text-sm font-medium text-[var(--dash-muted)]">
                    تاریخ و ساعت
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                        className="w-full appearance-none bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none ring-1 ring-transparent focus:ring-green-500/30 transition-all cursor-pointer">
                        <option value="">روز</option>
                        {days.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dash-muted)] pointer-events-none" />
                    </div>
                    <div className="relative flex-[2]">
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full appearance-none bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none ring-1 ring-transparent focus:ring-green-500/30 transition-all cursor-pointer">
                        <option value="">ماه</option>
                        {availableMonths.map((m, i) => (
                          <option key={i} value={i + currentMonth}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dash-muted)] pointer-events-none" />
                    </div>
                  </div>
                  <div className="relative">
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="w-full appearance-none bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none ring-1 ring-transparent focus:ring-green-500/30 transition-all cursor-pointer">
                      <option value="">ساعت پیشنهادی</option>
                      {timeSlots.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dash-muted)] pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Public notification */}
            {classType === "Public" && (
              <div className="bg-[var(--hover-bg)]/50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <svg
                      className="h-4 w-4 text-green-500"
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
                  <div className="text-xs text-[var(--dash-muted)] leading-relaxed space-y-1">
                    <p>
                      تاریخ و ساعت کلاس‌های عمومی از طریق پیامک یا ایمیل به شما
                      اطلاع داده خواهد شد.
                    </p>
                    <p>
                      کلاس شما بر اساس سطح انتخابی در{" "}
                      <Link
                        href="/dashboard/account"
                        className="underline underline-offset-2 text-purple-400 hover:text-purple-300 transition-colors font-medium">
                        حساب کاربری
                      </Link>
                      {" "}شما تعیین می‌شود.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Teacher Introduction */}
            <div className="bg-gradient-to-br from-purple-500/5 to-purple-500/[0.02] rounded-xl p-5 ring-1 ring-purple-500/10">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-5 w-1 rounded-full bg-purple-500" />
                <span className="text-xs font-bold text-purple-400">
                  مدرس شما
                </span>
              </div>
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg ring-2 ring-purple-500/20">
                    <Image
                      src="/me.png"
                      alt="رضا کمالی"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[var(--dash-sides)] flex items-center justify-center">
                    <svg className="h-2.5 w-2.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-bold text-[var(--dash-text)]">
                      رضا کمالی
                    </p>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-medium">
                      TTC
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-purple-400/50" />
                      <span className="text-[11px] text-[var(--dash-muted)]">۲۶ سال</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-purple-400/50" />
                      <span className="text-[11px] text-[var(--dash-muted)]">۳ سال سابقه</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-purple-400/50" />
                      <span className="text-[11px] text-[var(--dash-muted)]">دانشگاه بجنورد</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-green-500/8 to-emerald-500/5 rounded-xl p-5 ring-1 ring-green-500/10">
              {classType ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-medium text-[var(--dash-muted)]">
                        قیمت هر جلسه
                      </span>
                    </div>
                    <span className="text-2xl font-black text-[var(--dash-text)] text-left">
                      {classType === "Private" ? "۴۰۰,۰۰۰" : "۱۵۰,۰۰۰"}
                      <span className="text-xs font-bold text-[var(--dash-muted)] mr-1">
                        تومان
                      </span>
                    </span>
                  </div>
                  {classType === "Public" && (
                    <div className="flex items-center justify-between pt-2 border-t border-green-500/10">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--dash-muted)]">
                          قیمت کل (۱۵ جلسه)
                        </span>
                      </div>
                      <span className="text-lg font-black text-[var(--dash-text)] text-left">
                        {"۲,۲۵۰,۰۰۰"}
                        <span className="text-xs font-bold text-[var(--dash-muted)] mr-1">
                          تومان
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-[var(--dash-muted)]">
                      قیمت هر جلسه
                    </span>
                  </div>
                  <span className="text-sm text-[var(--dash-muted)]">
                    نوع کلاس را انتخاب کنید
                  </span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              suppressHydrationWarning
              className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 ${
                canSubmit && !submitting
                  ? "bg-green-500 text-black hover:bg-green-400 shadow-lg shadow-green-500/25"
                  : "bg-[var(--hover-bg)] text-[var(--dash-muted)] cursor-not-allowed"
              }`}>
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  در حال ثبت...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  ثبت درخواست
                </span>
              )}
            </button>

            {errorMsg && (
              <p className="text-red-400 text-sm text-center">{errorMsg}</p>
            )}
          </div>
        </div>

        {/* Left: Requests List (narrower) */}
        <div className="lg:col-span-2 bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--dash-text)]">
              درخواست‌های من
            </h2>
            <span className="text-xs bg-[var(--hover-bg)] text-[var(--dash-muted)] px-3 py-1 rounded-full">
              {requests.length} مورد
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1.5 mb-6 p-1 bg-[var(--hover-bg)] rounded-xl">
            {(["all", "Approved", "Pending", "Canceled"] as const).map(
              (key) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    filter === key
                      ? "bg-green-500 text-black shadow-lg shadow-green-500/25"
                      : "text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                  }`}>
                  {key === "all" ? "همه" : statusLabel[key]}
                </button>
              ),
            )}
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--dash-muted)]" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-16">
                <CalendarDays className="h-10 w-10 mx-auto text-[var(--dash-muted)]/40 mb-3" />
                <p className="text-[var(--dash-muted)] text-sm">
                  درخواستی یافت نشد
                </p>
              </div>
            ) : null}
            {filteredRequests.map((req) => {
              const StatusIcon = statusIcons[req.status];
              return (
                <div
                  key={req.id}
                  className="bg-[var(--hover-bg)] rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg ${statusBg[req.status]}`}>
                          <StatusIcon
                            className={`h-4 w-4 ${statusColors[req.status]}`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[15px] text-[var(--dash-text)]">
                            {req.language}
                          </p>
                          <p className="text-xs text-[var(--dash-muted)] mt-0.5">
                            {req.type}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold ${statusBg[req.status]} ${statusColors[req.status]}`}>
                        {statusLabel[req.status]}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-sm text-[var(--dash-muted)]">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        {req.date}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[var(--dash-muted)]/20" />
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {req.time}
                      </span>
                    </div>

                    {req.reason && (
                      <div className="mt-3 py-2.5 pr-3 border-r-2 border-[var(--dash-muted)]/10">
                        <p className="text-sm text-[var(--dash-muted)]/60 leading-relaxed line-clamp-2">
                          {req.reason}
                        </p>
                      </div>
                    )}

                        {req.status === "Approved" && (
                      <div className="mt-4 pt-4 border-t border-[var(--dash-muted)]/8 space-y-3">
                        {"meetLink" in req && req.meetLink ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 flex items-center gap-2.5 bg-[var(--hover-bg)] rounded-lg px-4 py-2.5 min-w-0">
                              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                              <span
                                className="text-sm font-mono truncate text-left"
                                style={{
                                  color: "var(--dash-text)",
                                  direction: "ltr",
                                }}>
                                {req.meetLink}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                handleCopyLink(req.id, req.meetLink!)
                              }
                              className="shrink-0 px-3 py-2.5 rounded-lg text-xs font-medium bg-[var(--hover-bg)] hover:bg-[var(--hover-bg-strong)] transition-colors"
                              style={{ color: "var(--dash-muted)" }}>
                              {copiedId === req.id ? (
                                <span className="text-green-500">کپی شد</span>
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5 bg-[var(--hover-bg)] rounded-lg px-4 py-2.5">
                            <Loader2 className="h-4 w-4 text-green-500 animate-spin shrink-0" />
                            <span className="text-sm text-[var(--dash-muted)]">
                              لینک در تاریخ جلسه قرار داده می‌شود
                            </span>
                          </div>
                        )}

                        <a
                          href={
                            "meetLink" in req && req.meetLink
                              ? req.meetLink
                              : "#"
                          }
                          target={
                            "meetLink" in req && req.meetLink
                              ? "_blank"
                              : "_self"
                          }
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                            "meetLink" in req && req.meetLink
                              ? "bg-green-500 text-black hover:bg-green-400"
                              : "bg-[var(--hover-bg)] text-[var(--dash-muted)] cursor-not-allowed"
                          }`}
                          onClick={(e) => {
                            if (!("meetLink" in req && req.meetLink))
                              e.preventDefault();
                          }}>
                          <Video className="h-4 w-4" />
                          شرکت در کلاس
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
