"use client";

import { useState, useSyncExternalStore } from "react";
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

const timeAgo = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "همین حالا";
  if (minutes < 60) return `${minutes} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ساعت پیش`;
  const days = Math.floor(hours / 24);
  return `${days} روز پیش`;
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-1.5 rounded-full bg-green-500" />
          <div>
            <h1 className="text-xl font-bold text-[var(--dash-text)]">
              دفترچه
            </h1>
            <p className="text-xs text-[var(--dash-muted)] mt-1">
              {notes.length} یادداشت
            </p>
          </div>
        </div>
        <button
          onClick={addNote}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold shadow-lg shadow-green-500/25 hover:bg-green-400 transition-all duration-200">
          <Plus className="h-4 w-4" />
          یادداشت جدید
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-[var(--dash-sides)]/80 ring-1 ring-white/5 shadow-2xl px-6 py-16 text-center min-h-[320px]">
          <NotebookText className="h-14 w-14 text-[var(--dash-muted)]" />
          <div>
            <p className="text-lg font-bold text-[var(--dash-text)]">
              دفترچه‌تان خالی است
            </p>
            <p className="text-sm text-[var(--dash-muted)] mt-2 leading-6">
              یادداشت‌ها در همین مرورگر ذخیره می‌شوند.
            </p>
          </div>
          <button
            onClick={addNote}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold shadow-lg shadow-green-500/25 hover:bg-green-400 transition-all duration-200">
            <Plus className="h-4 w-4" />
            اولین یادداشت را بنویسید
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex flex-col gap-3 rounded-2xl bg-[var(--dash-sides)]/80 ring-1 ring-white/5 shadow-xl p-4 transition-shadow duration-200 hover:ring-[var(--light-purple)]/40">
              <textarea
                value={note.text}
                autoFocus={note.id === focusedId}
                onChange={(e) => updateNote(note.id, e.target.value)}
                onFocus={() => setFocusedId(note.id)}
                placeholder="یادداشت بنویسید…"
                rows={Math.max(3, Math.min(14, note.text.split("\n").length))}
                className="w-full flex-1 resize-none bg-transparent text-[var(--dash-text)] placeholder:text-[var(--dash-muted)] text-sm leading-7 outline-none"
              />
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[11px] text-[var(--dash-muted)]">
                  {timeAgo(note.updatedAt)}
                </span>
                <button
                  onClick={() => deleteNote(note.id)}
                  aria-label="حذف یادداشت"
                  className="p-2 rounded-lg text-[var(--dash-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors duration-150">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}