"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Tag } from "lucide-react";
import BlogTopBar from "./blog/BlogTopBar";
import BlogToc from "./blog/BlogToc";
import ScrollToTop from "./blog/ScrollToTop";
import {
  AuthorBioCard,
  ExampleCards,
  FormulaCard,
  RelatedList,
  TakeawayCallout,
  WarningCallout,
  getLearningPreset,
} from "./blog/BlogBlocks";
import { AuthorAvatar } from "./blog/AuthorAvatar";
import { estimateMinutes, formatDate, processContent } from "./blog/utils";
import type { PostCard, PostDetail } from "@/lib/blog";

function TitleWithAccent({ text }: { text: string }) {
  const parts = text.split(
    /([A-Za-z][A-Za-z0-9'’-]*(?:\s+[A-Za-z0-9'’-]+)*)/g,
  );

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <span key={index} dir="ltr" className="inline-block text-green-400">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

export default function BlogPostView({
  post,
  related,
}: {
  post: PostDetail;
  related: PostCard[];
}) {
  const minutes = estimateMinutes(post.content);
  const level = ["مبتدی", "متوسط", "پیشرفته"][post.id % 3];
  const { headings: allHeadings, intro, sections } = processContent(
    post.content,
  );
  const headings = allHeadings.filter((heading) => heading.level === 2);
  const preset = getLearningPreset(post);

  const bodyClass =
    "blog-post ProseMirror prose prose-invert max-w-none text-right leading-relaxed [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24";

  const blocks: ReactNode[] = [];
  let formulaPlaced = false;
  let examplesPlaced = false;

  if (intro) {
    blocks.push(
      <div
        key="intro"
        className={bodyClass}
        dangerouslySetInnerHTML={{ __html: intro }}
      />,
    );
  }

  sections.forEach((html, index) => {
    blocks.push(
      <div
        key={`section-${index}`}
        className={bodyClass}
        dangerouslySetInnerHTML={{ __html: html }}
      />,
    );
    if (index === 0) {
      blocks.push(<FormulaCard key="formula" preset={preset} />);
      formulaPlaced = true;
    }
    if (index === 1) {
      blocks.push(<ExampleCards key="examples" preset={preset} />);
      examplesPlaced = true;
    }
  });

  if (!formulaPlaced) {
    blocks.push(<FormulaCard key="formula" preset={preset} />);
  }
  if (!examplesPlaced) {
    blocks.push(<ExampleCards key="examples" preset={preset} />);
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-150px] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#22c55e]/10 blur-[180px]" />
        <div className="absolute bottom-[-100px] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#4ade80]/8 blur-[140px]" />
      </div>

      <BlogTopBar postId={post.id} />

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 pt-6 lg:grid-cols-[minmax(0,1fr)_310px] lg:gap-10 lg:pt-10 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0">
            <header>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-400">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                <TitleWithAccent text={post.title} />
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[#ccc]">
                  <AuthorAvatar
                    seed={post.authorAvatarSeed}
                    name={post.author}
                    size={22}
                  />
                  {post.author}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[#aaa]">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(post.date)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[#aaa]">
                  <Clock className="h-3.5 w-3.5" />
                  {minutes.toLocaleString("fa-IR")} دقیقه مطالعه
                </span>
                <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/15 px-3 py-1.5 text-xs font-bold text-green-400">
                  سطح: {level}
                </span>
              </div>
            </header>

            <div className="mt-6 lg:hidden">
              <BlogToc headings={headings} collapsible />
            </div>

            <div className="mt-6 max-w-[75ch]">
              <TakeawayCallout items={preset.takeaways} />
            </div>

            <div className="mt-8 max-w-[75ch] space-y-8">{blocks}</div>

            <div className="mt-8 max-w-[75ch]">
              <WarningCallout preset={preset} />
            </div>

            <div className="mt-10 max-w-[75ch]">
              <AuthorBioCard name={post.author} seed={post.authorAvatarSeed} />
            </div>

            <div className="mt-10 lg:hidden">
              <RelatedList posts={related} />
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] space-y-6 overflow-y-auto pb-4">
              <BlogToc headings={headings} />
              <RelatedList posts={related} />
            </div>
          </aside>
        </div>
      </motion.article>

      <ScrollToTop />
    </div>
  );
}
