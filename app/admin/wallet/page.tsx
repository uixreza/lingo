"use client";
import React, { useState, useEffect } from "react";
import {
  Wallet,
  Shield,
  Loader2,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  BookOpen,
  ArrowDownLeft,
} from "lucide-react";

type RecentSession = {
  id: number;
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

export default function AdminWalletPage() {
  const [data, setData] = useState<IncomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fa-IR").format(num);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--light-purple)] mx-auto mb-4"></div>
          <p className="text-[var(--dash-text)] text-lg">
            بارگذاری اطلاعات کیف پول...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Balance Card + Income Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] rounded-2xl p-6 shadow-2xl text-white relative overflow-hidden">
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
                  <div className="text-4xl font-bold mb-2">
                    {data ? formatNumber(data.totalIncome) : "۰"}
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
            <div className="bg-[var(--dash-sides)] rounded-2xl p-6 shadow-lg border border-[var(--dash-muted)]/20 dark:border-white/20">
              <h3 className="font-semibold text-[var(--dash-text)] mb-4 text-center">
                آمار درآمد
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[var(--dash-muted)]/20">
                  <span className="text-[var(--dash-muted)] text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    درآمد امروز
                  </span>
                  <span className="text-[var(--dash-text)] font-medium">
                    {data ? formatNumber(data.todayIncome) : "۰"} تومان
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--dash-muted)]/20">
                  <span className="text-[var(--dash-muted)] text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    درآمد این هفته
                  </span>
                  <span className="text-[var(--dash-text)] font-medium">
                    {data ? formatNumber(data.weekIncome) : "۰"} تومان
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--dash-muted)]/20">
                  <span className="text-[var(--dash-muted)] text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    درآمد این ماه
                  </span>
                  <span className="text-[var(--dash-text)] font-medium">
                    {data ? formatNumber(data.monthIncome) : "۰"} تومان
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--dash-muted)]/20">
                  <span className="text-[var(--dash-muted)] text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    تعداد دانشجوها
                  </span>
                  <span className="text-[var(--dash-text)] font-medium">
                    {data ? formatNumber(data.totalStudents) : "۰"} نفر
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[var(--dash-muted)] text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    تعداد جلسات
                  </span>
                  <span className="text-[var(--dash-text)] font-medium">
                    {data ? formatNumber(data.totalSessions) : "۰"} جلسه
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-[var(--dash-sides)] rounded-2xl p-6 shadow-lg border border-[var(--dash-muted)]/20 dark:border-white/20">
              <h3 className="font-bold text-[var(--dash-text)] mb-6 text-center text-lg">
                آخرین جلسات ثبت‌نامی
              </h3>
              <div className="space-y-3">
                {data && data.recentSessions.length > 0 ? (
                  data.recentSessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[var(--dash-bg)] border border-[var(--dash-muted)]/10">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-xl shrink-0 bg-green-100 dark:bg-green-900/30">
                          <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[var(--dash-text)] truncate">
                            {s.studentName}
                          </p>
                          <p className="text-xs text-[var(--dash-muted)] mt-0.5">
                            {s.type === "Private" ? "خصوصی" : "عمومی"} — {s.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 mr-3">
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">
                          +{formatNumber(s.amount)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-[var(--dash-muted)] py-8">
                    هنوز جلسه‌ای ثبت نشده
                  </p>
                )}
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-4 rounded-xl text-center border border-green-500/20 bg-green-500/5">
              <div className="flex items-center justify-center gap-3 text-sm">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  تمامی تراکنش‌ها به صورت امن انجام می‌شود
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
