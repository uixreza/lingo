"use client";
import Image from "next/image";
import { Wallet, ChevronLeft, Bell, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type User = {
  name: string;
  image?: string | null;
  balance: number;
};

export default function Header({ user }: { user: User }) {
  const { name, image, balance } = user;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-[var(--header-bg)] backdrop-blur-2xl shadow-sm px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        {/* Left: Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-xl bg-[var(--hover-bg)] shadow-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="h-5 w-5 text-[var(--header-text)]" />
          </button>

          {/* Profile Image */}
          <div className="relative">
            {image ? (
              <Image
                src={image}
                alt={name}
                width={48}
                height={48}
                className="rounded-2xl object-cover shadow-lg transition-all duration-300 w-12 h-12 sm:w-14 sm:h-14"
              />
            ) : (
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-[var(--hover-bg-strong)] flex items-center justify-center shadow-lg">
                <span className="text-[var(--header-text)] font-bold text-lg sm:text-xl">
                  {name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="space-y-0.5 min-w-0 flex-1">
            <h3 className="text-base sm:text-xl font-bold text-[var(--header-text)] truncate max-w-[120px] xs:max-w-[150px] sm:max-w-none">
              {name}
            </h3>
            <div className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-medium w-fit">
              Admin Panel
            </div>
          </div>
        </div>

        {/* Right: Balance and Notifications */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications - Disabled */}
          <div className="relative p-2 rounded-xl bg-[var(--hover-bg)] opacity-40 cursor-not-allowed shadow-lg">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--icon-muted)]" />
          </div>

          {/* Balance Card */}
          <Link
            href="/admin/wallet"
            className="group flex items-center gap-2 sm:gap-3 bg-[var(--hover-bg)] rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 hover:bg-[var(--hover-bg-strong)] hover:scale-105 transition-all duration-200 shadow-lg min-w-[100px] xs:min-w-[120px] sm:min-w-[140px]">
            <div className="relative">
              <Wallet className="h-4 w-4 sm:h-6 sm:w-6 text-[var(--icon-muted)]" />
            </div>

            <div className="text-right flex-1 min-w-0">
              <div className="text-[var(--text-muted)] text-[10px] xs:text-xs">
                موجودی
              </div>
              <div className="text-[var(--header-text)] font-bold text-sm xs:text-base sm:text-lg leading-none truncate">
                {balance.toLocaleString("en-US")}
              </div>
            </div>

            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 text-[var(--text-muted)] group-hover:text-[var(--header-text)] transition-colors shrink-0" />
          </Link>
        </div>
      </div>
    </header>
  );
}
