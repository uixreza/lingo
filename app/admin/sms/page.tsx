"use client";
import { useState, useEffect } from "react";
import {
  MessageSquare,
  ArrowDownLeft,
  ArrowUpRight,
  Inbox,
  Loader2,
  Search,
  X,
  Wallet,
  RefreshCw,
  Clock,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageSkeleton } from "@/components/dashboard/Skeletons";
import toast from "react-hot-toast";

type SmsMessage = Record<string, unknown> & {
  id?: string;
  from?: string;
  to?: string;
  text?: string;
  date?: string;
  isRead?: boolean;
};

type SmsType = "all" | "in" | "out";

const TYPE_TABS: { key: SmsType; label: string; icon: typeof Inbox }[] = [
  { key: "all", label: "همه", icon: Inbox },
  { key: "in", label: "دریافتی", icon: ArrowDownLeft },
  { key: "out", label: "ارسالی", icon: ArrowUpRight },
];

function toFa(value: number | string): string {
  const digits = "۰۱۲۳۴۵۶۷۸۹";
  return String(value).replace(/[0-9]/g, (d) => digits[+d]);
}

function formatNumber(value: number): string {
  return toFa(value.toLocaleString("en-US"));
}

function PageSkeletonView() {
  return (
    <div className="space-y-6">
      <div className="h-28 rounded-2xl bg-[var(--dash-sides)]/80 animate-pulse" />
      <div className="h-12 w-72 rounded-2xl bg-[var(--dash-sides)]/80 animate-pulse" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-2xl bg-[var(--dash-sides)]/80 animate-pulse"
        />
      ))}
    </div>
  );
}

export default function SmsPage() {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [credit, setCredit] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<SmsType>("all");
  const [search, setSearch] = useState("");
  const [fetchingMessages, setFetchingMessages] = useState(false);
  const [fetchingCredit, setFetchingCredit] = useState(false);

  const fetchCredit = async () => {
    setFetchingCredit(true);
    try {
      const res = await fetch("/api/admin/sms/credit");
      if (res.ok) {
        const data = await res.json();
        const amount = data?.Amount ?? data?.amount ?? data?.credit ?? null;
        if (amount !== null) setCredit(Number(amount));
      }
    } catch {
      // silent
    }
    setFetchingCredit(false);
  };

  const fetchMessages = async (type: SmsType) => {
    setFetchingMessages(true);
    try {
      const res = await fetch("/api/admin/sms/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, index: 0, count: 100 }),
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.messages ?? data?.items ?? [];
        const normalized: SmsMessage[] = list
          .filter((m: Record<string, unknown>) => m && typeof m === "object" && Object.keys(m).length > 1)
          .map((m: Record<string, unknown>) => ({
            ...m,
            id: m.id ?? m.Id ?? m.messageId ?? null,
            from: m.from ?? m.From ?? m.senderNumber ?? m.SenderNumber ?? m.source ?? "",
            to: m.to ?? m.To ?? m.receiverNumber ?? m.ReceiverNumber ?? m.dest ?? "",
            text: m.text ?? m.Text ?? m.message ?? m.Message ?? m.body ?? "",
            date: m.date ?? m.Date ?? m.sendDate ?? m.SendDate ?? m.createDate ?? "",
          }));
        setMessages(normalized);
      } else {
        toast.error("خطا در دریافت پیام‌ها");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    }
    setFetchingMessages(false);
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await Promise.all([fetchCredit(), fetchMessages("all")]);
      if (!cancelled) setLoading(false);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleTabChange = (tab: SmsType) => {
    setActiveTab(tab);
    fetchMessages(tab);
  };

  const filtered = messages.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(m.text ?? "").toLowerCase().includes(q) ||
      String(m.from ?? "").toLowerCase().includes(q) ||
      String(m.to ?? "").toLowerCase().includes(q)
    );
  });

  if (loading) return <PageSkeletonView />;

  return (
    <div className="space-y-6">
      {/* Credit Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg"
      >
        <div className="pointer-events-none absolute -top-24 -left-10 h-48 w-48 rounded-full bg-green-500/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
        <div className="relative p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="inline-flex p-3 rounded-xl bg-green-500/10">
              <Wallet className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--dash-muted)" }}>
                موجودی پنل پیامک
              </p>
              <p className="text-2xl font-bold text-[var(--dash-text)] tabular-nums mt-1">
                {credit !== null ? `${formatNumber(credit)} ریال` : "—"}
              </p>
            </div>
          </div>
          <button
            onClick={fetchCredit}
            disabled={fetchingCredit}
            className="p-2.5 rounded-xl hover:bg-[var(--hover-bg)] transition-colors"
            aria-label="بروزرسانی موجودی"
          >
            <RefreshCw
              className={`h-5 w-5 text-[var(--dash-muted)] ${fetchingCredit ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </motion.div>

      {/* Tabs + Search */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="relative inline-flex p-1.5 rounded-2xl bg-[var(--dash-sides)]/80 backdrop-blur-xl border border-[var(--dash-muted)]/15 dark:border-white/20 shadow-lg">
          {TYPE_TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => handleTabChange(t.key)}
                className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300 ${activeTab === t.key ? "text-white" : "text-[var(--dash-muted)]"}`}
              >
                {activeTab === t.key && (
                  <motion.span
                    layoutId="sms-tab-pill"
                    className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] shadow-lg shadow-[var(--dark-purple)]/30"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="relative flex-1 sm:flex-initial w-full sm:w-72">
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] pointer-events-none">
            <Search className="h-5 w-5" />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در پیام‌ها..."
            className="w-full pr-11 pl-4 py-2.5 rounded-xl outline-none transition-all focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] text-[var(--dash-text)] placeholder:text-[var(--dash-muted)]/60 text-right text-sm"
            style={{ backgroundColor: "var(--dash-bg)" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Messages List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

        {fetchingMessages ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--dash-muted)]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14" style={{ color: "var(--dash-muted)" }}>
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[var(--hover-bg)] flex items-center justify-center mb-3">
              <MessageSquare className="h-6 w-6 opacity-60" />
            </div>
            <p className="text-sm">پیامی یافت نشد</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--dash-muted)]/10">
            <AnimatePresence initial={false}>
              {filtered.map((msg, i) => {
                const from = String(msg.from ?? "");
                const to = String(msg.to ?? "");
                const text = String(msg.text ?? "");
                const date = String(msg.date ?? "");
                const isIncoming = from !== "50004001939632" && to === "50004001939632";
                return (
                  <motion.div
                    key={String(msg.id ?? i)}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
                    transition={{ delay: i * 0.02, duration: 0.3 }}
                    className="flex items-start gap-4 p-4 hover:bg-[var(--hover-bg)]/50 transition-colors"
                  >
                    <div
                      className={`shrink-0 p-2.5 rounded-xl ${isIncoming ? "bg-blue-500/10" : "bg-green-500/10"}`}
                    >
                      {isIncoming ? (
                        <ArrowDownLeft className="h-5 w-5 text-blue-500" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-lg ${isIncoming ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"}`}
                        >
                          {isIncoming ? "دریافتی" : "ارسالی"}
                        </span>
                        <span className="text-xs flex items-center gap-1" style={{ color: "var(--dash-muted)" }}>
                          <Phone className="h-3 w-3" />
                          {toFa(isIncoming ? from : to)}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--dash-text)] leading-relaxed break-words">
                        {text}
                      </p>
                      <div className="flex items-center gap-1 mt-2" style={{ color: "var(--dash-muted)" }}>
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{toFa(date)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
