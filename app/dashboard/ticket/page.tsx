"use client";
import { useEffect, useState } from "react";
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
  X,
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

const priorityColors: Record<TicketPriority, string> = {
  low: "bg-gray-500/10 text-gray-400",
  medium: "bg-blue-500/10 text-blue-400",
  high: "bg-orange-500/10 text-orange-400",
  urgent: "bg-red-500/10 text-red-400",
};

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
  const [activeTab, setActiveTab] = useState<
    "all" | "open" | "in-progress" | "resolved"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
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
    fetchTickets();
  }, []);

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
    } catch {
      toast.error("خطا در برقراری ارتباط");
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div dir="rtl" className="py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--dash-text)" }}>
            پشتیبانی و تیکت‌ها
          </h1>
          <p style={{ color: "var(--dash-muted)" }}>
            درخواست‌های خود را مطرح کنید، ما در کوتاه ترین زمان پاسخگو هستیم
          </p>
        </div> */}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tickets List Panel */}
          <div className="lg:col-span-1">
            <div
              className="rounded-xl border overflow-hidden"
              style={{
                backgroundColor: "var(--dash-sides)",
                borderColor: "var(--dash-bg)",
              }}>
              {/* Create Ticket Button */}
              <div
                className="p-4 border-b"
                style={{ borderColor: "var(--dash-bg)" }}>
                <button
                  onClick={() => {
                    setTicketStep(1);
                    setIsCreatingTicket(true);
                  }}
                  className="w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "#22c55e",
                    color: "black",
                  }}>
                  <MessageSquare size={18} />
                  تیکت جدید
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
                  className="w-full px-4 py-2 rounded-xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/40 transition-all text-right"
                  style={{
                    backgroundColor: "var(--dash-bg)",
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
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(selectedTicket.priority).color}`}>
                        اولویت:{" "}
                        {getPriorityBadge(selectedTicket.priority).label}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedTicket.status).color}`}>
                        {getStatusBadge(selectedTicket.status).label}
                      </span>
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

        {/* Create Ticket Modal */}
        {isCreatingTicket && (
          <div className="fixed inset-0 z-[60] lg:flex lg:items-center lg:justify-center lg:p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsCreatingTicket(false)}
            />
            <div className="fixed bottom-0 inset-x-0 z-[60] bg-[var(--dash-sides)] shadow-2xl rounded-t-3xl max-h-[92dvh] overflow-y-auto animate-[sheet-up_0.3s_ease-out] lg:static lg:animate-none lg:rounded-2xl lg:max-w-lg lg:w-full">
              {/* Drag Handle (mobile only) */}
              <div className="flex justify-center pt-3 pb-1 lg:hidden">
                <div className="w-12 h-1.5 bg-[var(--dash-muted)]/25 rounded-full" />
              </div>

              {/* Header */}
              <div
                className="px-6 pt-2 pb-4 border-b flex items-center gap-3"
                style={{ borderColor: "var(--dash-bg)" }}>
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
                      ticketStep === 1 ? "text-green-500" : "text-[var(--dash-muted)]"
                    }`}>
                    ۱. اطلاعات اولیه
                  </span>
                  <span
                    className={`text-[11px] font-bold ${
                      ticketStep === 2 ? "text-green-500" : "text-[var(--dash-muted)]"
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
                        className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/40 transition-all"
                        style={{
                          backgroundColor: "var(--dash-bg)",
                          borderColor: "var(--dash-border)",
                          color: "var(--dash-text)",
                        }}
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
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => setNewTicketCategory(cat.value)}
                              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                selected
                                  ? "bg-green-500/10 ring-1 ring-green-500/40 text-green-500"
                                  : "bg-[var(--dash-bg)] text-[var(--dash-muted)] hover:bg-[var(--dash-border)] hover:text-[var(--dash-text)]"
                              }`}>
                              <span className="text-lg leading-none">{cat.icon}</span>
                              <span className="truncate">{cat.label}</span>
                            </button>
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
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => setNewTicketPriority(p.value)}
                              className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                selected
                                  ? priorityColors[p.value] + " ring-1 ring-current"
                                  : "bg-[var(--dash-bg)] text-[var(--dash-muted)] hover:bg-[var(--dash-border)] hover:text-[var(--dash-text)]"
                              }`}>
                              {p.label}
                            </button>
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
                        {categories.find((c) => c.value === newTicketCategory)?.icon}
                      </span>
                      <span
                        className="text-sm font-medium truncate flex-1"
                        style={{ color: "var(--dash-text)" }}>
                        {newTicketTitle.trim() || "بدون عنوان"}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ${priorityColors[newTicketPriority]}`}>
                        {priorities.find((p) => p.value === newTicketPriority)?.label}
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
                        className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/40 transition-all resize-none"
                        style={{
                          backgroundColor: "var(--dash-bg)",
                          borderColor: "var(--dash-border)",
                          color: "var(--dash-text)",
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer (sticky on mobile sheet) */}
              {ticketStep === 1 ? (
                <div
                  className="sticky bottom-0 p-6 border-t bg-[var(--dash-sides)]"
                  style={{ borderColor: "var(--dash-bg)" }}>
                  <button
                    onClick={() => setTicketStep(2)}
                    disabled={!newTicketTitle.trim()}
                    className="w-full py-3 rounded-xl font-bold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-green-400"
                    style={{
                      backgroundColor: "#22c55e",
                      color: "black",
                      boxShadow: "0 8px 24px -8px rgba(34,197,94,0.45)",
                    }}>
                    ادامه
                    <ChevronLeft size={18} />
                  </button>
                </div>
              ) : (
                <div
                  className="sticky bottom-0 p-6 border-t bg-[var(--dash-sides)] flex gap-3"
                  style={{ borderColor: "var(--dash-bg)" }}>
                  <button
                    onClick={handleCreateTicket}
                    disabled={
                      !newTicketTitle.trim() ||
                      !newTicketMessage.trim() ||
                      isSubmitting
                    }
                    className="flex-1 py-3 rounded-xl font-bold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-green-400"
                    style={{
                      backgroundColor: "#22c55e",
                      color: "black",
                      boxShadow: "0 8px 24px -8px rgba(34,197,94,0.45)",
                    }}>
                    {isSubmitting && (
                      <Loader2 size={18} className="animate-spin" />
                    )}
                    ارسال تیکت
                  </button>
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
