import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";
import moment from "moment-jalaali";

function slugify(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return `${base || "post"}-${Date.now().toString(36)}`;
}

function serializePost(post: {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  thumbnailGradient: string | null;
  tags: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  author: { fullname: string; email: string | null };
}) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    thumbnailUrl: post.thumbnailUrl,
    thumbnailGradient: post.thumbnailGradient,
    tags: post.tags,
    status: post.status,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    date: moment(post.createdAt).format("jYYYY/jMM/jDD"),
    isPublished: post.status === "Published",
    content: post.content,
    summary: post.content.replace(/<[^>]*>/g, "").trim().slice(0, 140),
    author: post.author.fullname,
  };
}

export async function GET() {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { fullname: true, email: true } },
    },
  });

  return NextResponse.json(posts.map(serializePost));
}

export async function POST(request: Request) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const status = body.status === "Published" ? "Published" : "Draft";
  const statusEnum = status === "Published" ? ("Published" as const) : ("Draft" as const);

  if (!title || !content) {
    return NextResponse.json(
      { error: "عنوان و محتوا الزامی است" },
      { status: 400 },
    );
  }

  const thumbnailUrl =
    typeof body.thumbnailUrl === "string" && body.thumbnailUrl.trim()
      ? body.thumbnailUrl.trim()
      : null;
  const thumbnailGradient =
    typeof body.thumbnailGradient === "string" && body.thumbnailGradient.trim()
      ? body.thumbnailGradient.trim()
      : null;
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === "string").slice(0, 10)
    : [];

  try {
    const post = await prisma.post.create({
      data: {
        title,
        slug: slugify(title),
        content,
        thumbnailUrl,
        thumbnailGradient,
        tags,
        status: statusEnum,
        authorId: parseInt(sess.user.id, 10),
        publishedAt:
          statusEnum === "Published" ? new Date() : null,
      },
      include: {
        author: { select: { fullname: true, email: true } },
      },
    });

    return NextResponse.json(serializePost(post), { status: 201 });
  } catch (err) {
    console.error("Error creating post:", err);
    return NextResponse.json({ error: "خطا در ذخیره پست" }, { status: 500 });
  }
}