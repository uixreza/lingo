// components/admin/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import {
  Home,
  User,
  LogOut,
  Sun,
  Moon,
  GraduationCap,
  Menu,
  X,
  ShieldCheck,
  ChevronLeft,
  LayoutDashboard,
  BookOpen,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

const menuItems = [
  { label: "خانه", href: "/admin", icon: Home },
  { label: "جلسات", href: "/admin/sessions", icon: GraduationCap },
  { label: "وبلاگ", href: "/admin/blog", icon: BookOpen },
  { label: "مدیریت کاربران", href: "/admin/users", icon: Users },
  { label: "تیکت", href: "/admin/ticket", icon: ShieldCheck },
  { label: "حساب کاربری", href: "/admin/account", icon: User },
];

const unreadHrefs: Record<string, "sessions" | "tickets"> = {
  "/admin/sessions": "sessions",
  "/admin/ticket": "tickets",
};

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({
    sessions: 0,
    tickets: 0,
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/unread-counts");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setUnreadCounts((prev) => ({
            sessions: data.sessions ?? prev.sessions,
            tickets: data.tickets ?? prev.tickets,
          }));
        }
      } catch {
        // silent
      }
    };
    void load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pathname]);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  // Close sheet when route changes on mobile
  useEffect(() => {
    const id = window.setTimeout(() => setIsMobileOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  const closeMobileSheet = () => setIsMobileOpen(false);

  const RedDot = () => (
    <span className="absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-[var(--sidebar-bg)]" />
  );

  return (
    <>
      {/* Mobile Menu Button - Bottom Right */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-40 p-4 rounded-2xl bg-gradient-to-r from-[var(--light-purple)] to-[var(--dark-purple)] text-white shadow-2xl backdrop-blur-sm transition-all duration-150 hover:scale-110 hover:shadow-xl"
        aria-label="باز کردن منو">
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-all duration-200 ${
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex ${
          isHovered ? "w-72" : "w-[5.5rem]"
        } bg-[var(--sidebar-bg)] shadow-2xl flex-col transition-all duration-200 h-screen`}
        dir="rtl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        {/* Logo */}
        <div className="py-6 px-4">
          <div className="flex items-center gap-3 transition-all duration-150">
            <div className="relative">
              <div className="w-12 h-12 rounded-md overflow-hidden flex items-center justify-center">
                <Image
                  src="/assets/img/sideIcon.png"
                  alt="Logo"
                  width={48}
                  height={48}
                />
              </div>
            </div>
            <div
              className={`overflow-hidden transition-all duration-150 ${
                isHovered ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}>
              <h1 className="text-xl font-bold text-[var(--sidebar-heading)] whitespace-nowrap">
                Lingo <span className="text-green-500">Fam</span>{" "}
              </h1>
              <p className="text-[var(--sidebar-text)] text-sm whitespace-nowrap">
                پنل مدیریت
              </p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const unreadKey = unreadHrefs[item.href];
            const hasUnread = unreadKey
              ? unreadCounts[unreadKey] > 0
              : false;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-4 py-3 rounded-xl font-medium relative overflow-hidden transition-all duration-150
                  ${
                    isActive
                      ? "bg-green-500 text-white shadow-lg scale-105"
                      : "text-[var(--sidebar-text)] hover:bg-[var(--hover-bg)] hover:text-[var(--sidebar-text-hover)]"
                  }`}>
                <div className="relative shrink-0">
                  <Icon
                    className={`h-5 w-5 transition-colors duration-100 ${
                      isActive
                        ? "text-white"
                        : "text-[var(--sidebar-text)] group-hover:text-[var(--sidebar-text-hover)]"
                    }`}
                  />
                  {hasUnread && <RedDot />}
                </div>

                <span
                  className={`overflow-hidden transition-all duration-150 ${isHovered ? "max-w-[200px] mr-3" : "max-w-0 mr-0"}`}>
                  <span
                    className={`whitespace-nowrap transition-all duration-150 ${
                      isHovered
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-4"
                    } ${isActive ? "font-bold" : "font-medium"}`}>
                    {item.label}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Theme Toggle + Logout */}
        <div className="p-4 space-y-2">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`
                w-full group flex items-center px-4 py-3 rounded-xl transition-all duration-150
                text-[var(--sidebar-text)] hover:bg-[var(--hover-bg)] hover:text-[var(--sidebar-text-hover)]
                backdrop-blur-sm
              `}
              aria-label="تغییر تم">
              <div className="relative w-5 h-5 shrink-0">
                <Sun
                  className={`absolute inset-0 w-5 h-5 transition-all duration-150 ${
                    theme === "dark"
                      ? "opacity-0 scale-0 rotate-90"
                      : "opacity-100 scale-100 rotate-0"
                  } group-hover:text-[var(--sidebar-text-hover)]`}
                />
                <Moon
                  className={`absolute inset-0 w-5 h-5 transition-all duration-150 ${
                    theme === "dark"
                      ? "opacity-100 scale-100 rotate-0"
                      : "opacity-0 scale-0 -rotate-90"
                  } group-hover:text-[var(--sidebar-text-hover)]`}
                />
              </div>

              <span
                className={`overflow-hidden transition-all duration-150 ${isHovered ? "max-w-[200px] mr-3" : "max-w-0 mr-0"}`}>
                <span
                  className={`whitespace-nowrap font-medium transition-all duration-150 ${
                    isHovered
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-4"
                  }`}>
                  {theme === "dark" ? "تم روشن" : "تم تاریک"}
                </span>
              </span>
            </button>
          )}

          {/* Back to Dashboard */}
          <Link
            href="/dashboard"
            className="w-full group flex items-center px-4 py-3 rounded-xl transition-all duration-150 text-[var(--sidebar-text)] hover:bg-[var(--hover-bg)] hover:text-[var(--sidebar-text-hover)] backdrop-blur-sm"
            aria-label="بازگشت به داشبورد">
            <LayoutDashboard className="h-5 w-5 shrink-0" />
            <span
              className={`overflow-hidden transition-all duration-150 ${isHovered ? "max-w-[200px] mr-3" : "max-w-0 mr-0"}`}>
              <span
                className={`whitespace-nowrap font-medium transition-all duration-150 ${
                  isHovered
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-4"
                }`}>
                بازگشت به داشبورد
              </span>
            </span>
          </Link>

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full group flex items-center px-4 py-3 rounded-xl transition-all duration-150 text-[var(--danger)] hover:bg-[var(--danger-hover-bg)] hover:text-[var(--sidebar-text-hover)] hover:scale-105">
            <LogOut className="h-5 w-5 shrink-0" />
            <span
              className={`overflow-hidden transition-all duration-150 ${isHovered ? "max-w-[200px] mr-3" : "max-w-0 mr-0"}`}>
              <span
                className={`whitespace-nowrap font-medium transition-all duration-150 ${
                  isHovered
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-4"
                }`}>
                خروج از حساب
              </span>
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar - Bottom Sheet */}
      <aside
        className={`
          lg:hidden fixed bottom-0 inset-x-0 z-[60] bg-[var(--sidebar-bg)]/95 backdrop-blur-2xl shadow-2xl rounded-t-3xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0.28,1)] max-h-[85dvh]
          ${isMobileOpen ? "translate-y-0" : "translate-y-full pointer-events-none"}
        `}
        dir="rtl"
        aria-hidden={!isMobileOpen}>
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-white/25 rounded-full" />
        </div>

        {/* Admin Header */}
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="w-11 h-11 rounded-2xl shrink-0 bg-[var(--hover-bg-strong)] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[var(--sidebar-text)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-[var(--sidebar-heading)] truncate">
              پنل مدیریت
            </p>
            <p className="text-xs text-[var(--sidebar-text)]">
              دسترسی مدیر
            </p>
          </div>
          <button
            onClick={closeMobileSheet}
            className="p-2.5 rounded-xl bg-[var(--hover-bg)] text-[var(--sidebar-text)] hover:bg-[var(--hover-bg-strong)] hover:text-[var(--sidebar-text-hover)] transition-all duration-150 hover:scale-105"
            aria-label="بستن منو">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-4 pb-2 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const unreadKey = unreadHrefs[item.href];
            const hasUnread = unreadKey
              ? unreadCounts[unreadKey] > 0
              : false;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileSheet}
                className={`group flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-150 ${
                  isActive
                    ? "bg-green-500 text-white shadow-lg"
                    : "text-[var(--sidebar-text)] hover:bg-[var(--hover-bg)] hover:text-[var(--sidebar-text-hover)]"
                }`}>
                <span
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-150 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[var(--hover-bg)] text-[var(--sidebar-text)] group-hover:text-[var(--sidebar-text-hover)]"
                  }`}>
                  <Icon className="w-5 h-5" />
                  {hasUnread && (
                    <span className="absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-[var(--sidebar-bg)]" />
                  )}
                </span>
                <span
                  className={`flex-1 text-base ${isActive ? "font-bold" : "font-medium"}`}>
                  {item.label}
                </span>
                <ChevronLeft
                  className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
                    isActive
                      ? "text-white/70"
                      : "text-[var(--sidebar-text)] opacity-40"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions - Theme Toggle & Logout */}
        <div
          className="px-4 pt-2 space-y-1.5 border-t border-white/5"
          style={{
            paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
          }}>
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="group w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl text-[var(--sidebar-text)] hover:bg-[var(--hover-bg)] hover:text-[var(--sidebar-text-hover)] transition-all duration-150"
              aria-label="تغییر تم">
              <span className="w-10 h-10 rounded-xl bg-[var(--hover-bg)] flex items-center justify-center group-hover:bg-[var(--hover-bg-strong)] transition-colors duration-150">
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </span>
              <span className="text-base font-medium">
                {theme === "dark" ? "فعال کردن تم روشن" : "فعال کردن تم تاریک"}
              </span>
            </button>
          )}

          {/* Back to Dashboard */}
          <Link
            href="/dashboard"
            onClick={closeMobileSheet}
            className="group w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl text-[var(--sidebar-text)] hover:bg-[var(--hover-bg)] hover:text-[var(--sidebar-text-hover)] transition-all duration-150"
            aria-label="بازگشت به داشبورد">
            <span className="w-10 h-10 rounded-xl bg-[var(--hover-bg)] flex items-center justify-center group-hover:bg-[var(--hover-bg-strong)] transition-colors duration-150">
              <LayoutDashboard className="w-5 h-5" />
            </span>
            <span className="text-base font-medium">بازگشت به داشبورد</span>
          </Link>

          {/* Logout */}
          <button
            onClick={() => {
              closeMobileSheet();
              signOut({ callbackUrl: "/" });
            }}
            className="group w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl text-[var(--danger)] hover:bg-[var(--danger-hover-bg)] transition-all duration-150">
            <span className="w-10 h-10 rounded-xl bg-[var(--danger-hover-bg)] flex items-center justify-center group-hover:bg-[var(--danger)] group-hover:text-white transition-colors duration-150">
              <LogOut className="w-5 h-5" />
            </span>
            <span className="text-base font-medium">خروج از حساب کاربری</span>
          </button>
        </div>
      </aside>
    </>
  );
}
