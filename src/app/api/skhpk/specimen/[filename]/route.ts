import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { isTtdSpecimenFile } from "@/lib/ttd-file";
import { contentTypeFor, resolveUploadPath } from "@/lib/uploads";

type Params = { params: Promise<{ filename: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { filename } = await params;
  if (!isTtdSpecimenFile(filename)) {
    return new NextResponse("Berkas tanda tangan tidak ditemukan.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const filePath = resolveUploadPath(filename);
  if (!filePath) {
    return new NextResponse("Berkas tanda tangan tidak ditemukan.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const file = await fs.readFile(filePath);
  return new NextResponse(file, {
    headers: {
      "Content-Type": contentTypeFor(filePath),
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
