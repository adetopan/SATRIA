import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getPeserta, savePeserta, uid } from "@/lib/db";
import type { Peserta } from "@/lib/types";

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getPeserta();
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await requireSession(["admin"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const now = new Date().toISOString();

  const peserta: Peserta = {
    id: uid("p"),
    nrp: String(body.nrp || "").trim(),
    nama: String(body.nama || "").trim(),
    pangkat: String(body.pangkat || "").trim(),
    satuan: String(body.satuan || "").trim(),
    jabatan: String(body.jabatan || "").trim(),
    alamatKantor: String(body.alamatKantor || "").trim(),
    tanggalLahir: String(body.tanggalLahir || ""),
    jenisKelamin: body.jenisKelamin === "P" ? "P" : "L",
    noHp: String(body.noHp || "").trim(),
    keperluan: body.keperluan || "IZIN_SENJATA",
    statusRikkes: "PENDING",
    statusIzin: "BELUM",
    createdAt: now,
    updatedAt: now,
  };

  if (!peserta.nrp || !peserta.nama) {
    return NextResponse.json(
      { error: "NRP dan nama wajib diisi." },
      { status: 400 },
    );
  }

  const list = await getPeserta();
  if (list.some((p) => p.nrp === peserta.nrp)) {
    return NextResponse.json(
      { error: "NRP sudah terdaftar." },
      { status: 409 },
    );
  }

  list.unshift(peserta);
  await savePeserta(list);
  return NextResponse.json({ data: peserta }, { status: 201 });
}
