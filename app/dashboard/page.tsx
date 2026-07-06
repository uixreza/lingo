"use client";

import Link from "next/link";
import { useState } from "react";
import { OrangeButton } from "@/components/dashboard/UI/Buttons";

// Mock data - you'll replace this with actual API calls
const mockData = {
  student: {
    name: "علی محمدی",
    enrolledCourses: 3,
    upcomingClasses: 2,
    pendingAssignments: 1,
  },
  upcomingClasses: [
    {
      id: "1",
      courseTitle: "مکالمه پیشرفته اسپانیایی",
      teacher: "ماریا رودریگز",
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      meetingUrl: "https://meet.google.com/abc-def-ghi",
      status: "scheduled" as const,
    },
    {
      id: "2",
      courseTitle: "فرانسوی مقدماتی",
      teacher: "ژان لوک مارتین",
      startTime: new Date(Date.now() + 26 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 27 * 60 * 60 * 1000),
      meetingUrl: null,
      status: "scheduled" as const,
    },
  ],
  ongoingCourses: [
    {
      id: "1",
      title: "مکالمه پیشرفته اسپانیایی",
      teacher: {
        name: "ماریا رودریگز",
        profileImage: "/assets/img/temp.webp",
        language: "es", // Spanish
      },
      progress: 0.75,
      currentModule: "ماژول ۵: اسپانیایی تجاری",
    },
    {
      id: "2",
      title: "فرانسوی مقدماتی",
      teacher: {
        name: "ژان لوک مارتین",
        profileImage: null,
        language: "fr", // French
      },
      progress: 0.4,
      currentModule: "ماژول ۳: مکالمات روزمره",
    },
    {
      id: "3",
      title: "گرامر پیشرفته آلمانی",
      teacher: {
        name: "توماس اشمیت",
        profileImage: "/assets/img/temp.webp",
        language: "de", // German
      },
      progress: 0.2,
      currentModule: "ماژول ۲: حالت‌ها و حروف تعریف",
    },
  ],
  todoItems: [
    {
      id: "1",
      type: "assignment" as const,
      title: "انشای اسپانیایی - برنامه روزانه من",
      courseTitle: "مکالمه پیشرفته اسپانیایی",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      link: "/courses/spanish/assignments/1",
    },
    {
      id: "2",
      type: "quiz" as const,
      title: "آزمون لغات فرانسوی",
      courseTitle: "فرانسوی مقدماتی",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      link: "/courses/french/quizzes/1",
    },
  ],
  recentActivities: [
    {
      id: "1",
      type: "completion" as const,
      title: "درس تکمیل شد",
      description: 'شما درس "زمان گذشته اسپانیایی" را تکمیل کردید',
      courseTitle: "مکالمه پیشرفته اسپانیایی",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      link: "/courses/spanish/lessons/5",
    },
    {
      id: "2",
      type: "grade" as const,
      title: "تکلیف تصحیح شد",
      description: 'شما نمره ۹۵٪ در "تلفظ آلمانی" گرفتید',
      courseTitle: "گرامر پیشرفته آلمانی",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      link: "/courses/german/assignments/1",
    },
    {
      id: "3",
      type: "announcement" as const,
      title: "مطالب جدید منتشر شد",
      description: "مدرس تمرین‌های جدیدی منتشر کرد",
      courseTitle: "فرانسوی مقدماتی",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      link: "/courses/french/materials",
    },
  ],
};

// Utility functions
function formatTime(date: Date): string {
  return date.toLocaleTimeString("fa-IR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getTimeBadge(startTime: Date): {
  text: string;
  color: string;
  bgColor: string;
} {
  const now = new Date();
  const timeDiff = startTime.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);

  if (hoursDiff < 0) {
    return {
      text: "شروع شده",
      color: "text-red-400",
      bgColor: "bg-red-500/20 border-red-400/30",
    };
  } else if (hoursDiff < 1) {
    return {
      text: "به زودی",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20 border-orange-400/30",
    };
  } else if (hoursDiff < 24) {
    return {
      text: "امروز",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20 border-orange-400/30",
    };
  } else if (hoursDiff < 48) {
    return {
      text: "فردا",
      color: "text-green-400",
      bgColor: "bg-green-500/20 border-green-400/30",
    };
  } else {
    return {
      text: "آینده",
      color: "text-dash-muted",
      bgColor: "bg-dash-muted/20 border-dash-muted/30",
    };
  }
}

