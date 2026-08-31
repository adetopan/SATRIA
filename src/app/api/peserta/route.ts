import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { STAFF_ADMIN_ROLES } from "@/lib/roles";
import { getPeserta, savePeserta, uid } from "@/lib/db";
import { recordActivity } from "@/lib/activity-log";
import { pesertaActivityLabel } from "@/lib/activity-labels";
import { findPesertaByNrp, isValidNrp, normalizeNrp } from "@/lib/format";
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
  const session = await requireSession(STAFF_ADMIN_ROLES);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const now = new Date().toISOString();

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
    keperluan: body.keperluan || "IZIN_SENJATA",
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
  const duplikat = findPesertaByNrp(peserta.nrp, list);
  if (duplikat) {
    return NextResponse.json(
      {
        error: `NRP ${peserta.nrp} sudah terdaftar atas nama ${duplikat.nama}.`,
      },
      { status: 409 },
    );
  }

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
