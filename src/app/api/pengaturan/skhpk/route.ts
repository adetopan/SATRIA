import { NextResponse } from "next/server";
import { recordActivity } from "@/lib/activity-log";
import { requireSession } from "@/lib/auth";
import { SUPERADMIN_ROLES } from "@/lib/roles";
import { getSkhpkSigner, saveSkhpkSigner } from "@/lib/db";
import { SKHPK_SIGNER } from "@/lib/skhpk";
import { saveTtdFile, ttdFileError } from "@/lib/ttd-file";
import type { SkhpkSigner } from "@/lib/types";

export async function GET() {
  const session = await requireSession(SUPERADMIN_ROLES);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getSkhpkSigner();
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const session = await requireSession(SUPERADMIN_ROLES);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const current = await getSkhpkSigner();

  const pick = (value: unknown, currentValue: string, fallback: string) =>
    String((value ?? currentValue) || fallback).trim();

  const next: SkhpkSigner = {
    atasNama: pick(form.get("atasNama"), current.atasNama, SKHPK_SIGNER.atasNama),
    jabatan: pick(form.get("jabatan"), current.jabatan, SKHPK_SIGNER.jabatan),
    nama: pick(form.get("nama"), current.nama, SKHPK_SIGNER.nama),
    pangkat: pick(form.get("pangkat"), current.pangkat, SKHPK_SIGNER.pangkat),
    nrp: pick(form.get("nrp"), current.nrp, SKHPK_SIGNER.nrp),
    jenisKelamin: pick(
      form.get("jenisKelamin"),
      current.jenisKelamin,
      SKHPK_SIGNER.jenisKelamin,
    ),
    satuan: pick(form.get("satuan"), current.satuan, SKHPK_SIGNER.satuan),
    status: pick(form.get("status"), current.status, SKHPK_SIGNER.status),
    ttdImagePath: current.ttdImagePath || SKHPK_SIGNER.ttdImagePath,
  };

  const file = form.get("ttdImage");
  if (file && file instanceof File && file.size > 0) {
    const fileError = ttdFileError(file);
    if (fileError) {
      return NextResponse.json({ error: fileError }, { status: 400 });
    }
    next.ttdImagePath = await saveTtdFile(file);
  }

  if (!next.nama || !next.pangkat) {
    return NextResponse.json(
      { error: "Nama dan pangkat pejabat wajib diisi." },
      { status: 400 },
    );
  }

  const data = await saveSkhpkSigner(next);
  await recordActivity(session, {
    action: "PENGATURAN_SKHPK",
    module: "PENGATURAN",
    targetId: "skhpk-signer",
    targetLabel: next.nama,
    detail:
      `${next.pangkat} · NRP ${next.nrp} · ${next.satuan}` +
      (file && file instanceof File && file.size > 0
        ? " · Tanda tangan diperbarui"
        : ""),
  });

  return NextResponse.json({ data });
}
