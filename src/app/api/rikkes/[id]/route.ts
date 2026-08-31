import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { MCU_STAFF_ROLES } from "@/lib/roles";
import { recordActivity } from "@/lib/activity-log";
import { pesertaActivityLabel } from "@/lib/activity-labels";
import { getIzin, getPeserta, getRikkes, saveIzin, savePeserta, saveRikkes } from "@/lib/db";
import { duplicateMcuDateMessage, findDuplicateMcuDate, formatDate } from "@/lib/format";
import { mcuFileError, saveMcuFile } from "@/lib/mcu-file";
import { removeUploadByPublicPath } from "@/lib/uploads";
import type { HasilRikkes, Peserta, Rikkes } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

function latestHasil(rikkes: Rikkes[], pesertaId: string): HasilRikkes {
  return rikkes.find((r) => r.pesertaId === pesertaId)?.hasil || "PENDING";
}

function applyPesertaStatus(
  list: Peserta[],
  rikkes: Rikkes[],
  pesertaId: string,
  extra?: Partial<Peserta>,
) {
  const index = list.findIndex((p) => p.id === pesertaId);
  if (index < 0) return;
  list[index] = {
    ...list[index],
    ...extra,
    statusRikkes: latestHasil(rikkes, pesertaId),
    updatedAt: new Date().toISOString(),
  };
}

export async function PUT(request: Request, { params }: Params) {
  const session = await requireSession(MCU_STAFF_ROLES);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const form = await request.formData();
  const pesertaId = String(form.get("pesertaId") || "");
  const tanggalPemeriksaan = String(form.get("tanggalPemeriksaan") || "");
  const noHp = String(form.get("noHp") || "").trim();
  const file = form.get("file");

  if (!pesertaId || !tanggalPemeriksaan || !noHp) {
    return NextResponse.json(
      { error: "Data rikkes belum lengkap. Peserta, tanggal pemeriksaan, dan No. HP wajib diisi." },
      { status: 400 },
    );
  }

  const rikkesList = await getRikkes();
  const index = rikkesList.findIndex((r) => r.id === id);
  if (index < 0) {
    return NextResponse.json({ error: "Data MCU tidak ditemukan." }, { status: 404 });
  }

  const pesertaList = await getPeserta();
  const pesertaIndex = pesertaList.findIndex((p) => p.id === pesertaId);
  if (pesertaIndex < 0) {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  const current = rikkesList[index];

  if (
    findDuplicateMcuDate(
      rikkesList,
      pesertaId,
      tanggalPemeriksaan,
      current.id,
    )
  ) {
    return NextResponse.json(
      { error: duplicateMcuDateMessage(tanggalPemeriksaan) },
      { status: 409 },
    );
  }
  let fileName = current.fileName;
  let filePath = current.filePath;

  if (file && file instanceof File && file.size > 0) {
    const fileError = mcuFileError(file);
    if (fileError) {
      return NextResponse.json({ error: fileError }, { status: 400 });
    }
    const stored = await saveMcuFile(file);
    if (current.filePath && current.filePath !== stored.filePath) {
      await removeUploadByPublicPath(current.filePath);
    }
    fileName = stored.fileName;
    filePath = stored.filePath;
  }

  const previousPesertaId = current.pesertaId;
  rikkesList[index] = {
    ...current,
    pesertaId,
    tanggalPemeriksaan,
    fileName,
    filePath,
  };
  await saveRikkes(rikkesList);

  applyPesertaStatus(pesertaList, rikkesList, pesertaId, { noHp });
  if (previousPesertaId !== pesertaId) {
    applyPesertaStatus(pesertaList, rikkesList, previousPesertaId);
  }
  await savePeserta(pesertaList);

  const p = pesertaList[pesertaIndex];
  await recordActivity(session, {
    action: "MCU_EDIT",
    module: "MCU",
    targetId: rikkesList[index].id,
    targetLabel: pesertaActivityLabel(p),
    detail: `Tanggal pemeriksaan ${formatDate(tanggalPemeriksaan)}${fileName ? ` · Berkas ${fileName}` : ""}`,
  });

  return NextResponse.json({ data: rikkesList[index] });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await requireSession(MCU_STAFF_ROLES);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const rikkesList = await getRikkes();
  const current = rikkesList.find((r) => r.id === id);
  if (!current) {
    return NextResponse.json({ error: "Data MCU tidak ditemukan." }, { status: 404 });
  }

  const nextRikkes = rikkesList.filter((r) => r.id !== id);
  await saveRikkes(nextRikkes);

  if (current.filePath) {
    await removeUploadByPublicPath(current.filePath);
  }

  const izinList = await getIzin();
  const nextIzin = izinList.map((item) =>
    item.rikkesId === id
      ? { ...item, rikkesId: undefined, updatedAt: new Date().toISOString() }
      : item,
  );
  if (nextIzin.some((item, i) => item !== izinList[i])) {
    await saveIzin(nextIzin);
  }

  const pesertaList = await getPeserta();
  const p = pesertaList.find((item) => item.id === current.pesertaId);
  applyPesertaStatus(pesertaList, nextRikkes, current.pesertaId);
  await savePeserta(pesertaList);

  await recordActivity(session, {
    action: "MCU_HAPUS",
    module: "MCU",
    targetId: current.id,
    targetLabel: pesertaActivityLabel(p),
    detail: `Tanggal pemeriksaan ${formatDate(current.tanggalPemeriksaan)}`,
  });

  return NextResponse.json({ ok: true });
}
