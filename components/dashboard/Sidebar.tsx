// components/dashboard/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Home,
  User,
  LogOut,
  Sun,
  Moon,
  GraduationCap,
  Menu,
  X,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

const menuItems = [
  { label: "خانه", href: "/dashboard", icon: Home },
  { label: "جلسات", href: "/dashboard/sessions", icon: GraduationCap },
  { label: "تیکت", href: "/dashboard/ticket", icon: ShieldCheck },
  { label: "حساب کاربری", href: "/dashboard/account", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsMobileOpen(false);
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

  // Mobile Menu Button (to be used in your layout/header)
  const MobileMenuButton = () => (
    <button
      onClick={() => setIsMobileOpen(true)}
      className="lg:hidden fixed bottom-6 right-6 z-40 p-4 rounded-2xl bg-gradient-to-r from-[var(--light-purple)] to-[var(--dark-purple)] text-white shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-xl"
      aria-label="باز کردن منو">
      <Menu className="h-6 w-6" />
    </button>
  );

  // Backdrop for mobile
  const MobileBackdrop = () => (
    <div
      className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-all duration-300 ${
        isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => setIsMobileOpen(false)}
    />
  );

  return (
    <>
      {/* Mobile Menu Button - Bottom Right */}
      <MobileMenuButton />

      {/* Mobile Backdrop */}
      <MobileBackdrop />

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex ${
          isHovered ? "w-72" : "w-[5.5rem]"
        } bg-[var(--sidebar-bg)] shadow-2xl flex-col transition-all duration-500 ease-in-out h-screen`}
        dir="rtl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        {/* Logo */}
        <div className="py-6 px-4">
          <div className="flex items-center gap-3 transition-all duration-300">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-lg">
                <Image
                  src="/assets/img/sideIcon.png"
                  alt="Logo"
                  width={48}
                  height={48}
                />
              </div>
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isHovered ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}>
              <h1 className="text-xl font-bold text-[var(--sidebar-heading)] whitespace-nowrap">
                Lingo <span className="text-green-500">Fam</span>{" "}
              </h1>
              <p className="text-[var(--sidebar-text)] text-sm whitespace-nowrap">
                پلتفرم آموزش زبان
              </p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-300 font-medium relative overflow-hidden
                  ${
                    isActive
                      ? "bg-green-500 text-white shadow-lg scale-105"
                      : "text-[var(--sidebar-text)] hover:bg-[var(--hover-bg)] hover:text-[var(--sidebar-text-hover)]"
                  }`}>
                <div className="relative shrink-0">
                  <Icon
                    className={`h-5 w-5 transition-colors duration-300 ${
                      isActive
                        ? "text-white"
                        : "text-[var(--sidebar-text)] group-hover:text-[var(--sidebar-text-hover)]"
                    }`}
                  />
                </div>

                <span
                  className={`overflow-hidden transition-all duration-300 ${isHovered ? "max-w-[200px] mr-3" : "max-w-0 mr-0"}`}>
                  <span
                    className={`whitespace-nowrap transition-all duration-300 ${
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
                w-full group flex items-center px-4 py-3 rounded-xl transition-all duration-300
                text-[var(--sidebar-text)] hover:bg-[var(--hover-bg)] hover:text-[var(--sidebar-text-hover)]
                backdrop-blur-sm
              `}
              aria-label="تغییر تم">
              <div className="relative w-5 h-5 shrink-0">
                <Sun
                  className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                    theme === "dark"
                      ? "opacity-0 scale-0 rotate-90"
                      : "opacity-100 scale-100 rotate-0"
                  } group-hover:text-[var(--sidebar-text-hover)]`}
                />
                <Moon
                  className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                    theme === "dark"
                      ? "opacity-100 scale-100 rotate-0"
                      : "opacity-0 scale-0 -rotate-90"
                  } group-hover:text-[var(--sidebar-text-hover)]`}
                />
              </div>

              <span
                className={`overflow-hidden transition-all duration-300 ${isHovered ? "max-w-[200px] mr-3" : "max-w-0 mr-0"}`}>
                <span
                  className={`whitespace-nowrap transition-all duration-300 font-medium ${
                    isHovered
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-4"
                  }`}>
                  {theme === "dark" ? "تم روشن" : "تم تاریک"}
                </span>
              </span>
            </button>
          )}

          {/* Logout */}
          <button className="w-full group flex items-center px-4 py-3 rounded-xl text-[var(--danger)] hover:bg-[var(--danger-hover-bg)] hover:text-[var(--sidebar-text-hover)] transition-all duration-300 hover:scale-105">
            <LogOut className="h-5 w-5 shrink-0" />
            <span
              className={`overflow-hidden transition-all duration-300 ${isHovered ? "max-w-[200px] mr-3" : "max-w-0 mr-0"}`}>
              <Link
                href="/"
                className={`whitespace-nowrap transition-all duration-300 font-medium ${
                  isHovered
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-4"
                }`}>
                خروج از حساب
              </Link>
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar - Bottom Sheet */}
      <aside
        className={`
          lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--sidebar-bg)] shadow-2xl rounded-t-3xl flex flex-col transition-all duration-500 z-50 backdrop-blur-lg
          ${isMobileOpen ? "translate-y-0" : "translate-y-full"}
          max-h-[85vh]
        `}
        dir="rtl">
        {/* Drag Handle */}
        <div className="flex justify-center p-4 pb-2">
          <div className="w-16 h-1.5 bg-white/20 rounded-full"></div>
        </div>

        {/* Mobile Header */}
        <div className="flex items-center justify-between p-6">
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-3 rounded-2xl text-[var(--sidebar-heading)] hover:bg-[var(--hover-bg)] transition-all duration-300 hover:scale-110"
            aria-label="بستن منو">
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] flex items-center justify-center shadow-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[var(--sidebar-heading)]">
              منو
            </h3>
          </div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`group flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 font-medium text-lg relative overflow-hidden
                  ${
                    isActive
                      ? "bg-green-500 text-white shadow-lg scale-105"
                      : "text-[var(--sidebar-text)] hover:bg-[var(--hover-bg)] hover:text-[var(--sidebar-text-hover)]"
                  }`}>
                <div className="relative">
                  <Icon
                    className={`h-6 w-6 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-[var(--sidebar-text)] group-hover:text-[var(--sidebar-text-hover)]"
                    }`}
                  />
                </div>

                <span className={`${isActive ? "font-bold" : "font-medium"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions - Theme Toggle & Logout */}
        <div className="p-6 space-y-4 bg-[var(--sidebar-bg)]/90 rounded-t-3xl">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`
                w-full flex items-center justify-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 text-lg font-medium
                text-[var(--sidebar-text)] hover:bg-[var(--hover-bg)] hover:text-[var(--sidebar-text-hover)]
                backdrop-blur-sm
              `}
              aria-label="تغییر تم">
              <div className="relative w-6 h-6">
                <Sun
                  className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                    theme === "dark"
                      ? "opacity-0 scale-0 rotate-90"
                      : "opacity-100 scale-100 rotate-0"
                  } group-hover:text-[var(--sidebar-text-hover)]`}
                />
                <Moon
                  className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                    theme === "dark"
                      ? "opacity-100 scale-100 rotate-0"
                      : "opacity-0 scale-0 -rotate-90"
                  } group-hover:text-[var(--sidebar-text-hover)]`}
                />
              </div>

              <span>
                {theme === "dark" ? "فعال کردن تم روشن" : "فعال کردن تم تاریک"}
              </span>
            </button>
          )}

          {/* Logout */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="w-full flex items-center justify-center gap-4 px-4 py-4 rounded-2xl text-[var(--danger)] hover:bg-[var(--danger-hover-bg)] hover:text-[var(--sidebar-text-hover)] transition-all duration-300 text-lg font-medium hover:scale-105">
            <LogOut className="h-6 w-6" />
            <Link href="/" className="font-medium">
              خروج از حساب کاربری
            </Link>
          </button>
        </div>
      </aside>
    </>
  );
}
