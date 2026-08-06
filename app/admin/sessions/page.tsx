"use client";

import { useCallback, useState, useEffect } from "react";
import {
  CheckCircle,
  Hourglass,
  XCircle,
  CalendarDays,
  Clock,
  Users,
  User,
  FileText,
  Link,
  MessageSquare,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { ListSkeleton } from "@/components/dashboard/Skeletons";

type SessionStatus = "Approved" | "Pending" | "Canceled";

interface SessionRequest {
  id: number;
  studentName: string;
  studentEmail: string | null;
  date: string;
  time: string;
  language: string;
  level: string;
  type: "Public" | "Private";
  reason?: string;
  status: SessionStatus;
  meetLink: string;
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionRequest | null>(
    null,
  );
  const [meetLinkInput, setMeetLinkInput] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<SessionStatus | "all">("all");

  const fetchSessions = async () => {
    const res = await fetch("/api/admin/sessions");
    if (!res.ok) throw new Error();
    return (await res.json()) as SessionRequest[];
  };

  const applySessions = useCallback((data: SessionRequest[]) => {
    setSessions(data);
    setSelectedSession((current) =>
      current ? (data.find((s) => s.id === current.id) ?? current) : null,
    );
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        applySessions(await fetchSessions());
      } catch (err) {
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    void run();
  }, [applySessions]);

  const handleRefresh = async () => {
    if (loading || refreshing) return;
    setRefreshing(true);
    try {
      applySessions(await fetchSessions());
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesFilter = filter === "all" || s.status === filter;
    const matchesSearch =
      searchQuery === "" ||
      s.studentName.includes(searchQuery) ||
      (s.studentEmail ?? "").includes(searchQuery) ||
      s.language.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const updateSession = async (id: number, data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (res.ok) {
        const updated: SessionRequest = await res.json();
        setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
        setSelectedSession(updated);
      }
    } catch (err) {
      console.error("Error updating session:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectSession = (session: SessionRequest) => {
    setSelectedSession(session);
    setMeetLinkInput(session.meetLink);
  };

  const handleSaveMeetLink = () => {
    if (!selectedSession) return;
    updateSession(selectedSession.id, { meetUrl: meetLinkInput });
  };

  const handleStatusChange = (id: number, status: SessionStatus) => {
    updateSession(id, { status });
  };

  const handleCopyLink = (id: number, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusConfig = {
    Approved: {
      label: "تأیید شده",
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      icon: CheckCircle,
    },
    Pending: {
      label: "در انتظار",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      icon: Hourglass,
    },
    Canceled: {
      label: "لغو شده",
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      icon: XCircle,
    },
  };

  const formatDate = (d: string) => d;

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "کل درخواست‌ها",
              value: sessions.length,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              label: "تأیید شده",
              value: sessions.filter((s) => s.status === "Approved").length,
              color: "text-green-500",
              bg: "bg-green-500/10",
            },
            {
              label: "در انتظار",
              value: sessions.filter((s) => s.status === "Pending").length,
              color: "text-orange-500",
              bg: "bg-orange-500/10",
            },
            {
              label: "لغو شده",
              value: sessions.filter((s) => s.status === "Canceled").length,
              color: "text-red-500",
              bg: "bg-red-500/10",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-5 shadow-lg border border-[var(--dash-muted)]/20 dark:border-white/20"
              style={{ backgroundColor: "var(--dash-sides)" }}>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--dash-muted)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Sessions List */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl border overflow-hidden shadow-lg"
              style={{
                backgroundColor: "var(--dash-sides)",
                borderColor: "var(--dash-bg)",
              }}>
              {/* Search */}
              <div
                className="p-4 border-b"
                style={{ borderColor: "var(--dash-bg)" }}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="جستجوی دانشجو، ایمیل یا زبان..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-2 text-right"
                    style={{
                      backgroundColor: "var(--dash-bg)",
                      borderColor: "var(--dash-border)",
                      color: "var(--dash-text)",
                    }}
                  />
                  <button
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
                    title="به‌روزرسانی"
                    aria-label="به‌روزرسانی"
                    className="p-2.5 rounded-xl border transition-colors hover:bg-white/10 disabled:opacity-50 shrink-0"
                    style={{
                      borderColor: "var(--dash-border)",
                      color: "var(--dash-muted)",
                    }}>
                    <RefreshCw
                      size={16}
                      className={refreshing ? "animate-spin" : ""}
                    />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div
                className="flex border-b"
                style={{ borderColor: "var(--dash-bg)" }}>
                {(["all", "Pending", "Approved", "Canceled"] as const).map(
                  (key) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className="flex-1 py-3 text-sm font-medium transition-colors"
                      style={{
                        color: filter === key ? "#22c55e" : "var(--dash-muted)",
                        borderBottom:
                          filter === key
                            ? "2px solid #22c55e"
                            : "2px solid transparent",
                      }}>
                      {key === "all" ? "همه" : statusConfig[key].label}
                    </button>
                  ),
                )}
              </div>

              {/* List */}
              <div className="max-h-[600px] overflow-y-auto">
                {loading ? (
                  <ListSkeleton count={3} />
                ) : filteredSessions.length === 0 ? (
                  <div
                    className="text-center py-12"
                    style={{ color: "var(--dash-muted)" }}>
                    <CalendarDays
                      size={48}
                      className="mx-auto mb-3 opacity-30"
                    />
                    <p>جلسه‌ای یافت نشد</p>
                  </div>
                ) : (
                  filteredSessions.map((session) => {
                    const StatusIcon = statusConfig[session.status].icon;
                    return (
                      <button
                        key={session.id}
                        onClick={() => handleSelectSession(session)}
                        className="w-full p-4 text-right border-b transition-all hover:bg-white/5"
                        style={{
                          borderColor: "var(--dash-bg)",
                          backgroundColor:
                            selectedSession?.id === session.id
                              ? "var(--dash-bg)"
                              : "transparent",
                        }}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div
                              className={`p-1.5 rounded-lg ${statusConfig[session.status].bg}`}>
                              <StatusIcon
                                className={`h-4 w-4 ${statusConfig[session.status].color}`}
                              />
                            </div>
                            <div className="min-w-0">
                              <p
                                className="font-semibold text-sm truncate"
                                style={{ color: "var(--dash-text)" }}>
                                {session.studentName}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: "var(--dash-muted)" }}>
                                {session.language} • سطح {session.level} •{" "}
                                {session.type === "Public" ? "عمومی" : "خصوصی"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div
                          className="flex items-center gap-3 text-xs"
                          style={{ color: "var(--dash-muted)" }}>
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(session.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {session.time}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right: Session Detail */}
          <div className="lg:col-span-3">
            {selectedSession ? (
              <div
                className="rounded-2xl border overflow-hidden shadow-lg"
                style={{
                  backgroundColor: "var(--dash-sides)",
                  borderColor: "var(--dash-bg)",
                }}>
                {/* Header */}
                <div
                  className="p-6 border-b"
                  style={{ borderColor: "var(--dash-bg)" }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2
                        className="text-xl font-bold"
                        style={{ color: "var(--dash-text)" }}>
                        {selectedSession.studentName}
                      </h2>
                      <p
                        className="text-sm mt-1"
                        style={{ color: "var(--dash-muted)" }}>
                        {selectedSession.studentEmail ?? "---"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig[selectedSession.status].bg} ${statusConfig[selectedSession.status].color} ${statusConfig[selectedSession.status].border}`}>
                      {statusConfig[selectedSession.status].label}
                    </span>
                  </div>

                  <div
                    className="flex flex-wrap gap-4 text-sm"
                    style={{ color: "var(--dash-muted)" }}>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(selectedSession.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {selectedSession.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4" />
                      {selectedSession.language}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      سطح {selectedSession.level}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {selectedSession.type === "Public" ? (
                        <Users className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      {selectedSession.type === "Public" ? "عمومی" : "خصوصی"}
                    </span>
                  </div>

                  {selectedSession.reason && (
                    <div
                      className="mt-4 p-3 rounded-xl"
                      style={{ backgroundColor: "var(--dash-bg)" }}>
                      <p
                        className="text-xs font-medium mb-1"
                        style={{ color: "var(--dash-muted)" }}>
                        دلیل یادگیری:
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--dash-text)" }}>
                        {selectedSession.reason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Online Meet Link */}
                <div
                  className="p-6 border-b"
                  style={{ borderColor: "var(--dash-bg)" }}>
                  <label
                    className="block text-sm font-medium mb-3"
                    style={{ color: "var(--dash-text)" }}>
                    <Link className="h-4 w-4 inline ml-1.5" />
                    لینک جلسه آنلاین
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="url"
                        value={meetLinkInput}
                        onChange={(e) => setMeetLinkInput(e.target.value)}
                        placeholder="https://meet.google.com/... یا https://zoom.us/j/..."
                        className="w-full px-4 py-3 rounded-xl border outline-none  text-left text-sm"
                        style={{
                          backgroundColor: "var(--dash-bg)",
                          borderColor: "var(--dash-border)",
                          color: "var(--dash-text)",
                          direction: "ltr",
                        }}
                      />
                    </div>
                    <button
                      onClick={handleSaveMeetLink}
                      disabled={
                        saving ||
                        !meetLinkInput.trim() ||
                        meetLinkInput === selectedSession.meetLink
                      }
                      className="px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg"
                      style={{
                        backgroundColor: "#22c55e",
                        color: "black",
                      }}>
                      {saving ? "در حال ذخیره..." : "ذخیره"}
                    </button>
                  </div>

                  {selectedSession.meetLink && (
                    <div className="mt-3 flex items-center gap-2">
                      <span
                        className="text-xs truncate flex-1 text-left font-mono"
                        style={{
                          color: "var(--dash-muted)",
                          direction: "ltr",
                        }}>
                        {selectedSession.meetLink}
                      </span>
                      <button
                        onClick={() =>
                          handleCopyLink(
                            selectedSession.id,
                            selectedSession.meetLink,
                          )
                        }
                        className="p-1.5 rounded-lg transition-colors hover:bg-white/10">
                        {copiedId === selectedSession.id ? (
                          <span className="text-xs text-green-500 font-medium">
                            کپی شد
                          </span>
                        ) : (
                          <Copy
                            className="h-3.5 w-3.5"
                            style={{ color: "var(--dash-muted)" }}
                          />
                        )}
                      </button>
                      <a
                        href={selectedSession.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg transition-colors hover:bg-white/10">
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          style={{ color: "var(--dash-muted)" }}
                        />
                      </a>
                    </div>
                  )}
                </div>

                {/* Status Management */}
                <div className="p-6 flex flex-col sm:flex-row gap-3">
                  {(["Approved", "Pending", "Canceled"] as const).map(
                    (status) => {
                      const isActive = selectedSession.status === status;
                      return (
                        <button
                          key={status}
                          onClick={() =>
                            !isActive &&
                            handleStatusChange(selectedSession.id, status)
                          }
                          disabled={isActive || saving}
                          className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
                            isActive
                              ? `${statusConfig[status].bg} ${statusConfig[status].color} border-2 ${statusConfig[status].border} cursor-default`
                              : "border-2 border-transparent hover:bg-white/5 disabled:opacity-50"
                          }`}
                          style={{
                            color: isActive ? undefined : "var(--dash-muted)",
                          }}>
                          {saving && !isActive ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isActive ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : null}
                          {statusConfig[status].label}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            ) : (
              <div
                className="flex items-center justify-center h-full rounded-2xl border shadow-lg"
                style={{
                  backgroundColor: "var(--dash-sides)",
                  borderColor: "var(--dash-bg)",
                }}>
                <div className="text-center py-16">
                  <CalendarDays
                    size={64}
                    className="mx-auto mb-4 opacity-30"
                    style={{ color: "var(--dash-muted)" }}
                  />
                  <h3
                    className="text-xl font-medium mb-2"
                    style={{ color: "var(--dash-text)" }}>
                    جلسه‌ای انتخاب نشده
                  </h3>
                  <p style={{ color: "var(--dash-muted)" }}>
                    از سمت راست یک درخواست را انتخاب کنید
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
