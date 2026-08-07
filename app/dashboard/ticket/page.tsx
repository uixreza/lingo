"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  MessageSquare,
  Send,
  Paperclip,
  CheckCircle2,
  XCircle,
  UserRound,
  Calendar,
  Tag,
  Loader2,
  Search,
  ShieldCheck,
  Inbox,
  Hourglass,
  AlertTriangle,
  Landmark,
  BookOpen,
  FileQuestion,
  GraduationCap,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ListSkeleton } from "@/components/dashboard/Skeletons";
import Avatar from "@/components/dashboard/Avatar";

// Types
type TicketStatus = "open" | "in-progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";

interface Ticket {
  id: number;
  title: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  replies: Reply[];
  attachment?: string;
}

interface Reply {
  id: number;
  message: string;
  isAdmin: boolean;
  userName: string;
  createdAt: string;
}

// Helper functions
const statusConfig: Record<
  TicketStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
    icon: typeof MessageSquare;
  }
> = {
  open: {
    label: "باز",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
    dot: "#3b82f6",
    icon: MessageSquare,
  },
  "in-progress": {
    label: "در حال بررسی",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/25",
    dot: "#eab308",
    icon: Hourglass,
  },
  resolved: {
    label: "حل شده",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/25",
    dot: "#22c55e",
    icon: CheckCircle2,
  },
  closed: {
    label: "بسته شده",
    color: "text-gray-500 dark:text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/25",
    dot: "#6b7280",
    icon: XCircle,
  },
};

const priorityConfig: Record<
  TicketPriority,
  { label: string; color: string; bg: string; border: string }
> = {
  low: {
    label: "کم",
    color: "text-gray-500 dark:text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/25",
  },
  medium: {
    label: "متوسط",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
  },
  high: {
    label: "بالا",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/25",
  },
  urgent: {
    label: "فوری",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
  },
};

const categoryIcons: Record<string, { label: string; icon: typeof UserRound }> =
  {
    technical: { label: "مشکل فنی", icon: AlertTriangle },
    payment: { label: "مشکل پرداخت", icon: Landmark },
    content: { label: "محتوا", icon: BookOpen },
    certificate: { label: "گواهی", icon: GraduationCap },
    general: { label: "سایر موارد", icon: FileQuestion },
  };

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

function toFa(value: number | string): string {
  const digits = "۰۱۲۳۴۵۶۷۸۹";
  return String(value).replace(/[0-9]/g, (d) => digits[+d]);
}

const listVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const inputClass =
  "w-full bg-[var(--dash-bg)]/70 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm outline-none border border-[var(--dash-muted)]/15 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] transition-all placeholder:text-[var(--dash-muted)]/60";

