"use client";
import { useState, useEffect } from "react";
import {
  Users,
  Pencil,
  Trash2,
  Lock,
  Unlock,
  Crown,
  Loader2,
  X,
  Search,
  Save,
  BadgeCheck,
  CalendarDays,
  Star,
  Gem,
  Swords,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/dashboard/Avatar";
import { PageSkeleton } from "@/components/dashboard/Skeletons";
import toast from "react-hot-toast";

type FluencyLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
type UserRole = "Admin" | "Teacher" | "Client";

type UserItem = {
  id: number;
  fullname: string;
  phone: string;
  email: string | null;
  avatarSeed: string | null;
  isPro: boolean;
  fluencyLevel: FluencyLevel;
  isVerified: boolean;
  isActive: boolean;
  role: UserRole;
  badges: string[];
  createdAt: string;
};

type ConfirmKind = "delete" | "disable" | "enable";

const PAGE_SIZE = 20;

const FLUENCY_LEVELS: FluencyLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const FLUENCY_LABELS: Record<FluencyLevel, string> = {
  A1: "مقدماتی A1",
  A2: "مقدماتی A2",
  B1: "متوسط B1",
  B2: "متوسط B2",
  C1: "پیشرفته C1",
  C2: "پیشرفته C2",
};
const ROLES: UserRole[] = ["Admin", "Teacher", "Client"];
const ROLE_TILE: Record<UserRole, string> = {
  Admin: "bg-red-500/10 text-red-500",
  Teacher: "bg-blue-500/10 text-blue-500",
  Client: "bg-green-500/10 text-green-500",
};
const ROLE_LABEL: Record<UserRole, string> = {
  Admin: "مدیر",
  Teacher: "مدرس",
  Client: "کاربر",
};

const BADGE_DEFS = [
  {
    key: "Pro",
    label: "کاربر ویژه",
    Icon: Star,
    activeTile:
      "bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-lg shadow-purple-500/10",
  },
  {
    key: "Loyalty",
    label: "کاربر وفادار",
    Icon: Gem,
    activeTile:
      "bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-lg shadow-amber-500/10",
  },
  {
    key: "Warrior",
    label: "رزمنده",
    Icon: Swords,
    activeTile:
      "bg-red-500/20 text-red-400 border-red-500/30 shadow-lg shadow-red-500/10",
  },
] as const;

function getConfirmCopy(kind: ConfirmKind, name: string) {
  if (kind === "delete") {
    return {
      title: "حذف کاربر؟",
      message: `کاربر «${name}» به همراه تمام اطلاعاتش (جلسات، کیف پول، تیکت‌ها و...) به صورت دائمی حذف خواهد شد. این عمل قابل بازگشت نیست.`,
      confirmLabel: "بله، حذف شود",
      icon: Trash2,
      iconBox: "bg-red-500/10 border-red-500/20 text-red-500",
      button:
        "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25",
    };
  }
  if (kind === "disable") {
    return {
      title: "مسدودسازی کاربر؟",
      message: `دسترسی کاربر «${name}» به صورت موقت مسدود می‌شود و نمی‌تواند وارد حساب خود شود. با فعال‌سازی مجدد، دسترسی برمی‌گردد.`,
      confirmLabel: "بله، مسدود شود",
      icon: Lock,
      iconBox: "bg-red-500/10 border-red-500/20 text-red-500",
      button:
        "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20",
    };
  }
  return {
    title: "فعال‌سازی کاربر؟",
    message: `دسترسی کاربر «${name}» مجدداً فعال می‌شود و می‌تواند وارد حساب خود شود.`,
    confirmLabel: "بله، فعال شود",
    icon: Unlock,
    iconBox: "bg-green-500/10 border-green-500/20 text-green-500",
    button:
      "bg-gradient-to-l from-green-500 to-emerald-500 text-black shadow-lg shadow-green-500/25",
  };
}

const cardClass =
  "relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg";
const accentBar =
  "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent";
const inputClass =
  "w-full bg-[var(--dash-bg)]/70 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm outline-none border border-[var(--dash-muted)]/15 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] transition-all placeholder:text-[var(--dash-muted)]/60";
const labelClass = "block text-sm font-medium text-[var(--dash-muted)] mb-2";

const listVariants = {
  initial: { opacity: 0, y: 12 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.3 },
  }),
};

function toFa(value: number | string) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
}

