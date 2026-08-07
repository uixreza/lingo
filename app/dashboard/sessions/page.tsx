"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Globe,
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
  BookOpen,
  Check,
  X,
} from "lucide-react";
import moment from "moment-jalaali";
import toast from "react-hot-toast";

const timeSlots = [
  { value: "08:30", label: "۰۸:۳۰ تا ۱۰:۰۰" },
  { value: "10:30", label: "۱۰:۳۰ تا ۱۲:۰۰" },
  { value: "12:30", label: "۱۲:۳۰ تا ۱۴:۰۰" },
];

const DEFAULT_MENTOR = {
  name: "رضا کمالی",
  photoUrl: "/me.png",
  certifications: [] as string[],
  languages: [] as string[],
  experience: "",
  education: "",
};


const languages = [
  { id: "en", label: "English", flag: "🇬🇧" },
  { id: "tr", label: "Turkish", flag: "🇹🇷" },
  { id: "de", label: "German", flag: "🇩🇪" },
];

const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const jMonthNames = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

function generateJalaaliMonthCells(jYear: number, jMonth: number) {
  const firstDay = moment(`${jYear}/${jMonth + 1}/1`, "jYYYY/jM/jD");
  const daysInMonth = firstDay.daysInMonth();
  const startWeekday = (firstDay.day() + 1) % 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function jToDateStr(jYear: number, jMonth: number, jDay: number) {
  return `${jYear}/${String(jMonth + 1).padStart(2, "0")}/${String(jDay).padStart(2, "0")}`;
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
  const [language, setLanguage] = useState("en");
  const [reason, setReason] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string[]>>(
    {},
  );
  const [slotPickerDate, setSlotPickerDate] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  const [requests, setRequests] = useState<SessionItem[]>([]);
  const [reservedSlots, setReservedSlots] = useState<
    { date: string; time: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [privatePrice, setPrivatePrice] = useState<number | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [cancelTarget, setCancelTarget] = useState<SessionItem | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [mentor, setMentor] = useState(DEFAULT_MENTOR);

  const handleCopyLink = async (id: number, link: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    setMounted(true);
    const fetchSessions = async () => {
      try {
        const [sessionsRes, priceRes, mentorRes] = await Promise.all([
          fetch("/api/sessions"),
          fetch("/api/sessions/price"),
          fetch("/api/mentor"),
        ]);
        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setRequests(data.sessions);
          setReservedSlots(data.reservedSlots ?? []);
        }
        if (priceRes.ok) {
          const { privatePrice, discountPercent } = await priceRes.json();
          setPrivatePrice(privatePrice);
          setDiscountPercent(discountPercent ?? 0);
        }
        if (mentorRes.ok) {
          const { mentor } = await mentorRes.json();
          if (mentor) {
            setMentor({
              name: mentor.name || DEFAULT_MENTOR.name,
              photoUrl: mentor.photoUrl || DEFAULT_MENTOR.photoUrl,
              certifications: Array.isArray(mentor.certifications)
                ? mentor.certifications
                : [],
              experience: mentor.experience || "",
              education: mentor.education || "",
              languages: Array.isArray(mentor.languages)
                ? mentor.languages
                : [],
            });
            setLanguage((prev) => {
              const available = new Set(mentor.languages ?? []);
              const prevLabel =
                languages.find((l) => l.id === prev)?.label ?? "";
              if (available.has(prevLabel)) return prev;
              return languages.find((l) => available.has(l.label))?.id ?? "";
            });
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const totalSlots = Object.values(selectedSlots).reduce(
    (sum, times) => sum + times.length,
    0,
  );

  const availableLanguages = new Set(mentor.languages ?? []);

  const discountedPrice = (p: number) =>
    discountPercent > 0
      ? Math.round((p * (100 - discountPercent)) / 100)
      : p;

  const canSubmit =
    language &&
    availableLanguages.has(
      languages.find((l) => l.id === language)?.label ?? "",
    ) &&
    totalSlots > 0;

  const toggleSlot = (dateStr: string, time: string) => {
    setSelectedSlots((prev) => {
      const current = prev[dateStr] ?? [];
      const next = current.includes(time)
        ? current.filter((t) => t !== time)
        : [...current, time];
      const updated = { ...prev };
      if (next.length === 0) delete updated[dateStr];
      else updated[dateStr] = next;
      return updated;
    });
  };

  const formatJalaliDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("/").map(Number);
    return `${toPersianDigits(String(d))} ${jMonthNames[m - 1]} ${toPersianDigits(String(y))}`;
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      let successCount = 0;
      let conflictCount = 0;
      for (const [dateStr, times] of Object.entries(selectedSlots)) {
        for (const time of times) {
          if (reservedByDate[dateStr]?.has(time)) {
            conflictCount++;
            continue;
          }
          const res = await fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionDate: dateStr,
              startTime: time,
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
          if (res.status === 409) {
            setReservedSlots((prev) => [...prev, { date: dateStr, time }]);
            conflictCount++;
            continue;
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
      }
      if (successCount === 0) {
        setErrorMsg("بازه انتخابی قبلاً رزرو شده است");
        toast.error("بازه انتخابی قبلاً رزرو شده است");
        return;
      }
      setSelectedSlots({});
      setReason("");
      toast.success(`درخواست ${successCount} جلسه با موفقیت ثبت شد`);
      if (conflictCount > 0) {
        toast.error(`${conflictCount} بازه به دلیل رزرو قبلی ثبت نشد`);
      }
      window.dispatchEvent(new Event("balance-update"));
    } catch (err) {
      setErrorMsg("خطا در برقراری ارتباط");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const handleCancelClick = (req: SessionItem) => {
    if (req.status === "Approved") {
      toast.error("این جلسه توسط استاد تأیید شده است و امکان لغو آن وجود ندارد");
      return;
    }
    setCancelTarget(req);
  };

  const confirmCancel = async () => {
    if (!cancelTarget || isCanceling) return;
    setIsCanceling(true);
    try {
      const res = await fetch(`/api/sessions/${cancelTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "خطا در لغو جلسه");
        return;
      }
      setRequests((prev) =>
        prev.map((r) =>
          r.id === cancelTarget.id ? { ...r, status: "Canceled" } : r,
        ),
      );
      setCancelTarget(null);
      toast.success("جلسه لغو شد و مبلغ به کیف پول شما بازگشت");
      window.dispatchEvent(new Event("balance-update"));
    } catch {
      toast.error("خطا در برقراری ارتباط");
    } finally {
      setIsCanceling(false);
    }
  };

  const pendingDates = new Set(
    requests.filter((r) => r.status === "Pending").map((r) => r.date),
  );

  const approvedDates = new Set(
    requests.filter((r) => r.status === "Approved").map((r) => r.date),
  );

  const reservedByDate: Record<string, Set<string>> = {};
  for (const s of reservedSlots) {
    (reservedByDate[s.date] ??= new Set()).add(s.time);
  }

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

  return isLoading ? (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start animate-pulse">
      <div className="lg:col-span-3 bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1 rounded-full bg-[var(--hover-bg-strong)]" />
          <div className="h-5 w-44 rounded bg-[var(--hover-bg-strong)]" />
        </div>
        <div className="space-y-7">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-3 w-32 rounded bg-[var(--hover-bg-strong)]" />
              <div className="h-24 rounded-xl bg-[var(--hover-bg)]" />
            </div>
          ))}
          <div className="h-14 rounded-xl bg-[var(--hover-bg)]" />
        </div>
      </div>
      <div className="lg:col-span-2 bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-5 w-36 rounded bg-[var(--hover-bg-strong)]" />
          <div className="h-5 w-10 rounded-full bg-[var(--hover-bg-strong)]" />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl p-5 bg-[var(--hover-bg)] space-y-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-[var(--hover-bg-strong)]" />
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded bg-[var(--hover-bg-strong)]" />
                  <div className="h-2.5 w-16 rounded bg-[var(--hover-bg-strong)]" />
                </div>
              </div>
              <div className="h-6 w-16 rounded-full bg-[var(--hover-bg-strong)]" />
            </div>
            <div className="h-2.5 w-full rounded bg-[var(--hover-bg-strong)]" />
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Pro Section (mobile only - above form) */}
        <div className="lg:hidden pro-border rounded-xl p-[2px]">
          <div className="bg-purple-500/10 backdrop-blur-xl rounded-[10px] p-4">
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
                کلاس‌های عمومی هر جمعه ساعت ۱۰:۰۰ تا ۱۱:۳۰
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
        </div>

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
                  const available = availableLanguages.has(lang.label);
                  const selected = language === lang.id;
                  return (
                    <button
                      key={lang.id}
                      onClick={() => available && setLanguage(lang.id)}
                      disabled={!available}
                      className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                        !available
                          ? "opacity-30 cursor-not-allowed"
                          : selected
                            ? "bg-green-500/10 ring-1 ring-green-500/40 text-green-400"
                            : "bg-[var(--hover-bg)] text-[var(--dash-text)] hover:bg-[var(--hover-bg-strong)]"
                      }`}>
                      <span className="text-2xl">{lang.flag}</span>
                      <span>{lang.label}</span>
                      {!available && (
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

            {/* Teacher Introduction */}
            <div className="relative bg-gradient-to-br from-purple-500/5 to-purple-500/[0.02] rounded-xl p-5 ring-1 ring-purple-500/10">
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
                      src={mentor.photoUrl}
                      alt={mentor.name}
                      width={256}
                      height={256}
                      unoptimized={mentor.photoUrl !== "/me.png"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="text-sm font-bold text-[var(--dash-text)]">
                      {mentor.name}
                    </p>
                    {mentor.certifications.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {mentor.experience && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-purple-400/50" />
                        <span className="text-[11px] text-[var(--dash-muted)]">{mentor.experience}</span>
                      </div>
                    )}
                    {mentor.education && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-purple-400/50" />
                        <span className="text-[11px] text-[var(--dash-muted)]">{mentor.education}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Time */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">
                    ۲
                  </span>
                  <label className="text-sm font-medium text-[var(--dash-muted)]">
                    تاریخ و ساعت جلسه
                  </label>
                </div>
                <div className="space-y-4">
                  {/* Month Grids */}
                  {mounted && (
                    <div className="relative">
                    <div className="flex gap-6 overflow-x-auto pb-2" style={{ direction: "ltr" }}>
                      {(() => {
                        const now = moment();
                        const jNowYear = now.jYear();
                        const jNowMonth = now.jMonth();
                        const todayStr = now.format("jYYYY/jMM/jDD");
                        return [0, 1, 2].map((offset) => {
                          const jm = jNowMonth + offset;
                          const jy = jNowYear + Math.floor(jm / 12);
                          const jMonthIdx = jm % 12;
                          const cells = generateJalaaliMonthCells(jy, jMonthIdx);
                          const weeks: (number | null)[][] = [];
                          for (let i = 0; i < cells.length; i += 7) {
                            weeks.push(cells.slice(i, i + 7));
                          }
                          return (
                            <div key={`${jy}-${jMonthIdx}`} className="flex flex-col items-center shrink-0">
                              <div className="grid grid-cols-7 gap-0.5">
                                {weekDays.map((wd) => (
                                  <div key={wd} className="w-9 h-6 flex items-center justify-center text-[10px] font-bold text-[var(--dash-muted)]">
                                    {wd}
                                  </div>
                                ))}
                                {weeks.map((week, wi) =>
                                  week.map((day, di) => {
                                    if (day === null) return <div key={`e-${wi}-${di}`} className="w-9 h-9" />;
                                    const dateStr = jToDateStr(jy, jMonthIdx, day);
                                    const isPast = dateStr < todayStr;
                                    const isToday = dateStr === todayStr;
                                    const selectedTimes = selectedSlots[dateStr] ?? [];
                                    const isSelected = selectedTimes.length > 0;
                                    const isPending = pendingDates.has(dateStr);
                                    const isApproved = approvedDates.has(dateStr);
                                    const dateReservedTimes = reservedByDate[dateStr];
                                    const isFullyReserved = dateReservedTimes
                                      ? timeSlots.every((t) => dateReservedTimes.has(t.value))
                                      : false;
                                    const isAvailable = dateStr > todayStr;
                                    return (
                                      <div
                                        key={dateStr}
                                        onClick={() => isAvailable && !isPending && !isApproved && !isFullyReserved && setSlotPickerDate(dateStr)}
                                        className={`relative w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-150 ${
                                          isToday
                                            ? "bg-purple-500/15 text-purple-500 dark:text-purple-400 ring-1 ring-purple-500/30 font-bold"
                                            : isApproved
                                              ? "bg-green-500 text-black font-bold ring-1 ring-green-500/60 cursor-not-allowed"
                                              : isPending
                                                ? "bg-amber-500/10 text-amber-500 font-bold ring-1 ring-amber-500/40 cursor-not-allowed"
                                                : isFullyReserved
                                                  ? "bg-red-500/10 text-red-500 ring-1 ring-red-500/30 cursor-not-allowed"
                                                  : isSelected
                                                    ? "bg-green-500/10 text-green-500 font-bold"
                                                    : isPast
                                                      ? "bg-[var(--hover-bg)]/50 text-[var(--dash-muted)]/40"
                                                      : "bg-[var(--hover-bg)] text-[var(--dash-text)] hover:bg-green-500/15 hover:text-green-500 cursor-pointer"
                                        }`}>
                                        {day}
                                        {!isToday && isApproved ? (
                                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                                            <Check className="h-2 w-2 text-green-600" strokeWidth={3} />
                                          </div>
                                        ) : isPending ? (
                                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center">
                                            <Loader2 className="h-2 w-2 text-black animate-spin" strokeWidth={3} />
                                          </div>
                                        ) : isFullyReserved ? (
                                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center">
                                            <Lock className="h-2 w-2 text-black" strokeWidth={3} />
                                          </div>
                                        ) : (
                                          isSelected && (
                                            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 min-w-3.5 px-0.5 bg-green-500 rounded-full flex items-center justify-center">
                                              <span className="text-[8px] font-black text-black leading-none">
                                                {toPersianDigits(String(selectedTimes.length))}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                              <span className="text-[10px] font-bold text-[var(--dash-muted)] mt-1.5">
                                {jMonthNames[jMonthIdx]}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                    </div>
                  )}
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

            {/* Price */}
            <div className="bg-gradient-to-r from-green-500/8 to-emerald-500/5 rounded-xl p-5 ring-1 ring-green-500/10">
              {discountPercent > 0 && privatePrice !== null && (
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-green-500/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">
                      {toPersianDigits(String(discountPercent))}٪ تخفیف
                    </span>
                    <span className="text-sm font-medium text-[var(--dash-muted)]">
                      قیمت اصلی
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[var(--dash-muted)]/60 line-through text-left" dir="ltr">
                      {(totalSlots > 0 ? totalSlots * privatePrice : privatePrice).toLocaleString("fa-IR")}
                    </span>
                    <span className="text-xs text-[var(--dash-muted)]/60">
                      تومان
                    </span>
                  </div>
                </div>
              )}
              {totalSlots > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--dash-muted)]">
                      تعداد جلسات
                    </span>
                    <span className="text-sm font-bold text-[var(--dash-text)]">
                      {totalSlots} جلسه
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-green-500/10">
                    <span className="text-sm font-medium text-[var(--dash-muted)]">
                      قیمت کل
                    </span>
                    <span className="text-2xl font-black text-[var(--dash-text)] text-left">
                      {privatePrice === null ? (
                        <span className="flex items-end gap-1" dir="ltr">
                          <span className="w-1.5 h-1.5 bg-[var(--dash-text)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 bg-[var(--dash-text)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 bg-[var(--dash-text)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                      ) : (
                        (totalSlots * discountedPrice(privatePrice)).toLocaleString("fa-IR")
                      )}
                      {privatePrice !== null && (
                        <span className="text-xs font-bold text-[var(--dash-muted)] mr-1">
                          تومان
                        </span>
                      )}
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
                    {privatePrice === null ? (
                      <span className="flex items-end gap-1" dir="ltr">
                        <span className="w-1.5 h-1.5 bg-[var(--dash-text)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-[var(--dash-text)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-[var(--dash-text)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    ) : (
                      discountedPrice(privatePrice).toLocaleString("fa-IR")
                    )}
                    {privatePrice !== null && (
                      <span className="text-xs font-bold text-[var(--dash-muted)] mr-1">
                        تومان
                      </span>
                    )}
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

          {/* Pro Section (desktop only) */}
          <div className="hidden lg:block pro-border rounded-xl p-[2px] mb-5">
            <div className="bg-[var(--hover-bg)] rounded-[10px] p-4">
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
                  کلاس‌های عمومی هر جمعه ساعت ۱۰:۰۰ تا ۱۱:۳۰ با مدرس {mentor.name}
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
            {filteredRequests.length === 0 ? (
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
                  className="relative bg-[var(--hover-bg)] rounded-2xl shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                  <div className="px-5 pt-5 pb-5">
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
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusBg[req.status]} ${statusColors[req.status]}`}>
                            {statusLabel[req.status]}
                          </span>
                          {req.status !== "Canceled" && (
                            <button
                              onClick={() => handleCancelClick(req)}
                              title={
                                req.status === "Approved"
                                  ? "جلسه تأیید شده قابل لغو نیست"
                                  : "لغو جلسه"
                              }
                              className={`p-1.5 rounded-full transition-all duration-200 ${
                                req.status === "Approved"
                                  ? "bg-[var(--hover-bg-strong)] text-[var(--dash-muted)]/40 cursor-not-allowed"
                                  : "bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:scale-110"
                              }`}>
                              {req.status === "Approved" ? (
                                <Lock className="h-3.5 w-3.5" />
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Language → Teacher */}
                      <div className="mt-4 flex items-center justify-between gap-2 bg-[var(--hover-bg)] rounded-xl px-4 py-3">
                        <div className="min-w-0 text-center flex-1">
                          <p className="text-[10px] text-[var(--dash-muted)]">
                            زبان
                          </p>
                          <p className="text-sm font-bold text-[var(--dash-text)] truncate mt-0.5">
                            {req.language}
                          </p>
                        </div>
                        <BookOpen className="h-4 w-4 text-[var(--dash-muted)] shrink-0" />
                        <div className="min-w-0 text-center flex-1">
                          <p className="text-[10px] text-[var(--dash-muted)]">
                            مدرس
                          </p>
                          <p className="text-sm font-bold text-[var(--dash-text)] truncate mt-0.5">
                            {mentor.name}
                          </p>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-[10px] text-[var(--dash-muted)]">
                            تاریخ
                          </p>
                          <p className="text-xs font-bold text-[var(--dash-text)] mt-0.5">
                            {toPersianDigits(req.date)}
                          </p>
                        </div>
                        <div className="border-x border-dashed border-[var(--dash-muted)]/15">
                          <p className="text-[10px] text-[var(--dash-muted)]">
                            ساعت
                          </p>
                          <p className="text-xs font-bold text-[var(--dash-text)] mt-0.5">
                            {toPersianDigits(req.time)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[var(--dash-muted)]">
                            نوع
                          </p>
                          <p className="text-xs font-bold text-[var(--dash-text)] mt-0.5">
                            {req.type === "Private" ? "خصوصی" : "عمومی"}
                          </p>
                        </div>
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

        {/* Slot picker modal */}
        {slotPickerDate && (
          <div className="fixed inset-0 z-[60] lg:flex lg:items-center lg:justify-center lg:p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSlotPickerDate(null)}
            />
            <div className="fixed bottom-0 inset-x-0 z-[60] bg-[var(--dash-sides)] shadow-2xl rounded-t-3xl p-6 pb-8 max-h-[85dvh] overflow-y-auto animate-[sheet-up_0.3s_ease-out] lg:static lg:animate-none lg:rounded-2xl lg:pb-6 lg:w-full lg:max-w-sm">
              <div className="flex justify-center pt-0 pb-3 lg:hidden">
                <div className="w-12 h-1.5 bg-[var(--dash-muted)]/25 rounded-full" />
              </div>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-green-500/15 shrink-0">
                  <CalendarDays className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--dash-text)]">
                    انتخاب ساعت جلسه
                  </h3>
                  <p className="text-sm text-[var(--dash-muted)] mt-0.5">
                    {formatJalaliDate(slotPickerDate)}
                  </p>
                </div>
              </div>
              <div className="space-y-2.5">
                {timeSlots.map((slot) => {
                  const reserved =
                    reservedByDate[slotPickerDate]?.has(slot.value) ?? false;
                  const selected =
                    selectedSlots[slotPickerDate]?.includes(slot.value) ?? false;
                  return (
                    <button
                      key={slot.value}
                      onClick={() => toggleSlot(slotPickerDate, slot.value)}
                      disabled={reserved}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                        reserved
                          ? "bg-red-500/10 text-red-500/70 ring-1 ring-red-500/20 cursor-not-allowed"
                          : selected
                            ? "bg-green-500 text-black shadow-lg shadow-green-500/25"
                            : "bg-[var(--hover-bg)] text-[var(--dash-text)] hover:bg-[var(--hover-bg-strong)]"
                      }`}>
                      <span className="flex items-center gap-2.5">
                        {reserved ? (
                          <Lock className="h-4 w-4" />
                        ) : selected ? (
                          <Check className="h-4 w-4" strokeWidth={3} />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-[var(--dash-muted)]/50" />
                        )}
                        {slot.label}
                      </span>
                      {selected && !reserved && (
                        <span className="text-[10px] opacity-80">
                          انتخاب شد
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setSlotPickerDate(null)}
                className="w-full mt-6 py-3 rounded-xl bg-green-500 text-black font-bold hover:bg-green-400 transition-all duration-200 shadow-lg shadow-green-500/25">
                تأیید
              </button>
            </div>
          </div>
        )}

        {/* Cancel confirmation modal */}
        {cancelTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setCancelTarget(null)}
            />
            <div className="relative w-full max-w-sm bg-[var(--dash-sides)] rounded-2xl shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-red-500/15 shrink-0">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-[var(--dash-text)]">
                  لغو جلسه
                </h3>
              </div>
              <p className="text-sm text-[var(--dash-muted)] leading-relaxed mb-4">
                آیا از لغو جلسه خود در تاریخ{" "}
                <span className="font-bold text-[var(--dash-text)]">
                  {toPersianDigits(cancelTarget.date)}
                </span>{" "}
                مطمئن هستید؟
              </p>
              <p className="text-[11px] text-[var(--dash-muted)] leading-relaxed mb-6">
                «مبلغ این جلسه به کیف پول شما بازگردانده خواهد شد»
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelTarget(null)}
                  disabled={isCanceling}
                  className="flex-[2] py-3 rounded-xl bg-green-500 text-black font-bold hover:bg-green-400 transition-all duration-200 disabled:opacity-60 shadow-lg shadow-green-500/20">
                  نه، منصرف شدم
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={isCanceling}
                  className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold ring-1 ring-red-500/20 hover:bg-red-500/20 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2">
                  {isCanceling && <Loader2 className="h-4 w-4 animate-spin" />}
                  بله، لغو کن
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
}
