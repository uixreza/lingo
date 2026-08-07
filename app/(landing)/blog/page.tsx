"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Rss, Calendar, User, Tag, FileText, X } from "lucide-react";
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

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    setMatches(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
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

function PostModal({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  const words = post.content.replace(/<[^>]*>/g, "").trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <button
        onClick={onClose}
        aria-label="بستن"
        className="absolute top-4 end-4 z-20 p-2.5 rounded-full bg-black/50 border border-white/10 text-white hover:bg-black/70 hover:scale-105 transition-all duration-200">
        <X className="h-4 w-4" />
      </button>
      <motion.div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        initial={
          isMobile
            ? { y: "100%", opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.96, y: 24 }
        }
        animate={isMobile ? { y: 0, opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={
          isMobile
            ? { y: "100%", opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.96, y: 24 }
        }
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`relative bg-[#0b0b0b] border-white/10 shadow-2xl overflow-hidden ${
          isMobile
            ? "w-full max-h-[88vh] overflow-y-auto rounded-t-3xl border-t"
            : "w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border my-8"
        }`}>
        <div className="w-10 h-1 rounded-full bg-white/15 mx-auto mt-3 sm:hidden" />

        {post.thumbnailUrl ? (
          <div className="relative h-52 sm:h-72">
            <Image
              src={post.thumbnailUrl}
              alt={post.title}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, 768px"
              className="object-cover"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1.5">
              <AuthorAvatar
                seed={post.authorAvatarSeed}
                name={post.author}
                size={30}
              />
              <span className="text-xs font-medium text-white whitespace-nowrap">
                {post.author}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-6 pt-6">
            <AuthorAvatar
              seed={post.authorAvatarSeed}
              name={post.author}
              size={34}
            />
            <span className="text-sm font-medium text-white">
              {post.author}
            </span>
          </div>
        )}

        <div className="p-6 sm:p-8">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
                  <Tag className="h-3 w-3" />
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug tracking-tight">
            {post.title}
          </h2>

          <div className="flex items-center gap-5 mt-4 text-sm text-[#666] flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(post.date)}
            </span>
            <span>{minutes.toLocaleString("fa-IR")} دقیقه مطالعه</span>
          </div>

          <div
            className="blog-post ProseMirror prose prose-invert max-w-none mt-6 text-right [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<BlogPost | null>(null);

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
        <motion.div variants={item} className="mb-14 text-right">
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
              <motion.article
                key={post.id}
                variants={item}
                whileHover={{ y: -4 }}
                onClick={() => setSelected(post)}
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
                    <div className="w-full h-full flex items-center justify-center">
                      <Rss className="h-10 w-10 text-green-500/30" />
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
            ))}
          </motion.div>
        )}
      </motion.section>

      <AnimatePresence>
        {selected && (
          <PostModal
            key={selected.id}
            post={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}