function getFlagEmoji(languageCode: string): string {
  const flags: { [key: string]: string } = {
    es: "🇪🇸", // Spanish
    fr: "🇫🇷", // French
    de: "🇩🇪", // German
    en: "🇺🇸", // English
    it: "🇮🇹", // Italian
    pt: "🇵🇹", // Portuguese
    ru: "🇷🇺", // Russian
    zh: "🇨🇳", // Chinese
    ja: "🇯🇵", // Japanese
    ko: "🇰🇷", // Korean
    ar: "🇸🇦", // Arabic
    tr: "🇹🇷", // Turkish
  };

  return flags[languageCode] || "🏴"; // Default flag if not found
}

// Icon components
const BookIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const AssignmentIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const GradeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

const AnnouncementIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
    />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

export default function DashboardPage() {
  const { student, upcomingClasses, ongoingCourses, recentActivities } =
    mockData;
  const [todoItems, setTodoItems] = useState(mockData.todoItems);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodoItem = {
        id: Date.now().toString(),
        type: "assignment" as const,
        title: newTodo,
        courseTitle: "دوره عمومی",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        link: "#",
        createdAt: new Date(),
      };
      setTodoItems([newTodoItem, ...todoItems]);
      setNewTodo("");
    }
  };

  const removeTodo = (id: string) => {
    setTodoItems(todoItems.filter((item) => item.id !== id));
  };

  const handleCourseClick = (courseId: string) => {
    window.location.href = `/courses/${courseId}`;
  };

  const handleClassClick = (classItem: any) => {
    if (
      classItem.meetingUrl &&
      classItem.startTime.getTime() - Date.now() < 30 * 60 * 1000
    ) {
      window.open(classItem.meetingUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-dash-bg text-dash-text" dir="rtl">
      <div className="space-y-6 p-4 sm:p-6">
        {/* Welcome Banner & Stats */}
        <div className="bg-dash-sides rounded-2xl shadow-lg border border-dash-muted/30 p-6 bg-[var(--dash-sides)]/80 backdrop-blur-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-dash-text">
                خوش آمدید، {student.name}!
              </h1>
              <p className="text-dash-muted mt-2 text-sm sm:text-base">
                این‌جا می‌توانید وضعیت دوره‌های خود را مشاهده کنید.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              icon={
                <BookIcon className="w-6 h-6 text-[#5c3e94] dark:text-foreground" />
              }
              title="دوره‌های ثبت‌نام شده"
              value={student.enrolledCourses.toString()}
            />
            <StatCard
              icon={
                <CalendarIcon className="w-6 h-6 text-[#5c3e94] dark:text-foreground" />
              }
              title="کلاس‌های آینده"
              value={student.upcomingClasses.toString()}
            />
            <StatCard
              icon={
                <AssignmentIcon className="w-6 h-6 text-[#5c3e94] dark:text-foreground" />
              }
              title="تکالیف در انتظار"
              value={student.pendingAssignments.toString()}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <UpcomingClassesSection
              upcomingClasses={upcomingClasses}
              onClassClick={handleClassClick}
            />
            <RecentActivitiesSection recentActivities={recentActivities} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <OngoingCoursesSection
              ongoingCourses={ongoingCourses}
              onCourseClick={handleCourseClick}
            />
            <TodoListSection
              todoItems={todoItems}
              newTodo={newTodo}
              setNewTodo={setNewTodo}
              onAddTodo={addTodo}
              onRemoveTodo={removeTodo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for statistic cards
const StatCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) => (
  <div className="bg-gradient-to-l from-[#412b6b]/20 to-[#5c3e94]/10 rounded-xl p-4 border border-[#5c3e94]/40 dark:bg-gradient-to-l dark:from-foreground/20 dark:to-foreground/10 dark:border-foreground/40">
    <div className="flex items-center gap-4">
      <div className="bg-[#412b6b]/30 p-3 rounded-xl dark:bg-foreground/30">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-dash-text">{title}</p>
        <p className="text-2xl font-bold text-[#5c3e94] dark:text-foreground">
          {value}
        </p>
      </div>
    </div>
  </div>
);

// Component for upcoming classes section
const UpcomingClassesSection = ({
  upcomingClasses,
  onClassClick,
}: {
  upcomingClasses: typeof mockData.upcomingClasses;
  onClassClick: (classItem: any) => void;
}) => (
  <div className="bg-dash-sides rounded-2xl shadow-lg border border-dash-muted/30 p-6 bg-[var(--dash-sides)]/80 backdrop-blur-2xl">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
      <h2 className="text-lg font-semibold text-dash-text">کلاس‌های آینده</h2>
      <Link
        href="/schedule"
        className="text-sm text-[#5c3e94] hover:text-[#412b6b] font-medium transition-colors duration-200 dark:text-foreground dark:hover:text-foreground/80">
        مشاهده همه
      </Link>
    </div>
    <div className="space-y-4">
      {upcomingClasses.map((classItem) => {
        const timeBadge = getTimeBadge(classItem.startTime);
        const canJoin =
          classItem.meetingUrl &&
          classItem.startTime.getTime() - Date.now() < 30 * 60 * 1000;

        return (
          <div
            key={classItem.id}
            onClick={() => onClassClick(classItem)}
            className={`flex items-start justify-between p-4 border border-dash-muted/30 rounded-xl transition-all duration-300 gap-4 cursor-pointer ${
              canJoin
                ? "hover:bg-green-500/10 hover:border-green-400/30 hover:scale-105"
                : "hover:bg-dash-muted/10 hover:scale-105"
            }`}>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-dash-text text-sm sm:text-base">
                    {classItem.courseTitle}
                  </h3>
                  <p className="text-sm text-dash-muted mt-2">
                    با {classItem.teacher}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full border ${timeBadge.bgColor} ${timeBadge.color} text-xs font-medium whitespace-nowrap`}>
                  {timeBadge.text}
                </div>
              </div>
              <div className="flex items-center text-sm text-dash-muted flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(classItem.startTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>
                    {formatTime(classItem.startTime)} -{" "}
                    {formatTime(classItem.endTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// Component for recent activities section
const RecentActivitiesSection = ({
  recentActivities,
}: {
  recentActivities: typeof mockData.recentActivities;
}) => (
  <div className="bg-dash-sides rounded-2xl shadow-lg border border-dash-muted/30 p-6 bg-[var(--dash-sides)]/80 backdrop-blur-2xl">
    <h2 className="text-lg font-semibold text-dash-text mb-4">
      فعالیت‌های اخیر
    </h2>
    <div className="space-y-4">
      {recentActivities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  </div>
);

// Component for individual activity item
const ActivityItem = ({
  activity,
}: {
  activity: (typeof mockData.recentActivities)[0];
}) => {
  const getActivityIcon = () => {
    switch (activity.type) {
      case "completion":
        return <CheckIcon className="w-5 h-5 text-green-400" />;
      case "grade":
        return <GradeIcon className="w-5 h-5 text-blue-400" />;
      case "announcement":
        return <AnnouncementIcon className="w-5 h-5 text-purple-400" />;
      default:
        return null;
    }
  };

  const getActivityColor = () => {
    switch (activity.type) {
      case "completion":
        return "bg-green-500/20 border-green-400/30";
      case "grade":
        return "bg-blue-500/20 border-blue-400/30";
      case "announcement":
        return "bg-purple-500/20 border-purple-400/30";
      default:
        return "bg-gray-500/20 border-gray-400/30";
    }
  };

  return (
    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-dash-muted/10 transition-all duration-300 border border-dash-muted/20">
      <div className={`p-3 rounded-xl flex-shrink-0 ${getActivityColor()}`}>
        {getActivityIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-dash-text text-sm sm:text-base">
          {activity.title}
        </p>
        <p className="text-sm text-dash-muted mt-2">{activity.description}</p>
        <p className="text-xs text-dash-muted/80 mt-3">
          {activity.courseTitle} • {formatDate(activity.timestamp)}
        </p>
      </div>
    </div>
  );
};

// Component for ongoing courses section
const OngoingCoursesSection = ({
  ongoingCourses,
  onCourseClick,
}: {
  ongoingCourses: typeof mockData.ongoingCourses;
  onCourseClick: (courseId: string) => void;
}) => (
  <div className="bg-dash-sides rounded-2xl shadow-lg border border-dash-muted/30 p-6 bg-[var(--dash-sides)]/80 backdrop-blur-2xl">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
      <h2 className="text-lg font-semibold text-dash-text">دوره‌های من</h2>
      <Link
        href="/courses"
        className="text-sm text-[#5c3e94] hover:text-[#412b6b] font-medium transition-colors duration-200 dark:text-foreground dark:hover:text-foreground/80">
        مشاهده همه
      </Link>
    </div>
    <div className="space-y-4">
      {ongoingCourses.map((course) => (
        <CourseItem
          key={course.id}
          course={course}
          onCourseClick={onCourseClick}
        />
      ))}
    </div>
  </div>
);

// Component for individual course item
const CourseItem = ({
  course,
  onCourseClick,
}: {
  course: (typeof mockData.ongoingCourses)[0];
  onCourseClick: (courseId: string) => void;
}) => (
  <div
    onClick={() => onCourseClick(course.id)}
    className="flex items-start gap-4 p-4 border border-dash-muted/30 rounded-xl hover:bg-dash-muted/10 transition-all duration-300 cursor-pointer hover:scale-105">
    <div className="flex flex-col gap-2">
      <div className="w-16 h-16 bg-dash-muted/20 rounded-xl flex-shrink-0 overflow-hidden border border-dash-muted/30">
        <img
          src={course.teacher.profileImage || "/assets/img/temp.webp"}
          alt={course.teacher.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/assets/img/temp.webp";
          }}
        />
      </div>
      <div className="w-16 h-8 bg-dash-muted/20 rounded-lg flex items-center justify-center border border-dash-muted/30 text-lg">
        {getFlagEmoji(course.teacher.language)}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-medium text-dash-text text-sm sm:text-base">
        {course.title}
      </h3>
      <p className="text-sm text-dash-muted mt-2">توسط {course.teacher.name}</p>
      <div className="mt-4">
        <div className="flex justify-between text-sm text-dash-muted mb-2">
          <span>پیشرفت</span>
          <span>{Math.round(course.progress * 100)}٪</span>
        </div>
        <div className="w-full bg-dash-muted/20 rounded-full h-2 border border-dash-muted/30">
          <div
            className="bg-gradient-to-l from-[#412b6b] to-[#5c3e94] h-2 rounded-full transition-all duration-500 dark:bg-gradient-to-l dark:from-foreground dark:to-foreground/80"
            style={{ width: `${course.progress * 100}%` }}
          />
        </div>
      </div>
      <p className="text-xs text-dash-muted/80 mt-3">{course.currentModule}</p>
    </div>
  </div>
);

// Component for todo list section
const TodoListSection = ({
  todoItems,
  newTodo,
  setNewTodo,
  onAddTodo,
  onRemoveTodo,
}: {
  todoItems: typeof mockData.todoItems;
  newTodo: string;
  setNewTodo: (value: string) => void;
  onAddTodo: () => void;
  onRemoveTodo: (id: string) => void;
}) => (
  <div className="bg-dash-sides rounded-2xl shadow-lg border border-dash-muted/30 p-6 bg-[var(--dash-sides)]/80 backdrop-blur-2xl">
    <h2 className="text-lg font-semibold text-dash-text mb-4">لیست کارها</h2>

    {/* Add Todo Input */}
    <div className="flex gap-3 mb-4">
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="کار جدیدی اضافه کنید..."
        className="flex-1 bg-dash-bg border border-dash-muted/40 rounded-xl px-4 py-3 text-sm text-dash-text placeholder-dash-muted focus:outline-none focus:ring-2 focus:ring-[#5c3e94]/50 focus:border-[#5c3e94]/50 transition-all duration-300 dark:focus:ring-foreground/50 dark:focus:border-foreground/50"
        onKeyPress={(e) => e.key === "Enter" && onAddTodo()}
      />
      <OrangeButton onClick={onAddTodo} className="whitespace-nowrap">
        <PlusIcon className="w-4 h-4" />
        <span>افزودن</span>
      </OrangeButton>
    </div>

    <div className="space-y-3">
      {todoItems.map((item) => (
        <TodoItem key={item.id} item={item} onRemove={onRemoveTodo} />
      ))}

      {todoItems.length === 0 && (
        <div className="text-center py-8 text-dash-muted">
          <p>هیچ کاری برای نمایش وجود ندارد</p>
        </div>
      )}
    </div>
  </div>
);

// Component for individual todo item
const TodoItem = ({
  item,
  onRemove,
}: {
  item: (typeof mockData.todoItems)[0];
  onRemove: (id: string) => void;
}) => (
  <div className="flex items-center justify-between p-4 border border-dash-muted/30 rounded-xl hover:bg-dash-muted/10 transition-all duration-300 group">
    <div className="flex items-center gap-4 flex-1 min-w-0">
      <div className="p-3 rounded-xl flex-shrink-0 bg-orange-500/20 border border-orange-400/30">
        <AssignmentIcon className="w-5 h-5 text-orange-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-dash-text text-sm sm:text-base">
          {item.title}
        </p>
        <p className="text-sm text-dash-muted mt-2">
          {formatDate(item.dueDate)}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={() => onRemove(item.id)}
        className="text-red-400 hover:text-red-600 transition-colors duration-300 p-2 rounded-lg hover:bg-red-500/10">
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  </div>
);
