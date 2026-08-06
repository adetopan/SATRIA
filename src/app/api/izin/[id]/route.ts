import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getIzin, getPeserta, saveIzin, savePeserta } from "@/lib/db";
import type { IzinSenjata } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await requireSession(["admin"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const list = await getIzin();
  const index = list.findIndex((i) => i.id === id);
  if (index < 0) {
    return NextResponse.json({ error: "Data izin tidak ditemukan" }, { status: 404 });
  }

  const status = (body.status || list[index].status) as IzinSenjata["status"];
  list[index] = {
    ...list[index],
    nomorPermohonan: String(body.nomorPermohonan ?? list[index].nomorPermohonan).trim(),
    jenisSenjata: String(body.jenisSenjata ?? list[index].jenisSenjata).trim(),
    keperluan: String(body.keperluan ?? list[index].keperluan).trim(),
    tanggalPengajuan: String(body.tanggalPengajuan ?? list[index].tanggalPengajuan),
    status,
    catatan: String(body.catatan ?? list[index].catatan).trim(),
    updatedAt: new Date().toISOString(),
  };

  await saveIzin(list);

  const pesertaList = await getPeserta();
  const pIndex = pesertaList.findIndex((p) => p.id === list[index].pesertaId);
  if (pIndex >= 0) {
    const map: Record<IzinSenjata["status"], "DIAJUKAN" | "DISETUJUI" | "DITOLAK"> = {
      DIAJUKAN: "DIAJUKAN",
      VERIFIKASI: "DIAJUKAN",
      DISETUJUI: "DISETUJUI",
      DITOLAK: "DITOLAK",
    };
    pesertaList[pIndex] = {
      ...pesertaList[pIndex],
      statusIzin: map[status],
      updatedAt: new Date().toISOString(),
    };
    await savePeserta(pesertaList);
  }

  return NextResponse.json({ data: list[index] });
}
