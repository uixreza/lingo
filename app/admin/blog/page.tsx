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
} from "lucide-react";

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
  thumbnail?: string | null;
  thumbnailUrl: string | null;
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
      ? "bg-green-500/20 text-green-500"
      : "text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-bg)]"
  }`;

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
    <div className="flex items-center gap-1 px-3 py-2 border-b border-[var(--dash-muted)]/20 bg-[var(--dash-sides)]/50 flex-wrap sticky top-0 z-10">
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-1">
          {gi > 0 && (
            <div className="w-px h-6 bg-[var(--dash-muted)]/20 mx-1.5" />
          )}
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

export default function BlogPage() {
  const [tab, setTab] = useState<"create" | "list">("create");
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [savedPost, setSavedPost] = useState(false);
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
        setError(data?.error ?? "خطا در آپلود تصویر");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
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
    setError(null);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: editor.getHTML(),
          thumbnailUrl: thumbnail,
          tags,
          status: asDraft ? "Draft" : "Published",
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "خطا در ذخیره پست");
        return;
      }
      setSavedPost(true);
      setTimeout(() => setSavedPost(false), 2500);
      setTitle("");
      setThumbnail(null);
      setTags([]);
      setTagInput("");
      editor.commands.clearContent();
      if (tab === "list") await loadPosts();
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-[var(--dash-bg)] rounded-xl p-1 border border-[var(--dash-muted)]/20 w-fit">
        <button
          onClick={() => setTab("create")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === "create"
              ? "bg-green-500 text-black shadow-lg"
              : "text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
          }`}>
          <Plus className="h-4 w-4 inline ml-1.5" />
          پست جدید
        </button>
        <button
          onClick={openList}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === "list"
              ? "bg-green-500 text-black shadow-lg"
              : "text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
          }`}>
          <FileText className="h-4 w-4 inline ml-1.5" />
          همه پست‌ها
        </button>
      </div>

      {tab === "create" ? (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Side: Meta (first on mobile, left column on desktop) */}
          <div className="lg:col-span-1 lg:order-2 bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-5 space-y-5">
            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                تصویر شاخص
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative h-40 rounded-2xl border-2 border-dashed border-[var(--dash-muted)]/30 bg-[var(--dash-bg)] flex items-center justify-center cursor-pointer hover:border-green-500/50 transition-colors overflow-hidden">
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
                    <ImageIcon className="h-9 w-9 text-[var(--dash-muted)] mx-auto mb-2" />
                    <p className="text-xs text-[var(--dash-muted)]">
                      {uploading
                        ? "در حال آپلود..."
                        : "کلیک کنید تا تصویر آپلود کنید"}
                    </p>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="h-8 w-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

            <div
              className="border-t"
              style={{ borderColor: "var(--dash-muted)" }}></div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                عنوان پست
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
                placeholder="عنوان پست وبلاگ را وارد کنید..."
                className="w-full bg-[var(--dash-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm border border-[var(--dash-muted)]/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
              <p
                className="mt-1.5 text-xs"
                style={{ color: "var(--dash-muted)" }}>
                {title.length}/۱۵۰
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                برچسب‌ها
              </label>
              <div className="flex items-center flex-wrap gap-2 border border-[var(--dash-muted)]/20 bg-[var(--dash-bg)] rounded-xl px-3 py-2 min-h-[48px]">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500 transition-colors"
                      aria-label={`حذف ${tag}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
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

            <div
              className="border-t"
              style={{ borderColor: "var(--dash-muted)" }}></div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => handleSave(false)}
                disabled={submitting || uploading || !title.trim()}
                className="w-full px-8 py-3 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                {submitting ? "در حال انتشار..." : "انتشار پست"}
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={submitting || uploading || !title.trim()}
                className="w-full px-8 py-3 border border-[var(--dash-muted)]/30 text-[var(--dash-muted)] rounded-xl hover:bg-[var(--dash-bg)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                ذخیره به عنوان پیش‌نویس
              </button>
              <p
                className={`text-center text-sm font-medium transition-opacity ${
                  savedPost ? "opacity-100 text-green-500" : "opacity-0"
                }`}>
                پست با موفقیت ذخیره شد
              </p>
              {error && (
                <p className="text-center text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Main: Editor */}
          <div className="lg:col-span-2 lg:order-1 bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="rounded-2xl border border-[var(--dash-muted)]/20 bg-[var(--dash-bg)] overflow-hidden relative focus-within:ring-2 focus-within:ring-green-500/50">
              {editor && (
                <>
                  <Toolbar editor={editor} />
                  <BubbleToolbar editor={editor} />
                </>
              )}
              <EditorContent
                editor={editor}
                className="prose prose-neutral dark:prose-invert max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[550px] [&_.ProseMirror]:px-6 [&_.ProseMirror]:py-4 [&_.ProseMirror]:text-[var(--dash-text)]"
              />
              <div
                className="flex items-center justify-between px-6 py-2.5 border-t border-[var(--dash-muted)]/20 text-xs"
                style={{ color: "var(--dash-muted)" }}>
                <span>{editorStats?.words ?? 0} کلمه</span>
                <span>{editorStats?.characters ?? 0} کاراکتر</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[var(--dash-text)]">
              همه پست‌ها
            </h2>
            <span className="text-sm text-[var(--dash-muted)]">
              {posts.length} پست
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--dash-muted)]/20">
                  <th className="text-right py-3 px-3 text-[var(--dash-muted)] font-medium">تصویر</th>
                  <th className="text-right py-3 px-3 text-[var(--dash-muted)] font-medium">عنوان</th>
                  <th className="text-right py-3 px-3 text-[var(--dash-muted)] font-medium hidden sm:table-cell">نویسنده</th>
                  <th className="text-right py-3 px-3 text-[var(--dash-muted)] font-medium hidden md:table-cell">تاریخ</th>
                  <th className="text-right py-3 px-3 text-[var(--dash-muted)] font-medium">وضعیت</th>
                  <th className="text-left py-3 px-3 text-[var(--dash-muted)] font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-[var(--dash-muted)]/10 hover:bg-[var(--dash-bg)]/50 transition-colors">
                    <td className="py-4 px-3">
                      <div className="w-12 h-12 rounded-xl bg-[var(--dash-bg)] flex items-center justify-center overflow-hidden">
                        {post.thumbnailUrl ? (
                          <Image src={post.thumbnailUrl} alt="" width={48} height={48} unoptimized className="object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-[var(--dash-muted)]" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <p className="font-medium text-[var(--dash-text)] truncate max-w-[200px]">
                        {post.title}
                      </p>
                    </td>
                    <td className="py-4 px-3 text-[var(--dash-muted)] hidden sm:table-cell">
                      {post.author}
                    </td>
                    <td className="py-4 px-3 text-[var(--dash-muted)] hidden md:table-cell">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {post.date}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          post.isPublished
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}>
                        {post.isPublished ? "منتشر شده" : "پیش‌نویس"}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button className="p-2 text-[var(--dash-muted)] hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-colors" title="مشاهده">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-[var(--dash-muted)] hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors" title="ویرایش">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-[var(--dash-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="حذف">
                          <Trash2 className="h-4 w-4" />
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
              <div className="h-8 w-8 border-2 border-[var(--dash-muted)]/30 border-t-green-500 rounded-full animate-spin mx-auto" />
            </div>
          )}

          {!loadingPosts && posts.length === 0 && (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-[var(--dash-muted)] mx-auto mb-3" />
              <p className="text-[var(--dash-muted)]">هنوز پستی نوشته نشده است</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}