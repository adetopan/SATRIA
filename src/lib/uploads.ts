import { existsSync } from "fs";
import { promises as fs } from "fs";
import path from "path";

export function uploadDir() {
  return path.join(process.cwd(), "data", "uploads");
}

export function legacyUploadDir() {
  return path.join(process.cwd(), "public", "uploads");
}

export async function ensureUploadDir() {
  await fs.mkdir(uploadDir(), { recursive: true });
}

export function safeUploadName(name: string) {
  const base = path.basename(name).trim();
  if (!base || base !== name.replace(/\\/g, "/").split("/").pop()) return null;
  if (base.includes("..") || base.startsWith(".")) return null;
  if (!/^[\w.-]+$/.test(base)) return null;
  return base;
}

export function contentTypeFor(name: string) {
  switch (path.extname(name).toLowerCase()) {
    case ".pdf":
      return "application/pdf";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

export function resolveUploadPath(filename: string) {
  const safe = safeUploadName(filename);
  if (!safe) return null;
  const current = path.join(uploadDir(), safe);
  if (existsSync(current)) return current;
  const legacy = path.join(legacyUploadDir(), safe);
  if (existsSync(legacy)) return legacy;
  return null;
}

export async function storeUploadFile(file: File, storedName: string) {
  await ensureUploadDir();
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadDir(), storedName), buffer);
}

export async function removeUploadByPublicPath(filePath: string) {
  const filename = path.basename(filePath.replace(/\\/g, "/"));
  const resolved = resolveUploadPath(filename);
  if (!resolved) return;
  await fs.unlink(resolved).catch(() => undefined);
}

