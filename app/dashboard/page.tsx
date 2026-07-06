"use client";

import { useState } from "react";

const kidsBooks = [
  {
    id: "starter",
    name: "Superminds",
    level: "Starter",
    image: "/assets/img/books/superminds-starter.jpg",
  },
  {
    id: "1",
    name: "Superminds",
    level: "1",
    image: "/assets/img/books/superminds-1.jpg",
  },
  {
    id: "2",
    name: "Superminds",
    level: "2",
    image: "/assets/img/books/superminds-2.jpg",
  },
  {
    id: "3",
    name: "Superminds",
    level: "3",
    image: "/assets/img/books/superminds-3.jpg",
  },
  {
    id: "4",
    name: "Superminds",
    level: "4",
    image: "/assets/img/books/superminds-4.jpg",
  },
  {
    id: "5",
    name: "Superminds",
    level: "5",
    image: "/assets/img/books/superminds-5.jpg",
  },
];

const adultBooks = [
  {
    id: "beginner",
    name: "Headway",
    level: "Beginner",
    image: "/assets/img/books/headway-beginner.jpg",
  },
  {
    id: "elementary",
    name: "Headway",
    level: "Elementary",
    image: "/assets/img/books/headway-elementary.jpg",
  },
  {
    id: "pre-intermediate",
    name: "Headway",
    level: "Pre-Intermediate",
    image: "/assets/img/books/headway-pre-intermediate.jpg",
  },
  {
    id: "intermediate",
    name: "Headway",
    level: "Intermediate",
    image: "/assets/img/books/headway-intermediate.jpg",
  },
  {
    id: "upper-intermediate",
    name: "Headway",
    level: "Upper-Intermediate",
    image: "/assets/img/books/headway-upper-intermediate.jpg",
  },
  {
    id: "advanced",
    name: "Headway",
    level: "Advanced",
    image: "/assets/img/books/headway-advanced.jpg",
  },
];

export default function DashboardPage() {
  const [activeGroup, setActiveGroup] = useState<"kids" | "adults">("kids");

  const student = {
    name: "علی محمدی",
    enrolledCourses: 3,
    upcomingClasses: 2,
    pendingAssignments: 1,
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon="📚"
            title="دوره‌های ثبت‌نام شده"
            value={student.enrolledCourses.toString()}
          />
          <StatCard
            icon="📅"
            title="کلاس‌های آینده"
            value={student.upcomingClasses.toString()}
          />
          <StatCard
            icon="📝"
            title="تکالیف در انتظار"
            value={student.pendingAssignments.toString()}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="bg-[var(--hover-bg)] rounded-xl p-4 shadow-xl">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-sm font-medium text-[var(--dash-muted)]">{title}</p>
          <p className="text-2xl font-bold text-[var(--dash-text)] mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}

function BookCard({
  book,
}: {
  book: { name: string; level: string; image: string };
}) {
  return (
    <div className="relative group rounded-2xl overflow-hidden shadow-lg aspect-[3/4]">
      {/* Background Image with Fallback */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)]"
        style={{ backgroundImage: `url(${book.image})` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-5">
        <h3 className="text-white font-bold text-lg leading-tight">
          {book.name}
        </h3>
        <p className="text-white/80 text-sm mt-1 mb-4">سطح {book.level}</p>

        <div className="flex gap-3">
          <button className="flex-1 px-3 py-2.5 bg-green-500 text-black text-sm font-medium rounded-xl hover:bg-green-400 transition-all duration-200 shadow-lg">
            دانلود کتاب
          </button>
          <button className="flex-1 px-3 py-2.5 bg-white/20 text-white text-sm font-medium rounded-xl hover:bg-white/30 backdrop-blur-sm transition-all duration-200">
            دانلود فایل صوتی
          </button>
        </div>
      </div>
    </div>
  );
}
