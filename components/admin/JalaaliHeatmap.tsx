"use client";

import { useRef, useState, useEffect } from "react";
import { Check, Loader2, Lock } from "lucide-react";
import moment from "moment-jalaali";

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

interface SessionInfo {
  date: string;
  status: "Approved" | "Pending" | "Canceled";
}

interface DateInfo {
  approved: number;
  pending: number;
  canceled: number;
  total: number;
}

export default function JalaaliHeatmap({
  sessions,
}: {
  sessions: SessionInfo[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const sessionsByDate: { [key: string]: DateInfo } = sessions.reduce(
    (acc: { [key: string]: DateInfo }, s: SessionInfo) => {
      if (!acc[s.date]) {
        acc[s.date] = { approved: 0, pending: 0, canceled: 0, total: 0 };
      }
      acc[s.date].total++;
      if (s.status === "Approved") acc[s.date].approved++;
      else if (s.status === "Pending") acc[s.date].pending++;
      else if (s.status === "Canceled") acc[s.date].canceled++;
      return acc;
    },
    {},
  );

  const now = moment();
  const todayStr = now.format("jYYYY/jMM/jDD");

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-white/90">
          تقویم جلسات
        </h3>
        <div className="flex items-center gap-3 text-[9px] font-medium text-white/60">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-white/30 ring-1 ring-white/40" />
            امروز
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-green-400" />
            تأیید شده
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-amber-400/50 ring-1 ring-amber-400/60" />
            در انتظار
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-red-400/40 ring-1 ring-red-400/50" />
            پر
          </span>
        </div>
      </div>

      {mounted && (
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-2"
            style={{ direction: "ltr" }}>
            {(() => {
              const jNowYear = now.jYear();
              const jNowMonth = now.jMonth();
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
                  <div
                    key={`${jy}-${jMonthIdx}`}
                    className="flex flex-col items-center shrink-0">
                    <div className="grid grid-cols-7 gap-0.5">
                      {weekDays.map((wd) => (
                        <div
                          key={wd}
                          className="w-8 h-5 flex items-center justify-center text-[9px] font-bold text-white/40">
                          {wd}
                        </div>
                      ))}
                      {weeks.map((week, wi) =>
                        week.map((day, di) => {
                          if (day === null)
                            return (
                              <div
                                key={`e-${wi}-${di}`}
                                className="w-8 h-8"
                              />
                            );
                          const dateStr = jToDateStr(jy, jMonthIdx, day);
                          const isPast = dateStr < todayStr;
                          const isToday = dateStr === todayStr;
                          const info = sessionsByDate[dateStr];
                          const hasApproved = info ? info.approved > 0 : false;
                          const hasPending = info ? info.pending > 0 : false;
                          const isFullyReserved = info
                            ? info.total >= 5
                            : false;
                          const sessionCount = info ? info.total : 0;

                          let cellClass = "";
                          if (isToday) {
                            cellClass =
                              "bg-white/25 text-white ring-1 ring-white/50 font-bold";
                          } else if (isFullyReserved) {
                            cellClass =
                              "bg-red-400/25 text-red-200 ring-1 ring-red-400/40";
                          } else if (hasApproved) {
                            cellClass =
                              "bg-green-400 text-black font-bold ring-1 ring-green-300/60";
                          } else if (hasPending) {
                            cellClass =
                              "bg-amber-400/25 text-amber-200 font-bold ring-1 ring-amber-400/40";
                          } else if (isPast) {
                            cellClass =
                              "bg-white/5 text-white/20";
                          } else {
                            cellClass =
                              "bg-white/8 text-white/60 hover:bg-white/15 hover:text-white/90 cursor-pointer";
                          }

                          return (
                            <div
                              key={dateStr}
                              className={`relative w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-medium transition-all duration-150 ${cellClass}`}>
                              {day}
                              {isToday &&
                              !hasApproved &&
                              !hasPending &&
                              !isFullyReserved ? (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                  <span className="text-[6px] font-black text-purple-600 leading-none">
                                    ✦
                                  </span>
                                </div>
                              ) : isFullyReserved ? (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-400 rounded-full flex items-center justify-center">
                                  <Lock
                                    className="h-1.5 w-1.5 text-black"
                                    strokeWidth={3}
                                  />
                                </div>
                              ) : hasApproved && !hasPending ? (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                  <Check
                                    className="h-1.5 w-1.5 text-green-600"
                                    strokeWidth={3}
                                  />
                                </div>
                              ) : hasPending ? (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center">
                                  <Loader2
                                    className="h-1.5 w-1.5 text-black animate-spin"
                                    strokeWidth={3}
                                  />
                                </div>
                              ) : sessionCount > 0 ? (
                                <div className="absolute -bottom-0.5 -right-0.5 h-3 min-w-3 px-0.5 bg-green-400 rounded-full flex items-center justify-center">
                                  <span className="text-[7px] font-black text-black leading-none">
                                    {toPersianDigits(String(sessionCount))}
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          );
                        })
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-white/50 mt-1">
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
  );
}
