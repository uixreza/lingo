// components/dashboard/Header.tsx
"use client";
import {
  Wallet,
  Star,
  Gem,
  Zap,
  ChevronLeft,
  Bell,
  Swords,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Avatar from "./Avatar";

type User = {
  name: string;
  image?: string | null;
  balance: number;
  level?: number;
  xp?: number;
  streak?: number;
  badges?: string[];
};

export default function Header({ user }: { user: User }) {
  const { data: session } = useSession();
  const displayName = session?.user?.fullname || user.name;

  const {
    name: _name,
    balance,
    level = 1,
    xp = 0,
    streak = 0,
  } = user;

  const [realBalance, setRealBalance] = useState<number | null>(null);

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/wallet");
      if (res.ok) {
        const data = await res.json();
        setRealBalance(data.balance);
      }
    } catch {
      // fallback to prop balance
    }
  };

  const [hasUnread, setHasUnread] = useState(false);

  const fetchUnread = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data: { read: boolean }[] = await res.json();
        setHasUnread(Array.isArray(data) && data.some((n) => !n.read));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchUnread();
    const balanceHandler = () => fetchBalance();
    const unreadHandler = () => fetchUnread();
    window.addEventListener("balance-update", balanceHandler);
    window.addEventListener("notifications-read", unreadHandler);
    return () => {
      window.removeEventListener("balance-update", balanceHandler);
      window.removeEventListener("notifications-read", unreadHandler);
    };
  }, []);

  // Calculate XP progress
  const xpForNextLevel = 1000;
  const xpProgress = (xp / xpForNextLevel) * 100;

  return (
    <header className="bg-[var(--header-bg)] backdrop-blur-2xl shadow-sm px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        {/* Left: Profile with Gamification */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Profile Image with Level Badge */}
          <div className="relative group">
            <div className="relative bg-[var(--hover-bg-strong)] rounded-2xl p-0.5">
              <Avatar
                seed={session?.user?.avatarSeed || displayName}
                size={56}
                className="rounded-xl w-12 h-12 sm:w-14 sm:h-14"
              />
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[var(--light-purple)] to-[var(--dark-purple)] text-white text-[10px] font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg border-2 border-[var(--header-bg)]">
                {level}
              </div>
            </div>
          </div>

          {/* User Info and Progress */}
          <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h3 className="text-base sm:text-xl font-bold text-[var(--header-text)] truncate max-w-[120px] xs:max-w-[150px] sm:max-w-none">
                {displayName}
              </h3>

              {/* Streak Badge - Important, keep green */}
              {streak > 0 && (
                <div className="flex items-center gap-1 bg-gradient-to-r from-[var(--light-purple)] to-[var(--dark-purple)] px-2 py-1 sm:px-3 sm:py-1 rounded-full text-white text-xs sm:text-sm font-medium shadow-lg">
                  <Zap className="h-3 w-3 fill-current" />
                  <span className="hidden xs:inline">{streak} روز</span>
                  <span className="xs:hidden">{streak}</span>
                </div>
              )}
            </div>

            {/* XP Progress Bar - Important, keep green */}
            <div className="hidden xs:flex items-center gap-2 sm:gap-3 w-full max-w-[200px] sm:max-w-[240px] lg:max-w-[280px]">
              <div className="flex-1 bg-[var(--hover-bg-strong)] rounded-full h-1.5 sm:h-2 overflow-hidden min-w-[80px]">
                <div
                  className="bg-gradient-to-r from-[var(--light-purple)] to-[var(--dark-purple)] h-full rounded-full transition-all duration-500 ease-out shadow-lg"
                  style={{ width: `${Math.min(xpProgress, 100)}%` }}
                />
              </div>
              <span className="text-[var(--text-muted)] text-xs sm:text-sm font-medium min-w-[45px] sm:min-w-[60px] shrink-0">
                {xp} XP
              </span>
            </div>

            {/* Pro & Loyalty Badges */}
            <div className="flex items-center gap-2">
              {user.badges?.includes("Pro") && (
                <div className="group relative">
                  <div className="bg-purple-500/15 text-purple-400 rounded-lg p-1.5 shadow-lg hover:scale-110 transition-transform duration-200">
                    <Star className="h-3 w-3 fill-purple-400" />
                  </div>
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-10">
                    کاربر ویژه (Pro)
                  </div>
                </div>
              )}
              {user.badges?.includes("Loyalty") && (
                <div className="group relative">
                  <div className="bg-amber-500/15 text-amber-400 rounded-lg p-1.5 shadow-lg hover:scale-110 transition-transform duration-200">
                    <Gem className="h-3 w-3" />
                  </div>
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-10">
                    کاربر وفادار
                  </div>
                </div>
              )}
              {user.badges?.includes("Warrior") && (
                <div className="group relative">
                  <div className="bg-red-500/15 text-red-400 rounded-lg p-1.5 shadow-lg hover:scale-110 transition-transform duration-200">
                    <Swords className="h-3 w-3" />
                  </div>
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-10">
                    رزمنده
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Balance and Notifications */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <Link
            href={"/dashboard/notification"}
            className="relative p-2 rounded-xl bg-[var(--hover-bg)]  hover:bg-[var(--hover-bg-strong)] transition-all duration-200 group shadow-lg">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--icon-muted)]" />
            {hasUnread && (
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full border-2 border-[var(--header-bg)]" />
            )}
          </Link>

          {/* Balance Card */}
          <Link
            href="/dashboard/wallet"
            className="group flex items-center gap-2 sm:gap-3 bg-[var(--hover-bg)]  rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 hover:bg-[var(--hover-bg-strong)] hover:scale-105 transition-all duration-200 shadow-lg min-w-[100px] xs:min-w-[120px] sm:min-w-[140px]">
            <div className="relative">
              <Wallet className="h-4 w-4 sm:h-6 sm:w-6 text-[var(--icon-muted)]" />
            </div>

            <div className="text-right flex-1 min-w-0">
              <div className="text-[var(--text-muted)] text-[10px] xs:text-xs">
                موجودی
              </div>
               <div className="text-[var(--header-text)] font-bold text-sm xs:text-base sm:text-lg leading-none truncate min-h-[1.25em]">
                {realBalance === null ? (
                  <span className="flex items-end gap-1 mt-1" dir="ltr">
                    <span className="w-1.5 h-1.5 bg-[var(--header-text)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-[var(--header-text)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-[var(--header-text)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                ) : (
                  realBalance.toLocaleString("fa-IR")
                )}
              </div>
            </div>

            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 text-[var(--text-muted)] group-hover:text-[var(--header-text)] transition-colors shrink-0" />
          </Link>
        </div>
      </div>

    </header>
  );
}
