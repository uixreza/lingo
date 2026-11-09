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
    process.env.storage_provider === "vercel-blob" &&
    !!process.env.BLOB_READ_WRITE_TOKEN
  );
}

export function isArvanStorageEnabled(): boolean {
  return (
    process.env.storage_provider === "arvan-s3" &&
    !!process.env.ARVAN_S3_ACCESS_KEY &&
    !!process.env.ARVAN_S3_SECRET_KEY &&
    !!process.env.ARVAN_S3_BUCKET
  );
}

type ArvanConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any;
  bucket: string;
  publicBase: string;
};

async function getArvanConfig(): Promise<ArvanConfig> {
  const { S3Client } = await import("@aws-sdk/client-s3");
  const endpoint = (
    process.env.ARVAN_S3_ENDPOINT || "https://s3.ir-central1.arvanstorage.ir"
  ).replace(/\/+$/, "");
  const bucket = process.env.ARVAN_S3_BUCKET!;
  const client = new S3Client({
    region: process.env.ARVAN_S3_REGION || "ir-central1",
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.ARVAN_S3_ACCESS_KEY!,
      secretAccessKey: process.env.ARVAN_S3_SECRET_KEY!,
    },
  });
  const publicBase = (
    process.env.ARVAN_S3_PUBLIC_URL || `${endpoint}/${bucket}`
  ).replace(/\/+$/, "");
  return { client, bucket, publicBase };
}

function randomName(ext: string): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
}

/**
 * Saves an image and returns its public URL.
 * - Arvan Cloud (storage_provider=arvan-s3): uploads to the S3-compatible
 *   bucket with a public-read ACL and returns the object's public URL.
 * - Vercel Blob (storage_provider=vercel-blob): stores in Vercel Blob.
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

  if (isArvanStorageEnabled()) {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const { client, bucket, publicBase } = await getArvanConfig();
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: name,
          Body: buffer,
          ContentType: file.type,
          ACL: "public-read",
        }),
      );
    } catch (err) {
      // Some buckets reject object ACLs; retry once without if the bucket
      // itself already allows public reads via its policy.
      const code = (err as { name?: string; Code?: string })?.name
        || (err as { Code?: string })?.Code
        || "";
      if (!/ACL|AccessControl/i.test(String(code) + String(err))) throw err;
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: name,
          Body: buffer,
          ContentType: file.type,
        }),
      );
    }
    return `${publicBase}/${name}`;
  }

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

/**
 * Deletes an image that was saved by `saveImage`.
 * - Arvan Cloud / Vercel Blob: deletes the remote object.
 * - Development: removes the file from ./uploads.
 * Silently ignores external URLs and already-missing files.
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    if (isArvanStorageEnabled()) {
      const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
      const { client, bucket, publicBase } = await getArvanConfig();
      const prefix = `${publicBase}/`;
      if (url.startsWith(prefix)) {
        const key = decodeURIComponent(url.slice(prefix.length));
        await client.send(
          new DeleteObjectCommand({ Bucket: bucket, Key: key }),
        );
        return;
      }
      // legacy local URL — fall through to local handling below
    } else if (isBlobStorageEnabled()) {
      const { del } = await import("@vercel/blob");
      await del(url);
      return;
    }

    const prefix = "/uploads/";
    if (!url.startsWith(prefix)) return;
    const uploadsRoot = path.join(process.cwd(), "uploads");
    const filePath = path.resolve(uploadsRoot, url.slice(prefix.length));
    if (!filePath.startsWith(uploadsRoot + path.sep)) return;
    await fs.promises.unlink(filePath);
  } catch {
    // file may already be missing or the blob URL may be stale
  }
}
