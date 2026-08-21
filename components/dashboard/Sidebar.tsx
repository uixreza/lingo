// components/dashboard/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
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
  Users,
  BookOpen,
  NotebookText,
  Pin,
  PinOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Avatar from "./Avatar";

const menuItems = [
  { label: "خانه", href: "/dashboard", icon: Home },
  { label: "جلسات", href: "/dashboard/sessions", icon: GraduationCap },
  { label: "دفترچه", href: "/dashboard/notebook", icon: NotebookText },
  { label: "تیکت", href: "/dashboard/ticket", icon: ShieldCheck },
  { label: "حساب کاربری", href: "/dashboard/account", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const isMentors = pathname.startsWith("/mentors");

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-pinned");
    if (saved === "true") setIsPinned(true);
    setMounted(true);
  }, []);

  const togglePin = () => {
    setIsPinned((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-pinned", String(next));
      return next;
    });
  };

  const isExpanded = isPinned || isHovered;

  const closeMobileSheet = () => setIsMobileOpen(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

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

  const MobileMenuButton = () => (
    <button
      onClick={() => setIsMobileOpen(true)}
      className="lg:hidden fixed bottom-6 left-6 z-40 p-4 rounded-2xl bg-gradient-to-r from-[var(--light-purple)] to-[var(--dark-purple)] text-white shadow-2xl backdrop-blur-sm transition-all duration-150 hover:scale-110 hover:shadow-xl"
      aria-label="باز کردن منو">
      <Menu className="h-6 w-6" />
    </button>
  );

  const MobileBackdrop = () => (
    <div
      className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-all duration-200 ${
        isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => setIsMobileOpen(false)}
    />
  );

  return (
    <>
      <MobileMenuButton />
      <MobileBackdrop />

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex ${
          isExpanded ? "w-72" : "w-[5.5rem]"
        } bg-[var(--sidebar-bg)] shadow-2xl flex-col transition-all duration-200 h-screen`}
        dir="rtl"
        onMouseEnter={() => !isPinned && setIsHovered(true)}
        onMouseLeave={() => !isPinned && setIsHovered(false)}>
        <div className="py-6 px-4">
          <div className="flex items-center gap-3 transition-all duration-150">
            <div className="relative">
              <div className="w-12 h-12 rounded-md overflow-hidden flex items-center justify-center ">
                <Image
                  src="/assets/img/sideIcon.png"
                  alt="Logo"
                  width={48}
                  height={48}
                  loading="eager"
                />
              </div>
            </div>
            <div
              className={`overflow-hidden transition-all duration-150 ${
                isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
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

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-4 py-3 rounded-xl font-medium relative overflow-hidden transition-all duration-150 ${
                  isActive
                    ? "bg-gradient-to-l from-[var(--light-purple)] to-[var(--dark-purple)] text-white shadow-lg scale-105"
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
                </div>
                <span className={`overflow-hidden transition-all duration-150 ${isExpanded ? "max-w-[200px] mr-3" : "max-w-0 mr-0"}`}>
                  <span className={`whitespace-nowrap transition-all duration-150 ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"} ${isActive ? "font-bold" : "font-medium"}`}>
                    {item.label}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Theme Toggle + Pin + Logout */}
        <div className="p-3 space-y-1.5 mx-3 mb-3 rounded-2xl" style={{ backgroundColor: "color-mix(in srgb, var(--hover-bg) 50%, transparent)" }}>
          <button onClick={togglePin} className={`w-full group flex items-center ${isExpanded ? "" : "justify-center"} px-4 py-2.5 rounded-xl transition-all duration-150 ${isPinned ? "text-[var(--light-purple)]" : "text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)]"} hover:bg-[var(--hover-bg-strong)]`} aria-label="Pin sidebar">
            {isPinned ? <PinOff className="h-5 w-5 shrink-0" /> : <Pin className="h-5 w-5 shrink-0" />}
            <span className={`overflow-hidden transition-all duration-150 whitespace-nowrap font-medium ${isExpanded ? "max-w-[200px] mr-3 opacity-100 translate-x-0" : "max-w-0 mr-0 opacity-0 translate-x-4"}`}>
              {isPinned ? "باز کردن قفل" : "قفل کردن"}
            </span>
          </button>

          {mounted && (
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className={`w-full group flex items-center ${isExpanded ? "" : "justify-center"} px-4 py-2.5 rounded-xl transition-all duration-150 text-[var(--sidebar-text)] hover:bg-[var(--hover-bg-strong)] hover:text-[var(--sidebar-text-hover)]`} aria-label="Toggle theme">
              <div className="relative w-5 h-5 shrink-0">
                <Sun className={`absolute inset-0 w-5 h-5 transition-all duration-150 ${theme === "dark" ? "opacity-0 scale-0 rotate-90" : "opacity-100 scale-100 rotate-0"} group-hover:text-[var(--sidebar-text-hover)]`} />
                <Moon className={`absolute inset-0 w-5 h-5 transition-all duration-150 ${theme === "dark" ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 -rotate-90"} group-hover:text-[var(--sidebar-text-hover)]`} />
              </div>
              <span className={`overflow-hidden transition-all duration-150 whitespace-nowrap font-medium ${isExpanded ? "max-w-[200px] mr-3 opacity-100 translate-x-0" : "max-w-0 mr-0 opacity-0 translate-x-4"}`}>
                {theme === "dark" ? "تم روشن" : "تم تاریک"}
              </span>
            </button>
          )}
          {session?.user?.role === "Admin" && (
            <Link href="/admin" className={`w-full group flex items-center ${isExpanded ? "" : "justify-center"} px-4 py-2.5 rounded-xl transition-all duration-150 text-[var(--sidebar-text)] hover:bg-[var(--hover-bg-strong)] hover:text-[var(--sidebar-text-hover)]`} aria-label="Admin panel">
              <BookOpen className="h-5 w-5 shrink-0" />
              <span className={`overflow-hidden transition-all duration-150 whitespace-nowrap font-medium ${isExpanded ? "max-w-[200px] mr-3 opacity-100 translate-x-0" : "max-w-0 mr-0 opacity-0 translate-x-4"}`}>
                پنل مدیر
              </span>
            </Link>
          )}
          <button onClick={() => signOut({ callbackUrl: "/" })} className={`w-full group flex items-center ${isExpanded ? "" : "justify-center"} px-4 py-2.5 rounded-xl transition-all duration-150 text-[var(--danger)] hover:bg-[var(--danger-hover-bg)] hover:text-[var(--sidebar-text-hover)] hover:scale-105`}>
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={`overflow-hidden transition-all duration-150 whitespace-nowrap font-medium ${isExpanded ? "max-w-[200px] mr-3 opacity-100 translate-x-0" : "max-w-0 mr-0 opacity-0 translate-x-4"}`}>
              خروج از حساب
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
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-white/25 rounded-full" />
        </div>

        <div className="flex items-center gap-3 px-5 py-4">
          <Avatar
            seed={session?.user?.avatarSeed || session?.user?.fullname || "lingofam"}
            size={44}
            className="w-11 h-11 rounded-2xl shrink-0 bg-[var(--hover-bg-strong)]"
          />
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-[var(--sidebar-heading)] truncate">
              {session?.user?.fullname || "کاربر لینگوفم"}
            </p>
            <p className="text-xs text-[var(--sidebar-text)]">پنل کاربری شما</p>
          </div>
          <button
            onClick={closeMobileSheet}
            className="p-2.5 rounded-xl bg-[var(--hover-bg)] text-[var(--sidebar-text)] hover:bg-[var(--hover-bg-strong)] hover:text-[var(--sidebar-text-hover)] transition-all duration-150 hover:scale-105"
            aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-2 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileSheet}
                className={`group flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-150 ${
                  isActive
                    ? "bg-gradient-to-l from-[var(--light-purple)] to-[var(--dark-purple)] text-white shadow-lg"
                    : "text-[var(--sidebar-text)] hover:bg-[var(--hover-bg)] hover:text-[var(--sidebar-text-hover)]"
                }`}>
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-150 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[var(--hover-bg)] text-[var(--sidebar-text)] group-hover:text-[var(--sidebar-text-hover)]"
                  }`}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className={`flex-1 text-base ${isActive ? "font-bold" : "font-medium"}`}>
                  {item.label}
                </span>
                <ChevronLeft
                  className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
                    isActive ? "text-white/70" : "text-[var(--sidebar-text)] opacity-40"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div
          className="px-4 pt-2 space-y-1.5 border-t border-white/5"
          style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
          {mounted && (
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="group w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl text-[var(--sidebar-text)] hover:bg-[var(--hover-bg)] hover:text-[var(--sidebar-text-hover)] transition-all duration-150" aria-label="Toggle theme">
              <span className="w-10 h-10 rounded-xl bg-[var(--hover-bg)] flex items-center justify-center group-hover:bg-[var(--hover-bg-strong)] transition-colors duration-150">
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </span>
              <span className="text-base font-medium">
                {theme === "dark" ? "فعال کردن تم روشن" : "فعال کردن تم تاریک"}
              </span>
            </button>
          )}

          {session?.user?.role === "Admin" && (
            <Link
              href="/admin"
              onClick={closeMobileSheet}
              className="group w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl text-[var(--sidebar-text)] hover:bg-[var(--hover-bg)] hover:text-[var(--sidebar-text-hover)] transition-all duration-150"
              aria-label="Admin panel">
              <span className="w-10 h-10 rounded-xl bg-[var(--hover-bg)] flex items-center justify-center group-hover:bg-[var(--hover-bg-strong)] transition-colors duration-150">
                <BookOpen className="w-5 h-5" />
              </span>
              <span className="text-base font-medium">پنل مدیر</span>
            </Link>
          )}

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
