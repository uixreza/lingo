"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import data from "@/data.json";
import {
  BookOpen,
  Calendar,
  Clock,
  Globe,
  Loader2,
  Play,
  Pause,
  Radio,
  Volume2,
  ChevronDown,
  ChevronUp,
  Download,
  HardDrive,
  Info,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRadio } from "@/components/RadioProvider";
import { useLang } from "@/contexts/LanguageContext";
import { PageSkeleton } from "@/components/dashboard/Skeletons";
const kidsBooks = data.kids.items.map((item, i) => ({
  ...item,
  id: `kid-${i}`,
}));

const adultBooks = data.adults.items.map((item, i) => ({
  ...item,
  id: `adult-${i}`,
}));

const etcBooks = data.etc.items.map((item, i) => ({
  ...item,
  id: `etc-${i}`,
}));

type DailyWord = {
  word: string;
  partOfSpeech: string | null;
  meaning: string;
  example: string;
};

export default function DashboardPage() {
  const [activeGroup, setActiveGroup] = useState<"kids" | "adults" | "etc">(
    "kids",
  );
  const [showOaldInfo, setShowOaldInfo] = useState(false);
  const session = useSession();
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [marqueeTexts, setMarqueeTexts] = useState<string[]>([]);
  const [wordOfDay, setWordOfDay] = useState<DailyWord | null>(null);
  const [phrasalVerb, setPhrasalVerb] = useState<DailyWord | null>(null);
  const [stats, setStats] = useState<{
    upcomingCount: number;
    upcomingSessions: {
      id: number;
      date: string;
      time: string;
      language: string;
      meetLink: string | null;
    }[];
    privateSessions: number;
  } | null>(null);
  const { t, locale } = useLang();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, dailyRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/dashboard/daily-content"),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (dailyRes.ok) {
          const daily = await dailyRes.json();
          if (Array.isArray(daily.marquee) && daily.marquee.length > 0)
            setMarqueeTexts(daily.marquee);
          if (daily.word) setWordOfDay(daily.word);
          if (daily.phrasalVerb) setPhrasalVerb(daily.phrasalVerb);
        }
      } catch {
        // stats are decorative; keep cards hidden on failure
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const books =
    activeGroup === "kids"
      ? kidsBooks
      : activeGroup === "adults"
        ? adultBooks
        : etcBooks;

  return isLoading ? <PageSkeleton /> : (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='3' cy='3' r='1.5' fill='white' fill-opacity='0.8'/%3E%3Ccircle cx='13' cy='3' r='1.5' fill='white' fill-opacity='0.8'/%3E%3Ccircle cx='3' cy='13' r='1.5' fill='white' fill-opacity='0.8'/%3E%3Ccircle cx='13' cy='13' r='1.5' fill='white' fill-opacity='0.8'/%3E%3C/svg%3E")`,
            backgroundSize: "20px 20px",
            backgroundRepeat: "repeat",
          }}
        />
        <div
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(34,197,94,0.45) 0%, rgba(34,197,94,0.12) 45%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />
        <div className="relative z-10">
        {marqueeTexts.length > 0 && (
        <div
          className="flex items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-l from-green-500/10 to-emerald-500/5 ring-1 ring-green-500/15 px-4 py-2.5 mb-6"
          style={{ direction: "ltr" }}>
          <span className="shrink-0 flex items-center gap-2 text-xs font-bold text-green-500">
            <span className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </span>
            {t("dashboard.notifications")}
          </span>
          <div className="relative flex-1 overflow-hidden min-w-0">
            <div className="flex w-max animate-marquee-reverse">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
                  {marqueeTexts.map((msg, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium text-[var(--dash-muted)] whitespace-nowrap px-6 flex items-center gap-2">
                      {msg}
                      <span className="w-1 h-1 rounded-full bg-green-500/60 shrink-0" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <div className="inline-block px-4 py-1.5 rounded-full bg-green-500 text-black text-xs font-bold mb-3">
              {t("dashboard.welcome")}
            </div>
            <h1 className="text-2xl font-bold text-[var(--dash-text)]">
              {t("dashboard.welcomeUser").replace("{name}", session.data?.user.fullname || "")}
            </h1>
            <p className="text-[var(--dash-muted)] mt-2 text-sm sm:text-base">
              {t("dashboard.greeting")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1 h-full">
            <button
              onClick={() => {
                if (navigating) return;
                setNavigating(true);
                router.push("/dashboard/sessions");
              }}
              disabled={navigating}
              className="group relative flex flex-col items-center justify-center rounded-t-2xl rounded-b-none bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] overflow-hidden cursor-pointer min-h-[80px] sm:min-h-0"
              style={{ flex: "2 1 0%" }}>
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0L30 15L15 30L0 15Z' fill='white' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                  backgroundSize: "30px 30px",
                  backgroundRepeat: "repeat",
                }}
              />
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {t("dashboard.requestSession")}
                </span>
                {navigating ? (
                  <Loader2 className="w-7 h-7 text-white animate-spin" />
                ) : (
                  <svg
                    className={`w-7 h-7 text-white ${locale === "en" ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 5l-7 7 7 7"
                    />
                  </svg>
                )}
              </div>

              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <Link href="/dashboard/ticket" className="block" style={{ flex: "1 1 0%" }}>
              <button className="w-full h-full group relative flex items-center justify-center gap-2 rounded-b-2xl rounded-t-none bg-gradient-to-br from-green-600/80 to-emerald-700/80 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.03] overflow-hidden cursor-pointer min-h-[60px] sm:min-h-0">
                <div
                  className="absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0L30 15L15 30L0 15Z' fill='white' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                    backgroundSize: "30px 30px",
                    backgroundRepeat: "repeat",
                  }}
                />
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-sm font-bold text-white">
                  {t("dashboard.support")}
                </span>
              </button>
            </Link>
          </div>
          <UpcomingSessionsCard stats={stats} />
          <RadioCard />
        </div>
      </div>
      </div>

      {(wordOfDay || phrasalVerb) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wordOfDay && <WordOfTheDay word={wordOfDay} />}
          {phrasalVerb && <PhrasalVerbOfTheDay word={phrasalVerb} />}
        </div>
      )}

      {/* OALD Dictionary Download Section */}
      <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 overflow-hidden relative">
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-lg ring-1 ring-white/10 shrink-0 bg-white">
            <img
              src="/assets/img/OALD.png"
              alt="OALD Dictionary"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-[var(--dash-text)]">
                {t("dashboard.oaldTitle")}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 text-[10px] font-bold">
                {t("dashboard.oaldPlatform")}
              </span>
            </div>
            <p className="text-sm text-[var(--dash-muted)] mb-3">
              Oxford Advanced Learner&rsquo;s Dictionary — دیتای کامل قابل دانلود داخل اپلیکیشن
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://dl.androidha.com/com.oup.elt.oald10_gp/Oxford_Advanced.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all duration-200">
                <Download className="w-4 h-4" />
                {t("dashboard.downloadApp")}
              </a>
              <span className="flex items-center gap-1.5 text-xs text-[var(--dash-muted)]">
                <HardDrive className="w-3.5 h-3.5" />
                {t("dashboard.oaldSize")}
              </span>
              <button
                onClick={() => setShowOaldInfo(!showOaldInfo)}
                className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400 font-medium transition-colors">
                <Info className="w-3.5 h-3.5" />
                {t("dashboard.moreInfo")}
                {showOaldInfo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
            {showOaldInfo && (
              <div className="mt-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-sm text-[var(--dash-muted)] leading-relaxed">
                {t("dashboard.downloadHint")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download Books Section */}
      <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
        <h2 className="text-xl font-bold text-[var(--dash-text)] mb-6">
          {t("dashboard.downloads")}
        </h2>

        {/* Group Tabs */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setActiveGroup("kids")}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              activeGroup === "kids"
                ? "bg-green-500/15 border border-green-500/40 text-green-500 shadow-sm"
                : "bg-[var(--hover-bg)] text-[var(--dash-muted)] hover:bg-[var(--hover-bg-strong)] hover:text-[var(--dash-text)]"
            }`}>
            {t("dashboard.kids")}
          </button>
          <button
            onClick={() => setActiveGroup("adults")}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              activeGroup === "adults"
                ? "bg-green-500/15 border border-green-500/40 text-green-500 shadow-sm"
                : "bg-[var(--hover-bg)] text-[var(--dash-muted)] hover:bg-[var(--hover-bg-strong)] hover:text-[var(--dash-text)]"
            }`}>
            {t("dashboard.adults")}
          </button>
          <button
            onClick={() => setActiveGroup("etc")}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              activeGroup === "etc"
                ? "bg-green-500/15 border border-green-500/40 text-green-500 shadow-sm"
                : "bg-[var(--hover-bg)] text-[var(--dash-muted)] hover:bg-[var(--hover-bg-strong)] hover:text-[var(--dash-text)]"
            }`}>
            {t("dashboard.misc")}
          </button>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
}

function WordCard({
  title,
  word,
  partOfSpeech,
  meaning,
  example,
  gradient,
  accentColor,
  iconColor,
}: {
  title: string;
  word: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
  gradient: string;
  accentColor: string;
  iconColor: string;
}) {
  return (
    <div
      dir="ltr"
      className={`relative ${gradient} rounded-2xl p-5 shadow-xl overflow-hidden group hover:${accentColor}/40 transition-all duration-300`}>
      <div
        className={`absolute top-0 right-0 w-32 h-32 ${accentColor}/5 rounded-full blur-3xl pointer-events-none`}
      />
      <div
        className={`absolute bottom-0 left-0 w-24 h-24 ${accentColor}/5 rounded-full blur-2xl pointer-events-none`}
      />

      <div className="flex items-center gap-2 mb-3">
        <BookOpen className={`w-4 h-4 ${iconColor}`} />
        <span
          className={`${iconColor} text-xs font-bold tracking-wider uppercase`}>
          {title}
        </span>
      </div>

      <div className="relative z-10">
        <h3 className="text-white text-xl font-bold">{word}</h3>
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full ${accentColor}/15 ${iconColor} text-xs font-medium mt-1.5 mb-3`}>
          {partOfSpeech}
        </span>

        <div className="bg-white/5 rounded-xl p-3 mb-3">
          <p className={`${iconColor} text-sm font-medium`}>{meaning}</p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
          <p className="text-[#aaa] text-sm italic leading-relaxed">
            &ldquo;{example}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

function WordOfTheDay({ word }: { word: DailyWord }) {
  return (
    <WordCard
      title="Word of Today"
      gradient="bg-gradient-to-br from-[#1a2e1a] to-[#0d1f0d]"
      accentColor="border-green-500"
      iconColor="text-green-400"
      {...word}
      partOfSpeech={word.partOfSpeech ?? ""}
    />
  );
}

function PhrasalVerbOfTheDay({ word }: { word: DailyWord }) {
  return (
    <WordCard
      title="Phrasal Verb of Today"
      gradient="bg-gradient-to-br from-[#2a1a2e] to-[#1a0d1f]"
      accentColor="border-purple-500"
      iconColor="text-purple-400"
      {...word}
      partOfSpeech={word.partOfSpeech ?? ""}
    />
  );
}

function UpcomingSessionsCard({
  stats,
}: {
  stats: {
    upcomingCount: number;
    upcomingSessions: {
      id: number;
      date: string;
      time: string;
      language: string;
      meetLink: string | null;
    }[];
    privateSessions: number;
  } | null;
}) {
  const upcoming = stats?.upcomingSessions ?? [];
  const next = upcoming[0];
  const moreCount = stats ? stats.upcomingCount - upcoming.length : 0;
  const { t } = useLang();

  return (
    <Link
      href="/dashboard/sessions"
      className="group relative flex flex-col rounded-2xl bg-[var(--dash-sides)]/80 backdrop-blur-2xl shadow-2xl p-4 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] overflow-hidden">
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-green-500" />
          </span>
          <h3 className="font-bold text-sm text-[var(--dash-text)]">
            {t("dashboard.upcomingSessions")}
          </h3>
        </div>
        {stats && (
          <span className="px-2.5 py-1 rounded-full bg-green-500/15 text-green-500 text-xs font-bold">
            {stats.upcomingCount.toLocaleString("fa-IR")}
          </span>
        )}
      </div>

      {!stats ? (
        <p className="text-sm text-[var(--dash-muted)] py-1">
          {t("dashboard.loading")}
        </p>
      ) : next ? (
        <>
          <div className="bg-[var(--hover-bg)] rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-green-500 shrink-0" />
              <span className="font-bold text-[var(--dash-text)]" dir="rtl">
                {next.date.replaceAll("/", " / ")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-green-500 shrink-0" />
              <span className="font-medium text-[var(--dash-muted)]">
                {t("dashboard.hour")} {next.time}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-green-500 shrink-0" />
              <span className="font-medium text-[var(--dash-muted)]">
                {next.language}
              </span>
            </div>
          </div>
          {moreCount > 0 && (
            <p className="text-xs text-[var(--dash-muted)] mt-2">
              {t("dashboard.moreSessions").replace("{count}", String(moreCount))}
            </p>
          )}
        </>
      ) : (
        <div className="bg-[var(--hover-bg)] rounded-xl p-3">
          <p className="text-sm text-[var(--dash-muted)]">
            {t("dashboard.noSessions")}
          </p>
        </div>
      )}
    </Link>
  );
}

function RadioCard() {
  const { playing, failed, toggle, accent, setAccent, station } = useRadio();
  const { t } = useLang();

  return (
    <div className="relative flex flex-col justify-between rounded-2xl bg-[var(--dash-sides)]/80 backdrop-blur-2xl shadow-2xl p-4 overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-3">
        <span className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center">
          <Radio className="w-4 h-4 text-purple-400" />
        </span>
        <div>
          <h3 className="font-bold text-sm text-[var(--dash-text)]">
            {t("dashboard.radio")}
          </h3>
          <p className="text-xs text-[var(--dash-muted)]">
            {t("dashboard.radioSubtitle")}
          </p>
        </div>
        <div className="ms-auto flex items-center gap-1 p-0.5 rounded-full bg-[var(--hover-bg)]">
          {(["UK", "US"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAccent(a)}
              aria-pressed={accent === a}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all duration-200 ${
                accent === a
                  ? "bg-gradient-to-r from-[var(--light-purple)] to-[var(--dark-purple)] text-white shadow"
                  : "text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
              }`}>
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label={playing ? "توقف پخش" : "پخش رادیو"}
          className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95">
          {playing ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 mr-0.5" />
          )}
        </button>

        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--dash-text)] truncate">
            {station}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-[var(--dash-muted)]">
              {failed
                ? t("dashboard.radioUnavailable")
                : playing
                  ? t("dashboard.playingLive")
                  : accent === "US"
                    ? t("dashboard.americanAccent")
                    : t("dashboard.britishAccent")}
            </p>
            {playing && (
              <span className="flex items-end gap-0.5 h-3" aria-hidden>
                <span className="eq-bar" style={{ animationDelay: "0s" }} />
                <span className="eq-bar" style={{ animationDelay: "0.2s" }} />
                <span className="eq-bar" style={{ animationDelay: "0.4s" }} />
                <span className="eq-bar" style={{ animationDelay: "0.1s" }} />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookCard({
  book,
}: {
  book: {
    id: string;
    name: string;
    author: string;
    cover: string;
    bookUrl: string;
    audioUrl: string;
  };
}) {
  const { t } = useLang();
  return (
    <div className="relative group rounded-2xl overflow-hidden shadow-lg aspect-[4/5]">
      {/* Background Image with Fallback */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)]"
        style={{ backgroundImage: `url(${book.cover})` }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-5">
        <h3 className="text-white font-bold text-lg leading-tight">
          {book.name}
        </h3>
        <p className="text-white/80 text-sm mt-1 mb-4">{book.author}</p>

        <div className="flex items-center gap-2">
          <a
            href={book.bookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-[3] px-2 sm:px-3 py-2 sm:py-2.5 bg-green-500 text-black text-xs sm:text-sm font-medium rounded-xl hover:bg-green-400 transition-all duration-200 shadow-lg text-center block">
            {t("dashboard.downloadBook")}
          </a>
          {book.audioUrl && (
            <a
              href={book.audioUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("dashboard.downloadAudio")}
              title={t("dashboard.downloadAudio")}
              className="flex-1 h-9 sm:h-[42px] bg-white/20 text-white rounded-xl hover:bg-white/30 backdrop-blur-sm transition-all duration-200 flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
