"use client";

import { Users } from "lucide-react";

const monthlyData = [
  { month: "فروردین", count: 28 },
  { month: "اردیبهشت", count: 35 },
  { month: "خرداد", count: 42 },
  { month: "تیر", count: 31 },
  { month: "مرداد", count: 48 },
  { month: "شهریور", count: 53 },
  { month: "مهر", count: 61 },
  { month: "آبان", count: 45 },
  { month: "آذر", count: 38 },
  { month: "دی", count: 52 },
];

const maxCount = Math.max(...monthlyData.map((d) => d.count));

export default function DashboardPage() {
  const student = {
    name: "علی محمدی",
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
        <div>
          <div className="inline-block px-4 py-1.5 rounded-full bg-green-500 text-black text-xs font-bold mb-3">
            پنل مدیریت
          </div>
          <h1 className="text-2xl font-bold text-[var(--dash-text)]">
            خوش آمدید، {student.name}!
          </h1>
          <p className="text-[var(--dash-muted)] mt-2 text-sm sm:text-base">
            به پنل مدیریت خوش آمدید
          </p>
        </div>
      </div>

      {/* Members Chart */}
      <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-green-500/20">
            <Users className="h-5 w-5 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-[var(--dash-text)]">
            اعضای جدید (۱۴۰۴)
          </h2>
        </div>

        <div className="flex items-end gap-2 sm:gap-3 md:gap-4 h-48 md:h-56 px-2">
          {monthlyData.map((item, i) => {
            const height = (item.count / maxCount) * 100;
            return (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-xs font-bold text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.count}
                </span>
                <div
                  className="w-full rounded-lg transition-all duration-300 group-hover:opacity-80 cursor-pointer"
                  style={{
                    height: `${height}%`,
                    background: "linear-gradient(180deg, #22c55e, #16a34a)",
                    minHeight: "8px",
                  }}
                />
                <span className="text-[10px] sm:text-xs text-[var(--dash-muted)] text-center mt-1">
                  {item.month.slice(0, 2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
