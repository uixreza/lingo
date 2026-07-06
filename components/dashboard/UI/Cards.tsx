"use client";
import Link from "next/link";
import React from "react";

interface Teacher {
  name: string;
  degree: string;
  profilePic: string;
  country: string;
  isApproved: boolean;
}

interface CourseCardProps {
  course: {
    id: number;
    teacher: Teacher;
    title: string;
    description: string;
    capacity: {
      current: number;
      total: number;
    };
    language: string;
    price: string;
    createdAt: string;
    isFree: boolean;
  };
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const getFlagEmoji = (country: string) => {
    const flags: { [key: string]: string } = {
      iran: "🇮🇷",
      usa: "🇺🇸",
      uk: "🇬🇧",
      germany: "🇩🇪",
      turkey: "🇹🇷",
      russia: "🇷🇺",
      uae: "🇦🇪",
      spain: "🇪🇸",
    };
    return flags[country] || "🏴";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div
      className="flex flex-col rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full"
      style={{
        backgroundColor: "var(--dash-sides)",
        border: "1px solid var(--dash-bg)",
      }}>
      {/* Teacher Info Section - Fixed height */}
      <div
        className="p-4 border-b flex-shrink-0"
        style={{ borderColor: "var(--dash-bg)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-semibold"
                style={{
                  backgroundColor: "var(--dash-accent)",
                  color: "white",
                }}>
                {course.teacher.profilePic ? (
                  <img
                    src={course.teacher.profilePic}
                    alt={course.teacher.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  getInitials(course.teacher.name)
                )}
              </div>
              {/* Twitter-style Blue Tick Badge */}
              {course.teacher.isApproved && (
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 bg-white rounded-full flex items-center justify-center"
                  title="مدرس تایید شده">
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="#1D9BF0"
                    className="r-1cvl2hr r-4qtqp9 r-yyyyoo r-1xvli5t r-9cviqr r-f9ja8p r-og9te1 r-bnwqim r-1plcrui r-lrvibr">
                    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="text-right">
              <h3
                className="font-semibold text-sm"
                style={{ color: "var(--dash-text)" }}>
                {course.teacher.name}
              </h3>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--dash-muted)" }}>
                {course.teacher.degree}
              </p>
            </div>
          </div>
          <div className="text-2xl">{getFlagEmoji(course.teacher.country)}</div>
        </div>
      </div>

      {/* Course Info - Flexible content area */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title and Description */}
        <div className="mb-4">
          <h2
            className="font-bold text-lg mb-2 text-right"
            style={{ color: "var(--dash-text)" }}>
            {course.title}
          </h2>
          <p
            className="text-sm text-right leading-relaxed"
            style={{ color: "var(--dash-muted)" }}>
            {course.description}
          </p>
        </div>

        {/* Capacity Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm" style={{ color: "var(--dash-muted)" }}>
              ظرفیت کلاس
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--dash-text)" }}>
              {course.capacity.current} از {course.capacity.total}
            </span>
          </div>
          <div
            className="w-full rounded-full h-2"
            style={{ backgroundColor: "var(--dash-bg)" }}>
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: "var(--dash-accent)",
                width: `${
                  (course.capacity.current / course.capacity.total) * 100
                }%`,
              }}></div>
          </div>
        </div>

        {/* Auto spacing with flex-grow */}
        <div className="flex-grow"></div>

        {/* Price and Button Section - Pushed to bottom */}
        <div className="space-y-3 mt-auto">
          {/* Price */}
          <div>
            <span
              className={`text-lg font-bold block text-right ${
                course.isFree ? "text-green-600" : ""
              }`}
              style={{
                color: course.isFree ? "inherit" : "var(--dash-text)",
              }}>
              {course.price}
            </span>
          </div>

          {/* Enroll Button */}
          <div>
            <button
              className={`w-full px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                course.capacity.current === course.capacity.total
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : course.isFree
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "text-white"
              }`}
              style={{
                backgroundColor:
                  course.capacity.current === course.capacity.total
                    ? "var(--dash-muted)"
                    : course.isFree
                    ? ""
                    : "var(--dash-accent)",
              }}
              disabled={course.capacity.current === course.capacity.total}>
              {course.capacity.current === course.capacity.total
                ? "تکمیل ظرفیت"
                : course.isFree
                ? "ثبت نام رایگان"
                : "ثبت نام"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// second card design for enrolled classes

interface Teacher {
  name: string;
  degree: string;
  profilePic: string;
  country: string;
  isApproved: boolean;
}

interface EnrolledCourseCardProps {
  course: {
    id: number;
    teacher: Teacher;
    title: string;
    description: string;
    language: string;
    progress?: number; // Optional progress for enrolled courses
    currentModule?: string; // Optional current module
  };
}

export const EnrolledCourseCard: React.FC<EnrolledCourseCardProps> = ({
  course,
}) => {
  const getFlagEmoji = (country: string) => {
    const flags: { [key: string]: string } = {
      iran: "🇮🇷",
      usa: "🇺🇸",
      uk: "🇬🇧",
      germany: "🇩🇪",
      turkey: "🇹🇷",
      russia: "🇷🇺",
      uae: "🇦🇪",
      spain: "🇪🇸",
    };
    return flags[country] || "🏴";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div
      className="flex flex-col rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full"
      style={{
        backgroundColor: "var(--dash-sides)",
        border: "1px solid var(--dash-bg)",
      }}>
      {/* Teacher Info Section - Fixed height */}
      <div
        className="p-4 border-b flex-shrink-0"
        style={{ borderColor: "var(--dash-bg)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-semibold"
                style={{
                  backgroundColor: "var(--dash-accent)",
                  color: "white",
                }}>
                {course.teacher.profilePic ? (
                  <img
                    src={course.teacher.profilePic}
                    alt={course.teacher.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  getInitials(course.teacher.name)
                )}
              </div>
              {/* Twitter-style Blue Tick Badge */}
              {course.teacher.isApproved && (
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 bg-white rounded-full flex items-center justify-center"
                  title="مدرس تایید شده">
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="#1D9BF0"
                    className="r-1cvl2hr r-4qtqp9 r-yyyyoo r-1xvli5t r-9cviqr r-f9ja8p r-og9te1 r-bnwqim r-1plcrui r-lrvibr">
                    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="text-right">
              <h3
                className="font-semibold text-sm"
                style={{ color: "var(--dash-text)" }}>
                {course.teacher.name}
              </h3>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--dash-muted)" }}>
                {course.teacher.degree}
              </p>
            </div>
          </div>
          <div className="text-2xl">{getFlagEmoji(course.teacher.country)}</div>
        </div>
      </div>

      {/* Course Info - Flexible content area */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title and Description */}
        <div className="mb-4">
          <h2
            className="font-bold text-lg mb-2 text-right"
            style={{ color: "var(--dash-text)" }}>
            {course.title}
          </h2>
          <p
            className="text-sm text-right leading-relaxed"
            style={{ color: "var(--dash-muted)" }}>
            {course.description}
          </p>
        </div>

        {/* Progress Bar (if available) */}
        {course.progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm" style={{ color: "var(--dash-muted)" }}>
                پیشرفت دوره
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--dash-text)" }}>
                {Math.round(course.progress * 100)}٪
              </span>
            </div>
            <div
              className="w-full rounded-full h-2"
              style={{ backgroundColor: "var(--dash-bg)" }}>
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: "var(--dash-accent)",
                  width: `${course.progress * 100}%`,
                }}></div>
            </div>
          </div>
        )}

        {/* Current Module (if available) */}
        {course.currentModule && (
          <div className="mb-4">
            <p
              className="text-sm text-right"
              style={{ color: "var(--dash-muted)" }}>
              <span
                className="font-medium"
                style={{ color: "var(--dash-text)" }}>
                ماژول فعلی:
              </span>{" "}
              {course.currentModule}
            </p>
          </div>
        )}

        {/* Auto spacing with flex-grow */}
        <div className="flex-grow"></div>

        {/* Action Button Section - Pushed to bottom */}
        <div className="space-y-3 mt-auto">
          {/* Continue Button */}
          <div>
            <Link href={`/dashboard/classes/${course.id}`}>
              <button
                className="w-full cursor-pointer px-6 py-2 rounded-lg font-medium transition-colors duration-200 text-white hover:opacity-90"
                style={{ backgroundColor: "var(--dash-accent)" }}>
                مشاهده دوره
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
