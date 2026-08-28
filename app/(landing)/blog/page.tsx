"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Rss, Calendar, User, Tag, FileText } from "lucide-react";
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

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
      style={{ width: size, height: size }}>
      <User
        className="text-[#999]"
        style={{ width: size * 0.55, height: size * 0.55 }}
      />
    </span>
  );
}

function toPersianDigits(n: string) {
  return n.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

function formatDate(dateStr: string) {
  return toPersianDigits(dateStr.replaceAll("/", " / "));
}

async function loadPosts() {
  try {
    const res = await fetch("/api/blog");
    if (!res.ok) return [];
    return (await res.json()) as BlogPost[];
  } catch {
    return [];
  }
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadPosts().then((data) => {
      if (!cancelled) {
        setPosts(data);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-[#050505] overflow-hidden">
      <div className="absolute top-[-150px] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#22c55e]/10 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#4ade80]/8 blur-[140px] pointer-events-none" />

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-24">
        <motion.div
          variants={item}
          style={{ fontFamily: "'Morabba', 'Dana', sans-serif" }}
          className="mb-14 text-right">
          <p className="text-green-400 text-sm font-medium tracking-wide mb-3">
            وبلاگ لینگوفام
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            لینگوبلاگ
          </h1>
          <p className="mt-4 text-lg text-[#8a8a8a] leading-relaxed max-w-xl">
            جدیدترین آموزش‌ها و نکته‌های یادگیری زبان
          </p>
        </motion.div>

        {!loaded ? (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 border-2 border-green-500/30 border-t-green-400 rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            variants={item}
            className="flex flex-col items-center text-center py-24">
            <FileText className="h-12 w-12 text-[#555] mb-4" />
            <p className="text-[#888] text-lg">هنوز مقاله‌ای منتشر نشده است</p>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <motion.article
                  variants={item}
                  whileHover={{ y: -4 }}
                  className="group bg-[#0b0b0b] border border-white/5 hover:border-green-500/30 rounded-2xl overflow-hidden transition-colors cursor-pointer h-full">
                <div className="relative h-44 bg-[#111] overflow-hidden">
                  {post.thumbnailUrl ? (
                    <Image
                      src={post.thumbnailUrl}
                      alt={post.title}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500"
                      style={
                        post.thumbnailGradient
                          ? { background: post.thumbnailGradient }
                          : undefined
                      }>
                      <Rss className="h-10 w-10 text-white/40" />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-bold text-white leading-snug mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-[#888] leading-relaxed mb-4 line-clamp-2">
                    {post.summary}
                  </p>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[11px]">
                          <Tag className="h-3 w-3" />
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs text-[#666]">
                    <span className="flex items-center gap-2">
                      <AuthorAvatar
                        seed={post.authorAvatarSeed}
                        name={post.author}
                        size={30}
                      />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(post.date)}
                    </span>
                  </div>
                </div>
              </motion.article>
              </Link>
            ))}
          </motion.div>
        )}
      </motion.section>
    </main>
  );
}