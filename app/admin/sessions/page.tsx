"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  Hourglass,
  XCircle,
  CalendarDays,
  Clock,
  Users,
  User,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  GraduationCap,
  ShieldCheck,
  Video,
  Globe,
  X,
  ClipboardCheck,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { ListSkeleton } from "@/components/dashboard/Skeletons";
import Avatar from "@/components/dashboard/Avatar";

type SessionStatus = "Approved" | "Pending" | "Canceled";

interface SessionRequest {
  id: number;
  studentName: string;
  studentEmail: string | null;
  date: string;
  time: string;
  language: string;
  level: string;
  type: "Public" | "Private";
  reason?: string;
  status: SessionStatus;
  meetLink: string;
}

function toFaDigits(value: number | string): string {
  const digits = "۰۱۲۳۴۵۶۷۸۹";
  return String(value).replace(/[0-9]/g, (d) => digits[+d]);
}

function toFaGrouped(value: number): string {
  return toFaDigits(value.toLocaleString("en-US"));
}

function CountUp({
  value,
  duration = 900,
}: {
  value: number;
  duration?: number;
}) {
  const shown = useRef(0);
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const from = shown.current;
    const to = value;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = Math.round(from + (to - from) * eased);
      shown.current = current;
      setDisplay(current);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return <>{toFaGrouped(display)}</>;
}

const listVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
};

const statusConfig: Record<
  SessionStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
    glow: string;
    icon: typeof CheckCircle2;
  }
> = {
  Approved: {
    label: "تأیید شده",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/25",
    dot: "bg-green-500",
    glow: "shadow-green-500/20",
    icon: CheckCircle2,
  },
  Pending: {
    label: "در انتظار",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/25",
    dot: "bg-orange-500",
    glow: "shadow-orange-500/20",
    icon: Hourglass,
  },
  Canceled: {
    label: "لغو شده",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    dot: "bg-red-500",
    glow: "shadow-red-500/20",
    icon: XCircle,
  },
};

