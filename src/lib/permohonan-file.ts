import path from "path";
import { uid } from "@/lib/db";
import { storeUploadFile } from "@/lib/uploads";

const ALLOWED = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function permohonanFileError(file: File): string | null {
  if (!ALLOWED.includes(file.type)) {
    return "Surat permohonan harus PDF atau gambar (JPG/PNG/WEBP).";
  }
  if (file.size > 8 * 1024 * 1024) {
    return "Ukuran file maksimal 8 MB.";
  }
  return null;
}

export async function savePermohonanFile(file: File) {
  const ext = path.extname(file.name) || ".bin";
  const stored = `${uid("sp")}${ext}`;
  await storeUploadFile(file, stored);
  return { fileName: file.name, filePath: `/uploads/${stored}` };
}
