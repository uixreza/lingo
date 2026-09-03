"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, PenLine, X, Save, CloudUpload, NotebookText, CloudCheck, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useLang } from "@/contexts/LanguageContext";
import { type TranslationKey } from "@/i18n";
import RichTextEditor from "@/components/dashboard/UI/RichTextEditor";

type Note = {
  id: string;
  text: string;
  updatedAt: number;
  synced?: boolean;
};

const STORAGE_KEY = "lingofam-notebook";

const createNote = (): Note => ({
  id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  text: "",
  updatedAt: Date.now(),
});

function toFa(value: number | string): string {
  const digits = "۰۱۲۳۴۵۶۷۸۹";
  return String(value).replace(/[0-9]/g, (d) => digits[+d]);
}

const timeAgo = (timestamp: number, t: (key: TranslationKey) => string): string => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t("notebook.justNow");
  if (minutes < 60) return t("notebook.minutesAgo").replace("{count}", toFa(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("notebook.hoursAgo").replace("{count}", toFa(hours));
  const days = Math.floor(hours / 24);
  return t("notebook.daysAgo").replace("{count}", toFa(days));
};

const loadNotes = (): Note[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Note[];
    }
  } catch {
    return [];
  }
  return [];
};

let notesCache: Note[] = [];
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = (): Note[] => notesCache;

const getServerSnapshot = (): Note[] => notesCache;

const persistNotes = (notes: Note[]) => {
  notesCache = notes;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    notesCache = [];
  }
  listeners.forEach((listener) => listener());
};