export default function UserManagementPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [badgeBusy, setBadgeBusy] = useState<Record<number, boolean>>({});

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [editForm, setEditForm] = useState({
    fullname: "",
    phone: "",
    email: "",
    fluencyLevel: "A1" as FluencyLevel,
    role: "Client" as UserRole,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirm, setConfirm] = useState<{
    kind: ConfirmKind;
    user: UserItem;
  } | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/admin/users?limit=${PAGE_SIZE}&offset=0&search=${encodeURIComponent(search)}`,
        );
        if (res.ok && !cancelled) {
          const data = await res.json();
          setUsers(data.users ?? []);
          setTotal(data.total ?? 0);
          setHasMore(data.hasMore ?? false);
        }
      } catch {
        // ignore
      }
      if (!cancelled) {
        setIsSearching(false);
        setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [search]);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/admin/users?limit=${PAGE_SIZE}&offset=${users.length}&search=${encodeURIComponent(search)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setUsers((prev) => [...prev, ...(data.users ?? [])]);
        setTotal(data.total ?? total);
        setHasMore(data.hasMore ?? false);
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleBadge = async (user: UserItem, key: (typeof BADGE_DEFS)[number]["key"]) => {
    if (badgeBusy[user.id]) return;
    const has = user.badges.includes(key);
    const next = has
      ? user.badges.filter((b) => b !== key)
      : [...user.badges, key];
    setBadgeBusy((prev) => ({ ...prev, [user.id]: true }));
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, badges: next } : u)),
    );
    const rollback = () =>
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, badges: user.badges } : u)),
      );
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badges: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        rollback();
        toast.error(data.error || "خطا در تغییر نشان کاربر");
        return;
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, badges: data.badges ?? next } : u,
        ),
      );
      toast.success(has ? "نشان حذف شد" : "نشان اعطا شد");
    } catch {
      rollback();
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setBadgeBusy((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  const openEdit = (user: UserItem) => {
    setEditUser(user);
    setEditForm({
      fullname: user.fullname,
      phone: user.phone,
      email: user.email ?? "",
      fluencyLevel: user.fluencyLevel,
      role: user.role,
    });
  };

  const saveEdit = async () => {
    if (!editUser || savingEdit) return;
    if (!editForm.fullname.trim() || !editForm.phone.trim()) {
      toast.error("نام و شماره موبایل الزامی است");
      return;
    }
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: editForm.fullname,
          phone: editForm.phone,
          email: editForm.email.trim() || null,
          fluencyLevel: editForm.fluencyLevel,
          role: editForm.role,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "خطا در ذخیره تغییرات");
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)));
      setEditUser(null);
      toast.success("اطلاعات کاربر به‌روزرسانی شد");
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSavingEdit(false);
    }
  };

  const runConfirmedAction = async () => {
    if (!confirm || confirmBusy) return;
    setConfirmBusy(true);
    const { kind, user } = confirm;
    try {
      if (kind === "delete") {
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: "DELETE",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.error || "خطا در حذف کاربر");
          return;
        }
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setTotal((prev) => Math.max(prev - 1, 0));
        setConfirm(null);
        toast.success("کاربر حذف شد");
      } else {
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: kind === "enable" }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.error || "خطا در تغییر وضعیت کاربر");
          return;
        }
        setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)));
        setConfirm(null);
        toast.success(
          kind === "enable"
            ? "کاربر مجدداً فعال شد"
            : "دسترسی کاربر موقتاً مسدود شد",
        );
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setConfirmBusy(false);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={`${cardClass} p-6`}>
        <div className={accentBar} />
        <div className="pointer-events-none absolute -top-24 -left-10 h-48 w-48 rounded-full bg-[var(--dash-accent)]/15 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dash-muted)]/50 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="جستجوی کاربر با نام، شماره موبایل یا ایمیل..."
              className={`${inputClass} pr-11`}
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[var(--dash-muted)] hover:bg-[var(--dash-muted)]/10 transition-colors"
                title="پاک کردن جستجو">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400">
            <Users className="h-3.5 w-3.5" />
            {toFa(total)} کاربر
          </span>
        </div>
      </motion.section>

      {/* Users grid */}
      {isSearching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)] shadow-lg p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--hover-bg-strong)] animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 w-2/3 rounded bg-[var(--hover-bg-strong)] animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-[var(--hover-bg)] animate-pulse" />
                </div>
              </div>
              <div className="h-7 w-full rounded-lg bg-[var(--hover-bg)] animate-pulse" />
              <div className="h-9 w-full rounded-xl bg-[var(--hover-bg)] animate-pulse" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardClass} p-12 text-center`}>
          <Users className="h-14 w-14 text-[var(--dash-muted)] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[var(--dash-text)] mb-2">
            کاربری یافت نشد
          </h3>
          <p className="text-[var(--dash-muted)] text-sm">
            {search
              ? "متن جستجو را تغییر دهید یا عبارت دیگری را امتحان کنید."
              : "هنوز کاربری در سیستم ثبت نشده است."}
          </p>
          </motion.div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence initial={false}>
            {users.map((user, i) => (
              <motion.div
                key={user.id}
                layout
                variants={listVariants}
                custom={i}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
                className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-200 ${
                  user.isActive
                    ? "border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg"
                    : "border border-red-500/25 bg-[var(--dash-sides)]/60 backdrop-blur-xl shadow-lg opacity-75"
                }`}>
                <div className={accentBar} />

                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <Avatar
                        seed={user.avatarSeed || user.fullname}
                        size={48}
                        className="rounded-xl ring-1 ring-[var(--dash-muted)]/15"
                      />
                      {user.isPro && (
                        <span className="absolute -bottom-1.5 -left-1.5 p-0.5 rounded-full bg-[var(--dash-sides)]">
                          <Crown className="h-3.5 w-3.5 text-purple-500" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-[var(--dash-text)] truncate">
                          {user.fullname}
                        </p>
                        {user.isVerified && (
                          <BadgeCheck className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                      </div>
                      <p
                        className="text-xs text-[var(--dash-muted)] mt-0.5 truncate"
                        dir="ltr">
                        {user.phone}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold ${ROLE_TILE[user.role]}`}>
                    {ROLE_LABEL[user.role]}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mt-4">
                  <span className="text-[10px] font-bold bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-md">
                    {FLUENCY_LABELS[user.fluencyLevel]}
                  </span>
                  {user.isPro && (
                    <span className="text-[10px] font-bold bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-md">
                      Pro
                    </span>
                  )}
                  {!user.isActive && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded-md">
                      <Lock className="h-3 w-3" />
                      غیرفعال
                    </span>
                  )}
                </div>

                {/* Achievements */}
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="text-[10px] font-bold text-[var(--dash-muted)] ml-0.5">
                    نشان‌ها:
                  </span>
                  {BADGE_DEFS.map((def) => {
                    const active = user.badges.includes(def.key);
                    const Icon = def.Icon;
                    return (
                      <motion.button
                        key={def.key}
                        whileTap={badgeBusy[user.id] ? {} : { scale: 0.85 }}
                        onClick={() => toggleBadge(user, def.key)}
                        title={`${active ? "برداشتن" : "اعطای"} نشان ${def.label}`}
                        className={`p-1.5 rounded-lg border transition-all duration-200 ${
                          active
                            ? `${def.activeTile} opacity-100`
                            : "border-[var(--dash-muted)]/15 bg-[var(--dash-muted)]/5 text-[var(--dash-muted)]/60 opacity-30 hover:opacity-60"
                        }`}>
                        <Icon className="h-4 w-4" />
                      </motion.button>
                    );
                  })}
                </div>

                {user.email && (
                  <p
                    className="mt-3 text-xs text-[var(--dash-muted)] truncate"
                    dir="ltr">
                    {user.email}
                  </p>
                )}

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-[var(--dash-muted)]/10">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="flex items-center gap-1.5 text-[11px] text-[var(--dash-muted)]">
                      <CalendarDays className="h-3.5 w-3.5" />
                      عضویت: {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => openEdit(user)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[var(--dash-text)] border border-[var(--dash-muted)]/20 dark:border-white/25 bg-[var(--dash-bg)]/40 hover:bg-[var(--dash-bg)] transition-all duration-200">
                      <Pencil className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      ویرایش
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() =>
                        setConfirm({
                          kind: user.isActive ? "disable" : "enable",
                          user,
                        })
                      }
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                        user.isActive
                          ? "text-red-500 border border-red-500/25 bg-red-500/10 hover:bg-red-500/20"
                          : "text-green-600 dark:text-green-400 border border-green-500/25 bg-green-500/10 hover:bg-green-500/20"
                      }`}>
                      {user.isActive ? (
                        <Lock className="h-3.5 w-3.5" />
                      ) : (
                        <Unlock className="h-3.5 w-3.5" />
                      )}
                      {user.isActive ? "مسدودسازی" : "فعال‌سازی"}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setConfirm({ kind: "delete", user })
                      }
                      className="shrink-0 p-2.5 rounded-xl text-red-500 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-all duration-200"
                      title="حذف کاربر">
                      <Trash2 className="h-3.5 w-3.5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Load more */}
      {users.length > 0 && (
        <div className="flex justify-center">
          {hasMore ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={loadMore}
              disabled={loadingMore}
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-black transition-all duration-300 disabled:opacity-60 bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
              {loadingMore ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              نمایش کاربران بیشتر
            </motion.button>
          ) : (
            <span className="text-xs text-[var(--dash-muted)]">
              همه کاربران نمایش داده شد
            </span>
          )}
        </div>
      )}

      {/* Edit modal */}
      {editUser && (
        <div className="fixed inset-0 z-[60] lg:flex lg:items-center lg:justify-center lg:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditUser(null)}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 inset-x-0 z-[60] bg-[var(--dash-sides)]/95 backdrop-blur-xl border-t border-[var(--dash-muted)]/15 lg:border lg:rounded-2xl rounded-t-3xl shadow-2xl p-6 pb-8 max-h-[85dvh] overflow-y-auto lg:static lg:pb-6 lg:w-full lg:max-w-md">
            <div className="flex justify-center pt-0 pb-3 lg:hidden">
              <div className="w-12 h-1.5 bg-[var(--dash-muted)]/25 rounded-full" />
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-500/10">
                  <Pencil className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--dash-text)]">
                    ویرایش کاربر
                  </h3>
                  <p className="text-xs text-[var(--dash-muted)] mt-0.5">
                    {editUser.fullname}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditUser(null)}
                className="p-2 rounded-lg text-[var(--dash-muted)] hover:bg-[var(--dash-muted)]/10 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>نام و نام خانوادگی</label>
                <input
                  type="text"
                  value={editForm.fullname}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      fullname: e.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="نام کامل کاربر"
                />
              </div>
              <div>
                <label className={labelClass}>شماره موبایل</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className={inputClass}
                  dir="ltr"
                  placeholder="09xxxxxxxxx"
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className={labelClass}>ایمیل</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className={inputClass}
                  dir="ltr"
                  placeholder="example@email.com"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>سطح زبان</label>
                  <select
                    value={editForm.fluencyLevel}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        fluencyLevel: e.target.value as FluencyLevel,
                      }))
                    }
                    className={`${inputClass} cursor-pointer appearance-none`}>
                    {FLUENCY_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {FLUENCY_LABELS[level]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>نقش</label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        role: e.target.value as UserRole,
                      }))
                    }
                    className={`${inputClass} cursor-pointer appearance-none`}>
                    {(ROLES as UserRole[]).map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABEL[role]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <motion.button
                whileTap={savingEdit ? {} : { scale: 0.98 }}
                onClick={saveEdit}
                disabled={savingEdit}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-black transition-all duration-300 disabled:opacity-60 bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
                {savingEdit ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                ذخیره تغییرات
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirm action sheet */}
      {confirm && (
        <div className="fixed inset-0 z-[60] lg:flex lg:items-center lg:justify-center lg:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirm(null)}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 inset-x-0 z-[60] bg-[var(--dash-sides)]/95 backdrop-blur-xl border-t border-[var(--dash-muted)]/15 lg:border lg:rounded-2xl rounded-t-3xl shadow-2xl p-6 pb-8 lg:static lg:pb-6 lg:w-full lg:max-w-sm">
            <div className="flex justify-center pt-0 pb-3 lg:hidden">
              <div className="w-12 h-1.5 bg-[var(--dash-muted)]/25 rounded-full" />
            </div>

            {(() => {
              const copy = getConfirmCopy(confirm.kind, confirm.user.fullname);
              const Icon = copy.icon;
              return (
                <>
                  <div
                    className={`w-14 h-14 mx-auto rounded-2xl border flex items-center justify-center mb-4 ${copy.iconBox}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--dash-text)] text-center mb-2">
                    {copy.title}
                  </h3>
                  <p className="text-sm text-[var(--dash-muted)] text-center leading-relaxed mb-6">
                    {copy.message}
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={runConfirmedAction}
                      disabled={confirmBusy}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-60 ${copy.button}`}>
                      {confirmBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                      {copy.confirmLabel}
                    </motion.button>
                    <button
                      onClick={() => setConfirm(null)}
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-[var(--dash-text)] bg-[var(--dash-muted)]/15 hover:bg-[var(--dash-muted)]/25 transition-colors duration-200">
                      انصراف
                    </button>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </div>
      )}
    </div>
  );
}