"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useEditor, EditorContent } from "@tiptap/react";
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
import {
  Newspaper,
  Plus,
  Image as ImageIcon,
  FileText,
  Calendar,
  Eye,
  Edit3,
  Trash2,
} from "lucide-react";

const mockPosts = [
  {
    id: 1,
    thumbnail: null,
    title: "۵ نکته طلایی برای یادگیری زبان انگلیسی",
    summary: "در این مقاله به بررسی بهترین روش‌های یادگیری زبان می‌پردازیم...",
    author: "رضا کمالی",
    createdAt: "۱۴۰۴/۰۴/۱۵",
    status: "منتشر شده",
  },
  {
    id: 2,
    thumbnail: null,
    title: "آموزش گرامر زمان حال ساده",
    summary: "یکی از پایه‌ای ترین مباحث گرامری زبان انگلیسی را در این پست بررسی می‌کنیم...",
    author: "رضا کمالی",
    createdAt: "۱۴۰۴/۰۴/۱۰",
    status: "پیش‌نویس",
  },
  {
    id: 3,
    thumbnail: null,
    title: "بهترین اپلیکیشن‌های یادگیری زبان در سال ۲۰۲۶",
    summary: "با پیشرفت تکنولوژی، اپلیکیشن‌های زیادی برای یادگیری زبان ساخته شده است...",
    author: "رضا کمالی",
    createdAt: "۱۴۰۴/۰۳/۲۸",
    status: "منتشر شده",
  },
];

const extensions = [
  Document,
  Paragraph,
  Text,
  Bold,
  Italic,
  Underline,
  Strike,
  Code,
  Heading.configure({ levels: [1, 2, 3] }),
  BulletList,
  OrderedList,
  ListItem,
];

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const buttons = [
    { key: "bold", label: "B", style: "font-bold", action: () => editor.chain().toggleBold().run(), isActive: () => editor.isActive("bold") },
    { key: "italic", label: "I", style: "italic", action: () => editor.chain().toggleItalic().run(), isActive: () => editor.isActive("italic") },
    { key: "underline", label: "U", style: "underline", action: () => editor.chain().toggleUnderline().run(), isActive: () => editor.isActive("underline") },
    { key: "strike", label: "S", style: "line-through", action: () => editor.chain().toggleStrike().run(), isActive: () => editor.isActive("strike") },
    { key: "code", label: "<>", style: "font-mono text-xs", action: () => editor.chain().toggleCode().run(), isActive: () => editor.isActive("code") },
  ];

  const headings = [
    { key: "h1", label: "H1", level: 1 as const },
    { key: "h2", label: "H2", level: 2 as const },
    { key: "h3", label: "H3", level: 3 as const },
  ];

  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-[var(--dash-muted)]/20 bg-[var(--dash-sides)]/50 flex-wrap">
      {buttons.map((btn) => (
        <button
          key={btn.key}
          onClick={btn.action}
          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${btn.style} ${
            btn.isActive()
              ? "bg-green-500/20 text-green-500"
              : "text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-bg)]"
          }`}>
          {btn.label}
        </button>
      ))}
      <div className="w-px h-6 bg-[var(--dash-muted)]/20 mx-1" />
      {headings.map((h) => (
        <button
          key={h.key}
          onClick={() => editor.chain().toggleHeading({ level: h.level }).run()}
          className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
            editor.isActive("heading", { level: h.level })
              ? "bg-green-500/20 text-green-500"
              : "text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-bg)]"
          }`}>
          {h.label}
        </button>
      ))}
      <div className="w-px h-6 bg-[var(--dash-muted)]/20 mx-1" />
      <button
        onClick={() => editor.chain().toggleBulletList().run()}
        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
          editor.isActive("bulletList")
            ? "bg-green-500/20 text-green-500"
            : "text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-bg)]"
        }`}>
        • List
      </button>
      <button
        onClick={() => editor.chain().toggleOrderedList().run()}
        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
          editor.isActive("orderedList")
            ? "bg-green-500/20 text-green-500"
            : "text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-bg)]"
        }`}>
        1. List
      </button>
    </div>
  );
}

export default function BlogPage() {
  const [tab, setTab] = useState<"create" | "list">("create");
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editorReady, setEditorReady] = useState(false);

  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    onUpdate: () => {
      // content is read on save via editor.getHTML()
    },
  });

  useEffect(() => {
    if (editor) setEditorReady(true);
  }, [editor]);

  const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setThumbnail(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !editor || !editor.getHTML().trim()) return;
    const html = editor.getHTML();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setTitle("");
    setThumbnail(null);
    editor.commands.clearContent();
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-green-500/20">
            <Newspaper className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--dash-text)]">
              مدیریت وبلاگ
            </h1>
            <p className="text-[var(--dash-muted)] text-sm mt-1">
              نوشتن و مدیریت پست‌های وبلاگ لینگوفم
            </p>
          </div>
        </div>
      </div>

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
          onClick={() => setTab("list")}
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
        <div className="bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                تصویر شاخص
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full h-48 sm:h-56 rounded-2xl border-2 border-dashed border-[var(--dash-muted)]/30 bg-[var(--dash-bg)] flex items-center justify-center cursor-pointer hover:border-green-500/50 transition-colors overflow-hidden">
                {thumbnail ? (
                  <Image
                    src={thumbnail}
                    alt="Thumbnail"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="h-10 w-10 text-[var(--dash-muted)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--dash-muted)]">
                      کلیک کنید تا تصویر آپلود کنید
                    </p>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                عنوان پست
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان پست وبلاگ را وارد کنید..."
                className="w-full bg-[var(--dash-bg)] text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm border border-[var(--dash-muted)]/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--dash-muted)] mb-2">
                محتوای پست
              </label>
              <div className="rounded-2xl border border-[var(--dash-muted)]/20 bg-[var(--dash-bg)] overflow-hidden focus-within:ring-2 focus-within:ring-green-500/50">
                {editorReady && <Toolbar editor={editor} />}
                <EditorContent
                  editor={editor}
                  className="min-h-[400px] prose prose-invert max-w-none px-4 py-3 [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror_p]:my-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={submitting || !title.trim() || !editor?.getHTML().trim()}
                className="px-8 py-3 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                {submitting ? "در حال انتشار..." : "انتشار پست"}
              </button>
              <button className="px-8 py-3 border border-[var(--dash-muted)]/30 text-[var(--dash-muted)] rounded-xl hover:bg-[var(--dash-bg)] transition-all">
                ذخیره به عنوان پیش‌نویس
              </button>
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
              {mockPosts.length} پست
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
                {mockPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-[var(--dash-muted)]/10 hover:bg-[var(--dash-bg)]/50 transition-colors">
                    <td className="py-4 px-3">
                      <div className="w-12 h-12 rounded-xl bg-[var(--dash-bg)] flex items-center justify-center overflow-hidden">
                        {post.thumbnail ? (
                          <Image src={post.thumbnail} alt="" width={48} height={48} className="object-cover" />
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
                        {post.createdAt}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          post.status === "منتشر شده"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}>
                        {post.status}
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
                        <button className="p-2 text-[var(--dash-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="حذف">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {mockPosts.length === 0 && (
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