type StatusTab = "all" | "open" | "in-progress" | "resolved";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [newTicketCategory, setNewTicketCategory] = useState("general");
  const [newTicketPriority, setNewTicketPriority] =
    useState<TicketPriority>("medium");
  const [replyMessage, setReplyMessage] = useState("");
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [ticketStep, setTicketStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const repliesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/tickets");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setTickets(data);
      } catch {
        toast.error("خطا در دریافت تیکت‌ها");
      } finally {
        setIsLoading(false);
      }
    };
    void run();
  }, []);

  useEffect(() => {
    repliesRef.current?.scrollTo({ top: repliesRef.current.scrollHeight });
  }, [selectedTicket?.replies.length]);

  const categories = [
    { value: "technical", label: "مشکل فنی", icon: "🔧" },
    { value: "payment", label: "مشکل پرداخت", icon: "💰" },
    { value: "content", label: "محتوا", icon: "📚" },
    { value: "general", label: "سایر موارد", icon: "📝" },
  ];

  const priorities: { value: TicketPriority; label: string }[] = [
    { value: "low", label: "کم" },
    { value: "medium", label: "متوسط" },
    { value: "high", label: "بالا" },
  ];

  const filteredTickets = tickets.filter((ticket) => {
    const matchesTab = activeTab === "all" || ticket.status === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreateTicket = async () => {
    if (!newTicketTitle.trim() || !newTicketMessage.trim() || isSubmitting)
      return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTicketTitle,
          message: newTicketMessage,
          category: newTicketCategory,
          priority: newTicketPriority,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "خطا در ثبت تیکت");
        return;
      }
      setTickets((prev) => [data, ...prev]);
      setSelectedTicket(data);
      setNewTicketTitle("");
      setNewTicketMessage("");
      setNewTicketCategory("general");
      setNewTicketPriority("medium");
      setTicketStep(1);
      setIsCreatingTicket(false);
      toast.success("تیکت با موفقیت ثبت شد");
    } catch {
      toast.error("خطا در برقراری ارتباط");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket || isSendingReply) return;

    setIsSendingReply(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "خطا در ارسال پاسخ");
        return;
      }
      const updated = data.ticket as Ticket;
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t)),
      );
      setSelectedTicket(updated);
      setReplyMessage("");
      toast.success("پاسخ با موفقیت ارسال شد");
    } catch {
      toast.error("خطا در برقراری ارتباط");
    } finally {
      setIsSendingReply(false);
    }
  };

  const tabCounts: Record<StatusTab, number> = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    "in-progress": tickets.filter((t) => t.status === "in-progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  const detailConfig = selectedTicket
    ? statusConfig[selectedTicket.status]
    : null;
  const DetailStatusIcon = detailConfig ? detailConfig.icon : MessageSquare;

  return (
    <div dir="rtl" className="min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-2 sm:px-0">
        {/* Hero Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {(
            [
              {
                label: "کل تیکت‌ها",
                value: tabCounts.all,
                icon: Inbox,
                color: "text-blue-600 dark:text-blue-400",
                iconBg: "bg-blue-500/10",
                accent: "from-blue-500/30",
              },
              {
                label: "باز",
                value: tabCounts.open,
                icon: MessageSquare,
                color: "text-blue-600 dark:text-blue-400",
                iconBg: "bg-blue-500/10",
                accent: "from-blue-500/30",
              },
              {
                label: "در حال بررسی",
                value: tabCounts["in-progress"],
                icon: Hourglass,
                color: "text-yellow-600 dark:text-yellow-400",
                iconBg: "bg-yellow-500/10",
                accent: "from-yellow-500/30",
              },
              {
                label: "حل شده",
                value: tabCounts.resolved,
                icon: CheckCircle2,
                color: "text-green-600 dark:text-green-400",
                iconBg: "bg-green-500/10",
                accent: "from-green-500/30",
              },
            ] as const
          ).map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              className="relative overflow-hidden group rounded-2xl p-5 shadow-lg border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:border-[var(--dash-accent)]/40">
              <div
                className={`pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br ${stat.accent} to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div
                className={`relative z-10 inline-flex p-2.5 rounded-xl ${stat.iconBg} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="relative z-10 text-2xl font-bold tabular-nums text-[var(--dash-text)]">
                {toFa(stat.value)}
              </p>
              <p
                className="relative z-10 text-sm mt-1"
                style={{ color: "var(--dash-muted)" }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tickets List Panel */}
          <div className="lg:col-span-1">
            <div className="relative overflow-hidden rounded-2xl shadow-lg border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl">
              {/* Create Ticket Button */}
              <div className="p-4 border-b border-[var(--dash-muted)]/10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setTicketStep(1);
                    setIsCreatingTicket(true);
                  }}
                  className="w-full py-3 rounded-xl font-bold text-black transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
                  <MessageSquare className="h-5 w-5" />
                  تیکت جدید
                </motion.button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-[var(--dash-muted)]/10">
                <div className="relative">
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] pointer-events-none transition-colors">
                    <Search className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="جستجو در تیکت‌ها..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-11 pl-4 py-2.5 rounded-xl outline-none transition-all focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] text-[var(--dash-text)] placeholder:text-[var(--dash-muted)]/60 text-right"
                    style={{ backgroundColor: "var(--dash-bg)" }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors">
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 p-2 border-b border-[var(--dash-muted)]/10">
                {(["all", "open", "in-progress", "resolved"] as StatusTab[]).map(
                  (tab) => {
                    const isActive = activeTab === tab;
                    const label =
                      tab === "all"
                        ? "همه"
                        : tab === "open"
                          ? "باز"
                          : tab === "in-progress"
                            ? "بررسی"
                            : "حل شده";
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                          isActive
                            ? "text-white"
                            : "text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                        }`}>
                        {isActive && (
                          <motion.span
                            layoutId="dashboard-ticket-tab-pill"
                            className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] shadow-lg shadow-[var(--dark-purple)]/30"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 32,
                            }}
                          />
                        )}
                        <span className="relative z-10">
                          {label}
                          <span className="mr-1 text-[10px] opacity-70">
                            {toFa(tabCounts[tab])}
                          </span>
                        </span>
                      </button>
                    );
                  },
                )}
              </div>

              {/* Tickets List */}
              <div className="max-h-[560px] overflow-y-auto">
                {isLoading ? (
                  <ListSkeleton count={3} />
                ) : filteredTickets.length === 0 ? (
                  <div
                    className="text-center py-14"
                    style={{ color: "var(--dash-muted)" }}>
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-[var(--hover-bg)] flex items-center justify-center mb-3">
                      <MessageSquare className="h-6 w-6 opacity-60" />
                    </div>
                    <p>تیکتی وجود ندارد</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {filteredTickets.map((ticket, i) => {
                      const cfg = statusConfig[ticket.status];
                      const StatusIcon = cfg.icon;
                      const prio = priorityConfig[ticket.priority];
                      const isSelected = selectedTicket?.id === ticket.id;
                      return (
                        <motion.button
                          key={ticket.id}
                          layout
                          variants={listVariants}
                          initial="initial"
                          animate="animate"
                          exit={{ opacity: 0, y: -8 }}
                          transition={{
                            delay: i * 0.05,
                            duration: 0.25,
                            layout: { duration: 0.2 },
                          }}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`w-full p-4 text-right border-b border-[var(--dash-muted)]/10 transition-all duration-300 group ${
                            isSelected
                              ? "bg-[var(--dash-bg)]/80"
                              : "hover:bg-white/5"
                          }`}>
                          <div className="flex items-start gap-3">
                            <div className="relative shrink-0">
                              <div className="p-3 rounded-2xl bg-[var(--dash-bg)] border border-[var(--dash-muted)]/10 group-hover:scale-105 transition-transform duration-300">
                                <StatusIcon
                                  className={`h-5 w-5 ${cfg.color}`}
                                />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p
                                  className="font-semibold text-sm truncate"
                                  style={{ color: "var(--dash-text)" }}>
                                  {ticket.title}
                                </p>
                                <span
                                  className="h-2 w-2 rounded-full shrink-0"
                                  style={{
                                    backgroundColor: cfg.dot,
                                    boxShadow: `0 0 8px ${cfg.dot}`,
                                  }}
                                />
                              </div>
                              <p
                                className="text-xs mb-1.5 line-clamp-1"
                                style={{ color: "var(--dash-muted)" }}>
                                {ticket.message}
                              </p>
                              <div className="flex items-center justify-between text-[11px]">
                                <span
                                  className="flex items-center gap-1"
                                  style={{ color: "var(--dash-muted)" }}>
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(ticket.createdAt)}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${prio.bg} ${prio.color} ${prio.border}`}>
                                  {prio.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>

          {/* Ticket Detail Panel */}
          <div
            className={`lg:col-span-2 min-w-0 ${
              !selectedTicket ? "hidden lg:block" : ""
            }`}>
            {selectedTicket ? (
              <motion.div
                key={selectedTicket.id}
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative overflow-hidden rounded-2xl shadow-lg border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl">
                <div className="pointer-events-none absolute -top-28 -right-16 h-64 w-64 rounded-full bg-[var(--dash-accent)]/15 blur-3xl" />
                <div className="relative">
                  {/* Ticket Header */}
                  <div className="p-6 border-b border-[var(--dash-muted)]/10">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
                      <div className="min-w-0">
                        <h2
                          className="text-xl font-bold truncate"
                          style={{ color: "var(--dash-text)" }}>
                          {selectedTicket.title}
                        </h2>
                        <div
                          className="flex flex-wrap gap-4 text-sm mt-2"
                          style={{ color: "var(--dash-muted)" }}>
                          <span className="flex items-center gap-1.5">
                            <UserRound className="h-4 w-4" />
                            {selectedTicket.user.name}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {formatDate(selectedTicket.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Tag className="h-4 w-4" />
                            {
                              categoryIcons[selectedTicket.category]?.label ??
                                "سایر"
                            }
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${priorityConfig[selectedTicket.priority].bg} ${priorityConfig[selectedTicket.priority].color} ${priorityConfig[selectedTicket.priority].border}`}>
                          اولویت: {priorityConfig[selectedTicket.priority].label}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${detailConfig!.bg} ${detailConfig!.color} ${detailConfig!.border}`}>
                          <DetailStatusIcon className="h-3.5 w-3.5" />
                          {statusConfig[selectedTicket.status].label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Initial Message */}
                  <div className="p-6 border-b border-[var(--dash-muted)]/10">
                    <div className="flex gap-3">
                      <div className="shrink-0">
                        <Avatar
                          seed={selectedTicket.user.name}
                          size={42}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
                          <span
                            className="font-semibold text-sm"
                            style={{ color: "var(--dash-text)" }}>
                            {selectedTicket.user.name}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--dash-muted)" }}>
                            {formatDate(selectedTicket.createdAt)}
                          </span>
                        </div>
                        <p
                          style={{ color: "var(--dash-text)" }}
                          className="leading-relaxed text-sm">
                          {selectedTicket.message}
                        </p>
                        {selectedTicket.attachment && (
                          <a
                            href={selectedTicket.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-[var(--dash-bg)] border border-[var(--dash-muted)]/15 text-xs text-[var(--dash-muted)] hover:text-[var(--dash-accent)] transition-colors">
                            <Paperclip className="h-3.5 w-3.5" />
                            پیوست تیکت
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  <div
                    ref={repliesRef}
                    className="p-6 border-b border-[var(--dash-muted)]/10 max-h-[380px] overflow-y-auto">
                    <h3
                      className="font-bold mb-4 flex items-center gap-2"
                      style={{ color: "var(--dash-text)" }}>
                      <MessageSquare className="h-4 w-4 text-[var(--dash-accent)]" />
                      پاسخ‌ها ({toFa(selectedTicket.replies.length)})
                    </h3>
                    {selectedTicket.replies.length === 0 ? (
                      <div
                        className="text-center py-8 text-sm"
                        style={{ color: "var(--dash-muted)" }}>
                        هنوز پاسخی داده نشده است
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <AnimatePresence initial={false}>
                          {selectedTicket.replies.map((reply) => (
                            <motion.div
                              key={reply.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.25 }}
                              className="flex gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                                  reply.isAdmin
                                    ? "bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] text-white shadow-lg shadow-[var(--dark-purple)]/25"
                                    : "bg-blue-500/10 text-blue-500"
                                }`}>
                                {reply.isAdmin ? (
                                  <ShieldCheck className="h-5 w-5" />
                                ) : (
                                  <UserRound className="h-5 w-5" />
                                )}
                              </div>
                              <div
                                className={`flex-1 min-w-0 p-3.5 rounded-2xl border ${
                                  reply.isAdmin
                                    ? "bg-[var(--dash-accent)]/10 border-[var(--dash-accent)]/20"
                                    : "bg-[var(--dash-bg)]/60 border-[var(--dash-muted)]/10"
                                }`}>
                                <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
                                  <span
                                    className="font-semibold text-sm flex items-center gap-2"
                                    style={{ color: "var(--dash-text)" }}>
                                    {reply.userName}
                                    {reply.isAdmin && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 font-medium">
                                        پشتیبان
                                      </span>
                                    )}
                                  </span>
                                  <span
                                    className="text-[11px]"
                                    style={{ color: "var(--dash-muted)" }}>
                                    {formatDate(reply.createdAt)}
                                  </span>
                                </div>
                                <p
                                  style={{ color: "var(--dash-text)" }}
                                  className="leading-relaxed text-sm">
                                  {reply.message}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Reply Input */}
                  {selectedTicket.status !== "resolved" &&
                    selectedTicket.status !== "closed" && (
                      <div className="p-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="پاسخ خود را بنویسید..."
                            rows={3}
                            className="flex-1 px-4 py-3 rounded-xl outline-none resize-none transition-all focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] bg-[var(--dash-bg)] text-[var(--dash-text)] placeholder:text-[var(--dash-muted)]/60 border border-[var(--dash-muted)]/15"
                          />
                          <motion.button
                            whileHover={
                              !replyMessage.trim() || isSendingReply
                                ? {}
                                : { scale: 1.02 }
                            }
                            whileTap={isSendingReply ? {} : { scale: 0.98 }}
                            onClick={handleSendReply}
                            disabled={!replyMessage.trim() || isSendingReply}
                            className="px-8 py-3 rounded-xl font-bold text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg sm:self-start bg-gradient-to-l from-green-500 to-emerald-500 shadow-green-500/25 hover:shadow-green-500/40">
                            {isSendingReply ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Send size={18} />
                            )}
                            ارسال
                          </motion.button>
                        </div>
                      </div>
                    )}

                  {selectedTicket.status === "resolved" ||
                  selectedTicket.status === "closed" ? (
                    <div
                      className="px-6 pb-6 flex items-center justify-center gap-2 text-sm"
                      style={{ color: "var(--dash-muted)" }}>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      این تیکت بسته شده و امکان پاسخ‌گویی غیرفعال است
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="relative overflow-hidden flex items-center justify-center h-full min-h-[420px] rounded-2xl bg-[var(--dash-sides)]/60 backdrop-blur-sm border border-dashed border-[var(--dash-muted)]/25">
                <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[var(--dash-accent)]/10 blur-3xl" />
                <div className="relative text-center py-16 px-6">
                  <div className="mx-auto w-16 h-16 mb-4 rounded-3xl bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] flex items-center justify-center shadow-lg shadow-[var(--dark-purple)]/25">
                    <MessageSquare className="h-7 w-7 text-white" />
                  </div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: "var(--dash-text)" }}>
                    تیکتی انتخاب نشده
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--dash-muted)" }}>
                    از فهرست روبه‌رو یک تیکت را انتخاب کنید تا جزئیات آن نمایش
                    داده شود
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Create Ticket Modal */}
        {isCreatingTicket && (
          <div className="fixed inset-0 z-[60] lg:flex lg:items-center lg:justify-center lg:p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsCreatingTicket(false)}
            />
            <div className="fixed bottom-0 inset-x-0 z-[60] bg-[var(--dash-sides)]/95 backdrop-blur-xl border-t border-[var(--dash-muted)]/15 lg:border rounded-t-3xl lg:rounded-2xl shadow-2xl max-h-[92dvh] overflow-y-auto animate-[sheet-up_0.3s_ease-out] lg:static lg:animate-none lg:max-w-lg lg:w-full">
              {/* Drag Handle (mobile only) */}
              <div className="flex justify-center pt-3 pb-1 lg:hidden">
                <div className="w-12 h-1.5 bg-[var(--dash-muted)]/25 rounded-full" />
              </div>

              {/* Header */}
              <div
                className="px-6 pt-2 pb-4 border-b flex items-center gap-3"
                style={{ borderColor: "var(--dash-muted)" }}>
                <div className="p-2.5 rounded-xl bg-green-500/15 shrink-0">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "var(--dash-text)" }}>
                    تیکت جدید
                  </h2>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--dash-muted)" }}>
                    مشکل یا سوال خود را مطرح کنید؛ در کوتاه‌ترین زمان پاسخ می‌دهیم.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreatingTicket(false)}
                  className="p-2 rounded-xl transition-all duration-200 hover:bg-[var(--dash-bg)] shrink-0"
                  style={{ color: "var(--dash-muted)" }}
                  aria-label="بستن">
                  <X size={18} />
                </button>
              </div>

              {/* Step Indicator */}
              <div className="px-6 pt-3 pb-1">
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        ticketStep >= step
                          ? "bg-green-500"
                          : "bg-[var(--dash-border)]"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between">
                  <span
                    className={`text-[11px] font-bold ${
                      ticketStep === 1
                        ? "text-green-500"
                        : "text-[var(--dash-muted)]"
                    }`}>
                    ۱. اطلاعات اولیه
                  </span>
                  <span
                    className={`text-[11px] font-bold ${
                      ticketStep === 2
                        ? "text-green-500"
                        : "text-[var(--dash-muted)]"
                    }`}>
                    ۲. متن تیکت
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {ticketStep === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="p-6 space-y-5">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--dash-text)" }}>
                        عنوان تیکت
                      </label>
                      <input
                        type="text"
                        value={newTicketTitle}
                        onChange={(e) => setNewTicketTitle(e.target.value)}
                        placeholder="مثال: مشکل در دسترسی به دوره..."
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--dash-text)" }}>
                        دسته‌بندی
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {categories.map((cat) => {
                          const selected = newTicketCategory === cat.value;
                          return (
                            <motion.button
                              key={cat.value}
                              type="button"
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setNewTicketCategory(cat.value)}
                              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                selected
                                  ? "bg-green-500/10 ring-1 ring-green-500/40 text-green-600 dark:text-green-400"
                                  : "bg-[var(--dash-bg)] text-[var(--dash-muted)] hover:bg-[var(--dash-border)] hover:text-[var(--dash-text)]"
                              }`}>
                              <span className="text-lg leading-none">
                                {cat.icon}
                              </span>
                              <span className="truncate">{cat.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--dash-text)" }}>
                        اولویت
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {priorities.map((p) => {
                          const selected = newTicketPriority === p.value;
                          return (
                            <motion.button
                              key={p.value}
                              type="button"
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setNewTicketPriority(p.value)}
                              className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                                selected
                                  ? `${priorityConfig[p.value].bg} ${priorityConfig[p.value].color} ${priorityConfig[p.value].border}`
                                  : "bg-[var(--dash-bg)] text-[var(--dash-muted)] border-transparent hover:bg-[var(--dash-border)] hover:text-[var(--dash-text)]"
                              }`}>
                              {p.label}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="p-6 space-y-5">
                    {/* Summary recap */}
                    <div
                      className="flex items-center gap-2.5 bg-[var(--dash-bg)] rounded-xl px-4 py-3 border"
                      style={{ borderColor: "var(--dash-border)" }}>
                      <span className="text-lg leading-none">
                        {
                          categories.find(
                            (c) => c.value === newTicketCategory,
                          )?.icon
                        }
                      </span>
                      <span
                        className="text-sm font-medium truncate flex-1"
                        style={{ color: "var(--dash-text)" }}>
                        {newTicketTitle.trim() || "بدون عنوان"}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 border ${priorityConfig[newTicketPriority].bg} ${priorityConfig[newTicketPriority].color} ${priorityConfig[newTicketPriority].border}`}>
                        {
                          priorities.find(
                            (p) => p.value === newTicketPriority,
                          )?.label
                        }
                      </span>
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--dash-text)" }}>
                        توضیحات
                      </label>
                      <textarea
                        value={newTicketMessage}
                        onChange={(e) => setNewTicketMessage(e.target.value)}
                        placeholder="مشکل خود را به طور کامل توضیح دهید..."
                        rows={5}
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer (sticky on mobile sheet) */}
              {ticketStep === 1 ? (
                <div
                  className="sticky bottom-0 p-6 border-t bg-[var(--dash-sides)]/95 backdrop-blur-xl"
                  style={{ borderColor: "var(--dash-muted)" }}>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTicketStep(2)}
                    disabled={!newTicketTitle.trim()}
                    className="w-full py-3 rounded-xl font-bold text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
                    ادامه
                    <ChevronLeft size={18} />
                  </motion.button>
                </div>
              ) : (
                <div
                  className="sticky bottom-0 p-6 border-t bg-[var(--dash-sides)]/95 backdrop-blur-xl flex gap-3"
                  style={{ borderColor: "var(--dash-muted)" }}>
                  <motion.button
                    whileTap={isSubmitting ? {} : { scale: 0.98 }}
                    onClick={handleCreateTicket}
                    disabled={
                      !newTicketTitle.trim() ||
                      !newTicketMessage.trim() ||
                      isSubmitting
                    }
                    className="flex-1 py-3 rounded-xl font-bold text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
                    {isSubmitting && (
                      <Loader2 size={18} className="animate-spin" />
                    )}
                    ارسال تیکت
                  </motion.button>
                  <button
                    onClick={() => setTicketStep(1)}
                    className="px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-1.5 hover:opacity-80"
                    style={{
                      backgroundColor: "var(--dash-bg)",
                      color: "var(--dash-muted)",
                    }}>
                    <ChevronRight size={16} />
                    بازگشت
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}