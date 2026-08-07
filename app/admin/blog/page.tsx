"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  useEditor,
  EditorContent,
  useEditorState,
} from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import type { LucideIcon } from "lucide-react";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import History from "@tiptap/extension-history";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Plus,
  Image as ImageIcon,
  FileText,
  Calendar,
  Eye,
  Edit3,
  Trash2,
  X,
  Undo2,
  Redo2,
  Send,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough,
  Code as CodeIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  TextQuote,
  Code2,
  Link2,
  Unlink,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Minus,
  Eraser,
  RotateCw,
  PenSquare,
  Loader2,
  PencilRuler,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const extensions = [
  Document,
  Paragraph,
  Text,
  History,
  Bold,
  Italic,
  Underline,
  Strike,
  Code,
  Heading.configure({ levels: [1, 2, 3] }),
  BulletList,
  OrderedList,
  ListItem,
  Blockquote,
  CodeBlock,
  HorizontalRule,
  Link.configure({ openOnClick: false }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Placeholder.configure({
    placeholder: "مطلب خود را اینجا بنویسید...",
  }),
  CharacterCount,
];

type BlogPost = {
  id: number;
  slug: string;
  thumbnail?: string | null;
  thumbnailUrl: string | null;
  thumbnailGradient: string | null;
  title: string;
  summary: string;
  author: string;
  createdAt: string;
  date: string;
  status: "Draft" | "Published";
  isPublished: boolean;
  content: string;
  tags: string[];
};

const DARK_GRADIENTS = [
  "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
  "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
  "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  "linear-gradient(135deg, #232526 0%, #414345 100%)",
  "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
  "linear-gradient(135deg, #134e5e 0%, #71b28025 100%)",
  "linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)",
  "linear-gradient(135deg, #093028 0%, #237a57 100%)",
  "linear-gradient(135deg, #1f1c2c 0%, #5b4a35 100%)",
  "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
];

function randomGradient(): string {
  const i = Math.floor(Math.random() * DARK_GRADIENTS.length);
  return DARK_GRADIENTS[i];
}

function toFa(value: number | string): string {
  const digits = "۰۱۲۳۴۵۶۷۸۹";
  return String(value).replace(/[0-9]/g, (d) => digits[+d]);
}

type ToolItem = {
  key: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  isActive?: () => boolean;
  disabled?: boolean;
};

const toolButtonClass = (active: boolean) =>
  `p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
    active
      ? "bg-green-500/20 text-green-600 dark:text-green-400"
      : "text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-bg)]"
  }`;

const toolGroupDivider = "w-px h-6 bg-[var(--dash-muted)]/20 mx-1.5";

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(
      "آدرس لینک را وارد کنید",
      previousUrl ?? "https://",
    );
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  const groups: ToolItem[][] = [
    [
      {
        key: "undo",
        icon: Undo2,
        label: "واگرد",
        onClick: () => editor.chain().focus().undo().run(),
        disabled: !editor.can().chain().undo().run(),
      },
      {
        key: "redo",
        icon: Redo2,
        label: "بازگردانی",
        onClick: () => editor.chain().focus().redo().run(),
        disabled: !editor.can().chain().redo().run(),
      },
    ],
    [
      { key: "bold", icon: BoldIcon, label: "ضخیم", onClick: () => editor.chain().focus().toggleBold().run(), isActive: () => editor.isActive("bold") },
      { key: "italic", icon: ItalicIcon, label: "ایتالیک", onClick: () => editor.chain().focus().toggleItalic().run(), isActive: () => editor.isActive("italic") },
      { key: "underline", icon: UnderlineIcon, label: "زیرخط", onClick: () => editor.chain().focus().toggleUnderline().run(), isActive: () => editor.isActive("underline") },
      { key: "strike", icon: Strikethrough, label: "خط خورده", onClick: () => editor.chain().focus().toggleStrike().run(), isActive: () => editor.isActive("strike") },
      { key: "code", icon: CodeIcon, label: "کد", onClick: () => editor.chain().focus().toggleCode().run(), isActive: () => editor.isActive("code") },
    ],
    [
      { key: "h1", icon: Heading1, label: "عنوان ۱", onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => editor.isActive("heading", { level: 1 }) },
      { key: "h2", icon: Heading2, label: "عنوان ۲", onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor.isActive("heading", { level: 2 }) },
      { key: "h3", icon: Heading3, label: "عنوان ۳", onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => editor.isActive("heading", { level: 3 }) },
    ],
    [
      { key: "bullet", icon: List, label: "لیست نقطه‌ای", onClick: () => editor.chain().focus().toggleBulletList().run(), isActive: () => editor.isActive("bulletList") },
      { key: "ordered", icon: ListOrdered, label: "لیست شماره‌دار", onClick: () => editor.chain().focus().toggleOrderedList().run(), isActive: () => editor.isActive("orderedList") },
      { key: "quote", icon: TextQuote, label: "نقل‌قول", onClick: () => editor.chain().focus().toggleBlockquote().run(), isActive: () => editor.isActive("blockquote") },
      { key: "codeblock", icon: Code2, label: "بلوک کد", onClick: () => editor.chain().focus().toggleCodeBlock().run(), isActive: () => editor.isActive("codeBlock") },
    ],
    [
      {
        key: "link",
        icon: Link2,
        label: "لینک",
        onClick: setLink,
        isActive: () => editor.isActive("link"),
      },
      {
        key: "unlink",
        icon: Unlink,
        label: "حذف لینک",
        onClick: () => editor.chain().focus().extendMarkRange("link").unsetLink().run(),
        disabled: !editor.isActive("link"),
      },
    ],
    [
      { key: "align-right", icon: AlignRight, label: "چپ‌چین", onClick: () => editor.chain().focus().setTextAlign("right").run(), isActive: () => editor.isActive({ textAlign: "right" }) },
      { key: "align-center", icon: AlignCenter, label: "وسط‌چین", onClick: () => editor.chain().focus().setTextAlign("center").run(), isActive: () => editor.isActive({ textAlign: "center" }) },
      { key: "align-left", icon: AlignLeft, label: "راست‌چین", onClick: () => editor.chain().focus().setTextAlign("left").run(), isActive: () => editor.isActive({ textAlign: "left" }) },
    ],
    [
      {
        key: "hr",
        icon: Minus,
        label: "خط جداکننده",
        onClick: () => editor.chain().focus().setHorizontalRule().run(),
      },
      {
        key: "clear",
        icon: Eraser,
        label: "پاک‌سازی قالب",
        onClick: () =>
          editor.chain().focus().unsetAllMarks().clearNodes().run(),
      },
    ],
  ];

  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-[var(--dash-muted)]/20 bg-[var(--dash-sides)]/50 flex-wrap sticky top-0 z-10 backdrop-blur-xl">
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-1">
          {gi > 0 && <div className={toolGroupDivider} />}
          {group.map((tool) => (
            <button
              key={tool.key}
              onClick={tool.onClick}
              disabled={tool.disabled}
              title={tool.label}
              aria-label={tool.label}
              className={toolButtonClass(tool.isActive?.() ?? false)}>
              <tool.icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function BubbleToolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(
      "آدرس لینک را وارد کنید",
      previousUrl ?? "https://",
    );
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  const items: ToolItem[] = [
    { key: "bold", icon: BoldIcon, label: "ضخیم", onClick: () => editor.chain().focus().toggleBold().run(), isActive: () => editor.isActive("bold") },
    { key: "italic", icon: ItalicIcon, label: "ایتالیک", onClick: () => editor.chain().focus().toggleItalic().run(), isActive: () => editor.isActive("italic") },
    { key: "underline", icon: UnderlineIcon, label: "زیرخط", onClick: () => editor.chain().focus().toggleUnderline().run(), isActive: () => editor.isActive("underline") },
    { key: "strike", icon: Strikethrough, label: "خط خورده", onClick: () => editor.chain().focus().toggleStrike().run(), isActive: () => editor.isActive("strike") },
    { key: "code", icon: CodeIcon, label: "کد", onClick: () => editor.chain().focus().toggleCode().run(), isActive: () => editor.isActive("code") },
    { key: "link", icon: Link2, label: "لینک", onClick: setLink, isActive: () => editor.isActive("link") },
  ];

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top" }}
      className="flex items-center gap-0.5 rounded-xl border border-[var(--dash-muted)]/20 bg-[var(--dash-sides)] p-1 shadow-2xl">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={item.onClick}
          title={item.label}
          aria-label={item.label}
          className={toolButtonClass(item.isActive?.() ?? false)}>
          <item.icon className="h-4 w-4" />
        </button>
      ))}
    </BubbleMenu>
  );
}

