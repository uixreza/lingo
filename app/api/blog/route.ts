import { prisma } from "@/lib/auth";
import { NextResponse } from "next/server";
import moment from "moment-jalaali";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "Published" },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnailUrl: true,
        thumbnailGradient: true,
        tags: true,
        content: true,
        publishedAt: true,
        author: { select: { fullname: true, avatarSeed: true } },
      },
    });

const mapped = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    thumbnailUrl: post.thumbnailUrl,
    thumbnailGradient: post.thumbnailGradient,
    tags: post.tags,
    summary: post.content.replace(/<[^>]*>/g, "").trim().slice(0, 160),
    content: post.content,
    date: moment(post.publishedAt).format("jYYYY/jMM/jDD"),
    author: post.author.fullname,
    authorAvatarSeed: post.author.avatarSeed,
  }));

    return NextResponse.json(mapped);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}