const listVariants = {
  initial: { opacity: 0, y: 16 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

export default function NotebookPage() {
  const notes = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { t, locale } = useLang();

  useEffect(() => {
    persistNotes(loadNotes());
    let cancelled = false;
    fetch("/api/notes")
      .then(async (res) => {
        if (!res.ok) throw new Error("fetch failed");
        const data = (await res.json()) as {
          notes?: { localId: string; text: string; updatedAt: string }[];
        };
        if (cancelled || !Array.isArray(data.notes)) return;

        const localById = new Map(notesCache.map((n) => [n.id, n]));
        const merged: Note[] = [...notesCache];

        for (const dbNote of data.notes) {
          const existing = localById.get(dbNote.localId);
          const dbTime = new Date(dbNote.updatedAt).getTime();
          if (existing) {
            const idx = merged.indexOf(existing);
            if (dbTime > existing.updatedAt) {
              merged[idx] = { ...existing, text: dbNote.text, updatedAt: dbTime, synced: true };
              localById.set(dbNote.localId, merged[idx]);
            } else if (!existing.synced) {
              merged[idx] = { ...existing, synced: true };
              localById.set(dbNote.localId, merged[idx]);
            }
          } else {
            const incoming: Note = {
              id: dbNote.localId,
              text: dbNote.text,
              updatedAt: dbTime,
              synced: true,
            };            localById.set(dbNote.localId, incoming);
            merged.push(incoming);
          }
        }
        persistNotes(merged);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const addNote = () => {
    const note = createNote();
    persistNotes([note, ...notesCache]);
    setEditingId(note.id);
  };

  const plainText = (html: string) =>
    html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const editingNote = notes.find((n) => n.id === editingId) ?? null;

  const closeEditor = () => {
    const note = notesCache.find((n) => n.id === editingId);
    if (note && !plainText(note.text)) {
      persistNotes(notesCache.filter((n) => n.id !== note.id));
    }
    setEditingId(null);
  };

  const saveAndClose = async () => {
    if (syncingId) return;
    const note = notesCache.find((n) => n.id === editingId);
    if (!note) {
      setEditingId(null);
      return;
    }
    if (!plainText(note.text)) {
      persistNotes(notesCache.filter((n) => n.id !== note.id));
      setEditingId(null);
      return;
    }
    await saveNote(note.id);
    setEditingId(null);
  };

  const updateNote = (id: string, text: string) => {
    persistNotes(
      notesCache.map((note) =>
        note.id === id ? { ...note, text, updatedAt: Date.now(), synced: false } : note,
      ),
    );
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    const target = deleteTarget;
    setDeleting(true);
    try {
      if (target.synced) {
        const res = await fetch("/api/notes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ localId: target.id }),
        });
        if (!res.ok) throw new Error("delete failed");
      }
      persistNotes(notesCache.filter((note) => note.id !== target.id));
      setDeleteTarget(null);
      toast.success(t("notebook.noteDeleted"));
    } catch {
      toast.error(t("notebook.deleteError"));
    } finally {
      setDeleting(false);
    }
  };

  const saveNote = async (id: string) => {
    if (syncingId) return;
    const note = notesCache.find((n) => n.id === id);
    if (!note || !note.text.trim()) return;
    setSyncingId(id);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localId: note.id, text: note.text }),
      });
      if (!res.ok) throw new Error("save failed");
      persistNotes(
        notesCache.map((n) => (n.id === id ? { ...n, synced: true } : n)),
      );
      toast.success(t("notebook.noteSaved"));
    } catch {
      toast.error(t("notebook.saveError"));
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-green-500/10">
            <NotebookText className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
              <h1 className="text-xl font-bold text-[var(--dash-text)]">
               {t("notebook.title")}
             </h1>
            <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--dash-muted)]/10 text-[var(--dash-muted)]">
              {t("notebook.count").replace("{count}", toFa(notes.length))}
            </span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={addNote}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-black transition-all duration-300 bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
           <Plus className="h-4 w-4" />
           {t("notebook.newNote")}
        </motion.button>
      </motion.div>

      {notes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="relative overflow-hidden flex flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg px-6 py-16 text-center min-h-[320px]">
          <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-[var(--dash-accent)]/15 blur-3xl" />
          <div className="relative mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] flex items-center justify-center shadow-lg shadow-[var(--dark-purple)]/25">
            <NotebookText className="h-7 w-7 text-white" />
          </div>
          <div className="relative">
             <p className="text-lg font-bold text-[var(--dash-text)]">
               {t("notebook.empty")}
             </p>
             <p className="text-sm text-[var(--dash-muted)] mt-2 leading-6">
               {t("notebook.emptyDesc")}
             </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {notes.map((note, i) => (
              <motion.div
                key={note.id}
                layout
                variants={listVariants}
                custom={i}
                initial="initial"
                animate="animate"
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  transition: { duration: 0.2 },
                }}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg p-4 transition-colors duration-300 hover:border-[var(--dash-accent)]/40">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
                <button
                  onClick={() => setEditingId(note.id)}
                  className="flex-1 text-right min-w-0 cursor-text">
                  {plainText(note.text) ? (
                    <p className="text-sm text-[var(--dash-text)] leading-7 whitespace-pre-wrap break-words line-clamp-6">
                      {plainText(note.text)}
                    </p>
                  ) : (
                     <p className="text-sm text-[var(--dash-muted)] leading-7">
                       {t("notebook.writePlaceholder")}
                     </p>
                  )}
                </button>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--dash-muted)]/10">
                  <span className="text-[11px] text-[var(--dash-muted)]">
                    {timeAgo(note.updatedAt, t)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingId(note.id)}
                       aria-label={t("notebook.editNote")}
                       title={t("notebook.editNote")}
                      className="p-2 rounded-lg text-[var(--dash-muted)] hover:text-blue-500 hover:bg-blue-500/10 transition-colors duration-150">
                      <PenLine className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => saveNote(note.id)}
                      disabled={note.synced || syncingId === note.id}
                       aria-label={note.synced ? t("notebook.savedCloud") : t("notebook.saveToDb")}
                       title={note.synced ? t("notebook.savedCloud") : t("notebook.saveToDb")}
                      className="p-2 rounded-lg text-[var(--dash-muted)] transition-colors duration-150 disabled:cursor-default enabled:hover:text-green-500 enabled:hover:bg-green-500/10">
                      {syncingId === note.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : note.synced ? (
                        <CloudCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <CloudUpload className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(note)}
                       aria-label={t("notebook.deleteNote")}
                      className="p-2 rounded-lg text-[var(--dash-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors duration-150">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {editingNote && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeEditor}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 120, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 120, scale: 0.98 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative w-full max-h-[94dvh] overflow-hidden rounded-t-3xl border border-[var(--dash-muted)]/15 bg-[var(--dash-sides)] shadow-2xl flex flex-col sm:max-w-3xl sm:rounded-2xl">
              <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-[var(--dash-muted)]/30 sm:hidden" />
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--dash-muted)]/10">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--dash-text)]">
                  <NotebookText className="h-4 w-4 text-green-500" />
                   {plainText(editingNote.text) ? t("notebook.editNote") : t("notebook.newNote")}
                </span>
                <button
                  onClick={closeEditor}
                   aria-label={t("notebook.cancel")}
                  className="p-2 rounded-xl text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--hover-bg)] transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                <RichTextEditor
                  key={editingNote.id}
                  initialContent={editingNote.text}
                  autoFocus
                  onChange={(html) => updateNote(editingNote.id, html)}
                   placeholder={t("notebook.writePlaceholder")}
                  minHeight="300px"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 px-4 sm:px-6 py-3 border-t border-[var(--dash-muted)]/10">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={closeEditor}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl border border-[var(--dash-muted)]/30 text-[var(--dash-muted)] hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)] transition-all duration-300 font-medium">
                   <Save className="h-4 w-4" />
                   {t("notebook.saveLocal")}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={saveAndClose}
                  disabled={syncingId === editingNote.id}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
                  {syncingId === editingNote.id ? (
                    <>
                     <Loader2 className="h-4 w-4 animate-spin" />
                       {t("notebook.saving")}
                    </>
                  ) : (
                    <>
                       <CloudUpload className="h-4 w-4" />
                       {t("notebook.saveToDb")}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => !deleting && setDeleteTarget(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 120, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 120, scale: 0.98 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative w-full rounded-t-3xl border border-[var(--dash-muted)]/15 bg-[var(--dash-sides)] p-5 pb-7 shadow-2xl sm:max-w-md sm:rounded-2xl sm:pb-6">
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[var(--dash-muted)]/30 sm:hidden" />
              <div className="flex items-start gap-3.5">
                <div className="shrink-0 p-3 rounded-2xl bg-red-500/10">
                  <Trash2 className="h-6 w-6 text-red-500" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-[var(--dash-text)]">
                     {t("notebook.deleteNote")}
                   </h3>
                  <p className="text-sm text-[var(--dash-muted)] mt-1.5 leading-6">
                     {deleteTarget.synced
                       ? t("notebook.deleteConfirmAccount")
                       : t("notebook.deleteConfirmLocal")}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => !deleting && setDeleteTarget(null)}
                  disabled={deleting}
                   className="rounded-xl px-4 py-3 text-sm font-bold text-[var(--dash-muted)] bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/15 transition-colors hover:bg-[var(--dash-bg)] disabled:opacity-50">
                   {t("notebook.cancel")}
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white bg-red-500 shadow-lg shadow-red-500/25 transition-colors hover:bg-red-600 disabled:opacity-50">
                  {deleting ? (
                    <>
                       <Loader2 className="h-4 w-4 animate-spin" />
                       {t("notebook.deleting")}
                    </>
                   ) : (
                      t("notebook.delete")
                   )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}