const statusOrder: SessionStatus[] = ["Pending", "Approved", "Canceled"];

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionRequest | null>(
    null,
  );
  const [meetLinkInput, setMeetLinkInput] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<SessionStatus | "all">("all");
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const fetchSessions = async () => {
    const res = await fetch("/api/admin/sessions");
    if (!res.ok) throw new Error();
    return (await res.json()) as SessionRequest[];
  };

  const applySessions = useCallback((data: SessionRequest[]) => {
    setSessions(data);
    setSelectedSession((current) =>
      current ? (data.find((s) => s.id === current.id) ?? current) : null,
    );
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        applySessions(await fetchSessions());
      } catch (err) {
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    void run();
  }, [applySessions]);

  const handleRefresh = async () => {
    if (loading || refreshing) return;
    setRefreshing(true);
    try {
      applySessions(await fetchSessions());
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesFilter = filter === "all" || s.status === filter;
    const matchesSearch =
      searchQuery === "" ||
      s.studentName.includes(searchQuery) ||
      (s.studentEmail ?? "").includes(searchQuery) ||
      s.language.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const updateSession = async (id: number, data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (res.ok) {
        const updated: SessionRequest = await res.json();
        setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
        setSelectedSession(updated);
        if (data.status) {
          toast.success(
            `وضعیت جلسه به «${statusConfig[data.status as SessionStatus].label}» تغییر کرد`,
            { duration: 2500 },
          );
        } else {
          toast.success("لینک جلسه ذخیره شد", { duration: 2500 });
        }
      } else {
        toast.error("ذخیره‌سازی با خطا مواجه شد");
      }
    } catch (err) {
      console.error("Error updating session:", err);
      toast.error("خطا در برقراری ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectSession = (session: SessionRequest) => {
    setSelectedSession(session);
    setMeetLinkInput(session.meetLink);
    setMobileView("detail");
  };

  const handleSaveMeetLink = () => {
    if (!selectedSession) return;
    updateSession(selectedSession.id, { meetUrl: meetLinkInput });
  };

  const handleStatusChange = (id: number, status: SessionStatus) => {
    updateSession(id, { status });
  };

  const handleCopyLink = (id: number, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const detailConfig = selectedSession
    ? statusConfig[selectedSession.status]
    : null;
  const DetailStatusIcon = detailConfig ? detailConfig.icon : CheckCircle2;

  const stats = [
    {
      label: "کل درخواست‌ها",
      value: sessions.length,
      icon: GraduationCap,
      color: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/10",
      accent: "from-blue-500/30",
    },
    {
      label: "تأیید شده",
      value: sessions.filter((s) => s.status === "Approved").length,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-500/10",
      accent: "from-green-500/30",
    },
    {
      label: "در انتظار",
      value: sessions.filter((s) => s.status === "Pending").length,
      icon: Hourglass,
      color: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-500/10",
      accent: "from-orange-500/30",
    },
    {
      label: "لغو شده",
      value: sessions.filter((s) => s.status === "Canceled").length,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-500/10",
      accent: "from-red-500/30",
    },
  ];

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              className="relative overflow-hidden group rounded-2xl p-5 shadow-lg border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:border-[var(--dash-accent)]/40">
              <div
                className={`pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br ${stat.accent} to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div
                className={`relative z-10 inline-flex p-2.5 rounded-xl ${stat.iconBg} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="relative z-10 text-2xl font-bold tabular-nums text-[var(--dash-text)]">
                <CountUp value={stat.value} />
              </p>
              <p
                className="relative z-10 text-sm mt-1"
                style={{ color: "var(--dash-muted)" }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Sessions List */}
          <div className={`${mobileView === "list" ? "" : "hidden "}lg:block lg:col-span-2`}>
            <div className="bg-[var(--dash-sides)]/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[var(--dash-muted)]/15 dark:border-white/20 overflow-hidden">
              {/* Search */}
              <div className="p-4 border-b border-[var(--dash-muted)]/10">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] peer-focus-within:text-green-500 transition-colors pointer-events-none">
                      <Search className="h-5 w-5" />
                    </span>
                    <input
                      type="text"
                      placeholder="جستجوی دانشجو، ایمیل یا زبان..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pr-11 pl-4 py-2.5 rounded-xl outline-none transition-all focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] text-[var(--dash-text)] placeholder:text-[var(--dash-muted)]/60 text-right"
                      style={{ backgroundColor: "var(--dash-bg)" }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
                    title="به‌روزرسانی"
                    aria-label="به‌روزرسانی"
                    className="p-2.5 rounded-xl border border-[var(--dash-muted)]/15 text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-white/5 transition-all duration-300 disabled:opacity-50 shrink-0">
                    <RefreshCw
                      size={16}
                      className={refreshing ? "animate-spin" : ""}
                    />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-2 border-b border-[var(--dash-muted)]/10">
                {(["all", ...statusOrder] as const).map((key) => {
                  const isActive = filter === key;
                  const cfg = key === "all" ? null : statusConfig[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`relative flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                        isActive
                          ? "text-white"
                          : `text-[var(--dash-muted)] hover:text-[var(--dash-text)] ${
                              cfg ? cfg.color : ""
                            }`
                      }`}>
                      {isActive && (
                        <motion.span
                          layoutId="session-filter-pill"
                          className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] shadow-lg shadow-[var(--dark-purple)]/30"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 32,
                          }}
                        />
                      )}
                      <span className="relative z-10">
                        {key === "all" ? "همه" : cfg?.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* List */}
              <div className="max-h-[560px] overflow-y-auto">
                {loading ? (
                  <ListSkeleton count={3} />
                ) : filteredSessions.length === 0 ? (
                  <div
                    className="text-center py-14"
                    style={{ color: "var(--dash-muted)" }}>
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-[var(--hover-bg)] flex items-center justify-center mb-3">
                      <CalendarDays className="h-6 w-6 opacity-60" />
                    </div>
                    <p>جلسه‌ای یافت نشد</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {filteredSessions.map((session, i) => {
                      const cfg = statusConfig[session.status];
                      const StatusIcon = cfg.icon;
                      const isSelected = selectedSession?.id === session.id;
                      return (
                        <motion.button
                          key={session.id}
                          variants={listVariants}
                          initial="initial"
                          animate="animate"
                          exit={{ opacity: 0, transition: { duration: 0.15 } }}
                          onClick={() => handleSelectSession(session)}
                          className={`w-full p-4 text-right border-b border-[var(--dash-muted)]/10 transition-all duration-300 group ${
                            isSelected
                              ? "bg-[var(--dash-bg)]/80"
                              : "hover:bg-white/5"
                          }`}>
                          <div className="flex items-start gap-3">
                            <div className="relative shrink-0">
                              <div className="p-3 rounded-2xl bg-[var(--dash-bg)] border border-[var(--dash-muted)]/10 group-hover:scale-105 transition-transform duration-300">
                                <StatusIcon
                                  className={`h-5 w-5 ${cfg.color}`}
                                />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p
                                  className="font-semibold text-sm truncate"
                                  style={{ color: "var(--dash-text)" }}>
                                  {session.studentName}
                                </p>
                                <span
                                  className="h-2 w-2 rounded-full shrink-0"
                                  style={{
                                    backgroundColor: cfg.dot,
                                    boxShadow: `0 0 8px ${cfg.dot}`,
                                  }}
                                />
                              </div>
                              <p
                                className="text-xs mb-1"
                                style={{ color: "var(--dash-muted)" }}>
                                {session.language} • سطح {session.level} •{" "}
                                {session.type === "Private" ? "خصوصی" : "عمومی"}
                              </p>
                              <div
                                className="flex items-center gap-3 text-[11px]"
                                style={{ color: "var(--dash-muted)" }}>
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3" />
                                  {session.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {session.time}
                                </span>
                              </div>
                            </div>
                          </div>
                          <motion.div
                            className={`mt-3 rounded-full inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                            <StatusIcon className="h-3 w-3" />
                            {cfg.label}
                          </motion.div>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>

          {/* Right: Session Detail */}
          <div className={`${mobileView === "detail" ? "" : "hidden "}lg:block lg:col-span-3`}>
            {selectedSession ? (
              <motion.div
                key={selectedSession.id}
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative overflow-hidden bg-[var(--dash-sides)]/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[var(--dash-muted)]/15 dark:border-white/20">
                <div className="pointer-events-none absolute -top-28 -right-16 h-64 w-64 rounded-full bg-[var(--dash-accent)]/15 blur-3xl" />
                <div className="relative">
                  {/* Header */}
                  <div className="p-6 border-b border-[var(--dash-muted)]/10">
                    {/* Mobile back button */}
                    <button
                      onClick={() => setMobileView("list")}
                      className="lg:hidden flex items-center gap-2 text-sm text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors mb-4">
                      <ArrowRight className="h-4 w-4" />
                      بازگشت به فهرست
                    </button>
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="shrink-0 relative">
                          <div
                            className={`rounded-2xl p-[2px] ${
                              selectedSession.status === "Approved"
                                ? "green-border"
                                : "bg-[var(--dash-bg)]"
                            }`}>
                            <Avatar
                              seed={selectedSession.studentName}
                              size={60}
                              className="rounded-2xl"
                            />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h2
                            className="text-xl font-bold truncate"
                            style={{ color: "var(--dash-text)" }}>
                            {selectedSession.studentName}
                          </h2>
                          <p
                            className="text-sm mt-0.5 truncate"
                            style={{ color: "var(--dash-muted)" }}>
                            {selectedSession.studentEmail ?? "---"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${detailConfig!.bg} ${detailConfig!.color} ${detailConfig!.border}`}>
                        <DetailStatusIcon className="h-3.5 w-3.5" />
                        {statusConfig[selectedSession.status].label}
                      </span>
                    </div>

                    {/* Meta grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        {
                          icon: CalendarDays,
                          label: "تاریخ",
                          value: selectedSession.date,
                        },
                        {
                          icon: Clock,
                          label: "ساعت",
                          value: selectedSession.time,
                        },
                        {
                          icon: Globe,
                          label: "زبان",
                          value: selectedSession.language,
                        },
                        {
                          icon: User,
                          label: "سطح",
                          value: `سطح ${selectedSession.level}`,
                        },
                        {
                          icon:
                            selectedSession.type === "Public" ? Users : User,
                          label: "نوع",
                          value:
                            selectedSession.type === "Public"
                              ? "جلسه عمومی"
                              : "جلسه خصوصی",
                        },
                        {
                          icon: ClipboardCheck,
                          label: "وضعیت",
                          value: statusConfig[selectedSession.status].label,
                        },
                      ].map((meta) => (
                        <div
                          key={meta.label}
                          className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10">
                          <div className="p-1.5 rounded-lg bg-[var(--dash-accent)]/10 shrink-0">
                            <meta.icon className="h-4 w-4 text-[var(--dash-accent)]" />
                          </div>
                          <div className="min-w-0">
                            <p
                              className="text-[10px]"
                              style={{ color: "var(--dash-muted)" }}>
                              {meta.label}
                            </p>
                            <p
                              className="text-sm font-medium truncate"
                              style={{ color: "var(--dash-text)" }}>
                              {meta.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedSession.reason && (
                      <div
                        className="mt-4 p-4 rounded-2xl bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10 relative overflow-hidden">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--dash-accent)]/50 to-transparent" />
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-[var(--dash-accent)]/15 shrink-0">
                            <MessageSquare className="h-4 w-4 text-[var(--dash-accent)]" />
                          </div>
                          <div>
                            <p
                              className="text-xs font-medium mb-1 flex items-center gap-2"
                              style={{ color: "var(--dash-muted)" }}>
                              دلیل یادگیری
                            </p>
                            <p
                              className="text-sm leading-relaxed"
                              style={{ color: "var(--dash-text)" }}>
                              {selectedSession.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Online Meet Link */}
                  <div className="p-6 border-b border-[var(--dash-muted)]/10">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="p-2 rounded-xl bg-green-500/10">
                        <Video className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <h3
                        className="font-bold text-sm"
                        style={{ color: "var(--dash-text)" }}>
                        لینک جلسه آنلاین
                      </h3>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="url"
                          value={meetLinkInput}
                          onChange={(e) => setMeetLinkInput(e.target.value)}
                          placeholder="https://meet.google.com/... یا https://zoom.us/j/..."
                          className="w-full px-4 py-3 rounded-xl outline-none focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] text-left text-sm bg-[var(--dash-bg)] text-[var(--dash-text)] placeholder:text-[var(--dash-muted)]/60 transition-all"
                          style={{ direction: "ltr" }}
                        />
                      </div>
                      <motion.button
                        whileHover={
                          saving ||
                          !meetLinkInput.trim() ||
                          meetLinkInput === selectedSession.meetLink
                            ? {}
                            : { scale: 1.02 }
                        }
                        whileTap={saving ? {} : { scale: 0.98 }}
                        onClick={handleSaveMeetLink}
                        disabled={
                          saving ||
                          !meetLinkInput.trim() ||
                          meetLinkInput === selectedSession.meetLink
                        }
                        className="px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 disabled:opacity-50 shadow-lg disabled:cursor-not-allowed bg-gradient-to-l from-green-500 to-emerald-500 shadow-green-500/25">
                        {saving ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            در حال ذخیره...
                          </span>
                        ) : (
                          "ذخیره"
                        )}
                      </motion.button>
                    </div>

                    {selectedSession.meetLink && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10">
                        <span
                          className="text-xs truncate flex-1 font-mono"
                          style={{
                            color: "var(--dash-muted)",
                            direction: "ltr",
                          }}>
                          {selectedSession.meetLink}
                        </span>
                        <button
                          onClick={() =>
                            handleCopyLink(
                              selectedSession.id,
                              selectedSession.meetLink,
                            )
                          }
                          className="p-1.5 rounded-lg transition-all hover:bg-white/10 hover:scale-105"
                          aria-label="کپی لینک">
                          {copiedId === selectedSession.id ? (
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                              کپی شد
                            </span>
                          ) : (
                            <Copy
                              className="h-3.5 w-3.5"
                              style={{ color: "var(--dash-muted)" }}
                            />
                          )}
                        </button>
                        <a
                          href={selectedSession.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg transition-colors hover:bg-white/10 hover:scale-105"
                          aria-label="باز کردن لینک">
                          <ExternalLink
                            className="h-3.5 w-3.5"
                            style={{ color: "var(--dash-muted)" }}
                          />
                        </a>
                      </motion.div>
                    )}
                  </div>

                  {/* Status Management */}
                  <div className="p-6">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="p-2 rounded-xl bg-[var(--dash-accent)]/10">
                        <ShieldCheck className="h-4 w-4 text-[var(--dash-accent)]" />
                      </div>
                      <h3
                        className="font-bold text-sm"
                        style={{ color: "var(--dash-text)" }}>
                        تغییر وضعیت جلسه
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {statusOrder.map((status) => {
                        const cfg = statusConfig[status];
                        const isActive = selectedSession.status === status;
                        return (
                          <motion.button
                            key={status}
                            whileHover={
                              isActive || saving ? {} : { scale: 1.02 }
                            }
                            whileTap={isActive || saving ? {} : { scale: 0.98 }}
                            onClick={() =>
                              !isActive &&
                              handleStatusChange(selectedSession.id, status)
                            }
                            disabled={isActive || saving}
                            className={`relative flex-1 py-3.5 rounded-xl font-medium transition-all duration-300 text-sm flex items-center justify-center gap-2 border ${
                              isActive
                                ? `${cfg.bg} ${cfg.color} ${cfg.border} cursor-default shadow-lg ${cfg.glow}`
                                : "border-[var(--dash-muted)]/20 text-[var(--dash-muted)] hover:bg-white/5 hover:border-[var(--dash-muted)]/40 disabled:opacity-50"
                            }`}>
                            {saving && !isActive ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isActive ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <cfg.icon className="h-4 w-4" />
                            )}
                            {cfg.label}
                          </motion.button>
                        );
                      })}
                    </div>
                    <p
                      className="text-[11px] mt-4 text-center"
                      style={{ color: "var(--dash-muted)" }}>
                      با تغییر وضعیت، تاریخ دقیق تأیید یا لغو به صورت خودکار ثبت
                      می‌شود
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="relative overflow-hidden flex items-center justify-center h-full min-h-[420px] rounded-2xl bg-[var(--dash-sides)]/60 backdrop-blur-sm border border-dashed border-[var(--dash-muted)]/25">
                <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[var(--dash-accent)]/10 blur-3xl" />
                <div className="relative text-center py-16 px-6">
                  <div className="mx-auto w-16 h-16 mb-4 rounded-3xl bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] flex items-center justify-center shadow-lg shadow-[var(--dark-purple)]/25">
                    <User className="h-7 w-7 text-white" />
                  </div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: "var(--dash-text)" }}>
                    جلسه‌ای انتخاب نشده
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--dash-muted)" }}>
                    از فهرست روبه‌رو یک جلسه را انتخاب کنید تا جزئیات آن نمایش
                    داده شود
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}