"use client";

import { useEffect } from "react";
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
  PenSquare,
  FileText,
} from "lucide-react";

type ToolItem = {
  key: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  isActive?: () => boolean;
  disabled?: boolean;
};

const toolButtonClass = (active: boolean) =>
  `p-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
    active
      ? "bg-green-500/20 text-green-600 dark:text-green-400"
      : "text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-bg)]"
  }`;

const toolGroupDivider = "w-px h-5 bg-[var(--dash-muted)]/20 mx-1";

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
    <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[var(--dash-muted)]/20 bg-[var(--dash-sides)]/50 backdrop-blur-xl sticky top-0 z-10">
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

function toFa(value: number | string): string {
  const digits = "۰۱۲۳۴۵۶۷۸۹";
  return String(value).replace(/[0-9]/g, (d) => digits[+d]);
}

const buildExtensions = (placeholder: string) => [
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
  Placeholder.configure({ placeholder }),
  CharacterCount,
];

export default function RichTextEditor({
  initialContent,
  onChange,
  onFocus,
  autoFocus = false,
  placeholder = "مطلب خود را اینجا بنویسید...",
  minHeight = "140px",
}: {
  initialContent: string;
  onChange: (html: string) => void;
  onFocus?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  minHeight?: string;
}) {
  const editor = useEditor({
    extensions: buildExtensions(placeholder),
    content: initialContent,
    immediatelyRender: false,
    autofocus: autoFocus ? "end" : false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onFocus: () => onFocus?.(),
  });

  const stats = useEditorState({
    editor,
    selector: ({ editor }) => ({
      words: editor?.storage.characterCount?.words?.() ?? 0,
      characters: editor?.storage.characterCount?.characters?.() ?? 0,
    }),
  });

  useEffect(() => {
    if (!editor) return;
    const normalize = (html: string) =>
      html.replace(/<p>\s*<\/p>/g, "").trim();
    if (!editor.isFocused && normalize(editor.getHTML()) !== normalize(initialContent)) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
  }, [initialContent, editor]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--dash-muted)]/20 bg-[var(--dash-bg)] focus-within:ring-2 focus-within:ring-green-500/30">
      {editor && (
        <>
          <Toolbar editor={editor} />
          <BubbleToolbar editor={editor} />
        </>
      )}
      <EditorContent
        editor={editor}
        className="prose prose-neutral dark:prose-invert max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-3 [&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:text-sm [&_.ProseMirror]:leading-7 [&_.ProseMirror]:text-[var(--dash-text)]"
        style={{ minHeight }}
      />
      <div
        className="flex items-center justify-between px-4 py-2 border-t border-[var(--dash-muted)]/20 text-[11px] tabular-nums"
        style={{ color: "var(--dash-muted)" }}>
        <span className="flex items-center gap-1.5">
          <PenSquare className="h-3.5 w-3.5" />
          {toFa(stats?.words ?? 0)} کلمه
        </span>
        <span className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          {toFa(stats?.characters ?? 0)} کاراکتر
        </span>
      </div>
    </div>
  );
}