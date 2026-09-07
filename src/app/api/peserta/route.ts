import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { STAFF_ADMIN_ROLES } from "@/lib/roles";
import { getPeserta, savePeserta, uid } from "@/lib/db";
import { recordActivity } from "@/lib/activity-log";
import { pesertaActivityLabel } from "@/lib/activity-labels";
import { isValidNrp, normalizeNrp } from "@/lib/format";
import {
  permohonanFileError,
  savePermohonanFile,
} from "@/lib/permohonan-file";
import type { Peserta } from "@/lib/types";

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getPeserta();
  return NextResponse.json({ data });
}

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

export async function POST(request: Request) {
  const session = await requireSession(STAFF_ADMIN_ROLES);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { body, file } = await readPesertaInput(request);
  const now = new Date().toISOString();

  let suratPermohonanFileName = "";
  let suratPermohonanFilePath = "";
  if (file) {
    const fileError = permohonanFileError(file);
    if (fileError) {
      return NextResponse.json({ error: fileError }, { status: 400 });
    }
    const stored = await savePermohonanFile(file);
    suratPermohonanFileName = stored.fileName;
    suratPermohonanFilePath = stored.filePath;
  }

  const peserta: Peserta = {
    id: uid("p"),
    nrp: normalizeNrp(String(body.nrp || "")),
    nama: String(body.nama || "").trim(),
    pangkat: String(body.pangkat || "").trim(),
    satuan: String(body.satuan || "").trim(),
    jabatan: String(body.jabatan || "").trim(),
    alamatKantor: String(body.alamatKantor || "").trim(),
    tanggalLahir: String(body.tanggalLahir || ""),
    jenisKelamin: body.jenisKelamin === "P" ? "P" : "L",
    noHp: String(body.noHp || "").trim(),
    nomorPermohonan: String(body.nomorPermohonan || "").trim(),
    suratPermohonanFileName,
    suratPermohonanFilePath,
    keperluan: (body.keperluan as Peserta["keperluan"]) || "IZIN_SENJATA",
    statusRikkes: "PENDING",
    statusIzin: "BELUM",
    createdAt: now,
    updatedAt: now,
  };

  if (!isValidNrp(peserta.nrp) || !peserta.nama) {
    return NextResponse.json(
      {
        error: !isValidNrp(peserta.nrp)
          ? "NRP harus 8 digit angka."
          : "NRP dan nama wajib diisi.",
      },
      { status: 400 },
    );
  }

  const list = await getPeserta();

  list.unshift(peserta);
  await savePeserta(list);
  await recordActivity(session, {
    action: "PESERTA_TAMBAH",
    module: "PESERTA",
    targetId: peserta.id,
    targetLabel: pesertaActivityLabel(peserta),
    detail: `${peserta.pangkat} · ${peserta.satuan || "-"}`,
  });
  return NextResponse.json({ data: peserta }, { status: 201 });
}
