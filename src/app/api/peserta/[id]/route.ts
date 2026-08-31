import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { STAFF_ADMIN_ROLES } from "@/lib/roles";
import { getIzin, getPeserta, getRikkes, savePeserta } from "@/lib/db";
import { findPesertaByNrp, isValidNrp, normalizeNrp } from "@/lib/format";

type Params = { params: Promise<{ id: string }> };

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
  const body = await request.json();
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

  const duplikat = findPesertaByNrp(nrp, list, id);
  if (duplikat) {
    return NextResponse.json(
      {
        error: `NRP ${nrp} sudah terdaftar atas nama ${duplikat.nama}.`,
      },
      { status: 409 },
    );
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
  const next = list.filter((p) => p.id !== id);
  if (next.length === list.length) {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  await savePeserta(next);
  return NextResponse.json({ ok: true });
}
