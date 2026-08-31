import { NextResponse } from "next/server";
import { recordActivity } from "@/lib/activity-log";
import { pesertaActivityLabel } from "@/lib/activity-labels";
import { requireSession } from "@/lib/auth";
import { STAFF_ADMIN_ROLES } from "@/lib/roles";
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

function statusIzinFromIzin(
  status: IzinSenjata["status"],
): Peserta["statusIzin"] {
  if (status === "DISETUJUI") return "DISETUJUI";
  if (status === "DITOLAK") return "DITOLAK";
  return "DIAJUKAN";
}

function latestStatusIzin(
  izin: IzinSenjata[],
  pesertaId: string,
): Peserta["statusIzin"] {
  const match = izin.find((item) => item.pesertaId === pesertaId);
  return match ? statusIzinFromIzin(match.status) : "BELUM";
}

function applyPesertaIzinStatus(
  list: Peserta[],
  izin: IzinSenjata[],
  pesertaId: string,
) {
  const index = list.findIndex((p) => p.id === pesertaId);
  if (index < 0) return;
  list[index] = {
    ...list[index],
    statusIzin: latestStatusIzin(izin, pesertaId),
    updatedAt: new Date().toISOString(),
  };
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
  const session = await requireSession(STAFF_ADMIN_ROLES);
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

  const previous = list[index];
  const previousStatus = previous.status;
  const previousPesertaId = previous.pesertaId;
  const nextPesertaId = String(body.pesertaId || previousPesertaId);
  const pesertaList = await getPeserta();
  const pIndex = pesertaList.findIndex((p) => p.id === nextPesertaId);
  if (pIndex < 0) {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  const status = (body.status || list[index].status) as IzinSenjata["status"];
  list[index] = {
    ...list[index],
    pesertaId: nextPesertaId,
    nomorPermohonan: String(body.nomorPermohonan ?? list[index].nomorPermohonan).trim(),
    jenisSenjata: String(body.jenisSenjata ?? list[index].jenisSenjata).trim(),
    keperluan: String(body.keperluan ?? list[index].keperluan).trim(),
    tanggalPengajuan: String(body.tanggalPengajuan ?? list[index].tanggalPengajuan),
    status,
    catatan: String(body.catatan ?? list[index].catatan).trim(),
    rikkesId: body.rikkesId ? String(body.rikkesId) : list[index].rikkesId,
    ditujukanKepada:
      body.ditujukanKepada !== undefined
        ? String(body.ditujukanKepada).trim()
        : list[index].ditujukanKepada || "",
    updatedAt: new Date().toISOString(),
  };

  await saveIzin(list);

  if (list[index].rikkesId && body.ditujukanKepada !== undefined) {
    const rikkesForTujuan = await getRikkes();
    const tujuanIndex = rikkesForTujuan.findIndex(
      (r) => r.id === list[index].rikkesId,
    );
    if (tujuanIndex >= 0) {
      rikkesForTujuan[tujuanIndex] = {
        ...rikkesForTujuan[tujuanIndex],
        ditujukanKepada: list[index].ditujukanKepada || "",
      };
      await saveRikkes(rikkesForTujuan);
    }
  }

  if (pIndex >= 0) {
    let nextPeserta = {
      ...pesertaList[pIndex],
      statusIzin: statusIzinFromIzin(status),
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
          {
            ...rikkesList[rIndex],
            ditujukanKepada:
              list[index].ditujukanKepada ||
              rikkesList[rIndex].ditujukanKepada,
          },
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
    if (previousPesertaId !== nextPesertaId) {
      applyPesertaIzinStatus(pesertaList, list, previousPesertaId);
    }
    await savePeserta(pesertaList);
  }

  const saved = list[index];
  const peserta = pesertaList[pIndex];
  if (body.status && status !== previousStatus) {
    if (status === "DISETUJUI") {
      await recordActivity(session, {
        action: "IZIN_SETUJUI",
        module: "IZIN",
        targetId: saved.id,
        targetLabel: pesertaActivityLabel(peserta),
        detail: `Nomor ${saved.nomorPermohonan}`,
      });
    } else if (status === "DITOLAK") {
      await recordActivity(session, {
        action: "IZIN_TOLAK",
        module: "IZIN",
        targetId: saved.id,
        targetLabel: pesertaActivityLabel(peserta),
        detail: `Nomor ${saved.nomorPermohonan}`,
      });
    }
  } else if (
    body.nomorPermohonan !== undefined ||
    body.jenisSenjata !== undefined ||
    body.keperluan !== undefined ||
    body.tanggalPengajuan !== undefined ||
    body.ditujukanKepada !== undefined ||
    body.rikkesId
  ) {
    await recordActivity(session, {
      action: "IZIN_EDIT",
      module: "IZIN",
      targetId: saved.id,
      targetLabel: pesertaActivityLabel(peserta),
      detail: `Nomor ${saved.nomorPermohonan} · ${saved.jenisSenjata}`,
    });
  }

  return NextResponse.json({ data: list[index] });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await requireSession(STAFF_ADMIN_ROLES);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const list = await getIzin();
  const current = list.find((item) => item.id === id);
  if (!current) {
    return NextResponse.json({ error: "Data izin tidak ditemukan" }, { status: 404 });
  }

  const next = list.filter((item) => item.id !== id);
  await saveIzin(next);

  const pesertaList = await getPeserta();
  const p = pesertaList.find((item) => item.id === current.pesertaId);
  applyPesertaIzinStatus(pesertaList, next, current.pesertaId);
  await savePeserta(pesertaList);

  await recordActivity(session, {
    action: "IZIN_HAPUS",
    module: "IZIN",
    targetId: current.id,
    targetLabel: pesertaActivityLabel(p),
    detail: `Nomor ${current.nomorPermohonan}`,
  });

  return NextResponse.json({ ok: true });
}
