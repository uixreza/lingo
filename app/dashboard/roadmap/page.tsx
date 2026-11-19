"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { Award, Check, Gift, Loader2, Lock, Star } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { PageSkeleton } from "@/components/dashboard/Skeletons";
import toast from "@/lib/toast";
import type { TranslationKey } from "@/i18n";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type Level = (typeof LEVELS)[number];
type NodeState = "reached" | "current" | "locked";

// Distance from a node's centre where a rail stops, so it never runs under a
// node (node radius is 32px on desktop + a little breathing room).
const RAIL_GAP = 36;
const RAIL_BASE = "absolute h-2 -translate-y-1/2 rounded-full";
const RAIL_TRACK = `${RAIL_BASE} bg-[var(--hover-bg)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)]`;
const RAIL_FILL = `${RAIL_BASE} bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 shadow-[0_0_14px_rgba(52,211,153,0.5)]`;

// Row geometry of the desktop path (kept as CSS vars so the rails can be
// positioned at the exact vertical centre of the node row).
const COL_COUNT = LEVELS.length;
const RAIL_VARS = {
  "--rail-slot": "160px",
  "--rail-row": "80px",
} as CSSProperties;

const PRIZE_KEYS: Record<Level, TranslationKey> = {
  A1: "roadmap.prizeA1",
  A2: "roadmap.prizeA2",
  B1: "roadmap.prizeB1",
  B2: "roadmap.prizeB2",
  C1: "roadmap.prizeC1",
  C2: "roadmap.prizeC2",
};

function groupOf(level: Level): "green" | "orange" | "red" {
  if (level.startsWith("A")) return "green";
  if (level.startsWith("B")) return "orange";
  return "red";
}

function stateOf(index: number, currentIndex: number): NodeState {
  if (index < currentIndex) return "reached";
  if (index === currentIndex) return "current";
  return "locked";
}

