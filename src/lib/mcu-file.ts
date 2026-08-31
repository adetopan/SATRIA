import path from "path";
import { storeUploadFile } from "./uploads";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_EXT = /\.(pdf|jpe?g|png|webp)$/i;
const MAX_BYTES = 10 * 1024 * 1024;

export function mcuFileError(file: File) {
  const typeOk = ALLOWED_TYPES.has(file.type);
  const extOk = ALLOWED_EXT.test(file.name);
  if (!typeOk && !extOk) {
    return "Berkas MCU harus PDF, JPG, PNG, atau WEBP.";
  }
  if (file.size > MAX_BYTES) {
    return "Ukuran berkas MCU maksimal 10 MB.";
  }
  return null;
}

export async function saveMcuFile(file: File) {
  const ext = path.extname(file.name).toLowerCase() || ".bin";
  const storedName = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  await storeUploadFile(file, storedName);
  return {
    fileName: file.name,
    filePath: `/api/uploads/${storedName}`,
  };
}
