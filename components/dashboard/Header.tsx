// components/dashboard/Header.tsx
"use client";
import {
  Wallet,
  Star,
  Gem,
  Zap,
  ChevronLeft,
  Swords,
  Sparkles,
  Leaf,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Avatar from "./Avatar";
import { useLang } from "@/contexts/LanguageContext";

type User = {
  name: string;
  image?: string | null;
  balance: number;
  years?: number;
  streak?: number;
  badges?: string[];
};

export default function Header({ user }: { user: User }) {
  const { data: session } = useSession();
  const displayName = session?.user?.fullname || user.name;
  const { t, locale, setLocale } = useLang();

  const {
    name: _name,
    balance,
    years = 1,
    streak = 0,
  } = user;

  const [realBalance, setRealBalance] = useState<number | null>(null);
  const [hasUnread, setHasUnread] = useState(false);

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

  useEffect(() => {
    fetchBalance();
    const balanceHandler = () => fetchBalance();
    window.addEventListener("balance-update", balanceHandler);
    return () => {
      window.removeEventListener("balance-update", balanceHandler);
    };
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data: { read: boolean }[] = await res.json();
          setHasUnread(Array.isArray(data) && data.some((n) => !n.read));
        }
      } catch {}
    };
    fetchUnread();
    const handler = () => fetchUnread();
    window.addEventListener("notifications-read", handler);
    return () => window.removeEventListener("notifications-read", handler);
  }, []);

  return (
    <header className="bg-[var(--header-bg)] backdrop-blur-2xl shadow-sm px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        {/* Left: Profile with Gamification */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle */}
          <div className="flex flex-col rounded-xl overflow-hidden ring-1 ring-[var(--hover-bg-strong)]">
            <button
              onClick={() => setLocale("fa")}
              className={`px-1.5 py-1 text-[10px] font-bold transition-all duration-200 ${
                locale === "fa"
                  ? "bg-gradient-to-l from-[var(--light-purple)] to-[var(--dark-purple)] text-white shadow-lg"
                  : "bg-[var(--hover-bg)] text-[var(--icon-muted)] hover:text-[var(--header-text)]"
              }`}>
              FA
            </button>
            <button
              onClick={() => setLocale("en")}
              className={`px-1.5 py-1 text-[10px] font-bold transition-all duration-200 ${
                locale === "en"
                  ? "bg-gradient-to-l from-[var(--light-purple)] to-[var(--dark-purple)] text-white shadow-lg"
                  : "bg-[var(--hover-bg)] text-[var(--icon-muted)] hover:text-[var(--header-text)]"
              }`}>
              EN
            </button>
          </div>

          {/* Profile Image with Level Badge */}
          <div className="relative group">
            <div className="relative bg-[var(--hover-bg-strong)] rounded-2xl p-0.5">
              <Avatar
                seed={session?.user?.avatarSeed || displayName}
                size={56}
                className="rounded-xl w-12 h-12 sm:w-14 sm:h-14"
              />
              <div
                title={`${years} ${t("header.yearsSuffix")}`}
                className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[var(--light-purple)] to-[var(--dark-purple)] text-white text-[10px] font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg border-2 border-[var(--header-bg)]">
                {years}
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

            {/* Badges */}
            <div className="flex items-center gap-2">
              {user.badges?.includes("Newbie") && (
                <div className="group relative">
                  <div className="bg-green-500/15 text-green-400 rounded-lg p-1.5 shadow-lg hover:scale-110 transition-transform duration-200">
                    <Leaf className="h-3 w-3" />
                  </div>
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-10">
                    {t("header.badgeNewbie")}
                  </div>
                </div>
              )}
              {user.badges?.includes("Pro") && (
                <div className="group relative">
                  <div className="bg-purple-500/15 text-purple-400 rounded-lg p-1.5 shadow-lg hover:scale-110 transition-transform duration-200">
                    <Star className="h-3 w-3 fill-purple-400" />
                  </div>
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-10">
                    {t("header.badgePro")}
                  </div>
                </div>
              )}
              {user.badges?.includes("Loyalty") && (
                <div className="group relative">
                  <div className="bg-amber-500/15 text-amber-400 rounded-lg p-1.5 shadow-lg hover:scale-110 transition-transform duration-200">
                    <Gem className="h-3 w-3" />
                  </div>
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-10">
                    {t("header.badgeLoyalty")}
                  </div>
                </div>
              )}
              {user.badges?.includes("Warrior") && (
                <div className="group relative">
                  <div className="bg-red-500/15 text-red-400 rounded-lg p-1.5 shadow-lg hover:scale-110 transition-transform duration-200">
                    <Swords className="h-3 w-3" />
                  </div>
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-10">
                    {t("header.badgeWarrior")}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Balance */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Bell - large screens only */}
          <Link
            href="/dashboard/notification"
            className="hidden lg:flex relative items-center justify-center p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[var(--hover-bg)] hover:bg-[var(--hover-bg-strong)] transition-all duration-200 group shadow-lg border border-white/5">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--icon-muted)] group-hover:text-[var(--header-text)] transition-colors" />
            {hasUnread && (
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full border-2 border-[var(--header-bg)]" />
            )}
          </Link>

          {/* Balance Card */}
          <Link
            href="/dashboard/wallet"
            className="group relative flex items-center gap-2 sm:gap-3 overflow-hidden bg-gradient-to-l from-[var(--light-purple)]/15 via-[var(--hover-bg)] to-[var(--hover-bg)] rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ring-1 ring-purple-500/15 hover:ring-purple-400/40 hover:scale-105 transition-all duration-200 shadow-lg min-w-[100px] xs:min-w-[120px] sm:min-w-[140px]">
            <div className="absolute -top-8 -left-8 h-20 w-20 rounded-full bg-purple-500/25 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative flex items-center gap-2 sm:gap-3 w-full">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] rounded-xl blur-md opacity-60" />
                <div className="relative bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] rounded-xl p-2 sm:p-2.5 shadow-lg">
                  <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </div>

              <div className="text-right flex-1 min-w-0">
                <div className="text-[var(--text-muted)] text-[10px] xs:text-xs">
                  {t("header.balance")}
                </div>
                <div className="text-[var(--header-text)] font-bold text-sm xs:text-base sm:text-lg leading-none truncate min-h-[1.25em]">
                  {realBalance === null ? (
                    <span className="flex items-end gap-1 mt-1" dir="ltr">
                      <span className="w-1.5 h-1.5 bg-[var(--dash-accent)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-[var(--dash-accent)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-[var(--dash-accent)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  ) : (
                    realBalance.toLocaleString("fa-IR")
                  )}
                </div>
              </div>

              <ChevronLeft className={`h-3 w-3 sm:h-4 sm:w-4 text-[var(--text-muted)] group-hover:text-[var(--header-text)] transition-colors shrink-0 ${locale === "en" ? "rotate-180" : ""}`} />
            </div>
          </Link>
        </div>
      </div>

    </header>
  );
}