function LevelNode({
  level,
  state,
  compact = false,
}: {
  level: Level;
  state: NodeState;
  compact?: boolean;
}) {
  const { t } = useLang();
  const locked = state === "locked";
  const accent = groupOf(level);

  const size = compact
    ? "h-12 w-12 text-sm"
    : "h-14 w-14 text-sm sm:h-16 sm:w-16 sm:text-base";

  const ring = locked
    ? ""
    : accent === "green"
      ? "bg-gradient-to-br from-green-300 via-green-500 to-emerald-600 shadow-[0_0_20px_rgba(52,211,153,0.35)]"
      : accent === "orange"
        ? "bg-gradient-to-br from-orange-300 via-orange-400 to-orange-600 shadow-[0_0_20px_rgba(251,146,60,0.35)]"
        : "bg-gradient-to-br from-rose-300 via-red-400 to-red-600 shadow-[0_0_20px_rgba(248,113,113,0.35)]";

  const face = locked
    ? "bg-[var(--hover-bg)]/70 border-2 border-dashed border-[var(--dash-muted)]/40 text-[var(--dash-muted)]/70"
    : `bg-[var(--dash-sides)] ${accent === "green" ? "text-green-600 dark:text-green-400" : accent === "orange" ? "text-orange-500 dark:text-orange-400" : "text-red-500 dark:text-red-400"}`;

  const badge = locked
    ? "bg-[var(--hover-bg-strong)] text-[var(--dash-muted)]"
    : state === "current"
      ? "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/40"
      : accent === "green"
        ? "bg-green-500/15 text-green-600 dark:text-green-400 ring-1 ring-green-500/40"
        : accent === "orange"
          ? "bg-orange-500/15 text-orange-500 ring-1 ring-orange-500/40"
          : "bg-red-500/15 text-red-500 ring-1 ring-red-500/40";

  return (
    <div
      className="relative z-10 shrink-0"
      title={locked ? `${level} — ${t("roadmap.locked")}` : level}>
      {state === "current" && (
        <>
          <span
            aria-hidden
            className="absolute -inset-2 rounded-full bg-green-500/20 blur-md animate-pulse"
          />
          <span
            aria-hidden
            style={{
              backgroundImage:
                "conic-gradient(from 0deg, rgba(52,211,153,0) 0deg, rgba(52,211,153,0.95) 80deg, rgba(16,185,129,0.95) 170deg, rgba(52,211,153,0) 260deg)",
            }}
            className="absolute -inset-[4px] rounded-full animate-[spin_3s_linear_infinite]"
          />
        </>
      )}

      <div
        className={`relative ${size} rounded-full ${
          locked ? "" : "p-[2px]"
        } ${ring}`}>
        <div
          dir="ltr"
          className={`flex h-full w-full items-center justify-center rounded-full font-extrabold tracking-tight transition-all duration-300 ${face}`}>
          {level}
        </div>
      </div>

      <span
        className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--dash-sides)] ${badge}`}>
        {locked ? (
          <Lock className="h-2.5 w-2.5" />
        ) : state === "current" ? (
          <Star className="h-3 w-3 fill-current" />
        ) : (
          <Check className="h-3 w-3" />
        )}
      </span>
    </div>
  );
}

function PrizeCard({
  level,
  unlocked,
  horizontal = false,
}: {
  level: Level;
  unlocked: boolean;
  horizontal?: boolean;
}) {
  const { t } = useLang();
  return (
    <div
      className={`relative overflow-hidden rounded-2xl px-3 py-2.5 text-center transition-all duration-300 ${
        unlocked
          ? "border border-amber-400/35 bg-amber-500/10 shadow-[0_12px_30px_-16px_rgba(251,191,36,0.75)] hover:-translate-y-0.5"
          : "border border-[var(--dash-muted)]/15 bg-[var(--hover-bg)] opacity-65"
      } ${horizontal ? "w-full" : "w-full max-w-[152px]"}`}>
      {/* top sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent"
      />
      {/* soft glow in the corner */}
      <span
        aria-hidden
        className={`pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full blur-2xl ${
          unlocked ? "bg-amber-400/30" : "bg-[var(--dash-muted)]/10"
        }`}
      />

      <span
        className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-xl ${
          unlocked
            ? "bg-gradient-to-br from-amber-300 to-orange-500 text-black shadow-lg shadow-amber-500/30"
            : "bg-[var(--hover-bg-strong)] text-[var(--dash-muted)]"
        }`}>
        {unlocked ? (
          <Gift className="h-4 w-4" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
      </span>

      <p
        className={`relative mt-1.5 text-[9px] font-extrabold uppercase tracking-[0.18em] ${
          unlocked ? "text-amber-600 dark:text-amber-400" : "text-[var(--dash-muted)]"
        }`}>
        {t("roadmap.prize")}
      </p>
      <p className="relative mt-0.5 text-[11px] font-bold leading-tight text-[var(--dash-text)]">
        {t(PRIZE_KEYS[level])}
      </p>
    </div>
  );
}

function StatusChip({ state }: { state: NodeState }) {
  const { t } = useLang();
  if (state === "locked") return null;
  const label = state === "current" ? t("roadmap.youAreHere") : t("roadmap.reached");
  const tone =
    state === "current"
      ? "bg-green-500/15 text-green-600 dark:text-green-400 ring-1 ring-green-500/30"
      : "bg-[var(--hover-bg)] text-[var(--dash-muted)]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${tone}`}>
      {state === "current" ? (
        <Star className="h-2.5 w-2.5 fill-current" />
      ) : (
        <Check className="h-2.5 w-2.5" />
      )}
      {label}
    </span>
  );
}

