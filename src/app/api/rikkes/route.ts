import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { MCU_STAFF_ROLES } from "@/lib/roles";
import { getPeserta, getRikkes, savePeserta, saveRikkes, uid } from "@/lib/db";
import { recordActivity } from "@/lib/activity-log";
import { pesertaActivityLabel } from "@/lib/activity-labels";
import { formatDate } from "@/lib/format";
import { mcuFileError, saveMcuFile } from "@/lib/mcu-file";
import { duplicateMcuDateMessage, findDuplicateMcuDate } from "@/lib/format";
import type { Rikkes } from "@/lib/types";

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [rikkes, peserta] = await Promise.all([getRikkes(), getPeserta()]);
  const data = rikkes.map((r) => ({
    ...r,
    peserta: peserta.find((p) => p.id === r.pesertaId) || null,
  }));

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await requireSession(MCU_STAFF_ROLES);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const pesertaId = String(form.get("pesertaId") || "");
  const nomorSurat = String(form.get("nomorSurat") || "").trim();
  const tanggalPemeriksaan = String(form.get("tanggalPemeriksaan") || "");
  const noHp = String(form.get("noHp") || "").trim();
  const rumahSakit = String(form.get("rumahSakit") || "RS Bhayangkara / MCU RS Polri").trim();
  const dokter = String(form.get("dokter") || "").trim();
  const tekananDarah = String(form.get("tekananDarah") || "").trim();
  const denyutNadi = String(form.get("denyutNadi") || "").trim();
  const tinggiBadan = String(form.get("tinggiBadan") || "").trim();
  const beratBadan = String(form.get("beratBadan") || "").trim();
  const visus = String(form.get("visus") || "").trim();
  const catatan = String(form.get("catatan") || "").trim();
  const file = form.get("file");

  if (!pesertaId || !tanggalPemeriksaan || !noHp) {
    return NextResponse.json(
      { error: "Data rikkes belum lengkap. Peserta, tanggal pemeriksaan, dan No. HP wajib diisi." },
      { status: 400 },
    );
  }

  const pesertaList = await getPeserta();
  const pesertaIndex = pesertaList.findIndex((p) => p.id === pesertaId);
  if (pesertaIndex < 0) {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  // MCU hanya mengunggah data pemeriksaan; kelayakan ditentukan di Izin Senjata Api.
  const rikkes = await getRikkes();

  if (findDuplicateMcuDate(rikkes, pesertaId, tanggalPemeriksaan)) {
    return NextResponse.json(
      { error: duplicateMcuDateMessage(tanggalPemeriksaan) },
      { status: 409 },
    );
  }

  let fileName = "";
  let filePath = "";

  if (file && file instanceof File && file.size > 0) {
    const fileError = mcuFileError(file);
    if (fileError) {
      return NextResponse.json({ error: fileError }, { status: 400 });
    }
    const stored = await saveMcuFile(file);
    fileName = stored.fileName;
    filePath = stored.filePath;
  }

  const record: Rikkes = {
    id: uid("r"),
    pesertaId,
    nomorSurat,
    tanggalPemeriksaan,
    rumahSakit,
    dokter,
    hasil: "PENDING",
    tekananDarah,
    denyutNadi,
    tinggiBadan,
    beratBadan,
    visus,
    catatan,
    fileName,
    filePath,
    uploadedBy: session.id,
    uploadedByName: session.name,
    createdAt: new Date().toISOString(),
  };

  rikkes.unshift(record);
  await saveRikkes(rikkes);

  pesertaList[pesertaIndex] = {
    ...pesertaList[pesertaIndex],
    noHp: noHp || pesertaList[pesertaIndex].noHp,
    statusRikkes: "PENDING",
    updatedAt: new Date().toISOString(),
  };
  await savePeserta(pesertaList);

  const p = pesertaList[pesertaIndex];
  await recordActivity(session, {
    action: "MCU_UPLOAD",
    module: "MCU",
    targetId: record.id,
    targetLabel: pesertaActivityLabel(p),
    detail: `Tanggal pemeriksaan ${formatDate(tanggalPemeriksaan)}${fileName ? ` · Berkas ${fileName}` : ""}`,
  });

  return NextResponse.json({ data: record }, { status: 201 });
}