const tabVariants = {
  initial: { opacity: 0, y: 16, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.99 },
};

function EditPostModal({
  post,
  onClose,
  onSaved,
}: {
  post: BlogPost;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(post.title);
  const [thumbnail, setThumbnail] = useState<string | null>(post.thumbnailUrl);
  const [gradient, setGradient] = useState<string | null>(
    post.thumbnailGradient,
  );
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState<string[]>(post.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [savingAs, setSavingAs] = useState<"draft" | "publish" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions,
    content: post.content ?? "",
    immediatelyRender: false,
  });

  const handleThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/blog/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.url) {
        setThumbnail(data.url);
      } else {
        toast.error(data?.error ?? "خطا در آپلود تصویر");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setUploading(false);
    }
    e.target.value = "";
  };

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, "");
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSave = async (asDraft: boolean) => {
    if (!title.trim() || !editor || !editor.getHTML().trim()) return;
    setSubmitting(true);
    setSavingAs(asDraft ? "draft" : "publish");
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: editor.getHTML(),
          thumbnailUrl: thumbnail,
          thumbnailGradient: gradient,
          tags,
          status: asDraft ? "Draft" : "Published",
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error ?? "خطا در ذخیره پست");
        return;
      }
      toast.success(
        asDraft ? "پیش‌نویس به‌روزرسانی شد" : "پست با موفقیت به‌روزرسانی شد",
      );
      onSaved();
      onClose();
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSubmitting(false);
      setSavingAs(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="relative w-full max-w-4xl max-h-[92dvh] overflow-hidden rounded-3xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--dash-muted)]/10 bg-[var(--dash-accent)]/10">
          <span className="inline-flex items-center gap-2 text-base font-bold text-[var(--dash-accent)]">
            <PenSquare className="h-5 w-5" />
            ویرایش پست
          </span>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--hover-bg)] text-[var(--dash-muted)]">
              {post.isPublished ? "منتشر شده" : "پیش‌نویس"}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--hover-bg)] transition-all"
              aria-label="بستن">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* Meta */}
            <div className="lg:col-span-1 space-y-5">
              {/* Thumbnail */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--dash-text)] mb-2">
                  <ImageIcon className="h-4 w-4 text-[var(--dash-accent)]" />
                  تصویر شاخص
                </label>
                <div
                  className="relative h-12 rounded-xl mb-3 overflow-hidden border border-[var(--dash-muted)]/15"
                  style={{ background: gradient ?? "var(--dash-bg)" }}>
                  <div className="absolute inset-0 bg-black/25" />
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <span className="text-[11px] font-medium text-white/80">
                      {gradient ? "گرادیان انتخاب شد" : "گرادیان تصادفی انتخاب کنید"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGradient(randomGradient())}
                      title="تولید گرادیان تصادفی"
                      aria-label="تولید گرادیان تصادفی"
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all hover:rotate-180 duration-300">
                      <RotateCw className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-36 rounded-2xl bg-[var(--dash-bg)]/70 border border-dashed border-[var(--dash-muted)]/25 hover:border-[var(--dash-accent)]/50 hover:bg-[var(--dash-bg)] flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300">
                  {thumbnail ? (
                    <Image
                      src={thumbnail}
                      alt="Thumbnail"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center px-4">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--hover-bg)] flex items-center justify-center mx-auto mb-2">
                        <ImageIcon className="h-6 w-6 text-[var(--dash-muted)]" />
                      </div>
                      <p className="text-xs text-[var(--dash-muted)]">
                        {uploading ? "در حال آپلود..." : "کلیک کنید تا تصویر آپلود کنید"}
                      </p>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnail}
                  className="hidden"
                />
                {thumbnail && (
                  <button
                    onClick={() => setThumbnail(null)}
                    className="mt-3 text-xs text-red-400 hover:text-red-500 transition-colors">
                    حذف تصویر
                  </button>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-[var(--dash-text)] mb-2">
                  عنوان پست
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={150}
                  placeholder="عنوان پست وبلاگ را وارد کنید..."
                  className="w-full bg-[var(--dash-bg)]/70 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm outline-none border border-[var(--dash-muted)]/15 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] transition-all placeholder:text-[var(--dash-muted)]/60"
                />
                <p
                  className="mt-1.5 text-xs tabular-nums"
                  style={{ color: "var(--dash-muted)" }}>
                  {toFa(title.length)} / ۱۵۰
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--dash-text)] mb-2">
                  <Tag className="h-4 w-4 text-[var(--dash-accent)]" />
                  برچسب‌ها
                </label>
                <div className="flex items-center flex-wrap gap-2 border border-[var(--dash-muted)]/15 bg-[var(--dash-bg)]/70 rounded-xl px-3 py-2 min-h-[48px] transition-all focus-within:shadow-[0_0_0_4px_rgba(34,197,94,0.22)]">
                  {tags.map((tag) => (
                    <motion.span
                      key={tag}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-500 transition-colors"
                        aria-label={`حذف ${tag}`}>
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      } else if (
                        e.key === "Backspace" &&
                        tagInput === "" &&
                        tags.length > 0
                      ) {
                        removeTag(tags[tags.length - 1]);
                      }
                    }}
                    placeholder={
                      tags.length === 0 ? "تگ اضافه کنید و Enter بزنید..." : ""
                    }
                    className="flex-1 min-w-[110px] bg-transparent outline-none text-sm text-[var(--dash-text)] placeholder:text-[var(--dash-muted)]"
                  />
                </div>
              </div>
            </div>

            {/* Editor */}
            <div className="lg:col-span-2 rounded-2xl border border-[var(--dash-muted)]/20 bg-[var(--dash-bg)] overflow-hidden relative focus-within:ring-2 focus-within:ring-green-500/30">
              {editor && (
                <>
                  <Toolbar editor={editor} />
                  <BubbleToolbar editor={editor} />
                </>
              )}
              <EditorContent
                editor={editor}
                className="prose prose-neutral dark:prose-invert max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:px-6 [&_.ProseMirror]:py-4 [&_.ProseMirror]:text-[var(--dash-text)]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 px-6 py-4 border-t border-[var(--dash-muted)]/10">
          <motion.button
            whileHover={submitting || !title.trim() ? {} : { scale: 1.01 }}
            whileTap={submitting ? {} : { scale: 0.99 }}
            onClick={() => handleSave(false)}
            disabled={submitting || !title.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
            {submitting && savingAs === "publish" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                ذخیره و انتشار
              </>
            )}
          </motion.button>
          <button
            onClick={() => handleSave(true)}
            disabled={submitting || !title.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-3 border border-[var(--dash-muted)]/30 text-[var(--dash-muted)] rounded-xl hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium">
            {submitting && savingAs === "draft" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <PencilRuler className="h-4 w-4" />
                ذخیره به عنوان پیش‌نویس
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-8 py-3 rounded-xl border border-[var(--dash-muted)]/30 text-[var(--dash-muted)] hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)] transition-all duration-300 disabled:opacity-50 font-medium">
            انصراف
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}


