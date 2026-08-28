import { prisma } from "@/lib/auth";
import { NextResponse } from "next/server";
import moment from "moment-jalaali";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await prisma.post.findFirst({
      where: { slug, status: "Published" },
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

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: post.id,
      title: post.title,
      slug: post.slug,
      thumbnailUrl: post.thumbnailUrl,
      thumbnailGradient: post.thumbnailGradient,
      tags: post.tags,
      summary: post.content.replace(/<[^>]*>/g, "").trim().slice(0, 160),
      content: post.content,
      date: moment(post.publishedAt).format("jDD/jMM/jYYYY"),
      author: post.author.fullname,
      authorAvatarSeed: post.author.avatarSeed,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
