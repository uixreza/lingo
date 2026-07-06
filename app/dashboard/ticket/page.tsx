"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Tag,
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

// Mock data
const mockTickets: Ticket[] = [
  {
    id: 1,
    title: "مشکل در دسترسی به دوره Next.js",
    message:
      "سلام، من دوره Next.js رو خریداری کردم ولی به بخش تمرین‌ها دسترسی ندارم. لطفاً راهنمایی کنید.",
    status: "open",
    priority: "high",
    category: "technical",
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
    user: {
      name: "علی محمدی",
      email: "ali@example.com",
    },
    replies: [],
  },
  {
    id: 2,
    title: "سوال درباره مدرک دوره",
    message: "بعد از اتمام دوره، مدرک معتبر ارائه می‌شود؟",
    status: "in-progress",
    priority: "medium",
    category: "general",
    createdAt: "2024-01-14T15:20:00",
    updatedAt: "2024-01-14T16:45:00",
    user: {
      name: "سارا حسینی",
      email: "sara@example.com",
    },
    replies: [
      {
        id: 1,
        message:
          "سلام سارا جان، بله بعد از اتمام موفقیت‌آمیز دوره، مدرک معتبر با قابلیت استعلام دریافت خواهید کرد.",
        isAdmin: true,
        userName: "پشتیبانی لینگوفم",
        createdAt: "2024-01-14T16:45:00",
      },
    ],
  },
  {
    id: 3,
    title: "مشکل در پرداخت",
    message:
      "هنگام پرداخت برای دوره Tailwind CSS، خطا دریافت می‌کنم. کارت بانکی من مشکلی نداره.",
    status: "resolved",
    priority: "urgent",
    category: "payment",
    createdAt: "2024-01-13T09:15:00",
    updatedAt: "2024-01-13T14:30:00",
    user: {
      name: "رضا کریمی",
      email: "reza@example.com",
    },
    replies: [
      {
        id: 1,
        message:
          "مشکل بررسی شد. لطفاً از مرورگر دیگری استفاده کنید یا کش مرورگر را پاک کنید.",
        isAdmin: true,
        userName: "پشتیبانی لینگوفم",
        createdAt: "2024-01-13T11:20:00",
      },
      {
        id: 2,
        message: "ممنون، مشکل حل شد. مرورگر رو عوض کردم و پرداخت انجام شد.",
        isAdmin: false,
        userName: "رضا کریمی",
        createdAt: "2024-01-13T14:30:00",
      },
    ],
  },
];

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
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [newTicketCategory, setNewTicketCategory] = useState("general");
  const [newTicketPriority, setNewTicketPriority] =
    useState<TicketPriority>("medium");
  const [replyMessage, setReplyMessage] = useState("");
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "open" | "in-progress" | "resolved"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { value: "technical", label: "مشکل فنی", icon: "🔧" },
    { value: "payment", label: "مشکل پرداخت", icon: "💰" },
    { value: "content", label: "محتوا", icon: "📚" },
    { value: "certificate", label: "گواهی و مدرک", icon: "🎓" },
    { value: "general", label: "سایر موارد", icon: "📝" },
  ];

  const priorities: { value: TicketPriority; label: string }[] = [
    { value: "low", label: "کم" },
    { value: "medium", label: "متوسط" },
    { value: "high", label: "بالا" },
    { value: "urgent", label: "فوری" },
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

  const handleCreateTicket = () => {
    if (!newTicketTitle.trim() || !newTicketMessage.trim()) return;

    const newTicket: Ticket = {
      id: tickets.length + 1,
      title: newTicketTitle,
      message: newTicketMessage,
      status: "open",
      priority: newTicketPriority,
      category: newTicketCategory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        name: "کاربر لینگوفم",
        email: "user@example.com",
      },
      replies: [],
    };

    setTickets([newTicket, ...tickets]);
    setNewTicketTitle("");
    setNewTicketMessage("");
    setIsCreatingTicket(false);
  };

  const handleSendReply = () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    const newReply: Reply = {
      id: selectedTicket.replies.length + 1,
      message: replyMessage,
      isAdmin: false,
      userName: "کاربر لینگوفم",
      createdAt: new Date().toISOString(),
    };

    const updatedTicket = {
      ...selectedTicket,
      replies: [...selectedTicket.replies, newReply],
      updatedAt: new Date().toISOString(),
      status:
        selectedTicket.status === "resolved" ? "open" : selectedTicket.status,
    };

    setTickets(
      tickets.map((t) => (t.id === selectedTicket.id ? updatedTicket : t)),
    );
    setSelectedTicket(updatedTicket);
    setReplyMessage("");
  };

  return (
    <div dir="rtl" className="py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--dash-text)] mb-2">
            پشتیبانی و تیکت‌ها
          </h1>
          <p className="text-[var(--dash-muted)]">
            درخواست‌های خود را مطرح کنید، ما در کوتاه‌ترین زمان پاسخگو هستیم
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tickets List Panel */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
              {/* Create Ticket Button */}
              <button
                onClick={() => setIsCreatingTicket(true)}
                className="w-full py-3 rounded-xl font-bold transition-all duration-300 shadow-lg flex items-center justify-center gap-2 mb-6 bg-green-500 text-black hover:bg-green-400"
              >
                <MessageSquare size={18} />
                تیکت جدید
              </button>

              {/* Search */}
              <input
                type="text"
                placeholder="جستجو در تیکت‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all mb-4"
              />

              {/* Tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {(["all", "open", "in-progress", "resolved"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-green-500 text-black shadow-lg"
                        : "bg-[var(--hover-bg)] text-[var(--dash-text)] hover:bg-[var(--hover-bg-strong)]"
                    }`}
                  >
                    {tab === "all" && "همه"}
                    {tab === "open" && "باز"}
                    {tab === "in-progress" && "در حال بررسی"}
                    {tab === "resolved" && "حل شده"}
                  </button>
                ))}
              </div>

              {/* Tickets List */}
              <div className="max-h-[600px] overflow-y-auto space-y-3">
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-12 text-[var(--dash-muted)]">
                    <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
                    <p>تیکتی وجود ندارد</p>
                  </div>
                ) : (
                  filteredTickets.map((ticket) => {
                    const StatusIcon = getStatusBadge(ticket.status).icon;
                    const priorityBadge = getPriorityBadge(ticket.priority);

                    return (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`w-full text-right rounded-xl p-4 transition-all duration-200 shadow-lg ${
                          selectedTicket?.id === ticket.id
                            ? "bg-green-500 text-black"
                            : "bg-[var(--hover-bg)] text-[var(--dash-text)] hover:bg-[var(--hover-bg-strong)]"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`font-semibold line-clamp-1 flex-1 ${selectedTicket?.id === ticket.id ? "text-black" : "text-[var(--dash-text)]"}`}>
                            {ticket.title}
                          </h3>
                          <StatusIcon size={16} className={`shrink-0 mt-0.5 ${selectedTicket?.id === ticket.id ? "text-black/60" : getStatusBadge(ticket.status).color.split(" ")[1]}`} />
                        </div>
                        <p className={`text-sm line-clamp-2 mb-2 ${selectedTicket?.id === ticket.id ? "text-black/70" : "text-[var(--dash-muted)]"}`}>
                          {ticket.message}
                        </p>
                        <div className="flex justify-between items-center text-xs">
                          <span className={selectedTicket?.id === ticket.id ? "text-black/70" : "text-[var(--dash-muted)]"}>
                            {formatDate(ticket.createdAt)}
                          </span>
                          {selectedTicket?.id !== ticket.id && (
                            <span className={`px-2 py-0.5 rounded-full text-xs ${priorityBadge.color}`}>
                              {priorityBadge.label}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Ticket Detail Panel */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
                {/* Ticket Header */}
                <div className="mb-6 pb-6 border-b border-[var(--dash-muted)]/20">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-[var(--dash-text)]">
                      {selectedTicket.title}
                    </h2>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(selectedTicket.priority).color}`}>
                        اولویت: {getPriorityBadge(selectedTicket.priority).label}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedTicket.status).color}`}>
                        {getStatusBadge(selectedTicket.status).label}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm text-[var(--dash-muted)]">
                    <span className="flex items-center gap-1"><User size={14} />{selectedTicket.user.name}</span>
                    <span className="flex items-center gap-1"><Calendar size={14} />{formatDate(selectedTicket.createdAt)}</span>
                    <span className="flex items-center gap-1"><Tag size={14} />{categories.find((c) => c.value === selectedTicket.category)?.label}</span>
                  </div>
                </div>

                {/* Initial Message */}
                <div className="mb-6 pb-6 border-b border-[var(--dash-muted)]/20">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--hover-bg-strong)] flex items-center justify-center shrink-0">
                      <User size={18} className="text-[var(--dash-text)]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-[var(--dash-text)]">{selectedTicket.user.name}</span>
                        <span className="text-xs text-[var(--dash-muted)]">{formatDate(selectedTicket.createdAt)}</span>
                      </div>
                      <p className="text-[var(--dash-text)] leading-relaxed">{selectedTicket.message}</p>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                <div className="mb-6 pb-6 border-b border-[var(--dash-muted)]/20 max-h-[400px] overflow-y-auto">
                  <h3 className="font-medium text-[var(--dash-text)] mb-4">
                    پاسخ‌ها ({selectedTicket.replies.length})
                  </h3>
                  <div className="space-y-4">
                    {selectedTicket.replies.length === 0 && (
                      <p className="text-[var(--dash-muted)] text-sm">هنوز پاسخی داده نشده است</p>
                    )}
                    {selectedTicket.replies.map((reply) => (
                      <div key={reply.id} className={`flex gap-3 ${reply.isAdmin ? "" : "flex-row-reverse"}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                          reply.isAdmin
                            ? "bg-green-500"
                            : "bg-[var(--hover-bg-strong)]"
                        }`}>
                          {reply.isAdmin ? (
                            <span className="text-black text-sm font-bold">پ</span>
                          ) : (
                            <User size={18} className="text-[var(--dash-text)]" />
                          )}
                        </div>
                        <div className={`flex-1 ${reply.isAdmin ? "" : "text-left"}`}>
                          <div className={`flex items-center mb-2 gap-2 ${reply.isAdmin ? "" : "flex-row-reverse"}`}>
                            <span className="font-medium text-[var(--dash-text)] text-sm">{reply.userName}</span>
                            {reply.isAdmin && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-black font-medium">پشتیبان</span>
                            )}
                            <span className="text-xs text-[var(--dash-muted)] mr-auto">{formatDate(reply.createdAt)}</span>
                          </div>
                          <p className={`text-[var(--dash-text)] leading-relaxed text-sm bg-[var(--hover-bg)] rounded-2xl p-4 shadow-lg ${reply.isAdmin ? "ml-6" : "mr-6"}`}>
                            {reply.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply Input */}
                {selectedTicket.status !== "resolved" && selectedTicket.status !== "closed" && (
                  <div className="flex gap-3 items-stretch">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="پاسخ خود را بنویسید..."
                      rows={3}
                      className="flex-1 bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all resize-none"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim()}
                      className="px-6 rounded-xl font-bold transition-all duration-300 shadow-lg flex items-center gap-2 bg-green-500 text-black hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={18} />
                      ارسال
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <MessageSquare size={64} className="mx-auto mb-4 opacity-30 text-[var(--dash-muted)]" />
                  <h3 className="text-xl font-medium text-[var(--dash-text)] mb-2">
                    تیکتی انتخاب نشده
                  </h3>
                  <p className="text-[var(--dash-muted)]">
                    از سمت راست تیکتی را انتخاب کنید یا تیکت جدید ایجاد کنید
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Ticket Modal */}
        <AnimatePresence>
          {isCreatingTicket && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setIsCreatingTicket(false)}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-lg w-full bg-[var(--dash-sides)]/95 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-[var(--dash-muted)]/20">
                  <h2 className="text-xl font-bold text-[var(--dash-text)]">
                    تیکت جدید
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--dash-text)] mb-2">
                      عنوان
                    </label>
                    <input
                      type="text"
                      value={newTicketTitle}
                      onChange={(e) => setNewTicketTitle(e.target.value)}
                      placeholder="مشکل در دسترسی به دوره..."
                      className="w-full bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--dash-text)] mb-2">
                        دسته‌بندی
                      </label>
                      <select
                        value={newTicketCategory}
                        onChange={(e) => setNewTicketCategory(e.target.value)}
                        className="w-full bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--dash-text)] mb-2">
                        اولویت
                      </label>
                      <select
                        value={newTicketPriority}
                        onChange={(e) => setNewTicketPriority(e.target.value as TicketPriority)}
                        className="w-full bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      >
                        {priorities.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--dash-text)] mb-2">
                      توضیحات
                    </label>
                    <textarea
                      value={newTicketMessage}
                      onChange={(e) => setNewTicketMessage(e.target.value)}
                      placeholder="مشکل خود را به طور کامل توضیح دهید..."
                      rows={5}
                      className="w-full bg-[var(--hover-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-[var(--dash-muted)]/20 flex gap-3">
                  <button
                    onClick={handleCreateTicket}
                    disabled={!newTicketTitle.trim() || !newTicketMessage.trim()}
                    className="flex-1 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg bg-green-500 text-black hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ارسال تیکت
                  </button>
                  <button
                    onClick={() => setIsCreatingTicket(false)}
                    className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-[var(--hover-bg)] text-[var(--dash-text)] hover:bg-[var(--hover-bg-strong)]"
                  >
                    انصراف
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