export default function RoadmapPage() {
  const { t, locale } = useLang();
  const [isLoading, setIsLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState<Level>("A1");
  const [hasRequest, setHasRequest] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/account");
        if (res.ok) {
          const data = await res.json();
          const match = LEVELS.find((l) => l === data.fluencyLevel);
          if (match) setCurrentLevel(match);
        }
      } catch {
        // keep default A1
      } finally {
        setIsLoading(false);
      }
    };
    load();

    fetch("/api/tickets")
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => {
        if (Array.isArray(list))
          setHasRequest(
            list.some((tk: { category?: string }) => tk.category === "certificate"),
          );
      })
      .catch(() => {
        // ticket lookup is optional
      });
  }, []);

  const currentIndex = LEVELS.indexOf(currentLevel);
  const allUnlocked = currentIndex >= LEVELS.length - 1;
  const unlockedCount = currentIndex + 1;
  const progressPct = Math.round((unlockedCount / LEVELS.length) * 100);

  const handleRequestCertification = async () => {
    if (requesting || hasRequest) return;
    setRequesting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: t("roadmap.certTicketTitle"),
          message: t("roadmap.certTicketMessage"),
          category: "certificate",
          priority: "high",
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setHasRequest(true);
      toast.success(t("roadmap.certRequested"));
    } catch {
      toast.error(t("roadmap.certFailed"));
    } finally {
      setRequesting(false);
    }
  };

  if (isLoading) return <PageSkeleton />;

  const fmt = (n: number) => n.toLocaleString(locale === "fa" ? "fa-IR" : "en-US");

  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} className="space-y-6">
      {/* Header card */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg p-6">
        <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-green-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--dash-text)]">
              {t("roadmap.title")}
            </h1>
            <p className="text-sm text-[var(--dash-muted)] mt-1">
              {t("roadmap.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-end">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-muted)]">
                {t("roadmap.currentLevel")}
              </p>
              <p
                dir="ltr"
                className="text-lg font-extrabold text-[var(--dash-text)] leading-tight">
                {currentLevel}
              </p>
            </div>
            <div
              dir="ltr"
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-black font-extrabold shadow-lg shadow-green-500/25">
              {currentLevel}
            </div>
          </div>
        </div>

        <div className="relative mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[var(--dash-muted)]">
              {t("roadmap.progress")
                .replace("{done}", fmt(unlockedCount))
                .replace("{total}", fmt(LEVELS.length))}
            </span>
            <span className="text-xs font-bold text-green-600 dark:text-green-400">
              {fmt(progressPct)}%
            </span>
          </div>
          <div className="relative h-3 w-full rounded-full bg-[var(--hover-bg)] shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative h-full rounded-full bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 shadow-[0_0_16px_rgba(52,211,153,0.55)]">
              {/* knob lives on the fill's leading edge, so it always matches the bar */}
              <span
                aria-hidden
                style={{ insetInlineEnd: 0, top: "50%", translate: "50% -50%" }}
                className="absolute h-4 w-4 rounded-full border-[3px] border-[var(--dash-sides)] bg-green-400 shadow-[0_0_14px_rgba(52,211,153,0.75)]"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Desktop path: horizontal A1 -> C2 */}
      <div className="hidden lg:block relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg p-6 pt-4">
        <div className="pointer-events-none absolute -top-32 left-1/3 h-64 w-64 rounded-full bg-green-500/5 blur-3xl" />
        <div className="relative grid grid-cols-6" style={RAIL_VARS}>
          {/* one continuous rail per gap between two nodes */}
          {LEVELS.slice(0, -1).map((lvl, k) => {
            const filled = k < currentIndex;
            const start = ((k + 0.5) * 100) / COL_COUNT;
            const end = 100 - ((k + 1.5) * 100) / COL_COUNT;
            return (
              <span
                key={`rail-${lvl}`}
                aria-hidden
                style={{
                  top: "calc(var(--rail-slot) + var(--rail-row) / 2)",
                  insetInlineStart: `calc(${start}% + ${RAIL_GAP}px)`,
                  insetInlineEnd: `calc(${end}% + ${RAIL_GAP}px)`,
                }}
                className={filled ? RAIL_FILL : RAIL_TRACK}
              />
            );
          })}

          {LEVELS.map((lvl, i) => {
            const state = stateOf(i, currentIndex);
            const unlocked = i <= currentIndex;

            return (
              <motion.div
                key={lvl}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className="flex flex-col items-center">
                {/* prize above */}
                <div className="flex h-[var(--rail-slot)] w-full items-end justify-center pb-3">
                  {i % 2 === 0 && <PrizeCard level={lvl} unlocked={unlocked} />}
                </div>

                {/* node */}
                <div className="relative flex h-[var(--rail-row)] w-full items-center justify-center">
                  <LevelNode level={lvl} state={state} />
                </div>

                {/* prize below + status */}
                <div className="flex h-[var(--rail-slot)] w-full flex-col items-center justify-start gap-2 pt-3">
                  <StatusChip state={state} />
                  {i % 2 === 1 && <PrizeCard level={lvl} unlocked={unlocked} />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Mobile path: vertical */}
      <div className="lg:hidden relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg p-5">
        <ol className="relative">
          {LEVELS.map((lvl, i) => {
            const state = stateOf(i, currentIndex);
            const unlocked = i <= currentIndex;
            const lineFilled = i < currentIndex;
            const isLast = i === LEVELS.length - 1;

            return (
              <motion.li
                key={lvl}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
                className="flex items-stretch gap-4">
                {/* rail */}
                <div className="flex flex-col items-center">
                  <LevelNode level={lvl} state={state} compact />
                  {!isLast && (
                    <span
                      aria-hidden
                      className={`my-1 w-2 min-h-8 flex-1 rounded-full ${
                        lineFilled
                          ? "bg-gradient-to-b from-green-400 via-green-500 to-emerald-500 shadow-[0_0_14px_rgba(52,211,153,0.5)]"
                          : "bg-[var(--hover-bg)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)]"
                      }`}
                    />
                  )}
                </div>

                {/* content */}
                <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-6"}`}>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h2 dir="ltr" className="text-sm font-extrabold text-[var(--dash-text)]">
                      {lvl}
                    </h2>
                    <StatusChip state={state} />
                    {state === "locked" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--hover-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--dash-muted)]">
                        <Lock className="h-2.5 w-2.5" />
                        {t("roadmap.locked")}
                      </span>
                    )}
                  </div>
                  <PrizeCard level={lvl} unlocked={unlocked} horizontal />
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>

      {/* Certification */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg p-6 text-center">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 ring-1 ring-amber-500/30">
          <Award className="h-7 w-7 text-amber-500" />
        </div>
        <h2 className="relative mt-3 text-lg font-bold text-[var(--dash-text)]">
          {t("roadmap.certTitle")}
        </h2>
        <p className="relative mx-auto mt-1.5 max-w-md text-sm text-[var(--dash-muted)]">
          {allUnlocked ? t("roadmap.certDesc") : t("roadmap.certLockedHint")}
        </p>

        <motion.button
          whileHover={allUnlocked && !hasRequest && !requesting ? { scale: 1.03 } : {}}
          whileTap={allUnlocked && !hasRequest && !requesting ? { scale: 0.97 } : {}}
          onClick={handleRequestCertification}
          disabled={!allUnlocked || hasRequest || requesting}
          title={
            allUnlocked ? undefined : t("roadmap.certLockedHint")
          }
          className={`relative mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 disabled:cursor-not-allowed ${
            allUnlocked && !hasRequest
              ? "text-black bg-gradient-to-l from-amber-400 to-yellow-500 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 disabled:opacity-70"
              : "bg-[var(--hover-bg)] text-[var(--dash-muted)] opacity-70"
          }`}>
          {requesting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : hasRequest ? (
            <Check className="h-4 w-4" />
          ) : allUnlocked ? (
            <Award className="h-4 w-4" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
          {hasRequest ? t("roadmap.certAlready") : t("roadmap.requestCertification")}
        </motion.button>
      </div>
    </div>
  );
}
