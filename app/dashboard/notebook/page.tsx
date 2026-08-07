"use client";

import { useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, NotebookText } from "lucide-react";

type Note = {
  id: string;
  text: string;
  updatedAt: number;
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

const timeAgo = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "همین حالا";
  if (minutes < 60) return `${toFa(minutes)} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${toFa(hours)} ساعت پیش`;
  const days = Math.floor(hours / 24);
  return `${toFa(days)} روز پیش`;
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

let notesCache: Note[] = loadNotes();
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = (): Note[] => notesCache;

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
  const notes = useSyncExternalStore(subscribe, getSnapshot, loadNotes);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const addNote = () => {
    const note = createNote();
    persistNotes([note, ...notesCache]);
    setFocusedId(note.id);
  };

  const updateNote = (id: string, text: string) => {
    persistNotes(
      notesCache.map((note) =>
        note.id === id ? { ...note, text, updatedAt: Date.now() } : note,
      ),
    );
  };

  const deleteNote = (id: string) => {
    persistNotes(notesCache.filter((note) => note.id !== id));
  };

  return (
    <div dir="rtl" className="space-y-6">
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
              دفترچه
            </h1>
            <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--dash-muted)]/10 text-[var(--dash-muted)]">
              {toFa(notes.length)} یادداشت
            </span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={addNote}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-black transition-all duration-300 bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
          <Plus className="h-4 w-4" />
          یادداشت جدید
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
              دفترچه‌تان خالی است
            </p>
            <p className="text-sm text-[var(--dash-muted)] mt-2 leading-6">
              یادداشت‌ها در همین مرورگر ذخیره می‌شوند.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={addNote}
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-black transition-all duration-300 bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
            <Plus className="h-4 w-4" />
            اولین یادداشت را بنویسید
          </motion.button>
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
                <textarea
                  value={note.text}
                  autoFocus={note.id === focusedId}
                  onChange={(e) => updateNote(note.id, e.target.value)}
                  onFocus={() => setFocusedId(note.id)}
                  placeholder="یادداشت بنویسید…"
                  rows={Math.max(3, Math.min(14, note.text.split("\n").length))}
                  className="w-full flex-1 resize-none bg-transparent text-[var(--dash-text)] placeholder:text-[var(--dash-muted)] text-sm leading-7 outline-none focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] rounded-lg transition-shadow"
                />
                <div className="flex items-center justify-between pt-2 border-t border-[var(--dash-muted)]/10">
                  <span className="text-[11px] text-[var(--dash-muted)]">
                    {timeAgo(note.updatedAt)}
                  </span>
                  <button
                    onClick={() => deleteNote(note.id)}
                    aria-label="حذف یادداشت"
                    className="p-2 rounded-lg text-[var(--dash-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors duration-150">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}