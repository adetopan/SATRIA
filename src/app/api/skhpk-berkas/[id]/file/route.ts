import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getIzin } from "@/lib/db";
import { hasSkhpkAccess } from "@/lib/skhpk-access";
import { contentTypeFor, resolveUploadPath } from "@/lib/uploads";

type Params = { params: Promise<{ id: string }> };

function inlineDisposition(originalName: string, storedName: string) {
  const ascii = (storedName || "berkas.pdf").replace(/[^\w.-]/g, "_");
  const encoded = encodeURIComponent(originalName.replace(/[\r\n"]/g, ""));
  return `inline; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  const allowed = Boolean(session) || (await hasSkhpkAccess(id));
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const izin = (await getIzin()).find((item) => item.id === id);
  if (!izin?.skhpkFilePath) {
    return NextResponse.json(
      { error: "Berkas SKHPK tidak ditemukan." },
      { status: 404 },
    );
  }

  const filename = izin.skhpkFilePath.replace(/\\/g, "/").split("/").pop() || "";
  const diskPath = resolveUploadPath(filename);
  if (!diskPath) {
    return new NextResponse("Berkas SKHPK tidak ditemukan di server.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const file = await fs.readFile(diskPath);
  const downloadName = izin.skhpkFileName || filename;
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": contentTypeFor(diskPath),
      "Content-Disposition": inlineDisposition(downloadName, filename),
      "Content-Length": String(file.byteLength),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
