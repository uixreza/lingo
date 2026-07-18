"use client";

import { useState, useEffect } from "react";
import { Users, CreditCard, CalendarCheck, DollarSign } from "lucide-react";
import { KpiCard, BarChart, ResponsiveChart } from "@derpdaderp/chartkit";

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    currentMonth: {
      transactionCount: number;
      transactionVolume: number;
      sessionCount: number;
    };
    dailyTransactions: number[];
    dailySessions: number[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.ok && r.json())
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  const transactionData =
    stats?.dailyTransactions.map((v, i) => ({
      day: String(i + 1),
      amount: Math.abs(v),
    })) ?? [];

  const sessionData =
    stats?.dailySessions.map((v, i) => ({
      day: String(i + 1),
      count: v,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-5">
          <KpiCard
            label="تراکنش‌های ماه جاری"
            value={stats?.currentMonth.transactionCount ?? 0}
            data={stats?.dailyTransactions ?? []}
            theme="emerald"
            format={(v) => v.toLocaleString("fa-IR")}
          />
        </div>
        <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-5">
          <KpiCard
            label="حجم تراکنش‌ها (تومان)"
            value={stats?.currentMonth.transactionVolume ?? 0}
            data={stats?.dailyTransactions ?? []}
            theme="emerald"
            format={(v) => v.toLocaleString("fa-IR")}
          />
        </div>
        <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-5 sm:col-span-2 lg:col-span-1">
          <KpiCard
            label="کلاس‌های ماه جاری"
            value={stats?.currentMonth.sessionCount ?? 0}
            data={stats?.dailySessions ?? []}
            theme="emerald"
            format={(v) => v.toLocaleString("fa-IR")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-green-500/20">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-[var(--dash-text)]">
              تراکنش‌های روزانه (ماه جاری)
            </h2>
          </div>
          <ResponsiveChart height={280}>
            {({ width }) => (
              <BarChart
                data={transactionData}
                dataKey="amount"
                categoryKey="day"
                width={width}
                height={280}
                theme="emerald"
                barRadius={6}
              />
            )}
          </ResponsiveChart>
        </div>

        <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-green-500/20">
              <CalendarCheck className="h-5 w-5 text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-[var(--dash-text)]">
              کلاس‌های روزانه (ماه جاری)
            </h2>
          </div>
          <ResponsiveChart height={280}>
            {({ width }) => (
              <BarChart
                data={sessionData}
                dataKey="count"
                categoryKey="day"
                width={width}
                height={280}
                theme="emerald"
                barRadius={6}
              />
            )}
          </ResponsiveChart>
        </div>
      </div>
    </div>
  );
}
