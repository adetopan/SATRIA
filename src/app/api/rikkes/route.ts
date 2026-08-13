import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireSession } from "@/lib/auth";
import { getPeserta, getRikkes, savePeserta, saveRikkes, uid } from "@/lib/db";
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
  const session = await requireSession(["admin", "mcu"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const pesertaId = String(form.get("pesertaId") || "");
  const nomorSurat = String(form.get("nomorSurat") || "").trim();
  const tanggalPemeriksaan = String(form.get("tanggalPemeriksaan") || "");
  const rumahSakit = String(form.get("rumahSakit") || "RS Bhayangkara / MCU RS Polri").trim();
  const dokter = String(form.get("dokter") || "").trim();
  const tekananDarah = String(form.get("tekananDarah") || "").trim();
  const denyutNadi = String(form.get("denyutNadi") || "").trim();
  const tinggiBadan = String(form.get("tinggiBadan") || "").trim();
  const beratBadan = String(form.get("beratBadan") || "").trim();
  const visus = String(form.get("visus") || "").trim();
  const catatan = String(form.get("catatan") || "").trim();
  const file = form.get("file");

  if (!pesertaId || !tanggalPemeriksaan) {
    return NextResponse.json(
      { error: "Data rikkes belum lengkap." },
      { status: 400 },
    );
  }

  const pesertaList = await getPeserta();
  const pesertaIndex = pesertaList.findIndex((p) => p.id === pesertaId);
  if (pesertaIndex < 0) {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  let fileName = "";
  let filePath = "";

  if (file && file instanceof File && file.size > 0) {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "File harus PDF atau gambar (JPG/PNG/WEBP)." },
        { status: 400 },
      );
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 8 MB." },
        { status: 400 },
      );
    }

    const ext = path.extname(file.name) || ".bin";
    fileName = file.name;
    const stored = `${uid("mcu")}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadDir, stored), buffer);
    filePath = `/uploads/${stored}`;
  }

  // MCU hanya mengunggah data pemeriksaan; kelayakan ditentukan di Izin Senjata Api.
  const rikkes = await getRikkes();

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
    statusRikkes: "PENDING",
    updatedAt: new Date().toISOString(),
  };
  await savePeserta(pesertaList);

  return NextResponse.json({ data: record }, { status: 201 });
}
