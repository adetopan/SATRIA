import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import {
  getIzin,
  getPeserta,
  getRikkes,
  saveIzin,
  savePeserta,
  saveRikkes,
} from "@/lib/db";
import {
  buildBarcodeValue,
  buildNomorSkhpk,
  nextSkhpkSeq,
} from "@/lib/skhpk";
import type { HasilRikkes, IzinSenjata, Peserta, Rikkes } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

function hasilFromIzinStatus(
  status: IzinSenjata["status"],
): HasilRikkes | null {
  if (status === "DISETUJUI") return "LAYAK";
  if (status === "DITOLAK") return "TIDAK_LAYAK";
  return null;
}

function applyHasilToRikkes(
  rikkes: Rikkes,
  peserta: Peserta,
  hasil: HasilRikkes,
  allRikkes: Rikkes[],
): Rikkes {
  if (hasil === "LAYAK") {
    const nomorSkhpk =
      rikkes.nomorSkhpk ||
      buildNomorSkhpk(nextSkhpkSeq(allRikkes), rikkes.tanggalPemeriksaan);
    const next: Rikkes = {
      ...rikkes,
      hasil,
      nomorSkhpk,
      tanggalTerbit: rikkes.tanggalTerbit || rikkes.tanggalPemeriksaan,
      ditujukanKepada: rikkes.ditujukanKepada || "As SDM Kapolri",
    };
    next.barcodeValue = buildBarcodeValue(next, peserta);
    return next;
  }

  return {
    ...rikkes,
    hasil,
    nomorSkhpk: undefined,
    tanggalTerbit: undefined,
    barcodeValue: undefined,
  };
}

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

    let nextPeserta = {
      ...pesertaList[pIndex],
      statusIzin: map[status],
      updatedAt: new Date().toISOString(),
    };

    const hasil = hasilFromIzinStatus(status);
    if (hasil) {
      nextPeserta = {
        ...nextPeserta,
        statusRikkes: hasil,
      };

      const rikkesList = await getRikkes();
      const linkedId = list[index].rikkesId;
      let rIndex = linkedId
        ? rikkesList.findIndex((r) => r.id === linkedId)
        : -1;
      if (rIndex < 0) {
        rIndex = rikkesList.findIndex(
          (r) => r.pesertaId === list[index].pesertaId,
        );
      }

      if (rIndex >= 0) {
        rikkesList[rIndex] = applyHasilToRikkes(
          rikkesList[rIndex],
          nextPeserta,
          hasil,
          rikkesList,
        );
        list[index] = {
          ...list[index],
          rikkesId: rikkesList[rIndex].id,
          updatedAt: new Date().toISOString(),
        };
        await saveIzin(list);
        await saveRikkes(rikkesList);
      }
    }

    pesertaList[pIndex] = nextPeserta;
    await savePeserta(pesertaList);
  }

  return NextResponse.json({ data: list[index] });
}
