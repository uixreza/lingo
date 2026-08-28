"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Tag, ArrowRight, Loader2 } from "lucide-react";

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  thumbnailGradient: string | null;
  tags: string[];
  summary: string;
  content: string;
  date: string;
  author: string;
  authorAvatarSeed: string | null;
};

function AuthorAvatar({
  seed,
  name,
  size,
  className = "",
}: {
  seed?: string | null;
  name: string;
  size: number;
  className?: string;
}) {
  return seed ? (
    <img
      src={`https://api.dicebear.com/10.x/notionists/svg?seed=${encodeURIComponent(seed)}`}
      alt={name}
      width={size}
      height={size}
      className={`rounded-lg object-cover shrink-0 bg-[#333] ${className}`}
    />
  ) : (
    <span
      className={`rounded-lg bg-[#333] flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

function toPersianDigits(n: string) {
  return n.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

function formatDate(dateStr: string) {
  const parts = dateStr.split("/");
  return toPersianDigits(`${parts[2]} / ${parts[1]} / ${parts[0]}`);
}

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [slug, setSlug] = useState("");

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetch(`/api/blog/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setPost(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="relative min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-green-400 animate-spin" />
      </main>
    );
  }

  if (notFound || !post) {
    return (
      <main className="relative min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <p className="text-[#888] text-lg">مقاله یافت نشد</p>
        <Link
          href="/blog"
          className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1 transition-colors">
          <ArrowRight className="h-4 w-4" />
          بازگشت به وبلاگ
        </Link>
      </main>
    );
  }

  const words = post.content.replace(/<[^>]*>/g, "").trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));

  return (
    <main className="relative min-h-screen bg-[#050505] overflow-hidden">
      <div className="absolute top-[-150px] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#22c55e]/10 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#4ade80]/8 blur-[140px] pointer-events-none" />

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 pb-24">
        {/* Hero image with blur overlay and info */}
        <div className="relative w-full h-72 sm:h-[28rem]">
          {post.thumbnailUrl ? (
            <Image
              src={post.thumbnailUrl}
              alt={post.title}
              fill
              unoptimized
              sizes="100vw"
              className="object-cover"
            />
          ) : post.thumbnailGradient ? (
            <div className="absolute inset-0" style={{ background: post.thumbnailGradient }} />
          ) : (
            <div className="absolute inset-0 bg-[#111]" />
          )}

          {/* Blur gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
          <div className="absolute inset-0 backdrop-blur-[2px]" />

          {/* Back button - top right */}
          <Link
            href="/blog"
            className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 text-sm text-[#aaa] hover:text-green-400 transition-colors bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
            <ArrowRight className="h-4 w-4" />
            بازگشت به وبلاگ
          </Link>

          {/* Content on top of image */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-10">
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 text-xs backdrop-blur-sm">
                    <Tag className="h-3 w-3" />
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-snug tracking-tight">
              {post.title}
            </h1>

            <div className="flex items-center justify-center gap-5 mt-4 text-sm text-[#ccc] flex-wrap">
              <span className="flex items-center gap-2">
                <AuthorAvatar
                  seed={post.authorAvatarSeed}
                  name={post.author}
                  size={28}
                />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(post.date)}
              </span>
              <span>{minutes.toLocaleString("fa-IR")} دقیقه مطالعه</span>
            </div>
          </div>
        </div>

        {/* Post content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-10">
          <div className="border-t border-white/10 pt-8">
            <div
              className="blog-post ProseMirror prose prose-invert max-w-none text-right [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </div>
      </motion.article>
    </main>
  );
}
