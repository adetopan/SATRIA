import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { contentTypeFor, resolveUploadPath } from "@/lib/uploads";

type Params = { params: Promise<{ filename: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename } = await params;
  const filePath = resolveUploadPath(filename);

  if (!filePath) {
    return new NextResponse(
      "Berkas MCU tidak ditemukan di server. Silakan unggah ulang hasil MCU.",
      {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      },
    );
  }

  const file = await fs.readFile(filePath);
  return new NextResponse(file, {
    headers: {
      "Content-Type": contentTypeFor(filePath),
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
