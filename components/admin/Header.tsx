"use client";
import Image from "next/image";
import { Wallet, ChevronLeft, Bell } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Avatar from "@/components/dashboard/Avatar";

type User = {
  name: string;
  image?: string | null;
  balance: number;
};

export default function Header({ user }: { user: User }) {
  const { data: session } = useSession();
  const displayName = session?.user?.fullname || user.name;
  const { image } = user;
  const [realBalance, setRealBalance] = useState<number | null>(null);
  const [mentorPhoto, setMentorPhoto] = useState<string | null>(null);

  useEffect(() => {
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
    fetchBalance();

    const fetchMentor = async () => {
      try {
        const res = await fetch("/api/mentor");
        if (res.ok) {
          const data = await res.json();
          if (data.mentor?.photoUrl) setMentorPhoto(data.mentor.photoUrl);
        }
      } catch {
        // silent
      }
    };
    fetchMentor();
  }, []);

  return (
    <header className="bg-[var(--header-bg)] backdrop-blur-2xl shadow-sm px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        {/* Left: Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Profile Image */}
          <div className="relative bg-[var(--hover-bg-strong)] rounded-2xl p-0.5">
            {mentorPhoto ? (
              <Image
                src={mentorPhoto}
                alt={displayName}
                width={56}
                height={56}
                unoptimized
                className="rounded-2xl object-cover shadow-lg transition-all duration-300 w-12 h-12 sm:w-14 sm:h-14"
              />
            ) : session?.user?.avatarSeed ? (
              <Avatar
                seed={session.user.avatarSeed}
                size={56}
                className="rounded-2xl w-12 h-12 sm:w-14 sm:h-14"
              />
            ) : image ? (
              <Image
                src={image}
                alt={displayName}
                width={48}
                height={48}
                className="rounded-2xl object-cover shadow-lg transition-all duration-300 w-12 h-12 sm:w-14 sm:h-14"
              />
            ) : (
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center">
                <span className="text-[var(--header-text)] font-bold text-lg sm:text-xl">
                  {displayName.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Balance and Notifications */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <Link
            href="/admin/notification"
            className="relative p-2 rounded-xl bg-[var(--hover-bg)] hover:bg-[var(--hover-bg-strong)] transition-all duration-200 shadow-lg">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--icon-muted)]" />
          </Link>

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
                {(realBalance ?? 0).toLocaleString("fa-IR")}
              </div>
            </div>

            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 text-[var(--text-muted)] group-hover:text-[var(--header-text)] transition-colors shrink-0" />
          </Link>
        </div>
      </div>
    </header>
  );
}
