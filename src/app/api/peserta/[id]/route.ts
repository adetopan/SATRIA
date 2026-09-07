import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { STAFF_ADMIN_ROLES } from "@/lib/roles";
import { getIzin, getPeserta, getRikkes, savePeserta } from "@/lib/db";
import { isValidNrp, normalizeNrp } from "@/lib/format";
import {
  permohonanFileError,
  savePermohonanFile,
} from "@/lib/permohonan-file";
import { removeUploadByPublicPath } from "@/lib/uploads";

type Params = { params: Promise<{ id: string }> };

async function readPesertaInput(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const uploaded = form.get("suratPermohonan");
    return {
      body: {
        nrp: String(form.get("nrp") || ""),
        nama: String(form.get("nama") || ""),
        pangkat: String(form.get("pangkat") || ""),
        satuan: String(form.get("satuan") || ""),
        jabatan: String(form.get("jabatan") || ""),
        alamatKantor: String(form.get("alamatKantor") || ""),
        tanggalLahir: String(form.get("tanggalLahir") || ""),
        jenisKelamin: String(form.get("jenisKelamin") || ""),
        noHp: String(form.get("noHp") || ""),
        nomorPermohonan: String(form.get("nomorPermohonan") || ""),
        keperluan: String(form.get("keperluan") || ""),
      },
      file: uploaded instanceof File && uploaded.size > 0 ? uploaded : null,
    };
  }

  return { body: await request.json(), file: null as File | null };
}

export async function GET(_request: Request, { params }: Params) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const list = await getPeserta();
  const peserta = list.find((p) => p.id === id);
  if (!peserta) {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  const rikkes = (await getRikkes()).filter((r) => r.pesertaId === id);
  const izin = (await getIzin()).filter((i) => i.pesertaId === id);

  return NextResponse.json({ data: peserta, rikkes, izin });
}

export async function PUT(request: Request, { params }: Params) {
  const session = await requireSession(STAFF_ADMIN_ROLES);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { body, file } = await readPesertaInput(request);
  const list = await getPeserta();
  const index = list.findIndex((p) => p.id === id);
  if (index < 0) {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  const nrp = normalizeNrp(String(body.nrp ?? list[index].nrp));
  if (!isValidNrp(nrp)) {
    return NextResponse.json(
      { error: "NRP harus 8 digit angka." },
      { status: 400 },
    );
  }

  let suratPermohonanFileName = list[index].suratPermohonanFileName || "";
  let suratPermohonanFilePath = list[index].suratPermohonanFilePath || "";
  if (file) {
    const fileError = permohonanFileError(file);
    if (fileError) {
      return NextResponse.json({ error: fileError }, { status: 400 });
    }
    const stored = await savePermohonanFile(file);
    if (suratPermohonanFilePath) {
      await removeUploadByPublicPath(suratPermohonanFilePath);
    }
    suratPermohonanFileName = stored.fileName;
    suratPermohonanFilePath = stored.filePath;
  }

  list[index] = {
    ...list[index],
    nrp,
    nama: String(body.nama ?? list[index].nama).trim(),
    pangkat: String(body.pangkat ?? list[index].pangkat).trim(),
    satuan: String(body.satuan ?? list[index].satuan).trim(),
    jabatan: String(body.jabatan ?? list[index].jabatan).trim(),
    alamatKantor: String(body.alamatKantor ?? list[index].alamatKantor ?? "").trim(),
    tanggalLahir: String(body.tanggalLahir ?? list[index].tanggalLahir),
    jenisKelamin: body.jenisKelamin === "P" ? "P" : body.jenisKelamin === "L" ? "L" : list[index].jenisKelamin,
    noHp: String(body.noHp ?? list[index].noHp).trim(),
    nomorPermohonan: String(
      body.nomorPermohonan ?? list[index].nomorPermohonan ?? "",
    ).trim(),
    suratPermohonanFileName,
    suratPermohonanFilePath,
    keperluan: body.keperluan ?? list[index].keperluan,
    updatedAt: new Date().toISOString(),
  };

  await savePeserta(list);
  return NextResponse.json({ data: list[index] });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await requireSession(STAFF_ADMIN_ROLES);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const list = await getPeserta();
  const current = list.find((p) => p.id === id);
  const next = list.filter((p) => p.id !== id);
  if (next.length === list.length) {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  if (current?.suratPermohonanFilePath) {
    await removeUploadByPublicPath(current.suratPermohonanFilePath);
  }

  await savePeserta(next);
  return NextResponse.json({ ok: true });
}
