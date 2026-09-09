import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { STAFF_ADMIN_ROLES } from "@/lib/roles";
import { getIzin, saveIzin } from "@/lib/db";
import {
  saveSkhpkUploadFile,
  skhpkUploadError,
} from "@/lib/skhpk-upload-file";
import { removeUploadByPublicPath } from "@/lib/uploads";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await requireSession(STAFF_ADMIN_ROLES);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const form = await request.formData();
  const uploaded = form.get("file");
  if (!(uploaded instanceof File) || uploaded.size === 0) {
    return NextResponse.json(
      { error: "File SKHPK wajib dipilih." },
      { status: 400 },
    );
  }

  const fileError = skhpkUploadError(uploaded);
  if (fileError) {
    return NextResponse.json({ error: fileError }, { status: 400 });
  }

  const list = await getIzin();
  const index = list.findIndex((item) => item.id === id);
  if (index < 0) {
    return NextResponse.json(
      { error: "Data izin tidak ditemukan." },
      { status: 404 },
    );
  }

  const stored = await saveSkhpkUploadFile(uploaded);
  if (list[index].skhpkFilePath) {
    await removeUploadByPublicPath(list[index].skhpkFilePath);
  }

  list[index] = {
    ...list[index],
    skhpkFileName: stored.fileName,
    skhpkFilePath: stored.filePath,
    updatedAt: new Date().toISOString(),
  };
  await saveIzin(list);

  return NextResponse.json({ data: list[index] });
}
