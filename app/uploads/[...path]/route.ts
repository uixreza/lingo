import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { isBlobStorageEnabled } from "@/lib/storage";

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
};

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  // Production stores images in Vercel Blob. Legacy /uploads/<name> URLs
  // (saved before blob storage was enabled) fall back to the matching blob.
  if (isBlobStorageEnabled()) {
    const name = segments.join("/");
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: name, limit: 1 });
      if (blobs.length > 0) {
        return NextResponse.redirect(blobs[0].url);
      }
    } catch {
      // fall through to 404
    }
    return new Response("Not found", { status: 404 });
  }

  const uploadsRoot = path.join(process.cwd(), "uploads");
  const relative = path.join(...segments);
  const filePath = path.resolve(uploadsRoot, relative);

  if (!filePath.startsWith(uploadsRoot + path.sep)) {
    return new Response("Bad request", { status: 400 });
  }

  try {
    const buffer = await fs.promises.readFile(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": MIME_BY_EXT[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}