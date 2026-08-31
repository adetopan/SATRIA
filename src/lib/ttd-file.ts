import path from "path";
import { uid } from "@/lib/db";
import { storeUploadFile } from "@/lib/uploads";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export function ttdFileError(file: File): string | null {
  if (!ALLOWED.includes(file.type)) {
    return "Tanda tangan harus gambar JPG, PNG, atau WEBP.";
  }
  if (file.size > 4 * 1024 * 1024) {
    return "Ukuran gambar tanda tangan maksimal 4 MB.";
  }
  return null;
}

export function isTtdSpecimenFile(filename: string) {
  return /^ttd-[\w.-]+\.(png|jpe?g|webp)$/i.test(filename);
}

export async function saveTtdFile(file: File) {
  const ext = path.extname(file.name).toLowerCase() || ".png";
  const stored = `${uid("ttd")}${ext}`;
  await storeUploadFile(file, stored);
  return `/skhpk-ttd/${stored}`;
}
