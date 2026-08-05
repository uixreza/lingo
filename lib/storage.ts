import fs from "node:fs";
import path from "node:path";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export function isBlobStorageEnabled(): boolean {
  return (
    process.env.STORAGE_PROVIDER === "vercel-blob" &&
    !!process.env.BLOB_READ_WRITE_TOKEN
  );
}

function randomName(ext: string): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
}

/**
 * Saves an image and returns its public URL.
 * - Production (Vercel): stores in Vercel Blob, returns the blob URL.
 * - Development: writes to ./uploads and returns /uploads/<name>,
 *   served by app/uploads/[...path]/route.ts.
 */
export async function saveImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("نوع فایل نامعتبر است. فقط تصویر مجاز است.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("حجم فایل بیشتر از ۵ مگابایت است.");
  }

  const ext = EXT_BY_MIME[file.type] ?? "bin";
  const name = randomName(ext);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isBlobStorageEnabled()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(name, buffer, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "uploads");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), buffer);
  return `/uploads/${name}`;
}
