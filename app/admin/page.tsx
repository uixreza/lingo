"use client";

import { useState, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useSession } from "next-auth/react";
import {
  DollarSign,
  CalendarCheck,
  Download,
  Activity,
  UserPlus,
  LogIn,
  Receipt,
  Video,
  Ticket,
  FileText,
  Loader2,
  TrendingUp,
  Sparkles,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  GraduationCap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  LineChart,
  Sparkline,
  ResponsiveChart,
  type ThemeName,
} from "@derpdaderp/chartkit";
import { useTheme } from "next-themes";
import moment from "moment-jalaali";
import MarqueeSection from "@/components/admin/MarqueeSection";
import type { AdminLogEntry } from "@/app/api/admin/logs/route";

const emptySubscribe = () => () => {};

function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

const FARSI_DAYS = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];
const FARSI_MONTHS = [
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

const LOG_PAGE_SIZE = 8;

function timeAgo(dateISO: string): string {
  const diff = Date.now() - new Date(dateISO).getTime();
  const seconds = Math.max(0, Math.floor(diff / 1000));
  if (seconds < 60) return "لحظاتی پیش";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ساعت پیش`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} روز پیش`;
  return moment(dateISO).format("jYYYY/jMM/jDD");
}

const LOG_ICONS: Record<string, typeof UserPlus> = {
  register: UserPlus,
  login: LogIn,
  transaction: Receipt,
  session: Video,
  ticket: Ticket,
  post: FileText,
};

const LOG_COLORS: Record<string, { color: string; iconBg: string }> = {
  register: { color: "text-green-600 dark:text-green-400", iconBg: "bg-green-500/10" },
  login: { color: "text-sky-600 dark:text-sky-400", iconBg: "bg-sky-500/10" },
  transaction: { color: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-500/10" },
  session: { color: "text-violet-600 dark:text-violet-400", iconBg: "bg-violet-500/10" },
  ticket: { color: "text-rose-600 dark:text-rose-400", iconBg: "bg-rose-500/10" },
  post: { color: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-500/10" },
};

function toFa(value: number | string): string {
  const digits = "۰۱۲۳۴۵۶۷۸۹";
  return String(value).replace(/[0-9]/g, (d) => digits[+d]);
}

function toFaGrouped(value: number): string {
  return toFa(value.toLocaleString("en-US"));
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

export default function DashboardPage() {
  const mounted = useHydrated();
  const { data: session } = useSession();
  const { theme } = useTheme();
  const chartTheme: ThemeName = theme === "dark" ? "emerald" : "latte";

  const [stats, setStats] = useState<{
    currentMonth: {
      transactionCount: number;
      transactionVolume: number;
      sessionCount: number;
    };
    dailyTransactions: number[];
    dailySessions: number[];
  } | null>(null);

  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [visibleCount, setVisibleCount] = useState(LOG_PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setStats(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/logs", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setLogs(d);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingLogs(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const transactionData =
    stats?.dailyTransactions?.map((v, i) => ({
      day: String(i + 1),
      amount: Math.abs(v),
    })) ?? [];

  const sessionData =
    stats?.dailySessions?.map((v, i) => ({
      day: String(i + 1),
      count: v,
    })) ?? [];

  const sparkTransactions = stats?.dailyTransactions ?? [];
  const sparkSessions = stats?.dailySessions ?? [];

  const downloadLogs = () => {
    if (logs.length === 0) return;
    const lines = logs.map(
      (l) =>
        `[${moment(l.at).format("jYYYY/jMM/jDD HH:mm")}] (${l.type}) ${l.fullname} — ${l.message}`,
    );
    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lingofam-logs-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const visibleLogs = useMemo(
    () => logs.slice(0, visibleCount),
    [logs, visibleCount],
  );

  const today = useMemo(() => {
    const m = moment();
    const weekday = FARSI_DAYS[m.day()];
    const month = FARSI_MONTHS[m.jMonth()];
    return `${weekday} ${toFa(m.jDate())} ${month} ${toFa(m.jYear())}`;
  }, []);

  const kpis = stats
    ? [
        {
          label: "تراکنش‌های ماه جاری",
          value: stats.currentMonth.transactionCount,
          icon: Receipt,
          iconBg: "bg-green-500/10",
          iconColor: "text-green-600 dark:text-green-400",
          spark: sparkTransactions,
          fill: true,
        },
        {
          label: "حجم تراکنش‌ها (تومان)",
          value: stats.currentMonth.transactionVolume,
          icon: DollarSign,
          iconBg: "bg-amber-500/10",
          iconColor: "text-amber-600 dark:text-amber-400",
          spark: sparkTransactions,
          fill: true,
        },
        {
          label: "کلاس‌های ماه جاری",
          value: stats.currentMonth.sessionCount,
          icon: GraduationCap,
          iconBg: "bg-violet-500/10",
          iconColor: "text-violet-600 dark:text-violet-400",
          spark: sparkSessions,
          fill: true,
        },
      ]
    : null;

  return (
    <div className="space-y-6">
      {/* Hero Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[var(--light-purple)] to-[var(--dark-purple)] p-6 sm:p-8 shadow-2xl text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/assets/img/mazePattern.svg')] bg-cover"></div>
        </div>
        <div className="pointer-events-none absolute -top-24 -right-10 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-extrabold">
                {mounted
                  ? `درود، ${session?.user?.fullname || "مدیر"} 👋`
                  : "درود، مدیر 👋"}
              </h1>
            </div>
            <p className="text-white/80 text-sm">
              به پنل مدیریت لینگوفم خوش آمدید
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-sm font-semibold transition-all duration-300">
              <TrendingUp className="h-4 w-4" />
              پنل مدیریت
            </span>
            <button
              onClick={downloadLogs}
              disabled={logs.length === 0}
              title="دانلود گزارش فعالیت‌ها"
              aria-label="دانلود گزارش فعالیت‌ها"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-sm font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed">
              <Download className="h-4 w-4" />
              گزارش فعالیت‌ها
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-6 flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/15 backdrop-blur-sm text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            {mounted ? today : ""}
          </div>
        </div>
      </motion.div>

      {/* KPI Stats */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="group relative overflow-hidden rounded-2xl p-5 shadow-lg border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[var(--dash-accent)]/40">
              <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-green-500/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${kpi.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--dash-muted)" }}>
                      {kpi.label}
                    </p>
                    <p
                      className="text-2xl font-extrabold tabular-nums mt-0.5"
                      style={{ color: "var(--dash-text)" }}>
                      <CountUp value={kpi.value} />
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative z-10">
                <Sparkline
                  data={kpi.spark}
                  height={40}
                  theme={chartTheme}
                  fill
                  color="#10b981"
                  glow
                  className="mt-1"
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-[var(--dash-sides)] p-5">
              <div className="h-full w-3/4 rounded-xl bg-[var(--hover-bg-strong)] animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          {
            title: "تراکنش‌های روزانه",
            icon: DollarSign,
            iconBg: "bg-green-500/10",
            iconColor: "text-green-600 dark:text-green-400",
            chart: (
              <ResponsiveChart height={280}>
                {({ width }) => (
                  <LineChart
                    data={transactionData}
                    timeKey="day"
                    series={[
                      {
                        key: "amount",
                        label: "مبلغ",
                        color: "#10b981",
                        area: true,
                      },
                    ]}
                    width={width}
                    height={280}
                    theme={chartTheme}
                    curve="monotone"
                    showDots
                    dotSize={3}
                    glow
                    grid={{ horizontal: true, vertical: false, opacity: 0.4 }}
                    areaGradient={{ from: 0.35, to: 0.04 }}
                    showLegend={false}
                    unit="تومان"
                  />
                )}
              </ResponsiveChart>
            ),
          },
          {
            title: "کلاس‌های روزانه",
            icon: CalendarCheck,
            iconBg: "bg-violet-500/10",
            iconColor: "text-violet-600 dark:text-violet-400",
            chart: (
              <ResponsiveChart height={280}>
                {({ width }) => (
                  <BarChart
                    data={sessionData}
                    dataKey="count"
                    categoryKey="day"
                    width={width}
                    height={280}
                    theme={chartTheme}
                    barRadius={6}
                  />
                )}
              </ResponsiveChart>
            ),
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
            className="min-w-0 overflow-hidden rounded-2xl shadow-lg border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl transition-all duration-300 hover:shadow-xl">
            <div
              className="p-6"
              style={{
                borderBottom: "1px solid var(--dash-muted)/10",
              }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "var(--dash-text)" }}>
                    {card.title}
                  </h2>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10"
                  style={{ color: "var(--dash-muted)" }}>
                  روزهای ماه جاری
                </span>
              </div>
            </div>
            <div className="p-4">{card.chart}</div>
          </motion.div>
        ))}
      </div>

      <MarqueeSection />

      {/* Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="rounded-2xl shadow-lg shadow-[var(--dash-muted)]/5 border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl">
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: "1px solid var(--dash-muted)/10" }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/10">
              <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--dash-text)" }}>
              فعالیت‌های اخیر
            </h2>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400">
            {toFa(logs.length)} مورد
          </span>
        </div>

        <div className="p-6">
          {loadingLogs ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 text-green-500 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-[var(--hover-bg)] flex items-center justify-center mb-4">
                <Activity
                  className="h-6 w-6"
                  style={{ color: "var(--dash-muted)" }}
                />
              </div>
              <p
                className="font-medium"
                style={{ color: "var(--dash-muted)" }}>
                هنوز فعالیتی ثبت نشده است
              </p>
            </motion.div>
          ) : (
            <>
              <div className="space-y-2.5">
                <AnimatePresence initial={false}>
                  {visibleLogs.map((log, i) => {
                    const color = LOG_COLORS[log.type] ?? {
                      color: "text-green-600 dark:text-green-400",
                      iconBg: "bg-green-500/10",
                    };
                    const Icon = LOG_ICONS[log.type] ?? Activity;
                    return (
                      <motion.div
                        key={log.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ delay: i * 0.04, duration: 0.25 }}
                        className="group flex items-center gap-3 p-3 rounded-xl border border-[var(--dash-muted)]/10 hover:border-[var(--dash-accent)]/30 hover:shadow-md hover:shadow-[var(--dash-accent)]/5 transition-all duration-300">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${color.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`h-4 w-4 ${color.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium text-[var(--dash-text)] truncate">
                            {log.message}
                          </p>
                          <p
                            className="text-xs text-[var(--dash-muted)] mt-0.5">
                            {log.fullname} • {timeAgo(log.at)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
                <span
                  className="text-sm tabular-nums"
                  style={{ color: "var(--dash-muted)" }}>
                  نمایش{" "}
                  {visibleCount > logs.length ? logs.length : visibleCount} از{" "}
                  {logs.length} مورد
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setVisibleCount((c) =>
                        Math.max(LOG_PAGE_SIZE, c - LOG_PAGE_SIZE),
                      )
                    }
                    disabled={visibleCount <= LOG_PAGE_SIZE}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--dash-muted)]/30 text-sm font-semibold text-[var(--dash-muted)] hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronUp className="h-4 w-4" />
                    کمتر
                  </button>
                  <button
                    onClick={() => setVisibleCount((c) => c + LOG_PAGE_SIZE)}
                    disabled={visibleCount >= logs.length}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-black bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 transition-all duration-300 hover:shadow-green-500/40 disabled:opacity-40 disabled:cursor-not-allowed">
                    بیشتر
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}