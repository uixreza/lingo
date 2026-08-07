import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { deleteImage } from "@/lib/storage";
import { NextResponse } from "next/server";
import moment from "moment-jalaali";

function serializePost(post: {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  thumbnailGradient: string | null;
  tags: string[];
  status: string;
  createdAt: Date;
  publishedAt: Date | null;
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

async function adminSession() {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return null;
  }
  return sess;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const sess = await adminSession();
  if (!sess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const postId = parseInt(id, 10);
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { author: { select: { fullname: true, email: true } } },
  });
  if (!post) {
    return NextResponse.json({ error: "پست یافت نشد" }, { status: 404 });
  }
  return NextResponse.json(serializePost(post));
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const sess = await adminSession();
  if (!sess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const postId = parseInt(id, 10);
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "پست یافت نشد" }, { status: 404 });
    }

    const status =
      body.status === "Published" ? "Published" : body.status === "Draft" ? "Draft" : post.status;

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        status: status as "Published" | "Draft",
        publishedAt:
          status === "Published" && !post.publishedAt ? new Date() : undefined,
      },
      include: { author: { select: { fullname: true, email: true } } },
    });

    return NextResponse.json(serializePost(updated));
  } catch (err) {
    console.error("Error updating post:", err);
    return NextResponse.json({ error: "خطا در به‌روزرسانی پست" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const sess = await adminSession();
  if (!sess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const postId = parseInt(id, 10);
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
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
  const status = body.status === "Published" ? "Published" : "Draft";

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "پست یافت نشد" }, { status: 404 });
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        thumbnailUrl,
        thumbnailGradient,
        tags,
        status: status as "Published" | "Draft",
        publishedAt:
          status === "Published" && !post.publishedAt ? new Date() : undefined,
      },
      include: { author: { select: { fullname: true, email: true } } },
    });

    return NextResponse.json(serializePost(updated));
  } catch (err) {
    console.error("Error updating post:", err);
    return NextResponse.json({ error: "خطا در ذخیره پست" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const sess = await adminSession();
  if (!sess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const postId = parseInt(id, 10);
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "پست یافت نشد" }, { status: 404 });
    }
    await prisma.post.delete({ where: { id: postId } });
    if (post.thumbnailUrl) {
      await deleteImage(post.thumbnailUrl);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "پست یافت نشد" }, { status: 404 });
  }
}