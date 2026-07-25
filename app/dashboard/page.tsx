"use client";

import { useState } from "react";
import Link from "next/link";
import data from "@/data.json";
import { FileText, BookOpen, Calendar } from "lucide-react";
import { useSession } from "next-auth/react";
const kidsBooks = data.kids.items.map((item, i) => ({
  ...item,
  id: `kid-${i}`,
}));

const adultBooks = data.adults.items.map((item, i) => ({
  ...item,
  id: `adult-${i}`,
}));

const etcBooks = data.etc.items.map((item, i) => ({
  ...item,
  id: `etc-${i}`,
}));

export default function DashboardPage() {
  const [activeGroup, setActiveGroup] = useState<"kids" | "adults" | "etc">(
    "kids",
  );
  const session = useSession();

  const student = {
    name: "علی محمدی",
    enrolledCourses: 3,
    upcomingClasses: 2,
    pendingAssignments: 1,
    publicClassesAttended: 0,
    privateSessionsRequested: 0,
  };

  const books =
    activeGroup === "kids"
      ? kidsBooks
      : activeGroup === "adults"
        ? adultBooks
        : etcBooks;

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
              خوش آمدید، {session.data?.user.fullname}!
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <WordOfTheDay />
        <PhrasalVerbOfTheDay />
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
                ? "bg-green-500/15 border border-green-500/40 text-green-500 shadow-sm"
                : "bg-[var(--hover-bg)] text-[var(--dash-muted)] hover:bg-[var(--hover-bg-strong)] hover:text-[var(--dash-text)]"
            }`}>
            کودکان
          </button>
          <button
            onClick={() => setActiveGroup("adults")}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              activeGroup === "adults"
                ? "bg-green-500/15 border border-green-500/40 text-green-500 shadow-sm"
                : "bg-[var(--hover-bg)] text-[var(--dash-muted)] hover:bg-[var(--hover-bg-strong)] hover:text-[var(--dash-text)]"
            }`}>
            بزرگسالان
          </button>
          <button
            onClick={() => setActiveGroup("etc")}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              activeGroup === "etc"
                ? "bg-green-500/15 border border-green-500/40 text-green-500 shadow-sm"
                : "bg-[var(--hover-bg)] text-[var(--dash-muted)] hover:bg-[var(--hover-bg-strong)] hover:text-[var(--dash-text)]"
            }`}>
            متفرقه
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

function WordCard({
  title,
  word,
  partOfSpeech,
  meaning,
  example,
  gradient,
  accentColor,
  iconColor,
}: {
  title: string;
  word: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
  gradient: string;
  accentColor: string;
  iconColor: string;
}) {
  return (
    <div
      dir="ltr"
      className={`relative ${gradient} rounded-2xl p-5 shadow-xl overflow-hidden group hover:${accentColor}/40 transition-all duration-300`}>
      <div
        className={`absolute top-0 right-0 w-32 h-32 ${accentColor}/5 rounded-full blur-3xl pointer-events-none`}
      />
      <div
        className={`absolute bottom-0 left-0 w-24 h-24 ${accentColor}/5 rounded-full blur-2xl pointer-events-none`}
      />

      <div className="flex items-center gap-2 mb-3">
        <BookOpen className={`w-4 h-4 ${iconColor}`} />
        <span
          className={`${iconColor} text-xs font-bold tracking-wider uppercase`}>
          {title}
        </span>
      </div>

      <div className="relative z-10">
        <h3 className="text-white text-xl font-bold">{word}</h3>
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full ${accentColor}/15 ${iconColor} text-xs font-medium mt-1.5 mb-3`}>
          {partOfSpeech}
        </span>

        <div className="bg-white/5 rounded-xl p-3 mb-3">
          <p className={`${iconColor} text-sm font-medium`}>{meaning}</p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
          <p className="text-[#aaa] text-sm italic leading-relaxed">
            &ldquo;{example}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

function WordOfTheDay() {
  const word = {
    word: "Perseverance",
    partOfSpeech: "noun",
    meaning: "استقامت، پایداری",
    example: "Her perseverance led her to success despite many challenges.",
  };

  return (
    <WordCard
      title="Word of Today"
      gradient="bg-gradient-to-br from-[#1a2e1a] to-[#0d1f0d]"
      accentColor="border-green-500"
      iconColor="text-green-400"
      {...word}
    />
  );
}

function PhrasalVerbOfTheDay() {
  const phrase = {
    word: "Carry On",
    partOfSpeech: "phrasal verb",
    meaning: "ادامه دادن",
    example: "Even when things get tough, you have to carry on.",
  };

  return (
    <WordCard
      title="Phrasal Verb of Today"
      gradient="bg-gradient-to-br from-[#2a1a2e] to-[#1a0d1f]"
      accentColor="border-purple-500"
      iconColor="text-purple-400"
      {...phrase}
    />
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
          {book.audioUrl && (
            <a
              href={book.audioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-3 py-2.5 bg-white/20 text-white text-sm font-medium rounded-xl hover:bg-white/30 backdrop-blur-sm transition-all duration-200 text-center block">
              دانلود فایل صوتی
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
