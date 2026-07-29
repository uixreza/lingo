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
import toast from "react-hot-toast";

const timeSlots = ["08:30", "09:30", "10:30"];


const languages = [
  { id: "en", label: "English", flag: "🇬🇧", available: true },
  { id: "tr", label: "Turkish", flag: "🇹🇷", available: false },
  { id: "de", label: "German", flag: "🇩🇪", available: false },
];

const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const persianMonthNames = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

function generateMonthCells(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function toPersianDigits(n: string) {
  return n.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [language, setLanguage] = useState("en");
  const [reason, setReason] = useState("");
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

  const [mounted, setMounted] = useState(false);
  const [requests, setRequests] = useState<SessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCopyLink = async (id: number, link: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    setMounted(true);
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

  const canSubmit = language && selectedDates.size > 0;

  const toggleDate = (dateStr: string) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      let successCount = 0;
      for (const dateStr of selectedDates) {
        const gregDate = new Date(dateStr);
        const jalali = moment(gregDate).format("jYYYY/jMM/jDD");
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionDate: jalali,
            startTime: selectedTimeSlot,
            language:
              languages.find((l) => l.id === language)?.label || "English",
            sessionType: "Private",
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
        successCount++;
      }
      setSelectedDates(new Set());
      setSelectedTimeSlot("");
      setReason("");
      toast.success(`درخواست ${successCount} جلسه با موفقیت ثبت شد`);
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
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Right: Request Form (wider) */}
        <div className="lg:col-span-3 bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-1 rounded-full bg-green-500" />
            <h2 className="text-xl font-bold text-[var(--dash-text)]">
              درخواست جلسه خصوصی
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

            {/* Date & Time */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">
                    ۲
                  </span>
                  <label className="text-sm font-medium text-[var(--dash-muted)]">
                    تاریخ جلسه
                  </label>
                </div>
                <div className="space-y-4">
                  {/* Month Grids */}
                  {mounted && (
                    <div className="flex gap-6 overflow-x-auto pb-2" style={{ direction: "ltr" }}>
                      {(() => {
                        const now = new Date();
                        return [0, 1, 2].map((offset) => {
                          const m = now.getMonth() + offset;
                          const y = now.getFullYear() + Math.floor(m / 12);
                          const monthIdx = m % 12;
                          const cells = generateMonthCells(y, monthIdx);
                          const weeks: (number | null)[][] = [];
                          for (let i = 0; i < cells.length; i += 7) {
                            weeks.push(cells.slice(i, i + 7));
                          }
                          return (
                            <div key={`${y}-${monthIdx}`} className="flex flex-col items-center shrink-0">
                              <div className="grid grid-cols-7 gap-0.5">
                                {weekDays.map((wd) => (
                                  <div key={wd} className="w-9 h-6 flex items-center justify-center text-[10px] font-bold text-[var(--dash-muted)]">
                                    {wd}
                                  </div>
                                ))}
                                {weeks.map((week, wi) =>
                                  week.map((day, di) => {
                                    if (day === null) return <div key={`e-${wi}-${di}`} className="w-9 h-9" />;
                                    const dateStr = toDateStr(y, monthIdx, day);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const cellDate = new Date(y, monthIdx, day);
                                    const isPast = cellDate < today;
                                    const isToday = cellDate.getTime() === today.getTime();
                                    const isSelected = selectedDates.has(dateStr);
                                    const isAvailable = !isPast;
                                    return (
                                      <div
                                        key={dateStr}
                                        onClick={() => isAvailable && toggleDate(dateStr)}
                                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-150 ${
                                          isSelected
                                            ? "ring-2 ring-green-500 bg-green-500/10 text-green-500 font-bold"
                                            : isToday
                                              ? "bg-purple-500/15 text-purple-500 dark:text-purple-400 ring-1 ring-purple-500/30 font-bold"
                                              : isPast
                                                ? "bg-[var(--hover-bg)]/50 text-[var(--dash-muted)]/40"
                                                : "bg-[var(--hover-bg)] text-[var(--dash-text)] hover:bg-green-500/15 hover:text-green-500 cursor-pointer"
                                        }`}>
                                        {day}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                              <span className="text-[10px] font-bold text-[var(--dash-muted)] mt-1.5">
                                {persianMonthNames[monthIdx]}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}

                  <div className="flex items-start gap-2.5 bg-[var(--hover-bg)]/50 rounded-xl p-3">
                    <svg className="h-4 w-4 text-[var(--dash-muted)] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs text-[var(--dash-muted)] leading-relaxed">
                      تمام جلسات ساعت ۸:۳۰ صبح برگزار می‌شوند. اگر نیاز به زمان دیگری دارید، لطفاً در بخش "توضیحات" ذکر کنید.
                    </p>
                  </div>
                </div>
              </div>

            {/* Reason */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">
                  ۳
                </span>
                <label className="text-sm font-medium text-[var(--dash-muted)]">
                  توضیحات
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
              {selectedDates.size > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--dash-muted)]">
                      تعداد جلسات
                    </span>
                    <span className="text-sm font-bold text-[var(--dash-text)]">
                      {selectedDates.size} جلسه
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-green-500/10">
                    <span className="text-sm font-medium text-[var(--dash-muted)]">
                      قیمت کل
                    </span>
                    <span className="text-2xl font-black text-[var(--dash-text)] text-left">
                      {(selectedDates.size * 400000).toLocaleString("fa-IR")}
                      <span className="text-xs font-bold text-[var(--dash-muted)] mr-1">
                        تومان
                      </span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-[var(--dash-muted)]">
                      قیمت هر جلسه
                    </span>
                  </div>
                  <span className="text-2xl font-black text-[var(--dash-text)] text-left">
                    ۴۰۰,۰۰۰
                    <span className="text-xs font-bold text-[var(--dash-muted)] mr-1">
                      تومان
                    </span>
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

          {/* Pro Section */}
          <div className="bg-[var(--hover-bg)] rounded-xl p-4 mb-5 ring-1 ring-purple-500/30 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/15 shrink-0">
                <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-[var(--dash-text)]">
                    کاربر ویژه (Pro)
                  </span>
                  <span className="text-[10px] bg-purple-500/15 text-purple-500 px-1.5 py-0.5 rounded font-medium">
                    اشتراک فعال
                  </span>
                </div>
                <p className="text-xs text-[var(--dash-muted)] leading-relaxed">
                  کلاس‌های عمومی هر جمعه ساعت ۱۰:۰۰ تا ۱۱:۳۰ با مدرس رضا کمالی
                </p>
              </div>
            </div>
            <button
              className="w-full py-2.5 rounded-lg text-sm font-bold transition-all duration-200 bg-purple-500/15 text-purple-500 hover:bg-purple-500/25"
              onClick={() => toast.error("لینک جلسه جمعه هنوز قرار داده نشده است")}>
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                لینک جلسه جمعه قرار داده می‌شود
              </span>
            </button>
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
                        {toPersianDigits(req.date)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[var(--dash-muted)]/20" />
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {toPersianDigits(req.time)}
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
  );
}
