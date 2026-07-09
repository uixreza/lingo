"use client";

import { useState } from "react";
import Link from "next/link";
import data from "@/data.json";
import { Calendar, FileText } from "lucide-react";

const kidsBooks = data.kids.items.map((item, i) => ({
  ...item,
  id: `kid-${i}`,
}));

const adultBooks = data.adults.items.map((item, i) => ({
  ...item,
  id: `adult-${i}`,
}));

export default function DashboardPage() {
  const [activeGroup, setActiveGroup] = useState<"kids" | "adults">("kids");

  const student = {
    name: "علی محمدی",
    enrolledCourses: 3,
    upcomingClasses: 2,
    pendingAssignments: 1,
    publicClassesAttended: 0,
    privateSessionsRequested: 0,
  };

  const books = activeGroup === "kids" ? kidsBooks : adultBooks;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <div className="inline-block px-4 py-1.5 rounded-full bg-green-500 text-black text-xs font-bold mb-3">
              داشبورد شما
            </div>
            <h1 className="text-2xl font-bold text-[var(--dash-text)]">
              خوش آمدید، {student.name}!
            </h1>
            <p className="text-[var(--dash-muted)] mt-2 text-sm sm:text-base">
              این‌جا می‌توانید کتاب‌های دوره خود را دانلود کنید.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-sm:[&>:first-child]:col-span-full">
          <Link
            href="/dashboard/sessions"
            className="group relative flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0L30 15L15 30L0 15Z' fill='white' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                backgroundSize: "30px 30px",
                backgroundRepeat: "repeat",
              }}
            />
            <div className="flex items-center gap-3">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                درخواست جلسه
              </span>
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 5l-7 7 7 7"
                />
              </svg>
            </div>

            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          <StatCard
            title="کلاس‌های عمومی"
            value={student.publicClassesAttended.toString()}
            icon={Calendar}
          />
          <StatCard
            title="جلسات خصوصی"
            value={student.privateSessionsRequested.toString()}
            icon={FileText}
          />
        </div>
      </div>

      {/* Download Books Section */}
      <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
        <h2 className="text-xl font-bold text-[var(--dash-text)] mb-6">
          دانلود کتاب‌های دوره
        </h2>

        {/* Group Tabs */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setActiveGroup("kids")}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              activeGroup === "kids"
                ? "bg-green-500 text-black shadow-lg scale-105"
                : "bg-[var(--hover-bg)] text-[var(--dash-text)] hover:bg-[var(--hover-bg-strong)]"
            }`}>
            کودکان
          </button>
          <button
            onClick={() => setActiveGroup("adults")}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              activeGroup === "adults"
                ? "bg-green-500 text-black shadow-lg scale-105"
                : "bg-[var(--hover-bg)] text-[var(--dash-text)] hover:bg-[var(--hover-bg-strong)]"
            }`}>
            بزرگسالان
          </button>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  href,
  className,
  icon: Icon,
}: {
  title: string;
  value: string;
  href?: string;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const content = (
    <div className="flex items-center gap-3">
      <div>
        <p className="text-sm font-medium text-[var(--dash-muted)]">{title}</p>
        <p className="text-2xl font-bold text-[var(--dash-text)] mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );

  const baseClasses = "rounded-xl p-4 shadow-xl relative overflow-hidden";
  const allClasses = `${baseClasses} ${href ? "block cursor-pointer transition-transform duration-200 hover:scale-[1.02]" : ""} ${className || "bg-[var(--hover-bg)]"}`;

  const iconElement = Icon && (
    <Icon className="absolute top-1/2 -translate-y-1/2 -left-2 w-16 h-16 -rotate-12 text-background opacity-10" />
  );

  if (href) {
    return (
      <Link href={href} className={allClasses}>
        {content}
        {iconElement}
      </Link>
    );
  }

  return (
    <div className={allClasses}>
      {content}
      {iconElement}
    </div>
  );
}

function BookCard({
  book,
}: {
  book: {
    id: string;
    name: string;
    author: string;
    cover: string;
    bookUrl: string;
    audioUrl: string;
  };
}) {
  return (
    <div className="relative group rounded-2xl overflow-hidden shadow-lg aspect-[4/5]">
      {/* Background Image with Fallback */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)]"
        style={{ backgroundImage: `url(${book.cover})` }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-5">
        <h3 className="text-white font-bold text-lg leading-tight">
          {book.name}
        </h3>
        <p className="text-white/80 text-sm mt-1 mb-4">{book.author}</p>

        <div className="flex flex-col gap-2">
          <a
            href={book.bookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-3 py-2.5 bg-green-500 text-black text-sm font-medium rounded-xl hover:bg-green-400 transition-all duration-200 shadow-lg text-center block">
            دانلود کتاب
          </a>
          <a
            href={book.audioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-3 py-2.5 bg-white/20 text-white text-sm font-medium rounded-xl hover:bg-white/30 backdrop-blur-sm transition-all duration-200 text-center block">
            دانلود فایل صوتی
          </a>
        </div>
      </div>
    </div>
  );
}
