import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getIzin, getPeserta, saveIzin, savePeserta, uid } from "@/lib/db";
import type { IzinSenjata } from "@/lib/types";

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [izin, peserta] = await Promise.all([getIzin(), getPeserta()]);
  const data = izin.map((i) => ({
    ...i,
    peserta: peserta.find((p) => p.id === i.pesertaId) || null,
  }));

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await requireSession(["admin"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const pesertaId = String(body.pesertaId || "");
  const now = new Date().toISOString();

  const pesertaList = await getPeserta();
  const index = pesertaList.findIndex((p) => p.id === pesertaId);
  if (index < 0) {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  const record: IzinSenjata = {
    id: uid("i"),
    pesertaId,
    nomorPermohonan: String(body.nomorPermohonan || "").trim(),
    jenisSenjata: String(body.jenisSenjata || "").trim(),
    keperluan: String(body.keperluan || "").trim(),
    tanggalPengajuan: String(body.tanggalPengajuan || now.slice(0, 10)),
    status: body.status || "DIAJUKAN",
    catatan: String(body.catatan || "").trim(),
    rikkesId: body.rikkesId || undefined,
    createdAt: now,
    updatedAt: now,
  };

  if (!record.nomorPermohonan || !record.jenisSenjata) {
    return NextResponse.json(
      { error: "Nomor permohonan dan jenis senjata wajib diisi." },
      { status: 400 },
    );
  }

  const list = await getIzin();
  list.unshift(record);
  await saveIzin(list);

  const statusMap: Record<
    IzinSenjata["status"],
    "DIAJUKAN" | "DISETUJUI" | "DITOLAK"
  > = {
    DIAJUKAN: "DIAJUKAN",
    VERIFIKASI: "DIAJUKAN",
    DISETUJUI: "DISETUJUI",
    DITOLAK: "DITOLAK",
  };

  pesertaList[index] = {
    ...pesertaList[index],
    statusIzin: statusMap[record.status],
    updatedAt: now,
  };
  await savePeserta(pesertaList);

  return NextResponse.json({ data: record }, { status: 201 });
}
