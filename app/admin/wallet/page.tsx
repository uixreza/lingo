"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Wallet,
  Shield,
  Loader2,
  TrendingUp,
  Calendar,
  DollarSign,
  BookOpen,
  ArrowDownLeft,
  Search,
  XCircle,
  CheckCircle2,
  Crown,
  Banknote,
  RefreshCw,
  UserRound,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { PageSkeleton } from "@/components/dashboard/Skeletons";
import Avatar from "@/components/dashboard/Avatar";

type RecentSession = {
  id: string;
  studentName: string;
  amount: number;
  type: string;
  date: string;
};

type IncomeData = {
  totalIncome: number;
  todayIncome: number;
  weekIncome: number;
  monthIncome: number;
  totalStudents: number;
  totalSessions: number;
  recentSessions: RecentSession[];
};

type SearchUser = {
  id: number;
  fullname: string;
  phone: string;
  avatarSeed: string | null;
  isPro: boolean;
  balance: number;
};

type Tab = "income" | "manual";
type ChargeType = "Card-to-Card" | "Gateway";
type Notice = {
  type: "success" | "error";
  title: string;
  message: string;
} | null;

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

const tabVariants = {
  initial: { opacity: 0, y: 16, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.99 },
};

export default function AdminWalletPage() {
  const [data, setData] = useState<IncomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("income");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [amount, setAmount] = useState("");
  const [chargeType, setChargeType] = useState<ChargeType>("Card-to-Card");
  const [isCharging, setIsCharging] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/wallet");
        if (res.ok) {
          const json: IncomeData = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Error fetching wallet data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const q = searchQuery.trim();
    if (tab !== "manual" || !q) return;
    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/admin/wallet/search?q=${encodeURIComponent(q)}&limit=8`,
        );
        if (!res.ok) {
          setSearchResults([]);
          return;
        }
        const json: SearchUser[] = await res.json();
        setSearchResults(json);
      } catch (err) {
        console.error("Error searching users:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery, tab]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fa-IR").format(num);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (selectedUser) setSelectedUser(null);
  };

  const handleCharge = async () => {
    if (!selectedUser) return;
    const amt = Number(amount.replace(/[^\d]/g, ""));
    if (!Number.isFinite(amt) || amt <= 0) {
      setNotice({
        type: "error",
        title: "خطا",
        message: "لطفاً یک مبلغ معتبر وارد کنید",
      });
      return;
    }
    setNotice(null);
    setIsCharging(true);
    try {
      const res = await fetch("/api/admin/wallet/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, amount: amt, chargeType }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const added = Number(json.addedAmount);
        const after = Number(json.balanceAfter);
        setNotice({
          type: "success",
          title: "شارژ با موفقیت انجام شد",
          message: `مبلغ ${formatNumber(added)} تومان به حساب ${json.fullname} اضافه شد. موجودی جدید: ${formatNumber(after)} تومان`,
        });
        setSelectedUser({
          ...selectedUser,
          balance: after,
        });
        setAmount("");
        toast.success(
          `موجودی ${json.fullname} با ${formatNumber(added)} تومان شارژ شد`,
          { duration: 3500 },
        );
      } else {
        setNotice({
          type: "error",
          title: "شارژ انجام نشد",
          message: json.error || "خطای ناشناخته رخ داد",
        });
        toast.error(json.error || "هنگام شارژ خطایی رخ داد");
      }
    } catch {
      setNotice({
        type: "error",
        title: "خطا در اتصال",
        message: "مشکلی پیش آمد، دوباره تلاش کنید",
      });
      toast.error("خطا در برقراری ارتباط با سرور");
    } finally {
      setIsCharging(false);
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  const incomeStats = [
    { icon: Calendar, label: "درآمد امروز", value: data ? data.todayIncome : 0 },
    { icon: TrendingUp, label: "درآمد این هفته", value: data ? data.weekIncome : 0 },
    { icon: DollarSign, label: "درآمد این ماه", value: data ? data.monthIncome : 0 },
  ];

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-4xl mx-auto">
        {/* Tab Toggle */}
        <div className="flex justify-start mb-8">
          <div className="relative w-full sm:w-auto inline-flex p-1.5 rounded-2xl bg-[var(--dash-sides)]/80 backdrop-blur-xl border border-[var(--dash-muted)]/15 dark:border-white/20 shadow-lg">
            {(["income", "manual"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative z-10 flex-1 sm:flex-none px-6 sm:px-10 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                  tab === t
                    ? "text-white"
                    : "text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                }`}>
                {t === "income" ? "درآمد" : "تراکنش دستی"}
                {tab === t && (
                  <motion.span
                    layoutId="wallet-tab-pill"
                    className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] shadow-lg shadow-[var(--dark-purple)]/30"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {tab === "income" && (
            <motion.div
              key="income"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Balance Card + Income Stats */}
              <div className="lg:col-span-2 space-y-6">
                {/* Balance Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] rounded-2xl p-6 shadow-2xl text-white">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('/assets/img/mazePattern.svg')] bg-cover"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Wallet className="h-6 w-6" />
                      </div>
                      <h2 className="text-lg font-semibold">درآمد کل</h2>
                    </div>

                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold tabular-nums mb-2 drop-shadow">
                        <CountUp value={data ? data.totalIncome : 0} />
                      </div>
                      <div className="text-white/80 text-lg">تومان</div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                      <Shield className="h-4 w-4" />
                      <span>امن و قابل اعتماد</span>
                    </div>
                  </div>
                </div>

                {/* Income Stats */}
                <div className="bg-[var(--dash-sides)]/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-[var(--dash-muted)]/15 dark:border-white/20">
                  <h3 className="font-semibold text-[var(--dash-text)] mb-4 text-center">
                    آمار درآمد
                  </h3>
                  <div className="space-y-3">
                    {incomeStats.map((s) => (
                      <div
                        key={s.label}
                        className="group flex items-center justify-between py-2.5 px-3 -mx-3 rounded-xl transition-all duration-300 hover:bg-[var(--hover-bg)] last:border-none">
                        <span className="text-[var(--dash-muted)] text-sm flex items-center gap-2">
                          <s.icon className="h-4 w-4 text-[var(--dash-accent)] transition-transform group-hover:scale-110" />
                          {s.label}
                        </span>
                        <span className="text-[var(--dash-text)] font-medium tabular-nums">
                          <CountUp value={s.value} /> تومان
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[var(--dash-muted)] text-sm flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-[var(--dash-accent)]" />
                        میانگین روزانه
                      </span>
                      <span className="text-[var(--dash-text)] font-medium tabular-nums">
                        <CountUp
                          value={
                            data
                              ? Math.round((data.totalIncome / 30) * 100) / 100
                              : 0
                          }
                        />{" "}
                        تومان
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Sessions */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-[var(--dash-sides)]/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-[var(--dash-muted)]/15 dark:border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-green-500/10">
                        <ArrowDownLeft className="h-5 w-5 text-green-500" />
                      </div>
<h3 className="font-bold text-[var(--dash-text)] text-lg">
                        آخرین تراکنشهای واریزی
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                      {data ? data.recentSessions.length : 0} مورد
                    </span>
                  </div>
                  <div className="space-y-3">
                    {data && data.recentSessions.length > 0 ? (
                      <AnimatePresence initial={false}>
                        {data.recentSessions.map((s, i) => (
                          <motion.div
                            key={s.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06, duration: 0.3 }}
                            className="group flex items-center justify-between p-3 rounded-xl bg-[var(--dash-bg)]/70 border border-[var(--dash-muted)]/10 hover:border-[var(--dash-accent)]/40 hover:shadow-md hover:shadow-[var(--dash-accent)]/5 transition-all duration-300">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="p-2 rounded-xl shrink-0 bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform duration-300">
                                <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-[var(--dash-text)] truncate">
                                  {s.studentName}
                                </p>
<p className="text-xs text-[var(--dash-muted)] mt-0.5">
                              {s.type === "Private"
                                ? "جلسه خصوصی"
                                : s.type === "Public"
                                  ? "جلسه عمومی"
                                  : s.type}{" "}
                              — {s.date}
                            </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-green-600 dark:text-green-400 tabular-nums">
                                +{formatNumber(s.amount)}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    ) : (
                      <div className="text-center py-10">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--hover-bg)] flex items-center justify-center mb-3">
                          <BookOpen className="h-5 w-5 text-[var(--dash-muted)]" />
                        </div>
<p className="text-[var(--dash-muted)]">
                          هنوز تراکنشی ثبت نشده
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Security Notice */}
                <div className="relative overflow-hidden p-4 rounded-xl text-center border border-green-500/20 bg-gradient-to-l from-green-500/10 to-emerald-500/5">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
                  <div className="flex items-center justify-center gap-3 text-sm">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      تمامی تراکنش‌ها به صورت امن انجام می‌شود
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "manual" && (
            <motion.div
              key="manual"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-5">
              {/* Step 1: Search */}
              {!selectedUser && (
              <div className="bg-[var(--dash-sides)]/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-[var(--dash-muted)]/15 dark:border-white/20 relative overflow-hidden">
                <div className="pointer-events-none absolute -top-20 -right-10 h-48 w-48 rounded-full bg-[var(--dash-accent)]/10 blur-3xl" />
                <div className="relative">
                  <div className="text-center mb-5">
                    <div className="inline-flex p-2.5 rounded-2xl bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] shadow-lg shadow-[var(--dark-purple)]/25 mb-3">
                      <Banknote className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-[var(--dash-text)] text-lg">
                      شارژ دستی کیف پول
                    </h3>
                    <p className="text-sm text-[var(--dash-muted)] mt-1">
                      شماره موبایل کاربر را جستجو کنید
                    </p>
                  </div>

                  <div className="relative group">
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] pointer-events-none group-focus-within:text-[var(--dash-accent)] transition-colors">
                      <Search className="h-5 w-5" />
                    </span>
                    <input
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="مثلاً ۰۹۱۲۳۴۵۶۷۸۹"
                      dir="rtl"
                      className="w-full rounded-xl pr-11 pl-10 py-3.5 text-sm bg-[var(--dash-bg)]/70 border border-[var(--dash-muted)]/20 text-[var(--dash-text)] placeholder:text-[var(--dash-muted)]/60 focus:outline-none focus:border-[var(--dash-accent)] focus:ring-2 focus:ring-[var(--dash-accent)]/20 transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedUser(null);
                          setSearchResults([]);
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors">
                        <XCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {!(isSearching || searchResults.length > 0) &&
                    searchQuery.trim() && (
                      <div className="text-center py-8">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--hover-bg)] flex items-center justify-center mb-3">
                          <UserRound className="h-5 w-5 text-[var(--dash-muted)]" />
                        </div>
                        <p className="text-[var(--dash-muted)] text-sm">
                          کاربری با این شماره یافت نشد
                        </p>
                      </div>
                    )}

                  {isSearching && searchQuery.trim() && (
                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-[var(--dash-muted)]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      در حال جستجو...
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <AnimatePresence initial={false}>
                        {searchResults.map((u, i) => (
                          <motion.button
                            key={u.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ delay: i * 0.04, duration: 0.2 }}
                            onClick={() => {
                              setSelectedUser(u);
                              setSearchResults([]);
                            }}
                            className="w-full group flex items-center gap-3 p-3 rounded-xl bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10 hover:border-[var(--dash-accent)]/40 hover:bg-[var(--dash-bg)] hover:shadow-lg hover:shadow-[var(--dash-accent)]/5 transition-all duration-300 text-right">
                            <div className="relative shrink-0">
                              <Avatar
                                seed={u.avatarSeed || u.fullname}
                                size={46}
                                className="rounded-xl"
                              />
                              {u.isPro && (
                                <span className="absolute -bottom-1 -left-1 p-0.5 rounded-full bg-[var(--dash-sides)]">
                                  <Crown className="h-3.5 w-3.5 text-purple-500" />
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-[var(--dash-text)] truncate">
                                {u.fullname}
                              </p>
                              <p className="text-xs text-[var(--dash-muted)] mt-0.5" dir="ltr">
                                {u.phone}
                              </p>
                            </div>
                            <div className="text-left shrink-0">
                              <p className="text-sm font-bold text-[var(--dash-text)] tabular-nums">
                                <CountUp value={u.balance} />
                              </p>
                              <p className="text-[10px] text-[var(--dash-muted)]">تومان</p>
                            </div>
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Step 2: Selected user + amount */}
              <AnimatePresence>
                {selectedUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className={`relative overflow-hidden rounded-2xl p-6 bg-[var(--dash-sides)]/90 backdrop-blur-xl shadow-2xl border ${
                      selectedUser.isPro
                        ? "border-purple-500/30"
                        : "border-[var(--dash-muted)]/15 dark:border-white/20"
                    }`}>
                    <div className="pointer-events-none absolute -top-24 -left-10 h-56 w-56 rounded-full bg-[var(--dash-accent)]/15 blur-3xl" />

                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-[var(--dash-text)] text-lg">
                          شارژ کیف پول
                        </h3>
                        <button
                          onClick={() => {
                            setSelectedUser(null);
                            setSearchResults([]);
                            setSearchQuery("");
                            setAmount("");
                            setNotice(null);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--dash-muted)]/20 text-sm font-medium text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:border-[var(--dash-muted)]/40 hover:bg-[var(--hover-bg)] transition-all duration-300">
                          <Search className="h-4 w-4" />
                          جستجوی کاربر دیگر
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div
                            className={`rounded-2xl p-[2px] ${
                              selectedUser.isPro ? "pro-border" : "green-border"
                            }`}>
                            <Avatar
                              seed={selectedUser.avatarSeed || selectedUser.fullname}
                              size={68}
                              className="rounded-2xl"
                            />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[var(--dash-text)] text-lg flex items-center gap-2">
                            {selectedUser.fullname}
                            {selectedUser.isPro && (
                              <Crown className="h-5 w-5 text-purple-500" />
                            )}
                          </p>
                          <p className="text-xs text-[var(--dash-muted)] mt-0.5" dir="ltr">
                            {selectedUser.phone}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              selectedUser.isPro
                                ? "bg-purple-500/15 text-purple-500"
                                : "bg-[var(--hover-bg)] text-[var(--dash-muted)]"
                            }`}>
                            {selectedUser.isPro && <Crown className="h-3.5 w-3.5" />}
                            {selectedUser.isPro ? "پرو" : "عادی"}
                          </span>
                        </div>
                      </div>

                      <motion.div
                        key={selectedUser.balance}
                        layout
                        className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-[var(--dash-bg)]/90 to-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10 flex items-center justify-between overflow-hidden relative">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--dash-accent)]/40 to-transparent" />
                        <span className="flex items-center gap-2 text-sm text-[var(--dash-muted)]">
                          <Wallet className="h-4 w-4 text-[var(--dash-accent)]" />
                          موجودی فعلی
                        </span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400 tabular-nums">
                          <CountUp value={selectedUser.balance} /> تومان
                        </span>
                      </motion.div>

                      <div className="mt-5">
                        <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                          مبلغ شارژ (تومان)
                        </label>
                        <div className="relative">
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--dash-accent)] pointer-events-none">
                            <Banknote className="h-5 w-5" />
                          </span>
                          <input
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="مثلاً ۵۰۰۰۰۰"
                            inputMode="numeric"
                            dir="ltr"
                            className="w-full rounded-xl py-3 pl-28 pr-12 text-lg font-bold tabular-nums bg-[var(--dash-bg)]/70 border border-[var(--dash-muted)]/20 text-[var(--dash-text)] placeholder:text-[var(--dash-muted)]/60 placeholder:font-normal focus:outline-none focus:border-[var(--dash-accent)] focus:ring-2 focus:ring-[var(--dash-accent)]/20 transition-all"
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--dash-muted)]">
                            تومان
                          </span>
                        </div>
                        {amount.trim() && Number(amount.replace(/\D/g, "")) > 0 && (
                          <p className="text-xs text-[var(--dash-muted)] mt-2">
                            مبلغ قابل پرداخت:{" "}
                            <span className="font-bold text-[var(--dash-text)]">
                              {formatNumber(Number(amount.replace(/\D/g, "")))}
                            </span>{" "}
                            تومان
                          </p>
                        )}
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                          نوع شارژ
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {(
                            [
                              { id: "Card-to-Card", label: "کارت به کارت", icon: Banknote },
                              { id: "Gateway", label: "درگاه", icon: CreditCard },
                            ] as { id: ChargeType; label: string; icon: typeof Banknote }[]
                          ).map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setChargeType(opt.id)}
                              className={`relative flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-all duration-300 ${
                                chargeType === opt.id
                                  ? "border-[var(--dash-accent)] bg-[var(--dash-accent)]/15 text-[var(--dash-text)] shadow-lg shadow-[var(--dash-accent)]/10"
                                  : "border-[var(--dash-muted)]/20 bg-[var(--dash-bg)]/60 text-[var(--dash-muted)] hover:border-[var(--dash-muted)]/40"
                              }`}>
                              <opt.icon className="h-4 w-4" />
                              {opt.label}
                              {chargeType === opt.id && (
                                <motion.span
                                  layoutId="charge-type-check"
                                  className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[var(--dash-accent)] text-white flex items-center justify-center">
                                  <CheckCircle2 className="h-3 w-3" />
                                </motion.span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <motion.button
                        onClick={handleCharge}
                        disabled={!amount.trim() || isCharging}
                        whileHover={amount.trim() && !isCharging ? { scale: 1.01 } : {}}
                        whileTap={amount.trim() && !isCharging ? { scale: 0.99 } : {}}
                        className={`mt-6 w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 ${
                          amount.trim() && !isCharging
                            ? "bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
                            : "bg-[var(--dash-bg)] text-[var(--dash-muted)] cursor-not-allowed"
                        }`}>
                        {isCharging ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            در حال شارژ...
                          </span>
                        ) : (
                          "شارژ حساب"
                        )}
                      </motion.button>

                      <AnimatePresence>
                        {notice && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className={`mt-4 p-4 rounded-2xl border flex items-start gap-3 ${
                              notice.type === "success"
                                ? "bg-green-500/10 border-green-500/25"
                                : "bg-red-500/10 border-red-500/25"
                            }`}>
                            <span
                              className={
                                notice.type === "success"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }>
                              {notice.type === "success" ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <XCircle className="h-5 w-5" />
                              )}
                            </span>
                            <div>
                              <p
                                className={`text-sm font-semibold ${
                                  notice.type === "success"
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}>
                                {notice.title}
                              </p>
                              <motion.div
                                key={
                                  notice.type === "success"
                                    ? `s-${notice.message}`
                                    : `e-${notice.message}`
                                }
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.15 }}
                                className="text-xs mt-0.5 text-[var(--dash-muted)]">
                                {notice.message}
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}