type Tab = "create" | "list";

export default function BlogPage() {
  const [tab, setTab] = useState<Tab>("create");
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [gradient, setGradient] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<BlogPost | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions,
    immediatelyRender: false,
  });

  const editorStats = useEditorState({
    editor,
    selector: ({ editor }) => ({
      words: editor?.storage.characterCount?.words?.() ?? 0,
      characters: editor?.storage.characterCount?.characters?.() ?? 0,
    }),
  });

  async function loadPosts() {
    setLoadingPosts(true);
    try {
      const res = await fetch("/api/admin/blog", { cache: "no-store" });
      if (res.ok) {
        const data: BlogPost[] = await res.json();
        setPosts(data);
      }
    } catch {
      // silent
    } finally {
      setLoadingPosts(false);
    }
  }

  function openList() {
    setTab("list");
    void loadPosts();
  }

  const resetCreate = () => {
    setTitle("");
    setThumbnail(null);
    setGradient(null);
    setTags([]);
    setTagInput("");
    editor?.commands.clearContent();
  };

  const handleThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/blog/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.url) {
        setThumbnail(data.url);
      } else {
        toast.error(data?.error ?? "خطا در آپلود تصویر");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setUploading(false);
    }
    e.target.value = "";
  };

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, "");
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSave = async (asDraft: boolean) => {
    if (!title.trim() || !editor || !editor.getHTML().trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: editor.getHTML(),
          thumbnailUrl: thumbnail,
          thumbnailGradient: gradient,
          tags,
          status: asDraft ? "Draft" : "Published",
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error ?? "خطا در ذخیره پست");
        return;
      }
      toast.success(
        asDraft ? "پیش‌نویس ذخیره شد" : "پست با موفقیت منتشر شد",
      );
      setTitle("");
      setThumbnail(null);
      setGradient(null);
      setTags([]);
      setTagInput("");
      editor.commands.clearContent();
      if (tab === "list") await loadPosts();
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (post: BlogPost) => {
    setPublishingId(post.id);
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Published" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error ?? "خطا در انتشار پست");
        return;
      }
      toast.success("پست با موفقیت منتشر شد");
      await loadPosts();
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setPublishingId(null);
    }
  };

  const handleView = (post: BlogPost) => {
    window.open(`/blog?post=${post.slug}`, "_blank");
  };

  const handleEdit = (post: BlogPost) => {
    setEditPost(post);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("پست حذف شد");
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "خطا در حذف پست");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Toggle */}
      <div className="w-full flex justify-center sm:w-auto sm:justify-start">
        <div className="relative w-full sm:w-auto inline-flex p-1.5 rounded-2xl bg-[var(--dash-sides)]/80 backdrop-blur-xl border border-[var(--dash-muted)]/15 dark:border-white/20 shadow-lg">
          {(["create", "list"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                if (t === "create") {
                  setTab("create");
                  resetCreate();
                } else {
                  openList();
                }
              }}
              className={`relative z-10 flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 sm:px-10 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                tab === t
                  ? "text-white"
                  : "text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
              }`}>
              {tab === t && (
                <motion.span
                  layoutId="blog-tab-pill"
                  className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] shadow-lg shadow-[var(--dark-purple)]/30"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              {t === "create" ? (
                <Plus className="h-4 w-4 relative z-10" />
              ) : (
                <FileText className="h-4 w-4 relative z-10" />
              )}
              <span className="relative z-10">
                {t === "create" ? "پست جدید" : "همه پست‌ها"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === "create" ? (
          <motion.div
            key="create"
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="grid lg:grid-cols-3 gap-6 items-start">
            {/* Side: Meta (first on mobile, left column on desktop) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="lg:col-span-1 lg:order-2 relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg p-5 space-y-5">
              <div className="pointer-events-none absolute -top-24 -right-10 h-48 w-48 rounded-full bg-[var(--dash-accent)]/15 blur-3xl" />
              {/* Thumbnail */}
              <div className="relative">
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--dash-text)] mb-2">
                  <ImageIcon className="h-4 w-4 text-[var(--dash-accent)]" />
                  تصویر شاخص
                </label>

                <div
                  className="relative h-12 rounded-xl mb-3 overflow-hidden border border-[var(--dash-muted)]/15"
                  style={{
                    background: gradient ?? "var(--dash-bg)",
                  }}>
                  <div className="absolute inset-0 bg-black/25" />
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <span className="text-[11px] font-medium text-white/80">
                      {gradient ? "گرادیان انتخاب شد" : "گرادیان تصادفی انتخاب کنید"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGradient(randomGradient())}
                      title="تولید گرادیان تصادفی"
                      aria-label="تولید گرادیان تصادفی"
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all hover:rotate-180 duration-300">
                      <RotateCw className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-40 rounded-2xl bg-[var(--dash-bg)]/70 border border-dashed border-[var(--dash-muted)]/25 hover:border-[var(--dash-accent)]/50 hover:bg-[var(--dash-bg)] flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300">
                  {thumbnail ? (
                    <Image
                      src={thumbnail}
                      alt="Thumbnail"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center px-4">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--hover-bg)] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <ImageIcon className="h-6 w-6 text-[var(--dash-muted)]" />
                      </div>
                      <p className="text-xs text-[var(--dash-muted)]">
                        {uploading
                          ? "در حال آپلود..."
                          : "کلیک کنید تا تصویر آپلود کنید"}
                      </p>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnail}
                  className="hidden"
                />
                {thumbnail && (
                  <button
                    onClick={() => setThumbnail(null)}
                    className="mt-3 text-xs text-red-400 hover:text-red-500 transition-colors">
                    حذف تصویر
                  </button>
                )}
              </div>

              {/* Title */}
              <div className="relative">
                <label className="block text-sm font-semibold text-[var(--dash-text)] mb-2">
                  عنوان پست
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={150}
                  placeholder="عنوان پست وبلاگ را وارد کنید..."
                  className="w-full bg-[var(--dash-bg)]/70 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm outline-none border border-[var(--dash-muted)]/15 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] transition-all placeholder:text-[var(--dash-muted)]/60"
                />
                <p
                  className="mt-1.5 text-xs tabular-nums"
                  style={{ color: "var(--dash-muted)" }}>
                  {toFa(title.length)} / ۱۵۰
                </p>
              </div>

              {/* Tags */}
              <div className="relative">
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--dash-text)] mb-2">
                  <Tag className="h-4 w-4 text-[var(--dash-accent)]" />
                  برچسب‌ها
                </label>
                <div className="flex items-center flex-wrap gap-2 border border-[var(--dash-muted)]/15 bg-[var(--dash-bg)]/70 rounded-xl px-3 py-2 min-h-[48px] transition-all focus-within:shadow-[0_0_0_4px_rgba(34,197,94,0.22)]">
                  {tags.map((tag) => (
                    <motion.span
                      key={tag}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-500 transition-colors"
                        aria-label={`حذف ${tag}`}>
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
                        removeTag(tags[tags.length - 1]);
                      }
                    }}
                    placeholder={
                      tags.length === 0 ? "تگ اضافه کنید و Enter بزنید..." : ""
                    }
                    className="flex-1 min-w-[110px] bg-transparent outline-none text-sm text-[var(--dash-text)] placeholder:text-[var(--dash-muted)]"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="relative space-y-3">
                <motion.button
                  whileHover={
                    submitting || uploading || !title.trim() ? {} : { scale: 1.01 }
                  }
                  whileTap={submitting || uploading ? {} : { scale: 0.99 }}
                  onClick={() => handleSave(false)}
                  disabled={submitting || uploading || !title.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      در حال انتشار...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      انتشار پست
                    </>
                  )}
                </motion.button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={submitting || uploading || !title.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 border border-[var(--dash-muted)]/30 text-[var(--dash-muted)] rounded-xl hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium">
                  <PencilRuler className="h-4 w-4" />
                  ذخیره به عنوان پیش‌نویس
                </button>
              </div>
            </motion.div>

            {/* Main: Editor */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.35 }}
              className="lg:col-span-2 lg:order-1 relative overflow-hidden rounded-2xl shadow-lg border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl">
              <div className="rounded-2xl border border-[var(--dash-muted)]/20 bg-[var(--dash-bg)] overflow-hidden relative focus-within:ring-2 focus-within:ring-green-500/30">
                {editor && (
                  <>
                    <Toolbar editor={editor} />
                    <BubbleToolbar editor={editor} />
                  </>
                )}
                <EditorContent
                  editor={editor}
                  className="prose prose-neutral dark:prose-invert max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[520px] [&_.ProseMirror]:px-6 [&_.ProseMirror]:py-4 [&_.ProseMirror]:text-[var(--dash-text)]"
                />
                <div
                  className="flex items-center justify-between px-6 py-2.5 border-t border-[var(--dash-muted)]/20 text-xs tabular-nums"
                  style={{ color: "var(--dash-muted)" }}>
                  <span className="flex items-center gap-1.5">
                    <PenSquare className="h-3.5 w-3.5" />
                    {toFa(editorStats?.words ?? 0)} کلمه
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    {toFa(editorStats?.characters ?? 0)} کاراکتر
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative overflow-hidden rounded-2xl shadow-lg border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl">
            <div className="pointer-events-none absolute -top-24 -left-10 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="relative flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-500/10">
                  <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <h2 className="text-lg font-bold text-[var(--dash-text)]">
                  همه پست‌ها
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--hover-bg)] text-[var(--dash-muted)] tabular-nums">
                {toFa(posts.length)} پست
              </span>
            </div>

            <div className="relative overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--dash-muted)]/20">
                    <th className="text-right py-3 px-4 text-[var(--dash-muted)] font-medium">تصویر</th>
                    <th className="text-right py-3 px-4 text-[var(--dash-muted)] font-medium">عنوان</th>
                    <th className="text-right py-3 px-4 text-[var(--dash-muted)] font-medium hidden sm:table-cell">نویسنده</th>
                    <th className="text-right py-3 px-4 text-[var(--dash-muted)] font-medium hidden md:table-cell">تاریخ</th>
                    <th className="text-right py-3 px-4 text-[var(--dash-muted)] font-medium">وضعیت</th>
                    <th className="text-left py-3 px-4 text-[var(--dash-muted)] font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr
                      key={post.id}
                      className="border-b border-[var(--dash-muted)]/10 transition-colors duration-300 hover:bg-[var(--dash-bg)]/50">
                      <td className="py-4 px-4">
                        <div
                          className="w-12 h-12 rounded-xl bg-[var(--dash-bg)] flex items-center justify-center overflow-hidden border border-[var(--dash-muted)]/10"
                          style={
                            !post.thumbnailUrl && post.thumbnailGradient
                              ? { background: post.thumbnailGradient }
                              : undefined
                          }>
                          {post.thumbnailUrl ? (
                            <Image src={post.thumbnailUrl} alt="" width={48} height={48} unoptimized className="object-cover" />
                          ) : post.thumbnailGradient ? (
                            <ImageIcon className="h-5 w-5 text-white/70" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-[var(--dash-muted)]" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-[var(--dash-text)] truncate max-w-[200px]">
                          {post.title}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-[var(--dash-muted)] hidden sm:table-cell">
                        {post.author}
                      </td>
                      <td className="py-4 px-4 text-[var(--dash-muted)] hidden md:table-cell">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {post.date}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            post.isPublished
                              ? "bg-green-500/10 text-green-600 dark:text-green-400"
                              : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                          }`}>
                          {post.isPublished ? "منتشر شده" : "پیش‌نویس"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 justify-end">
                          {post.isPublished && (
                            <button
                              onClick={() => handleView(post)}
                              className="p-2 text-[var(--dash-muted)] hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-all hover:scale-105"
                              title="مشاهده">
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(post)}
                            className="p-2 text-[var(--dash-muted)] hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all hover:scale-105"
                            title="ویرایش">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          {!post.isPublished && (
                            <button
                              onClick={() => handlePublish(post)}
                              disabled={publishingId === post.id}
                              className="p-2 text-[var(--dash-muted)] hover:text-green-600 hover:bg-green-500/10 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                              title="انتشار">
                              {publishingId === post.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmDelete(post)}
                            disabled={deletingId === post.id}
                            className="p-2 text-[var(--dash-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                            title="حذف">
                            {deletingId === post.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loadingPosts && (
              <div className="text-center py-16">
                <Loader2 className="h-8 w-8 text-green-500 animate-spin mx-auto" />
              </div>
            )}

            {!loadingPosts && posts.length === 0 && (
              <div className="text-center py-16">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-[var(--hover-bg)] flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-[var(--dash-muted)]" />
                </div>
                <p className="text-[var(--dash-muted)]">
                  هنوز پستی نوشته نشده است
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="relative w-full max-w-sm rounded-2xl border border-red-500/20 bg-[var(--dash-sides)] p-6 shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--dash-text)] text-center mb-2">
                حذف پست
              </h3>
              <p className="text-sm text-[var(--dash-muted)] text-center leading-relaxed mb-6">
                مطمئن هستید که این پست حذف شود؟ این عملیات قابل بازگشت نیست.
              </p>
              <p className="text-sm font-medium text-[var(--dash-text)] text-center mb-6 break-words">
                «{confirmDelete.title}»
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  disabled={deletingId === confirmDelete.id}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--dash-muted)]/30 text-[var(--dash-muted)] hover:bg-[var(--dash-bg)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  انصراف
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete.id)}
                  disabled={deletingId === confirmDelete.id}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-l from-red-500 to-rose-500 text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-wait shadow-lg shadow-red-500/25 hover:shadow-red-500/40">
                  {deletingId === confirmDelete.id ? "در حال حذف..." : "حذف"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Post Modal */}
      <AnimatePresence>
        {editPost && (
          <EditPostModal
            post={editPost}
            onClose={() => setEditPost(null)}
            onSaved={() => void loadPosts()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}