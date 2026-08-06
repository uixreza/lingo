// Migrates images from the local ./uploads folder to Vercel Blob and rewrites
// the posts.thumbnail_url values from /uploads/<name> to blob URLs.
//
// Usage (against your production database):
//   1. Set these env vars (e.g. via `vercel env pull` or your Vercel project env):
//        storage_provider=vercel-blob
//        BLOB_READ_WRITE_TOKEN=...
//        DATABASE_URL=...
//   2. Run: npm run migrate:uploads
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { put } from "@vercel/blob";

const MIME_BY_EXT = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
};

if (process.env.storage_provider !== "vercel-blob") {
  console.error(
    "storage_provider must be 'vercel-blob' (use the Vercel project env or `vercel env pull`).",
  );
  process.exit(1);
}
if (!process.env.BLOB_READ_WRITE_TOKEN || !process.env.DATABASE_URL) {
  console.error("BLOB_READ_WRITE_TOKEN and DATABASE_URL are required.");
  process.exit(1);
}

const uploadsDir = path.join(process.cwd(), "uploads");
const files = fs.existsSync(uploadsDir)
  ? fs.readdirSync(uploadsDir).filter((f) => !f.startsWith("."))
  : [];
console.log(`Found ${files.length} local upload(s).`);

const urlByLegacyPath = new Map();
for (const name of files) {
  const buffer = fs.readFileSync(path.join(uploadsDir, name));
  const ext = path.extname(name).slice(1).toLowerCase();
  const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream";
  const blob = await put(name, buffer, { access: "public", contentType });
  urlByLegacyPath.set(`/uploads/${name}`, blob.url);
  console.log(`  uploaded ${name}`);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  const { rows } = await client.query(
    `SELECT id, thumbnail_url AS url FROM posts WHERE thumbnail_url LIKE '/uploads/%'`,
  );
  let updated = 0;
  for (const row of rows) {
    const blobUrl = urlByLegacyPath.get(row.url);
    if (!blobUrl) {
      console.log(`  skipped post ${row.id} (${row.url}) - file not found locally`);
      continue;
    }
    await client.query(
      `UPDATE posts SET thumbnail_url = $1 WHERE id = $2`,
      [blobUrl, row.id],
    );
    updated++;
  }
  console.log(`Updated ${updated} post(s) to blob URLs.`);
} finally {
  await client.end();
}
