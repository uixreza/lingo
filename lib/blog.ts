import { cache } from "react";
import moment from "moment-jalaali";
import { prisma } from "@/lib/auth";

export type PostCard = {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  thumbnailGradient: string | null;
  tags: string[];
  summary: string;
  date: string;
  author: string;
  authorAvatarSeed: string | null;
};

export type PostDetail = PostCard & {
  content: string;
};

type RawPost = {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  thumbnailGradient: string | null;
  tags: string[];
  content: string;
  metaDescription: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  author: {
    fullname: string;
    avatarSeed: string | null;
  };
};

const postSelect = {
  id: true,
  title: true,
  slug: true,
  thumbnailUrl: true,
  thumbnailGradient: true,
  tags: true,
  content: true,
  metaDescription: true,
  publishedAt: true,
  updatedAt: true,
  author: { select: { fullname: true, avatarSeed: true } },
} as const;

function summarize(post: RawPost): string {
  return (
    post.metaDescription?.trim() ||
    post.content.replace(/<[^>]*>/g, "").trim().slice(0, 160)
  );
}

export const getPublishedPosts = cache(async (): Promise<RawPost[]> => {
  try {
    return await prisma.post.findMany({
      where: { status: "Published" },
      orderBy: { publishedAt: "desc" },
      select: postSelect,
    });
  } catch {
    return [];
  }
});

export const getPublishedPost = cache(
  async (slug: string): Promise<RawPost | null> => {
    try {
      return await prisma.post.findFirst({
        where: { slug, status: "Published" },
        select: postSelect,
      });
    } catch {
      return null;
    }
  },
);

export const getPublishedSlugs = cache(async (): Promise<string[]> => {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "Published" },
      select: { slug: true },
    });
    return posts.map((post) => post.slug);
  } catch {
    return [];
  }
});

export function toPostCard(post: RawPost): PostCard {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    thumbnailUrl: post.thumbnailUrl,
    thumbnailGradient: post.thumbnailGradient,
    tags: post.tags,
    summary: summarize(post),
    date: moment(post.publishedAt).format("jYYYY/jMM/jDD"),
    author: post.author.fullname,
    authorAvatarSeed: post.author.avatarSeed,
  };
}

export function toPostDetail(post: RawPost): PostDetail {
  return {
    ...toPostCard(post),
    content: post.content,
    date: moment(post.publishedAt).format("jDD/jMM/jYYYY"),
  };
}
