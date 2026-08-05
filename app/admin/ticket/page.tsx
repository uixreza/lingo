"use client";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  MessageSquare,
  Send,
  Paperclip,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Tag,
  Loader2,
  RefreshCw,
} from "lucide-react";

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
const getStatusBadge = (status: TicketStatus) => {
  const statusConfig = {
    open: {
      label: "باز",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: MessageSquare,
    },
    "in-progress": {
      label: "در حال بررسی",
      color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      icon: Clock,
    },
    resolved: {
      label: "حل شده",
      color: "bg-green-500/10 text-green-500 border-green-500/20",
      icon: CheckCircle,
    },
    closed: {
      label: "بسته شده",
      color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      icon: XCircle,
    },
  };
  return statusConfig[status];
};

const getPriorityBadge = (priority: TicketPriority) => {
  const priorityConfig = {
    low: {
      label: "کم",
      color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    },
    medium: {
      label: "متوسط",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    high: {
      label: "بالا",
      color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    },
    urgent: {
      label: "فوری",
      color: "bg-red-500/10 text-red-500 border-red-500/20",
    },
  };
  return priorityConfig[priority];
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

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "open" | "in-progress" | "resolved"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTickets = async () => {
    const res = await fetch("/api/admin/tickets");
    if (!res.ok) throw new Error();
    return (await res.json()) as Ticket[];
  };

  const applyTickets = useCallback((data: Ticket[]) => {
    setTickets(data);
    setSelectedTicket((current) =>
      current ? (data.find((t) => t.id === current.id) ?? current) : null,
    );
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        applyTickets(await fetchTickets());
      } catch {
        toast.error("خطا در دریافت تیکت‌ها");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };
    void run();
  }, [applyTickets]);

  const handleRefresh = async () => {
    if (isLoading || isRefreshing) return;
    setIsRefreshing(true);
    try {
      applyTickets(await fetchTickets());
    } catch {
      toast.error("خطا در دریافت تیکت‌ها");
    } finally {
      setIsRefreshing(false);
    }
  };

  const categories = [
    { value: "technical", label: "مشکل فنی", icon: "🔧" },
    { value: "payment", label: "مشکل پرداخت", icon: "💰" },
    { value: "content", label: "محتوا", icon: "📚" },
    { value: "general", label: "سایر موارد", icon: "📝" },
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

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket || isSendingReply) return;

    setIsSendingReply(true);
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
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

  const handleStatusChange = async (
    ticketId: number,
    newStatus: TicketStatus,
  ) => {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "خطا در تغییر وضعیت");
        return;
      }
      const updated = data as Ticket;
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? updated : t)),
      );
      setSelectedTicket(updated);
      toast.success("وضعیت تیکت به‌روزرسانی شد");
    } catch {
      toast.error("خطا در برقراری ارتباط");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tickets List Panel */}
          <div className="lg:col-span-1">
            <div
              className="rounded-xl border overflow-hidden"
              style={{
                backgroundColor: "var(--dash-sides)",
                borderColor: "var(--dash-bg)",
              }}>
              {/* Tickets Count */}
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{ borderColor: "var(--dash-bg)" }}>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--dash-text)" }}>
                  {tickets.length} تیکت
                </p>
                <button
                  onClick={handleRefresh}
                  disabled={isLoading || isRefreshing}
                  title="به‌روزرسانی"
                  aria-label="به‌روزرسانی"
                  className="p-2 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-50"
                  style={{ color: "var(--dash-muted)" }}>
                  <RefreshCw
                    size={16}
                    className={isRefreshing ? "animate-spin" : ""}
                  />
                </button>
              </div>

              {/* Search */}
              <div
                className="p-4 border-b"
                style={{ borderColor: "var(--dash-bg)" }}>
                <input
                  type="text"
                  placeholder="جستجو در تیکت‌ها..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2 text-right"
                  style={{
                    backgroundColor: "var(--dash-bg)",
                    borderColor: "var(--dash-border)",
                    color: "var(--dash-text)",
                  }}
                />
              </div>

              {/* Tabs */}
              <div
                className="flex border-b"
                style={{ borderColor: "var(--dash-bg)" }}>
                {(["all", "open", "in-progress", "resolved"] as const).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="flex-1 py-3 text-sm font-medium transition-colors relative"
                      style={{
                        color:
                          activeTab === tab ? "#22c55e" : "var(--dash-muted)",
                      }}>
                      {tab === "all" && "همه"}
                      {tab === "open" && "باز"}
                      {tab === "in-progress" && "در حال بررسی"}
                      {tab === "resolved" && "حل شده"}
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5"
                          style={{ backgroundColor: "#22c55e" }}
                        />
                      )}
                    </button>
                  ),
                )}
              </div>

              {/* Tickets List */}
              <div className="max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div
                    className="text-center py-12"
                    style={{ color: "var(--dash-muted)" }}>
                    <Loader2
                      size={48}
                      className="mx-auto mb-3 animate-spin opacity-30"
                    />
                    <p>در حال بارگذاری...</p>
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div
                    className="text-center py-12"
                    style={{ color: "var(--dash-muted)" }}>
                    <MessageSquare
                      size={48}
                      className="mx-auto mb-3 opacity-30"
                    />
                    <p>تیکتی وجود ندارد</p>
                  </div>
                ) : (
                  filteredTickets.map((ticket) => {
                    const StatusIcon = getStatusBadge(ticket.status).icon;
                    const priorityBadge = getPriorityBadge(ticket.priority);

                    return (
                      <motion.button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className="w-full p-4 text-right border-b transition-all hover:bg-white/5"
                        style={{
                          borderColor: "var(--dash-bg)",
                          backgroundColor:
                            selectedTicket?.id === ticket.id
                              ? "var(--dash-bg)"
                              : "transparent",
                        }}
                        whileHover={{ x: 4 }}>
                        <div className="flex justify-between items-start mb-2">
                          <h3
                            className="font-semibold line-clamp-1 flex-1"
                            style={{ color: "var(--dash-text)" }}>
                            {ticket.title}
                          </h3>
                          <StatusIcon
                            size={16}
                            className={
                              getStatusBadge(ticket.status).color.split(" ")[1]
                            }
                          />
                        </div>
                        <p
                          className="text-sm line-clamp-2 mb-2"
                          style={{ color: "var(--dash-muted)" }}>
                          {ticket.message}
                        </p>
                        <div className="flex justify-between items-center text-xs">
                          <span style={{ color: "var(--dash-muted)" }}>
                            {formatDate(ticket.createdAt)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${priorityBadge.color}`}>
                            {priorityBadge.label}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border overflow-hidden text-sm"
                style={{
                  backgroundColor: "var(--dash-sides)",
                  borderColor: "var(--dash-bg)",
                }}>
                {/* Ticket Header */}
                <div
                  className="p-6 border-b"
                  style={{ borderColor: "var(--dash-bg)" }}>
                  <div className="flex justify-between items-start mb-4">
                    <h2
                      className="text-xl font-bold"
                      style={{ color: "var(--dash-text)" }}>
                      {selectedTicket.title}
                    </h2>
                    <div className="flex gap-2 items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(selectedTicket.priority).color}`}>
                        اولویت:{" "}
                        {getPriorityBadge(selectedTicket.priority).label}
                      </span>
                      <div className="flex gap-1">
                        {(["open", "in-progress", "resolved"] as const).map(
                          (status) => (
                            <button
                              key={status}
                              onClick={() =>
                                handleStatusChange(selectedTicket.id, status)
                              }
                              disabled={isUpdatingStatus}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all disabled:opacity-60 ${
                                selectedTicket.status === status
                                  ? getStatusBadge(status).color + " shadow-sm"
                                  : "border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:border-[var(--dash-muted)]/30"
                              }`}>
                              {getStatusBadge(status).label}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex gap-4 text-sm"
                    style={{ color: "var(--dash-muted)" }}>
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{selectedTicket.user.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(selectedTicket.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag size={14} />
                      <span>
                        {
                          categories.find(
                            (c) => c.value === selectedTicket.category,
                          )?.label
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Initial Message */}
                <div
                  className="p-6 border-b"
                  style={{ borderColor: "var(--dash-bg)" }}>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0">
                      <User size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className="font-medium"
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
                        className="leading-relaxed">
                        {selectedTicket.message}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                <div
                  className="p-6 border-b max-h-[400px] overflow-y-auto"
                  style={{ borderColor: "var(--dash-bg)" }}>
                  <h3
                    className="font-medium mb-4"
                    style={{ color: "var(--dash-text)" }}>
                    پاسخ‌ها ({selectedTicket.replies.length})
                  </h3>
                  <div className="space-y-4">
                    {selectedTicket.replies.map((reply) => (
                      <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, x: reply.isAdmin ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex gap-3 ${reply.isAdmin ? "flex-row" : ""}`}>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            reply.isAdmin
                              ? "bg-green-500/20 text-green-500"
                              : "bg-blue-500/20 text-blue-500"
                          }`}>
                          {reply.isAdmin ? "👨‍💻" : <User size={18} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <span
                              className="font-medium"
                              style={{ color: "var(--dash-text)" }}>
                              {reply.userName}
                              {reply.isAdmin && (
                                <span className="text-xs mr-2 px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">
                                  پشتیبان
                                </span>
                              )}
                            </span>
                            <span
                              className="text-xs"
                              style={{ color: "var(--dash-muted)" }}>
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <p
                            style={{ color: "var(--dash-text)" }}
                            className="leading-relaxed">
                            {reply.message}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
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
                          className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none"
                          style={{
                            backgroundColor: "var(--dash-bg)",
                            borderColor: "var(--dash-border)",
                            color: "var(--dash-text)",
                          }}
                        />
                        <button
                          onClick={handleSendReply}
                          disabled={!replyMessage.trim() || isSendingReply}
                          className="px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg sm:self-start"
                          style={{
                            backgroundColor: "#22c55e",
                            color: "black",
                          }}>
                          {isSendingReply ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Send size={18} />
                          )}
                          ارسال
                        </button>
                      </div>
                    </div>
                  )}
              </motion.div>
            ) : (
              <div
                className="flex items-center justify-center h-full rounded-xl border"
                style={{
                  backgroundColor: "var(--dash-sides)",
                  borderColor: "var(--dash-bg)",
                }}>
                <div className="text-center py-16">
                  <MessageSquare
                    size={64}
                    className="mx-auto mb-4 opacity-30"
                  />
                  <h3
                    className="text-xl font-medium mb-2"
                    style={{ color: "var(--dash-text)" }}>
                    تیکتی انتخاب نشده
                  </h3>
                  <p style={{ color: "var(--dash-muted)" }}>
                    از سمت راست تیکتی را انتخاب کنید یا تیکت جدید ایجاد کنید
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
